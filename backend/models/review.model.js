import mongoose from "mongoose"

const { Schema } = mongoose

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    purchase: {
      type: Schema.Types.ObjectId,
      ref: "Purchase",
      required: [true, "Purchase is required"],
    },
    car: {
      type: Schema.Types.ObjectId,
      ref: "Car",
      required: [true, "Car is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      minlength: [10, "Comment must be at least 10 characters long"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    // Additional review fields
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    pros: [
      {
        type: String,
        trim: true,
        maxlength: [100, "Pro cannot exceed 100 characters"],
      },
    ],
    cons: [
      {
        type: String,
        trim: true,
        maxlength: [100, "Con cannot exceed 100 characters"],
      },
    ],
    wouldRecommend: {
      type: Boolean,
      default: true,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: true, // Since it's linked to a purchase
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for performance
reviewSchema.index({ user: 1, purchase: 1 }, { unique: true })
reviewSchema.index({ car: 1, rating: -1 })
reviewSchema.index({ createdAt: -1 })
reviewSchema.index({ rating: -1 })
reviewSchema.index({ isHidden: 1 })

// Virtual for star display
reviewSchema.virtual("starDisplay").get(function () {
  return "★".repeat(this.rating) + "☆".repeat(5 - this.rating)
})

// Virtual for review age
reviewSchema.virtual("reviewAge").get(function () {
  const days = Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24))
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 30) return `${days} days ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
})

// Instance methods
reviewSchema.methods.incrementHelpfulVotes = function () {
  this.helpfulVotes += 1
  return this.save()
}

reviewSchema.methods.hide = function () {
  this.isHidden = true
  return this.save()
}

reviewSchema.methods.show = function () {
  this.isHidden = false
  return this.save()
}

// Static methods
reviewSchema.statics.findVisibleReviews = function () {
  return this.find({ isHidden: false }).populate("user car").sort({ createdAt: -1 })
}

reviewSchema.statics.getAverageRating = async function (carId) {
  const result = await this.aggregate([
    { $match: { car: carId, isHidden: false } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ])

  return result.length > 0 ? result[0] : { avgRating: 0, count: 0 }
}

reviewSchema.statics.getRatingDistribution = async function (carId) {
  const distribution = await this.aggregate([
    { $match: { car: carId, isHidden: false } },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ])

  // Fill in missing ratings with 0
  const result = {}
  for (let i = 1; i <= 5; i++) {
    result[i] = 0
  }

  distribution.forEach((item) => {
    result[item._id] = item.count
  })

  return result
}

reviewSchema.statics.getTopReviews = function (limit = 10) {
  return this.find({ isHidden: false }).populate("user car").sort({ helpfulVotes: -1, createdAt: -1 }).limit(limit)
}

const Review = mongoose.model("Review", reviewSchema)
export default Review
