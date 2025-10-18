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
  },
  {
    timestamps: true,
  },
)

requestSchema.index({ buyer: 1, status: 1 })
requestSchema.index({ vehicleType: 1, fuelType: 1 })
requestSchema.index({ status: 1 })

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

const Request = mongoose.model("Request", requestSchema)
export default Request
