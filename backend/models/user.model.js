import mongoose from "mongoose"
import passportLocalMongoose from "passport-local-mongoose"

const { Schema } = mongoose

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, "Please provide a valid email address"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: {
        values: ["host", "agent", "normalUser"],
        message: "Role must be either host, agent, or normalUser",
      },
      default: "normalUser",
    },
    mobileNumber: {
      type: String,
      unique: true,
      sparse: true,
      match: [/^\d{10}$/, "Mobile number must be exactly 10 digits"],
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    profilePicture: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
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

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`
  }
  return this.username
})

// Indexes for performance
userSchema.index({ email: 1 })
userSchema.index({ username: 1 })
userSchema.index({ role: 1 })
userSchema.index({ isActive: 1 })

// Plugin for passport authentication
userSchema.plugin(passportLocalMongoose, {
  usernameField: "username",
  errorMessages: {
    UserExistsError: "A user with the given username is already registered",
  },
})

// Instance method to get user's active listings count
userSchema.methods.getActiveListingsCount = async function () {
  const Car = mongoose.model("Car")
  return await Car.countDocuments({ seller: this._id, status: "available" })
}

// Static method to find users by role
userSchema.statics.findByRole = function (role) {
  return this.find({ role, isActive: true })
}

const User = mongoose.model("User", userSchema)
export default User
