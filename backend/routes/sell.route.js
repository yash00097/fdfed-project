import express from "express";
import { upload } from "../config/cloudinaryConfig.js";
import { sellCar } from "../controllers/sell.controller.js";

const router = express.Router();

// Sell request route
router.post("/sell", upload.array("photos", 4), sellCar);

export default router;