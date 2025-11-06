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
    photos: {
      type: [String],
      required: [true, "Photos are required"],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 2,
        message: "At least 2 photos are required",
      },
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

reviewSchema.index({ user: 1, purchase: 1 }, { unique: true })
reviewSchema.index({ car: 1 })

const Review = mongoose.model("Review", reviewSchema)
export default Review