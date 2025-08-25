import mongoose from "mongoose"

const { Schema } = mongoose

const purchaseSchema = new Schema(
  {
    car: {
      type: Schema.Types.ObjectId,
      ref: "Car",
      required: [true, "Car is required"],
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Buyer is required"],
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\d{10}$/, "Please provide a valid 10-digit phone number"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [50, "City name cannot exceed 50 characters"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      maxlength: [50, "State name cannot exceed 50 characters"],
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      match: [/^\d{6}$/, "Please provide a valid 6-digit pincode"],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ["cod", "netbanking", "online"],
        message: "Payment method must be cod, netbanking, or online",
      },
      default: "cod",
    },
    // Netbanking specific fields
    bankName: {
      type: String,
      trim: true,
      required: function () {
        return this.paymentMethod === "netbanking"
      },
    },
    accountNumber: {
      type: String,
      trim: true,
      required: function () {
        return this.paymentMethod === "netbanking"
      },
      match: [/^[0-9]{9,18}$/, "Please provide a valid account number"],
    },
    ifscCode: {
      type: String,
      trim: true,
      uppercase: true,
      required: function () {
        return this.paymentMethod === "netbanking"
      },
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Please provide a valid IFSC code"],
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price cannot be negative"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "processing", "delivered", "cancelled"],
        message: "Status must be pending, confirmed, processing, delivered, or cancelled",
      },
      default: "pending",
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    deliveryDate: {
      type: Date,
      default: null,
    },
    trackingNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [200, "Cancellation reason cannot exceed 200 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for performance
purchaseSchema.index({ buyer: 1, status: 1 })
purchaseSchema.index({ car: 1 })
purchaseSchema.index({ status: 1, purchaseDate: -1 })
purchaseSchema.index({ trackingNumber: 1 })

// Virtual for buyer full name
purchaseSchema.virtual("buyerFullName").get(function () {
  return `${this.firstName} ${this.lastName}`
})

// Virtual for full address
purchaseSchema.virtual("fullAddress").get(function () {
  return `${this.address}, ${this.city}, ${this.state} - ${this.pincode}`
})

// Virtual for purchase age in days
purchaseSchema.virtual("purchaseAgeInDays").get(function () {
  return Math.floor((new Date() - this.purchaseDate) / (1000 * 60 * 60 * 24))
})

// Pre-save middleware to generate tracking number
purchaseSchema.pre("save", function (next) {
  if (this.isNew && !this.trackingNumber) {
    this.trackingNumber = `PW${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  }

  if (this.isModified("status") && this.status === "delivered" && !this.deliveryDate) {
    this.deliveryDate = new Date()
  }

  next()
})

// Instance methods
purchaseSchema.methods.canBeCancelled = function () {
  return ["pending", "confirmed"].includes(this.status)
}

purchaseSchema.methods.cancel = function (reason) {
  if (!this.canBeCancelled()) {
    throw new Error("Purchase cannot be cancelled at this stage")
  }
  this.status = "cancelled"
  this.cancellationReason = reason
  return this.save()
}

purchaseSchema.methods.markAsDelivered = function () {
  this.status = "delivered"
  this.deliveryDate = new Date()
  return this.save()
}

// Static methods
purchaseSchema.statics.findByStatus = function (status) {
  return this.find({ status }).populate("car buyer").sort({ purchaseDate: -1 })
}

purchaseSchema.statics.findRecentPurchases = function (days = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return this.find({
    purchaseDate: { $gte: startDate },
  })
    .populate("car buyer")
    .sort({ purchaseDate: -1 })
}

purchaseSchema.statics.getPurchaseStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalValue: { $sum: "$totalPrice" },
      },
    },
  ])

  return stats
}

const Purchase = mongoose.model("Purchase", purchaseSchema)
export default Purchase
