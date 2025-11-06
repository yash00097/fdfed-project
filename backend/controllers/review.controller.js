import Review from "../models/review.model.js";
import Purchase from "../models/purchase.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

// Get all reviews (for About page)
export const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate({
        path: "car",
        select: "brand model"
      })
      .populate({
        path: "user",
        select: "username avatar"
      })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// Get user's eligible purchases for review
export const getEligiblePurchases = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all sold purchases (user bought the car)
    const purchases = await Purchase.find({
      buyer: userId,
      status: "sold"
    }).populate("car", "brand model photos");

    // Get already reviewed purchase IDs
    const reviewedPurchases = await Review.find({
      user: userId
    }).select("purchase");

    const reviewedPurchaseIds = reviewedPurchases.map(r => r.purchase.toString());

    // Filter out already reviewed purchases
    const eligiblePurchases = purchases.filter(
      purchase => !reviewedPurchaseIds.includes(purchase._id.toString())
    );

    res.status(200).json({
      success: true,
      canReview: eligiblePurchases.length > 0,
      purchases: eligiblePurchases,
      message: eligiblePurchases.length === 0 
        ? "No eligible purchases for review. Only purchased cars can be reviewed."
        : `You have ${eligiblePurchases.length} purchase(s) eligible for review.`
    });
  } catch (error) {
    next(error);
  }
};

// Create a review
export const createReview = async (req, res, next) => {
  try {
    const { purchaseId, rating, comment } = req.body;
    const userId = req.user.id;

    // Validate photos
    if (!req.files || req.files.length < 2) {
      return next(errorHandler(400, "Please upload at least 2 photos of your purchased car."));
    }

    // Get photo URLs from Cloudinary
    const photoUrls = req.files.map((file) => file.path);

    // Verify purchase exists and belongs to user
    const purchase = await Purchase.findOne({
      _id: purchaseId,
      buyer: userId,
      status: "sold"
    }).populate("car");

    if (!purchase) {
      return next(errorHandler(404, "Purchase not found or not eligible for review"));
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      user: userId,
      purchase: purchaseId
    });

    if (existingReview) {
      return next(errorHandler(400, "You have already reviewed this purchase"));
    }

    // Get user name
    const user = await User.findById(userId).select("username");

    // Create review
    const review = await Review.create({
      user: userId,
      purchase: purchaseId,
      car: purchase.car._id,
      rating: parseInt(rating),
      comment: comment.trim(),
      photos: photoUrls,
      userName: user.username
    });

    const populatedReview = await Review.findById(review._id)
      .populate("car", "brand model")
      .populate("user", "username avatar");

    res.status(201).json({
      success: true,
      message: "Review submitted successfully!",
      review: populatedReview
    });
  } catch (error) {
    next(error);
  }
};

// Update a review
export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await Review.findOne({ _id: id, user: userId });

    if (!review) {
      return next(errorHandler(404, "Review not found or you don't have permission"));
    }

    // Update fields
    if (rating) review.rating = parseInt(rating);
    if (comment) review.comment = comment.trim();
    
    // Update photos if new ones provided
    if (req.files && req.files.length >= 2) {
      review.photos = req.files.map((file) => file.path);
    }

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate("car", "brand model")
      .populate("user", "username avatar");

    res.status(200).json({
      success: true,
      message: "Review updated successfully!",
      review: populatedReview
    });
  } catch (error) {
    next(error);
  }
};

// Delete a review
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findOneAndDelete({ _id: id, user: userId });

    if (!review) {
      return next(errorHandler(404, "Review not found or you don't have permission"));
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully!"
    });
  } catch (error) {
    next(error);
  }
};

// Get user's own reviews
export const getUserReviews = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const reviews = await Review.find({ user: userId })
      .populate("car", "brand model")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    next(error);
  }
};
