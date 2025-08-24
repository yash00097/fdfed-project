import mongoose from "mongoose"

const { Schema } = mongoose

const agentSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, "Please provide a valid email address"],
    },
    status: {
      type: String,
      enum: {
        values: ["approved", "pending", "rejected"],
        message: "Status must be approved, pending, or rejected",
      },
      default: "pending",
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    approvedDate: {
      type: Date,
      default: null,
    },
    rejectedDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for performance
agentSchema.index({ email: 1 })
agentSchema.index({ status: 1 })
agentSchema.index({ appliedDate: -1 })

// Virtual to check if agent is active
agentSchema.virtual("isActive").get(function () {
  return this.status === "approved"
})

// Pre-save middleware to set approval/rejection dates
agentSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    if (this.status === "approved" && !this.approvedDate) {
      this.approvedDate = new Date()
    } else if (this.status === "rejected" && !this.rejectedDate) {
      this.rejectedDate = new Date()
    }
  }
  next()
})

// Static method to get pending agents
agentSchema.statics.getPendingAgents = function () {
  return this.find({ status: "pending" }).sort({ appliedDate: -1 })
}

// Static method to get approved agents
agentSchema.statics.getApprovedAgents = function () {
  return this.find({ status: "approved" }).sort({ approvedDate: -1 })
}

const Agent = mongoose.model("Agent", agentSchema)
export default Agent
