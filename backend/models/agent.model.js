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
  },
  {
    timestamps: true,
  },
)

// Simple index for performance
agentSchema.index({ email: 1 })
agentSchema.index({ status: 1 })

const Agent = mongoose.model("Agent", agentSchema)
export default Agent