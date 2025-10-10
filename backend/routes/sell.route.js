import express from "express";
import { upload } from "../config/cloudinaryConfig.js";
import { sellCar } from "../controllers/sell.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
import Car from "../models/car.model.js";

const router = express.Router();

// Sell request route - requires authentication
router.post("/sell", verifyToken, upload.array("photos", 4), sellCar);

// Inventory endpoint: list available cars (public)
router.get("/inventory", async (req, res, next) => {
  try {
    const cars = await Car.find({ status: "available" })
      .select("brand model price photos carNumber manufacturedYear vehicleType fuelType")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, cars });
  } catch (err) {
    next(err);
  }
});

export default router;