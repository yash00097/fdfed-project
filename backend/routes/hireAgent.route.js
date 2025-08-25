import express from "express"
import mongoose from "mongoose"
import { isHost, validateObjectId } from "../middleware.js"
import { body, validationResult } from "express-validator"
import rateLimit from "express-rate-limit"

const router = express.Router()

// Rate limiting for agent applications
const applicationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // limit each IP to 3 applications per day
  message: "Too many agent applications. Please try again tomorrow.",
  standardHeaders: true,
  legacyHeaders: false,
})

// Agent schema definition
const { Schema } = mongoose
const agentApplicationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    contact: {
      type: String,
      required: [true, "Contact number is required"],
      match: [/^\d{10}$/, "Contact must be exactly 10 digits"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, "Please provide a valid email address"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [100, "Job title cannot exceed 100 characters"],
    },
    experience: {
      type: Number,
      required: [true, "Experience is required"],
      min: [0, "Experience cannot be negative"],
      max: [50, "Experience cannot exceed 50 years"],
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    inspection: {
      type: String,
      enum: {
        values: ["Yes", "No"],
        message: "Inspection experience must be Yes or No",
      },
      required: [true, "Inspection experience is required"],
    },
    fraud: {
      type: String,
      enum: {
        values: ["Yes", "No"],
        message: "Fraud detection experience must be Yes or No",
      },
      required: [true, "Fraud detection experience is required"],
    },
    workHours: {
      type: String,
      enum: {
        values: ["Full-time", "Part-time"],
        message: "Work hours must be Full-time or Part-time",
      },
      required: [true, "Work hours preference is required"],
    },
    salary: {
      type: String,
      required: [true, "Expected salary is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "Status must be pending, approved, or rejected",
      },
      default: "pending",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, "Rejection reason cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for performance
agentApplicationSchema.index({ email: 1 })
agentApplicationSchema.index({ status: 1, createdAt: -1 })

// Virtual for application age
agentApplicationSchema.virtual("applicationAge").get(function () {
  const days = Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24))
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  return `${days} days ago`
})

// Static methods
agentApplicationSchema.statics.getPendingApplications = function () {
  return this.find({ status: "pending" }).sort({ createdAt: -1 })
}

agentApplicationSchema.statics.getApplicationStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ])

  return stats.reduce((acc, stat) => {
    acc[stat._id] = stat.count
    return acc
  }, {})
}

const AgentApplication = mongoose.models.AgentApplication || mongoose.model("AgentApplication", agentApplicationSchema)

// Validation middleware
const validateAgentApplication = [
  body("name").isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
  body("contact")
    .matches(/^\d{10}$/)
    .withMessage("Contact must be exactly 10 digits"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),
  body("address").isLength({ min: 10, max: 200 }).withMessage("Address must be between 10 and 200 characters"),
  body("jobTitle").isLength({ min: 2, max: 100 }).withMessage("Job title must be between 2 and 100 characters"),
  body("experience").isInt({ min: 0, max: 50 }).withMessage("Experience must be between 0 and 50 years"),
  body("company").isLength({ min: 2, max: 100 }).withMessage("Company name must be between 2 and 100 characters"),
  body("inspection").isIn(["Yes", "No"]).withMessage("Inspection experience must be Yes or No"),
  body("fraud").isIn(["Yes", "No"]).withMessage("Fraud detection experience must be Yes or No"),
  body("workHours").isIn(["Full-time", "Part-time"]).withMessage("Work hours must be Full-time or Part-time"),
  body("salary").isLength({ min: 1, max: 50 }).withMessage("Expected salary is required"),
]

// Get agent application form
router.get("/agentForm", (req, res) => {
  res.render("agentForm")
})

// Submit agent application
router.post("/submit-agent-form", [applicationLimiter, ...validateAgentApplication], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg)
      return res.redirect("/agentForm")
    }

    // Check if email already exists
    const existingApplication = await AgentApplication.findOne({ email: req.body.email })
    if (existingApplication) {
      req.flash("error", "An application with this email already exists.")
      return res.redirect("/agentForm")
    }

    const agent = new AgentApplication(req.body)
    await agent.save()

    req.flash(
      "success",
      "Agent application submitted successfully! We will review your application and get back to you.",
    )
    res.redirect("/")
  } catch (error) {
    console.error("Error saving agent application:", error)
    req.flash("error", "Error submitting application. Please try again.")
    res.redirect("/agentForm")
  }
})

// API endpoint for submitting agent application
router.post("/api/submit-agent-form", [applicationLimiter, ...validateAgentApplication], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const existingApplication = await AgentApplication.findOne({ email: req.body.email })
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: "An application with this email already exists",
      })
    }

    const agent = new AgentApplication(req.body)
    await agent.save()

    res.json({
      success: true,
      message: "Agent application submitted successfully!",
      data: { applicationId: agent._id },
    })
  } catch (error) {
    console.error("API Error saving agent application:", error)
    res.status(500).json({
      success: false,
      error: "Error submitting application",
    })
  }
})

// Get admin dashboard for reviewing applications
router.get("/admin-dashboard", isHost, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const status = req.query.status || "pending"

    const query = status === "all" ? {} : { status }

    const [applications, totalApplications, applicationStats] = await Promise.all([
      AgentApplication.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      AgentApplication.countDocuments(query),
      AgentApplication.getApplicationStats(),
    ])

    const totalPages = Math.ceil(totalApplications / limit)

    res.render("adminDashboard", {
      applications,
      applicationStats,
      currentStatus: status,
      pagination: {
        currentPage: page,
        totalPages,
        totalApplications,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    req.flash("error", "Error loading dashboard.")
    res.redirect("/")
  }
})

// API endpoint for admin dashboard
router.get("/api/admin-dashboard", isHost, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const status = req.query.status || "pending"

    const query = status === "all" ? {} : { status }

    const [applications, totalApplications, applicationStats] = await Promise.all([
      AgentApplication.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      AgentApplication.countDocuments(query),
      AgentApplication.getApplicationStats(),
    ])

    res.json({
      success: true,
      data: {
        applications,
        applicationStats,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalApplications / limit),
          totalApplications,
          hasNext: page * limit < totalApplications,
          hasPrev: page > 1,
        },
      },
    })
  } catch (error) {
    console.error("API Error fetching applications:", error)
    res.status(500).json({
      success: false,
      error: "Error loading dashboard",
    })
  }
})

// Approve agent application
router.post("/approve/:id", [isHost, validateObjectId], async (req, res) => {
  try {
    const application = await AgentApplication.findById(req.params.id)
    if (!application) {
      req.flash("error", "Application not found.")
      return res.redirect("/admin-dashboard")
    }

    if (application.status !== "pending") {
      req.flash("error", "Application has already been processed.")
      return res.redirect("/admin-dashboard")
    }

    application.status = "approved"
    application.reviewedBy = req.user._id
    application.reviewedAt = new Date()
    await application.save()

    req.flash("success", "Agent application approved successfully.")
    res.redirect("/admin-dashboard")
  } catch (error) {
    console.error("Error approving agent:", error)
    req.flash("error", "Error approving agent application.")
    res.redirect("/admin-dashboard")
  }
})

// API endpoint for approving agent
router.post("/api/approve/:id", [isHost, validateObjectId], async (req, res) => {
  try {
    const application = await AgentApplication.findById(req.params.id)
    if (!application) {
      return res.status(404).json({
        success: false,
        error: "Application not found",
      })
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Application has already been processed",
      })
    }

    application.status = "approved"
    application.reviewedBy = req.user._id
    application.reviewedAt = new Date()
    await application.save()

    res.json({
      success: true,
      message: "Agent application approved successfully",
      data: { application },
    })
  } catch (error) {
    console.error("API Error approving agent:", error)
    res.status(500).json({
      success: false,
      error: "Error approving agent application",
    })
  }
})

// Reject agent application
router.post("/reject/:id", [isHost, validateObjectId], async (req, res) => {
  try {
    const { rejectionReason } = req.body
    const application = await AgentApplication.findById(req.params.id)

    if (!application) {
      req.flash("error", "Application not found.")
      return res.redirect("/admin-dashboard")
    }

    if (application.status !== "pending") {
      req.flash("error", "Application has already been processed.")
      return res.redirect("/admin-dashboard")
    }

    application.status = "rejected"
    application.reviewedBy = req.user._id
    application.reviewedAt = new Date()
    application.rejectionReason = rejectionReason || "No reason provided"
    await application.save()

    req.flash("success", "Agent application rejected.")
    res.redirect("/admin-dashboard")
  } catch (error) {
    console.error("Error rejecting agent:", error)
    req.flash("error", "Error rejecting agent application.")
    res.redirect("/admin-dashboard")
  }
})

// API endpoint for rejecting agent
router.post("/api/reject/:id", [isHost, validateObjectId], async (req, res) => {
  try {
    const { rejectionReason } = req.body
    const application = await AgentApplication.findById(req.params.id)

    if (!application) {
      return res.status(404).json({
        success: false,
        error: "Application not found",
      })
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Application has already been processed",
      })
    }

    application.status = "rejected"
    application.reviewedBy = req.user._id
    application.reviewedAt = new Date()
    application.rejectionReason = rejectionReason || "No reason provided"
    await application.save()

    res.json({
      success: true,
      message: "Agent application rejected",
      data: { application },
    })
  } catch (error) {
    console.error("API Error rejecting agent:", error)
    res.status(500).json({
      success: false,
      error: "Error rejecting agent application",
    })
  }
})

// Get application details
router.get("/application/:id", [isHost, validateObjectId], async (req, res) => {
  try {
    const application = await AgentApplication.findById(req.params.id).populate("reviewedBy", "username")

    if (!application) {
      return res.status(404).json({
        success: false,
        error: "Application not found",
      })
    }

    res.json({
      success: true,
      data: { application },
    })
  } catch (error) {
    console.error("Error fetching application details:", error)
    res.status(500).json({
      success: false,
      error: "Error fetching application details",
    })
  }
})

export default router
