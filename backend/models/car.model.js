import mongoose from "mongoose"

const { Schema } = mongoose

const carSchema = new Schema(
  {
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
      maxlength: [50, "Brand name cannot exceed 50 characters"],
    },
    model: {
      type: String,
      required: [true, "Model is required"],
      trim: true,
      maxlength: [50, "Model name cannot exceed 50 characters"],
    },
    vehicleType: {
      type: String,
      enum: {
        values: ["sedan", "suv", "hatchback", "coupe", "convertible", "off-road", "sport", "muscle", "truck", "van"],
        message: "Please select a valid vehicle type",
      },
      required: [true, "Vehicle type is required"],
    },
    transmission: {
      type: String,
      enum: {
        values: ["manual", "automatic"],
        message: "Transmission must be either manual or automatic",
      },
      required: [true, "Transmission type is required"],
    },
    manufacturedYear: {
      type: Number,
      required: [true, "Manufactured year is required"],
      min: [1900, "Manufactured year must be after 1900"],
      max: [new Date().getFullYear(), `Manufactured year can't be in the future`],
    },
    fuelType: {
      type: String,
      enum: {
        values: ["diesel", "petrol", "electric", "gas", "hybrid"],
        message: "Please select a valid fuel type",
      },
      required: [true, "Fuel type is required"],
    },
    seater: {
      type: Number,
      required: [true, "Seater capacity is required"],
      min: [2, "A car must have at least 2 seats"],
      max: [12, "Seater capacity cannot exceed 12"],
    },
    exteriorColor: {
      type: String,
      required: [true, "Exterior color is required"],
      trim: true,
    },
    carNumber: {
      type: String,
      unique: true,
      required: [true, "Car number is required"],
      uppercase: true,
      trim: true,
    },
    traveledKm: {
      type: Number,
      required: [true, "Traveled kilometers are required"],
      min: [0, "Traveled kilometers cannot be negative"],
    },
    photos: {
      type: [String],
      required: [true, "Photos are required"],
      validate: {
        validator: (v) => v.length >= 4 && v.length <= 10,
        message: "There must be between 4 and 10 photos",
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [1000, "Price must be at least ₹1,000"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "available", "sold", "rejected"],
        message: "Status must be pending, available, sold, or rejected",
      },
      default: "pending",
    },
    // Engine specifications
    engine: {
      type: Number,
      min: [0, "Engine displacement cannot be negative"],
      max: [10000, "Engine displacement seems too high"],
    },
    torque: {
      type: Number,
      min: [0, "Torque cannot be negative"],
    },
    power: {
      type: Number,
      min: [0, "Power cannot be negative"],
    },
    groundClearance: {
      type: Number,
      min: [0, "Ground clearance cannot be negative"],
      max: [500, "Ground clearance seems too high"],
    },
    topSpeed: {
      type: Number,
      min: [0, "Top speed cannot be negative"],
      max: [500, "Top speed seems unrealistic"],
    },
    fuelTank: {
      type: Number,
      min: [0, "Fuel tank capacity cannot be negative"],
      max: [200, "Fuel tank capacity seems too high"],
    },
    driveType: {
      type: String,
      enum: {
        values: ["FWD", "RWD", "AWD", "4WD"],
        message: "Drive type must be FWD, RWD, AWD, or 4WD",
      },
    },
    // Location details
    address: {
      type: String,
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, "City name cannot exceed 50 characters"],
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, "State name cannot exceed 50 characters"],
    },
    pincode: {
      type: String,
      match: [/^\d{6}$/, "Pincode must be exactly 6 digits"],
    },
    // References
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller is required"],
    },
    agent: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    agentName: {
      type: String,
      trim: true,
    },
    sellerName: {
      type: String,
      required: [true, "Seller name is required"],
      trim: true,
      maxlength: [100, "Seller name cannot exceed 100 characters"],
    },
    sellerphone: {
      type: String,
      required: [true, "Seller phone number is required"],
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    // Additional fields
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    viewCount: {
      type: Number,
      default: 0,
    },
    isPromoted: {
      type: Boolean,
      default: false,
    },
    promotedUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for performance
carSchema.index({ seller: 1, status: 1 })
carSchema.index({ agent: 1, status: 1 })
carSchema.index({ status: 1, createdAt: -1 })
carSchema.index({ brand: 1, model: 1 })
carSchema.index({ vehicleType: 1, fuelType: 1 })
carSchema.index({ price: 1 })
carSchema.index({ city: 1, state: 1 })
carSchema.index({ carNumber: 1 })

// Virtual for car age
carSchema.virtual("age").get(function () {
  return new Date().getFullYear() - this.manufacturedYear
})

// Virtual for full location
carSchema.virtual("fullLocation").get(function () {
  const parts = [this.city, this.state].filter(Boolean)
  return parts.join(", ")
})

// Virtual for display name
carSchema.virtual("displayName").get(function () {
  return `${this.brand} ${this.model} (${this.manufacturedYear})`
})

// Pre-save middleware
carSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "available") {
    this._statusChangedToAvailable = true
  } else {
    this._statusChangedToAvailable = false
  }
  next()
})

// Post-save middleware for notifications
carSchema.post("save", async (doc) => {
  if (doc._statusChangedToAvailable) {
    try {
      const Request = mongoose.model("Request")
      const Notification = mongoose.model("Notification")

      const matchingRequests = await Request.find({
        $or: [{ brand: { $exists: false } }, { brand: doc.brand }],
        $or: [{ model: { $exists: false } }, { model: doc.model }],
        vehicleType: doc.vehicleType,
        transmission: doc.transmission,
        fuelType: doc.fuelType,
        $or: [
          { "manufacturedYearRange.minYear": { $exists: false } },
          { "manufacturedYearRange.minYear": { $lte: doc.manufacturedYear } },
        ],
        $or: [
          { "manufacturedYearRange.maxYear": { $exists: false } },
          { "manufacturedYearRange.maxYear": { $gte: doc.manufacturedYear } },
        ],
      }).populate("buyer")

      for (const request of matchingRequests) {
        const notification = new Notification({
          userId: request.buyer._id,
          message: `Great news! We found a ${doc.brand} ${doc.model} that matches your request. Check it out before it's gone!`,
          type: "car_match",
          relatedCar: doc._id,
        })
        await notification.save()
      }
    } catch (error) {
      console.error("Error creating availability notifications:", error)
    }
  }
})

// Instance methods
carSchema.methods.incrementViewCount = function () {
  this.viewCount += 1
  return this.save()
}

carSchema.methods.isAvailable = function () {
  return this.status === "available"
}

// Static methods
carSchema.statics.findAvailable = function (filters = {}) {
  return this.find({ status: "available", ...filters }).sort({ createdAt: -1 })
}

carSchema.statics.findByPriceRange = function (minPrice, maxPrice) {
  return this.find({
    status: "available",
    price: { $gte: minPrice, $lte: maxPrice },
  })
}

carSchema.statics.searchCars = function (searchTerm) {
  const regex = new RegExp(searchTerm, "i")
  return this.find({
    status: "available",
    $or: [{ brand: regex }, { model: regex }, { vehicleType: regex }, { fuelType: regex }],
  })
}

const Car = mongoose.model("Car", carSchema)
export default Car
