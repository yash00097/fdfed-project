import express from "express";
import Car from "../models/car.model.js";

const router = express.Router();

// Inventory endpoint: list available cars (public)
router.get("/inventory", async (req, res, next) => {
  try {
    const query = { status: "available" };

    // Apply filters dynamically based on query params
    const {
      vehicleType,
      transmission,
      fuelType,
      seater,
      exteriorColor,
      manufacturedYear,
      traveledKm,
      price,
    } = req.query;

    if (vehicleType) query.vehicleType = vehicleType;
    if (transmission) query.transmission = transmission;
    if (fuelType) query.fuelType = fuelType;
    if (seater) query.seater = Number(seater);
    if (exteriorColor) query.exteriorColor = { $regex: new RegExp(`^${exteriorColor}$`, "i") }; //case-insensitive
    if (manufacturedYear) query.manufacturedYear = { $gte: Number(manufacturedYear) }; // show cars above or equal
    if (traveledKm) query.traveledKm = { $lte: Number(traveledKm) }; // show cars below or equal
    if (price) query.price = { $lte: Number(price) };

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

export default router;