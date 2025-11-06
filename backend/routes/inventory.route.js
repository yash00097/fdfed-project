import express from "express";
import Car from "../models/car.model.js";

const router = express.Router();

// Inventory endpoint: list available cars (public)
router.get("/inventory", async (req, res, next) => {
  try {
    const query = { status: "available" };

    // Apply filters dynamically based on query params
    const {
      brand,
      model,
      vehicleType,
      transmission,
      fuelType,
      seater,
      exteriorColor,
      manufacturedYear,
      traveledKm,
      price,
      priceRange,
    } = req.query;

    if (brand) query.brand = { $regex: new RegExp(`^${brand}`, "i") }; // case-insensitive brand search
    if (model) query.model = { $regex: new RegExp(`^${model}`, "i") }; // case-insensitive model search
    if (vehicleType) query.vehicleType = vehicleType;
    if (transmission) query.transmission = transmission;
    if (fuelType) query.fuelType = fuelType;
    if (seater) query.seater = Number(seater);
    if (exteriorColor)
      query.exteriorColor = { $regex: new RegExp(`^${exteriorColor}$`, "i") }; //case-insensitive
    if (manufacturedYear)
      query.manufacturedYear = { $gte: Number(manufacturedYear) }; // show cars above or equal
    if (traveledKm) query.traveledKm = { $lte: Number(traveledKm) }; // show cars below or equal
    if (price) query.price = { $lte: Number(price) };

    // Handle price range filter
    if (priceRange) {
      if (priceRange.includes("-")) {
        const [minPrice, maxPrice] = priceRange.split("-").map(Number);
        query.price = { $gte: minPrice, $lte: maxPrice };
      } else {
        // Handle "above" cases like "5000001"
        query.price = { $gte: Number(priceRange) };
      }
    }

    const cars = await Car.find(query)
      .select(
        "brand model price photos carNumber manufacturedYear vehicleType transmission seater exteriorColor fuelType traveledKm sellerName sellerphone"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, cars });
  } catch (err) {
    console.error("Error fetching inventory:", err);
    next(err);
  }
});

// Top-selling brands over a time window (public)
// Query params: months (default 12), limit (default 9)
router.get("/top-brands", async (req, res, next) => {
  try {
    const months = Math.max(parseInt(req.query.months || "12", 10) || 12, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "9", 10) || 9, 1), 50);

    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - (months - 1));
    fromDate.setDate(1);
    fromDate.setHours(0, 0, 0, 0);

    const agg = await Car.aggregate([
      {
        $match: {
          status: "sold",
          updatedAt: { $gte: fromDate },
        },
      },
      {
        $group: {
          _id: "$brand",
          soldCount: { $sum: 1 },
        },
      },
      { $sort: { soldCount: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          brand: { $ifNull: ["$_id", "Unknown"] },
          soldCount: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, brands: agg, windowMonths: months, fromDate });
  } catch (err) {
    console.error("Error fetching top brands:", err);
    next(err);
  }
});

// Get single car by ID (public)
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    res.status(200).json({ success: true, car });
  } catch (err) {
    console.error("Error fetching car:", err);
    next(err);
  }
});

export default router;
