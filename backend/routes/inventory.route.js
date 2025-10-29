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
