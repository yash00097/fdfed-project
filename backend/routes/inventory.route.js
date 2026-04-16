import express from "express";
import { cacheResponse } from "../middleware/cache.js";
import { getCarById, getTopBrands, listAvailableCars } from "../controllers/car.controller.js";
import { createCacheKey } from "../utils/cache.js";

const router = express.Router();

router.get(
  "/inventory",
  cacheResponse("cars:list", 180, (req) => createCacheKey("cars:list", req.query)),
  listAvailableCars
);

// Top-selling brands over a time window (public)
// Query params: months (default 12), limit (default 9)
router.get(
  "/top-brands",
  cacheResponse("cars:top-brands", 900, (req) =>
    createCacheKey("cars:top-brands", req.query)
  ),
  getTopBrands
);

// Get single car by ID (public)
router.get(
  "/:id",
  cacheResponse("cars:item", 300, (req) => `cars:item:${req.params.id}`),
  getCarById
);

export default router;
