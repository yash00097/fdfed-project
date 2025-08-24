import express from "express"
import Request from "../models/request.model.js"
import Notification from "../models/notification.model.js"
import User from "../models/user.model.js"
import Car from "../models/car.model.js"
import { isLoggedIn, validateObjectId } from "../middleware.js"
import { body, validationResult } from "express-validator"
import rateLimit from "express-rate-limit"

const router = express.Router()

// Rate limiting for request creation
const requestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each user to 5 requests per hour
  message: "Too many requests created. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
})

// Validation middleware
const validateRequest = [
  body("vehicleType")
    .isIn(["sedan", "suv", "hatchback", "coupe", "convertible", "truck", "van", "off-road", "sport", "muscle"])
    .withMessage("Invalid vehicle type"),
  body("transmission").isIn(["manual", "automatic"]).withMessage("Invalid transmission type"),
  body("fuelType").isIn(["diesel", "petrol", "electric", "gas", "hybrid"]).withMessage("Invalid fuel type"),
  body("brand").optional().isLength({ max: 50 }).withMessage("Brand name cannot exceed 50 characters"),
  body("model").optional().isLength({ max: 50 }).withMessage("Model name cannot exceed 50 characters"),
  body("minYear").optional().isInt({ min: 1900, max: new Date().getFullYear() }).withMessage("Invalid minimum year"),
  body("maxYear").optional().isInt({ min: 1900, max: new Date().getFullYear() }).withMessage("Invalid maximum year"),
  body("minPrice").optional().isFloat({ min: 0 }).withMessage("Minimum price must be positive"),
  body("maxPrice").optional().isFloat({ min: 0 }).withMessage("Maximum price must be positive"),
]

// Get request form or display requests based on user role
router.get("/", isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (user.role === "host") {
      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 10
      const skip = (page - 1) * limit

      const [requests, totalRequests] = await Promise.all([
        Request.find().populate("buyer", "username email mobileNumber").sort({ createdAt: -1 }).skip(skip).limit(limit),
        Request.countDocuments(),
      ])

      const totalPages = Math.ceil(totalRequests / limit)

      res.render("host/requestDisplay", {
        requests,
        pagination: {
          currentPage: page,
          totalPages,
          totalRequests,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      })
    } else {
      // Get user's requests
      const userRequests = await Request.find({ buyer: req.user._id }).sort({ createdAt: -1 })
      res.render("buyerRequest", { userRequests })
    }
  } catch (error) {
    console.error("Error loading requests:", error)
    req.flash("error", "Error loading requests")
    res.redirect("/")
  }
})

// API endpoint for React.js - Get requests
router.get("/api/requests", isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    if (user.role === "host") {
      const [requests, totalRequests] = await Promise.all([
        Request.find().populate("buyer", "username email mobileNumber").sort({ createdAt: -1 }).skip(skip).limit(limit),
        Request.countDocuments(),
      ])

      res.json({
        success: true,
        data: {
          requests,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalRequests / limit),
            totalRequests,
            hasNext: page * limit < totalRequests,
            hasPrev: page > 1,
          },
        },
      })
    } else {
      const [requests, totalRequests] = await Promise.all([
        Request.find({ buyer: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Request.countDocuments({ buyer: req.user._id }),
      ])

      res.json({
        success: true,
        data: {
          requests,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalRequests / limit),
            totalRequests,
            hasNext: page * limit < totalRequests,
            hasPrev: page > 1,
          },
        },
      })
    }
  } catch (error) {
    console.error("API Error loading requests:", error)
    res.status(500).json({
      success: false,
      error: "Error loading requests",
    })
  }
})

// Create a new request
router.post("/", [isLoggedIn, requestLimiter, ...validateRequest], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg)
      return res.redirect("/request")
    }

    const { brand, model, vehicleType, transmission, fuelType, manufacturedYearRange } = req.body

    // Parse year range
    const minYear = Number.parseInt(manufacturedYearRange?.minYear, 10)
    const maxYear = Number.parseInt(manufacturedYearRange?.maxYear, 10)

    if (isNaN(minYear) || isNaN(maxYear) || minYear > maxYear) {
      req.flash("error", "Invalid manufacturing year range")
      return res.redirect("/request")
    }

    // Check for duplicate active requests
    const existingRequest = await Request.findOne({
      buyer: req.user._id,
      status: "active",
      vehicleType,
      transmission,
      fuelType,
      ...(brand && { brand }),
      ...(model && { model }),
    })

    if (existingRequest) {
      req.flash("error", "You already have a similar active request")
      return res.redirect("/request")
    }

    const newRequest = new Request({
      buyer: req.user._id,
      brand,
      model,
      vehicleType,
      transmission,
      manufacturedYearRange: {
        minYear: Math.max(1900, minYear),
        maxYear: Math.min(new Date().getFullYear(), maxYear),
      },
      fuelType,
      status: "active",
    })

    await newRequest.save()

    // Find matching cars
    const matchingCars = await Car.find({
      status: "available",
      vehicleType: newRequest.vehicleType,
      transmission: newRequest.transmission,
      fuelType: newRequest.fuelType,
      ...(brand && { brand: new RegExp(`^${brand}$`, "i") }),
      ...(model && { model: new RegExp(`^${model}$`, "i") }),
      manufacturedYear: {
        $gte: newRequest.manufacturedYearRange.minYear,
        $lte: newRequest.manufacturedYearRange.maxYear,
      },
    })

    // Create initial notification
    await Notification.create({
      userId: req.user._id,
      message:
        "We took your request and will notify you if your requested requirements for a car are available in our showroom.",
      type: "general",
      relatedRequest: newRequest._id,
      priority: "low",
    })

    // Create notifications for matching cars
    if (matchingCars.length > 0) {
      for (const car of matchingCars) {
        await Notification.create({
          userId: req.user._id,
          message: `We have your requested ${newRequest.brand || "car"} ${newRequest.model || ""}. You can buy the car before anyone can purchase. <a href="/buyCar/${car._id}">Click here to buy</a>`,
          type: "car_match",
          relatedCar: car._id,
          relatedRequest: newRequest._id,
          priority: "high",
        })
      }
    }

    req.flash("success", "Your request has been submitted successfully.")
    res.redirect("/")
  } catch (error) {
    console.error("Error creating request:", error)
    req.flash("error", "An error occurred while creating the request.")
    res.redirect("/request")
  }
})

// API endpoint for creating request
router.post("/api/create", [isLoggedIn, requestLimiter, ...validateRequest], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { brand, model, vehicleType, transmission, fuelType, manufacturedYearRange } = req.body

    const minYear = Number.parseInt(manufacturedYearRange?.minYear, 10)
    const maxYear = Number.parseInt(manufacturedYearRange?.maxYear, 10)

    if (isNaN(minYear) || isNaN(maxYear) || minYear > maxYear) {
      return res.status(400).json({
        success: false,
        error: "Invalid manufacturing year range",
      })
    }

    // Check for duplicates
    const existingRequest = await Request.findOne({
      buyer: req.user._id,
      status: "active",
      vehicleType,
      transmission,
      fuelType,
      ...(brand && { brand }),
      ...(model && { model }),
    })

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error: "You already have a similar active request",
      })
    }

    const newRequest = new Request({
      buyer: req.user._id,
      brand,
      model,
      vehicleType,
      transmission,
      manufacturedYearRange: {
        minYear: Math.max(1900, minYear),
        maxYear: Math.min(new Date().getFullYear(), maxYear),
      },
      fuelType,
      status: "active",
    })

    await newRequest.save()

    // Find matching cars
    const matchingCars = await Car.find({
      status: "available",
      vehicleType: newRequest.vehicleType,
      transmission: newRequest.transmission,
      fuelType: newRequest.fuelType,
      ...(brand && { brand: new RegExp(`^${brand}$`, "i") }),
      ...(model && { model: new RegExp(`^${model}$`, "i") }),
      manufacturedYear: {
        $gte: newRequest.manufacturedYearRange.minYear,
        $lte: newRequest.manufacturedYearRange.maxYear,
      },
    })

    // Create notifications
    await Notification.create({
      userId: req.user._id,
      message: "Your car request has been submitted successfully.",
      type: "general",
      relatedRequest: newRequest._id,
      priority: "low",
    })

    if (matchingCars.length > 0) {
      for (const car of matchingCars) {
        await Notification.createCarMatchNotification(req.user._id, car)
      }
    }

    res.json({
      success: true,
      message: "Request submitted successfully!",
      data: {
        request: newRequest,
        matchingCarsCount: matchingCars.length,
      },
    })
  } catch (error) {
    console.error("API Error creating request:", error)
    res.status(500).json({
      success: false,
      error: "Error creating request",
    })
  }
})

// Update request status
router.patch("/:id/status", [isLoggedIn, validateObjectId], async (req, res) => {
  try {
    const { status } = req.body

    if (!["active", "fulfilled", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status",
      })
    }

    const request = await Request.findOne({
      _id: req.params.id,
      buyer: req.user._id,
    })

    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Request not found",
      })
    }

    request.status = status
    await request.save()

    res.json({
      success: true,
      message: "Request status updated successfully",
      data: { request },
    })
  } catch (error) {
    console.error("Error updating request status:", error)
    res.status(500).json({
      success: false,
      error: "Error updating request status",
    })
  }
})

// Delete request
router.delete("/:id", [isLoggedIn, validateObjectId], async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      buyer: req.user._id,
    })

    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Request not found",
      })
    }

    await Request.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Request deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting request:", error)
    res.status(500).json({
      success: false,
      error: "Error deleting request",
    })
  }
})

export default router
