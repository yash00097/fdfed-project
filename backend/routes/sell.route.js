import express from "express";
import { upload } from "../config/cloudinaryConfig.js";
import { sellCar } from "../controllers/sell.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
import Car from "../models/car.model.js";

const router = express.Router();

// Sell request route - requires authentication (photos are now pre-uploaded URLs)
router.post("/sell", verifyToken, sellCar);

export default router;
