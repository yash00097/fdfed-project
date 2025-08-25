import mongoose from "mongoose"

const { Schema } = mongoose

const requestSchema = new Schema(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Buyer is required"],
    },
    brand: {
      type: String,
      required: false,
      trim: true,
      maxlength: [50, "Brand name cannot exceed 50 characters"],
    },
    model: {
      type: String,
      required: false,
      trim: true,
      maxlength: [50, "Model name cannot exceed 50 characters"],
    },
    vehicleType: {
      type: String,
      enum: {
        values: ["sedan", "suv", "hatchback", "coupe", "convertible", "truck", "van", "off-road", "sport", "muscle"],
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
    manufacturedYearRange: {
      minYear: {
        type: Number,
        min: [1900, "Invalid manufacturing year"],
        max: [new Date().getFullYear(), "Future year not allowed"],
      },
      maxYear: {
        type: Number,
        min: [1900, "Invalid manufacturing year"],
        max: [new Date().getFullYear(), "Future year not allowed"],
      },
    },
    fuelType: {
      type: String,
      enum: {
        values: ["diesel", "petrol", "electric", "gas", "hybrid"],
        message: "Please select a valid fuel type",
      },
      required: [true, "Fuel type is required"],
    },
    priceRange: {
      minPrice: {
        type: Number,
        min: [0, "Minimum price cannot be negative"],
      },
      maxPrice: {
        type: Number,
        min: [0, "Maximum price cannot be negative"],
      },
    },
    preferredLocation: {
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
    },
    additionalRequirements: {
      type: String,
      trim: true,
      maxlength: [500, "Additional requirements cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ["active", "fulfilled", "cancelled"],
        message: "Status must be active, fulfilled, or cancelled",
      },
      default: "active",
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Priority must be low, medium, or high",
      },
      default: "medium",
    },
    notificationCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for performance
requestSchema.index({ buyer: 1, status: 1 })
requestSchema.index({ vehicleType: 1, fuelType: 1 })
requestSchema.index({ status: 1, createdAt: -1 })
requestSchema.index({ "preferredLocation.city": 1, "preferredLocation.state": 1 })

// Virtual for year range display
requestSchema.virtual("yearRangeDisplay").get(function () {
  if (this.manufacturedYearRange.minYear && this.manufacturedYearRange.maxYear) {
    return `${this.manufacturedYearRange.minYear} - ${this.manufacturedYearRange.maxYear}`
  }
  return "Any year"
})

// Virtual for price range display
requestSchema.virtual("priceRangeDisplay").get(function () {
  if (this.priceRange.minPrice && this.priceRange.maxPrice) {
    return `₹${this.priceRange.minPrice.toLocaleString()} - ₹${this.priceRange.maxPrice.toLocaleString()}`
  }
  return "Any price"
})

// Validation for year range
requestSchema.pre("save", function (next) {
  if (this.manufacturedYearRange.minYear && this.manufacturedYearRange.maxYear) {
    if (this.manufacturedYearRange.minYear > this.manufacturedYearRange.maxYear) {
      return next(new Error("Minimum year cannot be greater than maximum year"))
    }
  }

  if (this.priceRange.minPrice && this.priceRange.maxPrice) {
    if (this.priceRange.minPrice > this.priceRange.maxPrice) {
      return next(new Error("Minimum price cannot be greater than maximum price"))
    }
  }

  next()
})

// Instance methods
requestSchema.methods.incrementNotificationCount = function () {
  this.notificationCount += 1
  return this.save()
}

requestSchema.methods.markAsFulfilled = function () {
  this.status = "fulfilled"
  return this.save()
}

// Static methods
requestSchema.statics.findActiveRequests = function () {
  return this.find({ status: "active" }).populate("buyer").sort({ createdAt: -1 })
}

requestSchema.statics.findMatchingRequests = function (car) {
  const query = {
    status: "active",
    vehicleType: car.vehicleType,
    transmission: car.transmission,
    fuelType: car.fuelType,
  }

  // Add brand filter if specified in request
  if (car.brand) {
    query.$or = [{ brand: { $exists: false } }, { brand: car.brand }]
  }

  // Add model filter if specified in request
  if (car.model) {
    query.$or = query.$or || []
    query.$or.push({ model: { $exists: false } }, { model: car.model })
  }

  return this.find(query)
}

const Request = mongoose.model("Request", requestSchema)
export default Request
