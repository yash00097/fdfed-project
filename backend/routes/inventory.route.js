import express from "express";
import Car from "../models/car.model.js";

const router = express.Router();

// Inventory endpoint: list available cars (public)
router.get("/inventory", async (req, res, next) => {
  try {
    const cars = await Car.find({ status: "available" })
      .select(
        "brand model price photos carNumber manufacturedYear vehicleType transmission seater exteriorColor fuelType traveledKm sellerName sellerphone"
      )
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, cars });
  } catch (err) {
    next(err);
  }
});

export default router;