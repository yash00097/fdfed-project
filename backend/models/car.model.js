import mongoose from "mongoose";

const { Schema } = mongoose;

const carSchema = new Schema(
  {
    // Required fields from user
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
        values: ["sedan", "suv", "hatchback", "coupe", "convertible", "off-road", "sport", "muscle"],
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
        values: ["diesel", "petrol", "electric", "gas"],
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
        validator: function (v) {
          return v && v.length >= 4;
        },
        message: "At least 4 photos are required",
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [1000, "Price must be at least ₹1,000"],
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

    // Optional fields
    status: {
      type: String,
      enum: {
        values: ["pending", "available", "sold", "rejected"],
        message: "Status must be pending, available, sold, or rejected",
      },
      default: "pending",
    },
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
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    agent: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    agentName: {
      type: String,
      trim: true,
    },

    // Technical specifications (to be filled by agent later)
    engine: {
      type: Number,
      min: [0, "Engine cannot be negative"],
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
    },
    topSpeed: {
      type: Number,
      min: [0, "Top speed cannot be negative"],
    },
    fuelTank: {
      type: Number,
      min: [0, "Fuel tank capacity cannot be negative"],
    },
    driveType: {
      type: String,
      enum: {
        values: ["FWD", "RWD", "AWD"],
        message: "Drive type must be FWD, RWD, or AWD",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
carSchema.index({ agent: 1, status: 1 });
carSchema.index({ status: 1 });
carSchema.index({ seller: 1, status: 1 });

const Car = mongoose.model("Car", carSchema);
export default Car;