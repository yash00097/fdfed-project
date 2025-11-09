import mongoose from "mongoose"

const { Schema } = mongoose

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    type: {
      type: String,
      enum: {
        values: ["car_match", "purchase_update", "review_request","verification_request", "general", "promotion"],
        message: "Type must be car_match, purchase_update, review_request,verification_request, general, or promotion",
      },
      default: "general",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

notificationSchema.index({ userId: 1, read: 1 })
notificationSchema.index({ type: 1 })

const Notification = mongoose.model("Notification", notificationSchema)
export default Notification
