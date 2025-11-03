import express from "express";
import { upload } from "../config/cloudinaryConfig.js";
import { verifyToken } from "../utils/verifyUser.js";
import {
  getAllReviews,
  getEligiblePurchases,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews
} from "../controllers/review.controller.js";

const router = express.Router();

// Public route - get all reviews for About page
router.get("/", getAllReviews);

// Protected routes - require authentication
router.get("/eligible", verifyToken, getEligiblePurchases);
router.get("/my-reviews", verifyToken, getUserReviews);
router.post("/", verifyToken, upload.array("photos", 5), createReview);
router.put("/:id", verifyToken, upload.array("photos", 5), updateReview);
router.delete("/:id", verifyToken, deleteReview);

export default router;
