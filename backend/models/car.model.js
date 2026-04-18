import mongoose from "mongoose";

const { Schema } = mongoose;

const pdfUrlValidator = (value) =>
  typeof value === "string" &&
  value.toLowerCase().includes("/raw/upload/") &&
  value.toLowerCase().includes(".pdf");

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
        values: [
          "sedan",
          "suv",
          "hatchback",
          "coupe",
          "convertible",
          "off-road",
          "sport",
          "muscle",
        ],
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
      max: [new Date().getFullYear(), "Manufactured year can't be in the future"],
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
        validator: (v) => Array.isArray(v) && v.length >= 4,
        message: "At least 4 photos are required",
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [1000, "Price must be at least ₹1,000"],
    },
    description: {
      type: String,
      required: [true, "Car description is required"],
      trim: true,
      maxlength: [1000, "Car description cannot exceed 1000 characters"],
    },
    // Optional. Keep empty if there is no accident history for the car.
    accidentHistory: {
      type: [
        {
          incidentType: {
            type: String,
            enum: [
              "minor_scratch_dent",
              "bumper_replacement",
              "glass_windshield_damage",
              "major_collision",
            ],
            required: true,
          },
          accidentDate: {
            type: Date,
            required: true,
          },
          repairStatus: {
            type: String,
            enum: ["authorized_center", "local_repair"],
            required: true,
          },
          airbagsDeployed: {
            type: Boolean,
            required: true,
          },
          insuranceClaimed: {
            type: Boolean,
            required: true,
          },
          description: {
            type: String,
            trim: true,
            maxlength: [300, "Accident description cannot exceed 300 characters"],
            default: "",
          },
        },
      ],
      default: [],
    },
    ownershipHistory: [
      {
        ownerSequence: {
          type: Number,
          required: [true, "Owner sequence is required"],
          min: [1, "Owner number must be at least 1"],
          max: [10, "Owner number cannot exceed 10"],
          required: [true, "Owner sequence is required"],
        },
        usageCategory: {
          type: String,
          enum: {
            values: [
              "private_personal",
              "corporate_lease",
              "taxi_commercial",
              "demo_car",
            ],
            message: "Please select a valid usage category",
          },
          required: [true, "Usage category is required"],
        },
        registrationCity: {
          type: String,
          required: [true, "City of registration is required"],
          trim: true,
          maxlength: [50, "City of registration cannot exceed 50 characters"],
        },
        ownershipDuration: {
          type: String,
          required: [true, "Ownership duration is required"],
          trim: true,
          maxlength: [50, "Ownership duration cannot exceed 50 characters"],
        },
      },
    ],
    insuranceDetails: {
      policyType: {
        type: String,
        enum: {
          values: [
            "comprehensive_zero_dep",
            "comprehensive_standard",
            "third_party_only",
          ],
          message: "Please select a valid policy type",
        },
        required: [true, "Policy type is required"],
      },
      providerName: {
        type: String,
        required: [true, "Insurance provider name is required"],
        trim: true,
        maxlength: [100, "Provider name cannot exceed 100 characters"],
      },
      expiryDate: {
        type: Date,
        required: [true, "Insurance expiry date is required"],
      },
      ncbPercentage: {
        type: Number,
        required: [true, "No Claim Bonus percentage is required"],
        min: [0, "NCB cannot be below 0%"],
        max: [100, "NCB cannot exceed 100%"],
      },
    },
    documentUploads: {
      rcFront: {
        type: String,
        required: [true, "RC front document is required"],
        validate: {
          validator: pdfUrlValidator,
          message: "RC front must be a PDF document URL",
        },
      },
      rcBack: {
        type: String,
        required: [true, "RC back document is required"],
        validate: {
          validator: pdfUrlValidator,
          message: "RC back must be a PDF document URL",
        },
      },
      insuranceCopy: {
        type: String,
        required: [true, "Insurance copy is required"],
        validate: {
          validator: pdfUrlValidator,
          message: "Insurance copy must be a PDF document URL",
        },
      },
      pucCertificate: {
        type: String,
        required: [true, "PUC certificate is required"],
        validate: {
          validator: pdfUrlValidator,
          message: "PUC certificate must be a PDF document URL",
        },
      },
      serviceLogs: {
        type: [String],
        validate: {
          validator: (v) =>
            Array.isArray(v) && v.length > 0 && v.every(pdfUrlValidator),
          message: "At least one PDF service log is required",
        },
        required: [true, "Service logs are required"],
      },
      nocDocument: {
        type: String,
        required: [true, "NOC document is required"],
        validate: {
          validator: pdfUrlValidator,
          message: "NOC document must be a PDF document URL",
        },
      },
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
      enum: ["pending", "available", "verification", "sold", "rejected"],
      message: "Status must be pending, available, verification, sold, or rejected",
      default: "pending",
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, "Rejection reason cannot exceed 500 characters"],
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

    // Verification tracking fields
    verificationDays: {
      type: Number,
      min: [1, "Verification days must be at least 1"],
      max: [10, "Verification days cannot exceed 10"],
    },
    verificationDeadline: {
      type: Date,
    },
    verificationStartTime: {
      type: Date,
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

// Indexes for performance optimization
carSchema.index({ agent: 1, status: 1 });
carSchema.index({ status: 1 });
carSchema.index({ seller: 1, status: 1 });
carSchema.index({ brand: 1, model: 1 });
carSchema.index({ price: 1 });
carSchema.index({ vehicleType: 1, fuelType: 1 });
carSchema.index({ brand: "text", model: "text", vehicleType: "text", exteriorColor: "text", fuelType: "text" });

const Car = mongoose.model("Car", carSchema);
export default Car;
