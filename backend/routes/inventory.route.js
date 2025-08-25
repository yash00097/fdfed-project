import express from "express"
import Car from "../models/car.model.js"
import Review from "../models/review.model.js"
import { validateObjectId } from "../middleware.js"
import { query, validationResult } from "express-validator"

const router = express.Router()

// Validation middleware
const validateFilters = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
  query("minPrice").optional().isFloat({ min: 0 }).withMessage("Minimum price must be positive"),
  query("maxPrice").optional().isFloat({ min: 0 }).withMessage("Maximum price must be positive"),
  query("minYear").optional().isInt({ min: 1900, max: new Date().getFullYear() }).withMessage("Invalid minimum year"),
  query("maxYear").optional().isInt({ min: 1900, max: new Date().getFullYear() }).withMessage("Invalid maximum year"),
]

// Get all available cars with filtering and pagination
router.get("/", validateFilters, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg)
      return res.redirect("/inventory")
    }

    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 12
    const skip = (page - 1) * limit

    // Build query object
    const query = { status: "available" }
    const {
      brand,
      transmission,
      fuelType,
      priceRange,
      vehicleType,
      minYear,
      maxYear,
      minPrice,
      maxPrice,
      search,
      sortBy,
      city,
      state,
    } = req.query

    // Text search
    if (search) {
      query.$or = [
        { brand: new RegExp(search, "i") },
        { model: new RegExp(search, "i") },
        { vehicleType: new RegExp(search, "i") },
        { sellerName: new RegExp(search, "i") },
      ]
    }

    // Filter by brand
    if (brand && brand !== "all") {
      query.brand = new RegExp(`^${brand}$`, "i")
    }

    // Filter by transmission
    if (transmission && transmission !== "all") {
      query.transmission = transmission
    }

    // Filter by fuel type
    if (fuelType && fuelType !== "all") {
      query.fuelType = fuelType
    }

    // Filter by vehicle type
    if (vehicleType && vehicleType !== "all") {
      query.vehicleType = vehicleType
    }

    // Filter by location
    if (city && city !== "all") {
      query.city = new RegExp(`^${city}$`, "i")
    }
    if (state && state !== "all") {
      query.state = new RegExp(`^${state}$`, "i")
    }

    // Filter by year range
    if (minYear) {
      query.manufacturedYear = { ...query.manufacturedYear, $gte: Number.parseInt(minYear) }
    }
    if (maxYear) {
      query.manufacturedYear = { ...query.manufacturedYear, $lte: Number.parseInt(maxYear) }
    }

    // Filter by custom price range
    if (minPrice) {
      query.price = { ...query.price, $gte: Number.parseFloat(minPrice) }
    }
    if (maxPrice) {
      query.price = { ...query.price, $lte: Number.parseFloat(maxPrice) }
    }

    // Filter by predefined price range
    if (priceRange && priceRange !== "all") {
      if (priceRange === "above-20") {
        query.price = { $gte: 2000000 }
      } else if (priceRange === "above 20Lakhs") {
        query.price = { $gte: 2000000 }
      } else {
        const cleanRange = priceRange.replace("Lakhs", "")
        const [min, max] = cleanRange.split("-").map(Number)
        if (!isNaN(min) && !isNaN(max)) {
          query.price = { $gte: min * 100000, $lte: max * 100000 }
        }
      }
    }

    // Build sort object
    let sort = { createdAt: -1 } // Default sort
    if (sortBy) {
      switch (sortBy) {
        case "price-low":
          sort = { price: 1 }
          break
        case "price-high":
          sort = { price: -1 }
          break
        case "year-new":
          sort = { manufacturedYear: -1 }
          break
        case "year-old":
          sort = { manufacturedYear: 1 }
          break
        case "mileage-low":
          sort = { traveledKm: 1 }
          break
        case "popular":
          sort = { viewCount: -1 }
          break
        case "recent":
          sort = { createdAt: -1 }
          break
      }
    }

    // Execute queries
    const [cars, totalCars, filterOptions] = await Promise.all([
      Car.find(query).populate("seller", "username").sort(sort).skip(skip).limit(limit),
      Car.countDocuments(query),
      // Get filter options
      Promise.all([
        Car.distinct("brand", { status: "available" }),
        Car.distinct("city", { status: "available" }),
        Car.distinct("state", { status: "available" }),
        Car.aggregate([
          { $match: { status: "available" } },
          {
            $group: {
              _id: null,
              minPrice: { $min: "$price" },
              maxPrice: { $max: "$price" },
              avgPrice: { $avg: "$price" },
            },
          },
        ]),
      ]),
    ])

    const totalPages = Math.ceil(totalCars / limit)
    const [brands, cities, states, priceStats] = filterOptions

    const responseData = {
      cars,
      currentPage: page,
      totalPages,
      totalCars,
      query: req.query,
      filterOptions: {
        brands: brands.sort(),
        cities: cities.sort(),
        states: states.sort(),
        priceStats: priceStats[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 },
      },
      pagination: {
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }

    res.render("inventory/inventoryHome", responseData)
  } catch (error) {
    console.error("Error fetching cars:", error)
    req.flash("error", "Error loading inventory.")
    res.redirect("/")
  }
})

// API endpoint for React.js - Get cars with filters
router.get("/api/cars", validateFilters, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 12
    const skip = (page - 1) * limit

    const query = { status: "available" }
    const {
      brand,
      transmission,
      fuelType,
      vehicleType,
      minYear,
      maxYear,
      minPrice,
      maxPrice,
      search,
      sortBy,
      city,
      state,
      priceRange,
    } = req.query

    // Apply filters (same logic as above)
    if (search) {
      query.$or = [
        { brand: new RegExp(search, "i") },
        { model: new RegExp(search, "i") },
        { vehicleType: new RegExp(search, "i") },
      ]
    }

    if (brand && brand !== "all") query.brand = new RegExp(`^${brand}$`, "i")
    if (transmission && transmission !== "all") query.transmission = transmission
    if (fuelType && fuelType !== "all") query.fuelType = fuelType
    if (vehicleType && vehicleType !== "all") query.vehicleType = vehicleType
    if (city && city !== "all") query.city = new RegExp(`^${city}$`, "i")
    if (state && state !== "all") query.state = new RegExp(`^${state}$`, "i")

    if (minYear) query.manufacturedYear = { ...query.manufacturedYear, $gte: Number.parseInt(minYear) }
    if (maxYear) query.manufacturedYear = { ...query.manufacturedYear, $lte: Number.parseInt(maxYear) }
    if (minPrice) query.price = { ...query.price, $gte: Number.parseFloat(minPrice) }
    if (maxPrice) query.price = { ...query.price, $lte: Number.parseFloat(maxPrice) }

    // Handle predefined price ranges
    if (priceRange && priceRange !== "all") {
      if (priceRange === "above-20" || priceRange === "above 20Lakhs") {
        query.price = { $gte: 2000000 }
      } else {
        const cleanRange = priceRange.replace("Lakhs", "")
        const [min, max] = cleanRange.split("-").map(Number)
        if (!isNaN(min) && !isNaN(max)) {
          query.price = { $gte: min * 100000, $lte: max * 100000 }
        }
      }
    }

    let sort = { createdAt: -1 }
    if (sortBy) {
      switch (sortBy) {
        case "price-low":
          sort = { price: 1 }
          break
        case "price-high":
          sort = { price: -1 }
          break
        case "year-new":
          sort = { manufacturedYear: -1 }
          break
        case "year-old":
          sort = { manufacturedYear: 1 }
          break
        case "mileage-low":
          sort = { traveledKm: 1 }
          break
        case "popular":
          sort = { viewCount: -1 }
          break
      }
    }

    const [cars, totalCars] = await Promise.all([
      Car.find(query).populate("seller", "username").sort(sort).skip(skip).limit(limit),
      Car.countDocuments(query),
    ])

    res.json({
      success: true,
      data: {
        cars,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCars / limit),
          totalCars,
          hasNext: page * limit < totalCars,
          hasPrev: page > 1,
        },
      },
    })
  } catch (error) {
    console.error("API Error fetching cars:", error)
    res.status(500).json({
      success: false,
      error: "Error loading cars",
    })
  }
})

// Get single car details
router.get("/car/:id", validateObjectId, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate("seller", "username email mobileNumber")
      .populate("agent", "username")

    if (!car) {
      req.flash("error", "Car not found.")
      return res.redirect("/inventory")
    }

    // Get related cars and reviews
    const [relatedCars, reviews, ratingStats] = await Promise.all([
      Car.find({
        _id: { $ne: car._id },
        status: "available",
        $or: [{ brand: car.brand }, { vehicleType: car.vehicleType }],
      })
        .limit(6)
        .sort({ createdAt: -1 }),
      Review.find({ car: car._id, isHidden: false }).populate("user", "username").sort({ createdAt: -1 }).limit(10),
      Review.getAverageRating(car._id),
    ])

    // Increment view count
    await car.incrementViewCount()

    res.render("inventory/carDetails", {
      car,
      relatedCars,
      reviews,
      ratingStats,
    })
  } catch (error) {
    console.error("Error fetching car details:", error)
    req.flash("error", "Error loading car details.")
    res.redirect("/inventory")
  }
})

// API endpoint for single car details
router.get("/api/car/:id", validateObjectId, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate("seller", "username email mobileNumber")
      .populate("agent", "username")

    if (!car) {
      return res.status(404).json({
        success: false,
        error: "Car not found",
      })
    }

    const [relatedCars, reviews, ratingStats] = await Promise.all([
      Car.find({
        _id: { $ne: car._id },
        status: "available",
        $or: [{ brand: car.brand }, { vehicleType: car.vehicleType }],
      })
        .limit(6)
        .sort({ createdAt: -1 }),
      Review.find({ car: car._id, isHidden: false }).populate("user", "username").sort({ createdAt: -1 }).limit(10),
      Review.getAverageRating(car._id),
    ])

    await car.incrementViewCount()

    res.json({
      success: true,
      data: {
        car,
        relatedCars,
        reviews,
        ratingStats,
      },
    })
  } catch (error) {
    console.error("API Error fetching car details:", error)
    res.status(500).json({
      success: false,
      error: "Error loading car details",
    })
  }
})

// Search cars (API endpoint)
router.get("/api/search", async (req, res) => {
  try {
    const { q, limit = 10 } = req.query

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { cars: [] },
      })
    }

    const cars = await Car.searchCars(q)
      .select("brand model price photos vehicleType city state")
      .limit(Number.parseInt(limit))

    res.json({
      success: true,
      data: { cars },
    })
  } catch (error) {
    console.error("Error searching cars:", error)
    res.status(500).json({
      success: false,
      error: "Search failed",
    })
  }
})

// Get filter options (API endpoint)
router.get("/api/filters", async (req, res) => {
  try {
    const [brands, cities, states, vehicleTypes, fuelTypes, priceRanges] = await Promise.all([
      Car.distinct("brand", { status: "available" }),
      Car.distinct("city", { status: "available" }),
      Car.distinct("state", { status: "available" }),
      Car.distinct("vehicleType", { status: "available" }),
      Car.distinct("fuelType", { status: "available" }),
      Car.aggregate([
        { $match: { status: "available" } },
        {
          $group: {
            _id: null,
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
          },
        },
      ]),
    ])

    res.json({
      success: true,
      data: {
        brands: brands.sort(),
        cities: cities.sort(),
        states: states.sort(),
        vehicleTypes: vehicleTypes.sort(),
        fuelTypes: fuelTypes.sort(),
        priceRange: priceRanges[0] || { minPrice: 0, maxPrice: 0 },
      },
    })
  } catch (error) {
    console.error("Error fetching filter options:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch filter options",
    })
  }
})

export default router
