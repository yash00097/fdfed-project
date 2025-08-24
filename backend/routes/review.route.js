import express from "express"
import Review from "../models/review.model.js"
import Purchase from "../models/purchase.model.js"
import { isLoggedIn, validateObjectId } from "../middleware.js"
import { body, validationResult } from "express-validator"
import rateLimit from "express-rate-limit"

const router = express.Router()

// Rate limiting for review operations
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each user to 10 review operations per hour
  message: "Too many review operations. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
})

// Validation middleware
const validateReview = [
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").isLength({ min: 10, max: 500 }).withMessage("Comment must be between 10 and 500 characters"),
  body("title").optional().isLength({ max: 100 }).withMessage("Title cannot exceed 100 characters"),
  body("pros").optional().isArray().withMessage("Pros must be an array"),
  body("cons").optional().isArray().withMessage("Cons must be an array"),
  body("wouldRecommend").optional().isBoolean().withMessage("Would recommend must be a boolean"),
]

// Create a new review
router.post("/", [isLoggedIn, reviewLimiter, ...validateReview], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg)
      return res.redirect("/aboutUs")
    }

    const { purchaseId, rating, comment, title, pros, cons, wouldRecommend } = req.body

    // Validate purchase exists and belongs to user
    const purchase = await Purchase.findById(purchaseId).populate("car")
    if (!purchase) {
      req.flash("error", "Purchase not found")
      return res.redirect("/aboutUs")
    }

    if (purchase.buyer.toString() !== req.user._id.toString()) {
      req.flash("error", "You can only review cars you purchased")
      return res.redirect("/aboutUs")
    }

    // Check if user already reviewed this purchase
    const existingReview = await Review.findOne({
      user: req.user._id,
      purchase: purchaseId,
    })

    if (existingReview) {
      req.flash("error", "You have already reviewed this purchase")
      return res.redirect("/aboutUs")
    }

    // Create new review
    const newReview = new Review({
      user: req.user._id,
      purchase: purchaseId,
      car: purchase.car._id,
      rating: Number.parseInt(rating),
      comment,
      title,
      pros: Array.isArray(pros) ? pros.filter(Boolean) : [],
      cons: Array.isArray(cons) ? cons.filter(Boolean) : [],
      wouldRecommend: wouldRecommend === true || wouldRecommend === "true",
      userName: req.user.username,
    })

    await newReview.save()
    req.flash("success", "Review submitted successfully")
    res.redirect("/aboutUs")
  } catch (error) {
    console.error("Error creating review:", error)
    req.flash("error", "Error submitting review")
    res.redirect("/aboutUs")
  }
})

// API endpoint for creating review
router.post("/api/create", [isLoggedIn, reviewLimiter, ...validateReview], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { purchaseId, rating, comment, title, pros, cons, wouldRecommend } = req.body

    const purchase = await Purchase.findById(purchaseId).populate("car")
    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: "Purchase not found",
      })
    }

    if (purchase.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "You can only review cars you purchased",
      })
    }

    const existingReview = await Review.findOne({
      user: req.user._id,
      purchase: purchaseId,
    })

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: "You have already reviewed this purchase",
      })
    }

    const newReview = new Review({
      user: req.user._id,
      purchase: purchaseId,
      car: purchase.car._id,
      rating: Number.parseInt(rating),
      comment,
      title,
      pros: Array.isArray(pros) ? pros.filter(Boolean) : [],
      cons: Array.isArray(cons) ? cons.filter(Boolean) : [],
      wouldRecommend: wouldRecommend === true || wouldRecommend === "true",
      userName: req.user.username,
    })

    await newReview.save()

    res.json({
      success: true,
      message: "Review submitted successfully",
      data: { review: newReview },
    })
  } catch (error) {
    console.error("API Error creating review:", error)
    res.status(500).json({
      success: false,
      error: "Error submitting review",
    })
  }
})

// Update a review
router.put("/:id", [isLoggedIn, validateObjectId, reviewLimiter, ...validateReview], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg)
      return res.redirect("/aboutUs")
    }

    const { rating, comment, title, pros, cons, wouldRecommend } = req.body

    const review = await Review.findById(req.params.id)
    if (!review) {
      req.flash("error", "Review not found")
      return res.redirect("/aboutUs")
    }

    if (review.user.toString() !== req.user._id.toString()) {
      req.flash("error", "You can only edit your own reviews")
      return res.redirect("/aboutUs")
    }

    // Update review
    review.rating = Number.parseInt(rating)
    review.comment = comment
    review.title = title
    review.pros = Array.isArray(pros) ? pros.filter(Boolean) : []
    review.cons = Array.isArray(cons) ? cons.filter(Boolean) : []
    review.wouldRecommend = wouldRecommend === true || wouldRecommend === "true"

    await review.save()
    req.flash("success", "Review updated successfully")
    res.redirect("/aboutUs")
  } catch (error) {
    console.error("Error updating review:", error)
    req.flash("error", "Error updating review")
    res.redirect("/aboutUs")
  }
})

// API endpoint for updating review
router.put("/api/:id", [isLoggedIn, validateObjectId, reviewLimiter, ...validateReview], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { rating, comment, title, pros, cons, wouldRecommend } = req.body

    const review = await Review.findById(req.params.id)
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      })
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "You can only edit your own reviews",
      })
    }

    review.rating = Number.parseInt(rating)
    review.comment = comment
    review.title = title
    review.pros = Array.isArray(pros) ? pros.filter(Boolean) : []
    review.cons = Array.isArray(cons) ? cons.filter(Boolean) : []
    review.wouldRecommend = wouldRecommend === true || wouldRecommend === "true"

    await review.save()

    res.json({
      success: true,
      message: "Review updated successfully",
      data: { review },
    })
  } catch (error) {
    console.error("API Error updating review:", error)
    res.status(500).json({
      success: false,
      error: "Error updating review",
    })
  }
})

// Delete a review
router.delete("/:id", [isLoggedIn, validateObjectId], async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) {
      req.flash("error", "Review not found")
      return res.redirect("/aboutUs")
    }

    if (review.user.toString() !== req.user._id.toString()) {
      req.flash("error", "You can only delete your own reviews")
      return res.redirect("/aboutUs")
    }

    await Review.findByIdAndDelete(req.params.id)
    req.flash("success", "Review deleted successfully")
    res.redirect("/aboutUs")
  } catch (error) {
    console.error("Error deleting review:", error)
    req.flash("error", "Error deleting review")
    res.redirect("/aboutUs")
  }
})

// API endpoint for deleting review
router.delete("/api/:id", [isLoggedIn, validateObjectId], async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      })
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "You can only delete your own reviews",
      })
    }

    await Review.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Review deleted successfully",
    })
  } catch (error) {
    console.error("API Error deleting review:", error)
    res.status(500).json({
      success: false,
      error: "Error deleting review",
    })
  }
})

// Get reviews for a specific car
router.get("/car/:carId", validateObjectId, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const [reviews, totalReviews, averageRating, ratingDistribution] = await Promise.all([
      Review.findVisibleReviews().where("car").equals(req.params.carId).skip(skip).limit(limit),
      Review.countDocuments({ car: req.params.carId, isHidden: false }),
      Review.getAverageRating(req.params.carId),
      Review.getRatingDistribution(req.params.carId),
    ])

    res.json({
      success: true,
      data: {
        reviews,
        totalReviews,
        averageRating,
        ratingDistribution,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalReviews / limit),
          hasNext: page * limit < totalReviews,
          hasPrev: page > 1,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching car reviews:", error)
    res.status(500).json({
      success: false,
      error: "Error fetching reviews",
    })
  }
})

// Mark review as helpful
router.post("/:id/helpful", [isLoggedIn, validateObjectId], async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      })
    }

    await review.incrementHelpfulVotes()

    res.json({
      success: true,
      message: "Review marked as helpful",
      data: { helpfulVotes: review.helpfulVotes },
    })
  } catch (error) {
    console.error("Error marking review as helpful:", error)
    res.status(500).json({
      success: false,
      error: "Error processing request",
    })
  }
})

// Get user's reviews
router.get("/api/my-reviews", isLoggedIn, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const [reviews, totalReviews] = await Promise.all([
      Review.find({ user: req.user._id })
        .populate("car", "brand model")
        .populate("purchase", "totalPrice")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ user: req.user._id }),
    ])

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasNext: page * limit < totalReviews,
          hasPrev: page > 1,
        },
      },
    })
  } catch (error) {
    console.error("API Error fetching user reviews:", error)
    res.status(500).json({
      success: false,
      error: "Error fetching reviews",
    })
  }
})

export default router
