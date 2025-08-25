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
        values: ["car_match", "purchase_update", "review_request", "general", "promotion"],
        message: "Type must be car_match, purchase_update, review_request, general, or promotion",
      },
      default: "general",
    },
    read: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Priority must be low, medium, or high",
      },
      default: "medium",
    },
    // Related entities
    relatedCar: {
      type: Schema.Types.ObjectId,
      ref: "Car",
      default: null,
    },
    relatedPurchase: {
      type: Schema.Types.ObjectId,
      ref: "Purchase",
      default: null,
    },
    relatedRequest: {
      type: Schema.Types.ObjectId,
      ref: "Request",
      default: null,
    },
    // Action URL for frontend navigation
    actionUrl: {
      type: String,
      trim: true,
    },
    // Metadata for additional information
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for performance
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 })
notificationSchema.index({ type: 1 })
notificationSchema.index({ priority: 1 })
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 }) // TTL: 30 days

// Virtual for notification age
notificationSchema.virtual("age").get(function () {
  const minutes = Math.floor((new Date() - this.createdAt) / (1000 * 60))
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`

  return this.createdAt.toLocaleDateString()
})

// Virtual for icon based on type
notificationSchema.virtual("icon").get(function () {
  const icons = {
    car_match: "🚗",
    purchase_update: "📦",
    review_request: "⭐",
    general: "📢",
    promotion: "🎉",
  }
  return icons[this.type] || "📢"
})

// Instance methods
notificationSchema.methods.markAsRead = function () {
  this.read = true
  return this.save()
}

notificationSchema.methods.markAsUnread = function () {
  this.read = false
  return this.save()
}

// Static methods
notificationSchema.statics.findUnreadForUser = function (userId) {
  return this.find({ userId, read: false })
    .populate("relatedCar relatedPurchase relatedRequest")
    .sort({ createdAt: -1 })
}

notificationSchema.statics.findForUser = function (userId, limit = 50) {
  return this.find({ userId })
    .populate("relatedCar relatedPurchase relatedRequest")
    .sort({ createdAt: -1 })
    .limit(limit)
}

notificationSchema.statics.markAllAsReadForUser = function (userId) {
  return this.updateMany({ userId, read: false }, { read: true })
}

notificationSchema.statics.getUnreadCountForUser = function (userId) {
  return this.countDocuments({ userId, read: false })
}

notificationSchema.statics.createCarMatchNotification = function (userId, car) {
  return this.create({
    userId,
    message: `Great news! We found a ${car.brand} ${car.model} that matches your request. Check it out before it's gone!`,
    type: "car_match",
    relatedCar: car._id,
    actionUrl: `/cars/${car._id}`,
    priority: "high",
  })
}

notificationSchema.statics.createPurchaseUpdateNotification = function (userId, purchase, message) {
  return this.create({
    userId,
    message,
    type: "purchase_update",
    relatedPurchase: purchase._id,
    actionUrl: `/purchases/${purchase._id}`,
    priority: "medium",
  })
}

notificationSchema.statics.createReviewRequestNotification = function (userId, purchase) {
  return this.create({
    userId,
    message: `How was your experience with your recent purchase? Share your review to help other buyers.`,
    type: "review_request",
    relatedPurchase: purchase._id,
    actionUrl: `/reviews/create/${purchase._id}`,
    priority: "low",
  })
}

const Notification = mongoose.model("Notification", notificationSchema)
export default Notification
