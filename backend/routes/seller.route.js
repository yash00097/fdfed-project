import express from "express"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import Car from "../models/car.model.js"
import User from "../models/user.model.js"
import Notification from "../models/notification.model.js"
import { isLoggedIn, validateObjectId } from "../middleware.js"
import { body, validationResult } from "express-validator"
import rateLimit from "express-rate-limit"

const router = express.Router()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "primewheels/cars",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 1200, height: 800, crop: "limit", quality: "auto:good" }, { fetch_format: "auto" }],
  },
})

// Configure multer with file validation
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10, // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"), false)
    }
  },
})

// Rate limiting for car submissions
const sellLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each user to 3 car submissions per hour
  message: "Too many car submissions. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
})

// Validation middleware
const validateCarListing = [
  body("brand").isLength({ min: 2, max: 50 }).withMessage("Brand must be between 2 and 50 characters"),
  body("model").isLength({ min: 2, max: 50 }).withMessage("Model must be between 2 and 50 characters"),
  body("vehicleType")
    .isIn(["sedan", "suv", "hatchback", "coupe", "convertible", "off-road", "sport", "muscle", "truck", "van"])
    .withMessage("Invalid vehicle type"),
  body("transmission").isIn(["manual", "automatic"]).withMessage("Invalid transmission type"),
  body("manufacturedYear").isInt({ min: 1900, max: new Date().getFullYear() }).withMessage("Invalid manufactured year"),
  body("fuelType").isIn(["diesel", "petrol", "electric", "gas", "hybrid"]).withMessage("Invalid fuel type"),
  body("seater").isInt({ min: 2, max: 12 }).withMessage("Seater capacity must be between 2 and 12"),
  body("exteriorColor").isLength({ min: 2, max: 30 }).withMessage("Color must be between 2 and 30 characters"),
  body("carNo")
    .matches(/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/)
    .withMessage("Invalid car number format (e.g., MH12AB1234)"),
  body("traveledKm").isFloat({ min: 0 }).withMessage("Traveled kilometers must be a positive number"),
  body("price").isFloat({ min: 1000 }).withMessage("Price must be at least ₹1,000"),
  body("city").isLength({ min: 2, max: 50 }).withMessage("City must be between 2 and 50 characters"),
  body("state").isLength({ min: 2, max: 50 }).withMessage("State must be between 2 and 50 characters"),
  body("address").isLength({ min: 10, max: 200 }).withMessage("Address must be between 10 and 200 characters"),
  body("pincode")
    .matches(/^\d{6}$/)
    .withMessage("Pincode must be exactly 6 digits"),
  body("phone")
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be exactly 10 digits"),
  body("description").optional().isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),
]

// Helper function to find least busy agent
const findLeastBusyAgent = async () => {
  try {
    const agentEmails = process.env.AGENT_EMAILS?.split(",") || []
    if (agentEmails.length === 0) {
      throw new Error("No agents configured")
    }

    const agents = await User.find({
      email: { $in: agentEmails },
      role: "agent",
      isActive: true,
    }).sort({ createdAt: 1 })

    if (agents.length === 0) {
      throw new Error("No active agents available")
    }

    // Get workload for each agent
    const agentWorkloads = await Car.aggregate([
      { $match: { status: "pending" } },
      { $group: { _id: "$agent", count: { $sum: 1 } } },
    ])

    let leastBusyAgent = agents[0]
    let minWorkload = Number.MAX_SAFE_INTEGER

    for (const agent of agents) {
      const workload = agentWorkloads.find((w) => w._id?.equals(agent._id))?.count || 0
      if (workload < minWorkload) {
        minWorkload = workload
        leastBusyAgent = agent
      }
    }

    return leastBusyAgent
  } catch (error) {
    console.error("Error finding least busy agent:", error)
    throw error
  }
}

// Get sell form
router.get("/", isLoggedIn, (req, res) => {
  res.render("seller/form")
})

// Submit car for sale
router.post("/", isLoggedIn, sellLimiter, upload.array("photos", 10), validateCarListing, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      // Clean up uploaded files if validation fails
      if (req.files) {
        for (const file of req.files) {
          try {
            await cloudinary.uploader.destroy(file.filename)
          } catch (cleanupError) {
            console.error("Error cleaning up file:", cleanupError)
          }
        }
      }
      req.flash("error", errors.array()[0].msg)
      return res.redirect("/sell")
    }

    if (!req.files || req.files.length < 4) {
      req.flash("error", "Please upload at least 4 photos of your car")
      return res.redirect("/sell")
    }

    if (req.files.length > 10) {
      req.flash("error", "Maximum 10 photos allowed")
      return res.redirect("/sell")
    }

    const {
      brand,
      model,
      vehicleType,
      transmission,
      manufacturedYear,
      fuelType,
      seater,
      exteriorColor,
      carNo,
      traveledKm,
      price,
      state,
      city,
      address,
      pincode,
      phone,
      description,
      features,
    } = req.body

    // Check if car number already exists
    const existingCar = await Car.findOne({ carNumber: carNo.toUpperCase() })
    if (existingCar) {
      req.flash("error", "A car with this number is already registered")
      return res.redirect("/sell")
    }

    // Process uploaded photos
    const photos = req.files.map((file) => file.path)

    // Find least busy agent
    const assignedAgent = await findLeastBusyAgent()

    // Create new car listing
    const newCar = new Car({
      brand,
      model,
      vehicleType,
      transmission,
      manufacturedYear: Number.parseInt(manufacturedYear),
      fuelType,
      seater: Number.parseInt(seater),
      exteriorColor,
      carNumber: carNo.toUpperCase(),
      traveledKm: Number.parseFloat(traveledKm),
      photos,
      price: Number.parseFloat(price),
      state,
      city,
      address,
      pincode,
      sellerphone: phone,
      seller: req.user._id,
      sellerName: req.user.username,
      agent: assignedAgent._id,
      agentName: assignedAgent.username,
      status: "pending",
      description: description || "",
      features: features
        ? features
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean)
        : [],
    })

    await newCar.save()

    // Calculate pickup date (2 days from now)
    const pickupDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    const formattedDate = pickupDate.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // Create notifications
    await Promise.all([
      // Seller notification
      Notification.create({
        userId: req.user._id,
        message: `Thank you for submitting your ${brand} ${model}. Agent ${assignedAgent.username} will contact you within 24 hours to schedule pickup from ${address} around ${formattedDate} for verification.`,
        type: "general",
        relatedCar: newCar._id,
        priority: "medium",
      }),
      // Agent notification
      Notification.create({
        userId: assignedAgent._id,
        message: `New car assigned for pickup: ${brand} ${model} from ${req.user.username} (${phone}) at ${address}. Please contact the seller to schedule pickup by ${formattedDate}.`,
        type: "general",
        relatedCar: newCar._id,
        actionUrl: `/agent/${newCar._id}/verify`,
        priority: "high",
      }),
    ])

    req.flash("success", "Your car listing has been submitted successfully! Our agent will contact you soon.")
    res.redirect("/user/my-cars")
  } catch (error) {
    console.error("Error submitting car listing:", error)

    // Clean up uploaded files on error
    if (req.files) {
      for (const file of req.files) {
        try {
          await cloudinary.uploader.destroy(file.filename)
        } catch (cleanupError) {
          console.error("Error cleaning up file:", cleanupError)
        }
      }
    }

    req.flash("error", "Something went wrong while submitting your car. Please try again.")
    res.redirect("/sell")
  }
})

// API endpoint for React.js - Submit car listing
router.post(
  "/api/submit",
  isLoggedIn,
  sellLimiter,
  upload.array("photos", 10),
  validateCarListing,
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        // Clean up uploaded files if validation fails
        if (req.files) {
          for (const file of req.files) {
            try {
              await cloudinary.uploader.destroy(file.filename)
            } catch (cleanupError) {
              console.error("Error cleaning up file:", cleanupError)
            }
          }
        }
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        })
      }

      if (!req.files || req.files.length < 4) {
        return res.status(400).json({
          success: false,
          error: "Please upload at least 4 photos of your car",
        })
      }

      const {
        brand,
        model,
        vehicleType,
        transmission,
        manufacturedYear,
        fuelType,
        seater,
        exteriorColor,
        carNo,
        traveledKm,
        price,
        state,
        city,
        address,
        pincode,
        phone,
        description,
        features,
      } = req.body

      // Check if car number already exists
      const existingCar = await Car.findOne({ carNumber: carNo.toUpperCase() })
      if (existingCar) {
        return res.status(400).json({
          success: false,
          error: "A car with this number is already registered",
        })
      }

      const photos = req.files.map((file) => file.path)
      const assignedAgent = await findLeastBusyAgent()

      const newCar = new Car({
        brand,
        model,
        vehicleType,
        transmission,
        manufacturedYear: Number.parseInt(manufacturedYear),
        fuelType,
        seater: Number.parseInt(seater),
        exteriorColor,
        carNumber: carNo.toUpperCase(),
        traveledKm: Number.parseFloat(traveledKm),
        photos,
        price: Number.parseFloat(price),
        state,
        city,
        address,
        pincode,
        sellerphone: phone,
        seller: req.user._id,
        sellerName: req.user.username,
        agent: assignedAgent._id,
        agentName: assignedAgent.username,
        status: "pending",
        description: description || "",
        features: features
          ? features
              .split(",")
              .map((f) => f.trim())
              .filter(Boolean)
          : [],
      })

      await newCar.save()

      // Create notifications
      const pickupDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      const formattedDate = pickupDate.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      await Promise.all([
        Notification.create({
          userId: req.user._id,
          message: `Thank you for submitting your ${brand} ${model}. Agent ${assignedAgent.username} will contact you within 24 hours.`,
          type: "general",
          relatedCar: newCar._id,
          priority: "medium",
        }),
        Notification.create({
          userId: assignedAgent._id,
          message: `New car assigned: ${brand} ${model} from ${req.user.username} (${phone}) at ${address}.`,
          type: "general",
          relatedCar: newCar._id,
          actionUrl: `/agent/${newCar._id}/verify`,
          priority: "high",
        }),
      ])

      res.json({
        success: true,
        message: "Car listing submitted successfully!",
        car: {
          id: newCar._id,
          brand: newCar.brand,
          model: newCar.model,
          status: newCar.status,
          assignedAgent: assignedAgent.username,
        },
      })
    } catch (error) {
      console.error("API Error submitting car listing:", error)

      // Clean up uploaded files on error
      if (req.files) {
        for (const file of req.files) {
          try {
            await cloudinary.uploader.destroy(file.filename)
          } catch (cleanupError) {
            console.error("Error cleaning up file:", cleanupError)
          }
        }
      }

      res.status(500).json({
        success: false,
        error: "Something went wrong while submitting your car",
      })
    }
  },
)

// Get car listing form data (API endpoint for React.js)
router.get("/api/form-data", (req, res) => {
  try {
    const formData = {
      vehicleTypes: [
        "sedan",
        "suv",
        "hatchback",
        "coupe",
        "convertible",
        "off-road",
        "sport",
        "muscle",
        "truck",
        "van",
      ],
      transmissionTypes: ["manual", "automatic"],
      fuelTypes: ["diesel", "petrol", "electric", "gas", "hybrid"],
      currentYear: new Date().getFullYear(),
      minYear: 1900,
      maxPhotos: 10,
      minPhotos: 4,
      maxFileSize: "5MB",
      allowedFormats: ["jpg", "jpeg", "png", "webp"],
    }

    res.json(formData)
  } catch (error) {
    console.error("Error fetching form data:", error)
    res.status(500).json({ error: "Error fetching form data" })
  }
})

// Update car listing (for sellers to edit their pending cars)
router.put("/:id", [isLoggedIn, validateObjectId], async (req, res) => {
  try {
    const car = await Car.findOne({
      _id: req.params.id,
      seller: req.user._id,
      status: "pending",
    })

    if (!car) {
      return res.status(404).json({
        success: false,
        error: "Car not found or cannot be edited",
      })
    }

    const allowedUpdates = ["description", "features", "price", "phone"]
    const updates = {}

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        if (key === "features") {
          updates[key] = req.body[key]
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean)
        } else if (key === "price") {
          const price = Number.parseFloat(req.body[key])
          if (isNaN(price) || price < 1000) {
            return res.status(400).json({
              success: false,
              error: "Price must be at least ₹1,000",
            })
          }
          updates[key] = price
        } else {
          updates[key] = req.body[key]
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid updates provided",
      })
    }

    const updatedCar = await Car.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })

    res.json({
      success: true,
      message: "Car listing updated successfully",
      car: updatedCar,
    })
  } catch (error) {
    console.error("Error updating car listing:", error)
    res.status(500).json({
      success: false,
      error: "Error updating car listing",
    })
  }
})

// Delete car listing (only for pending cars)
router.delete("/:id", [isLoggedIn, validateObjectId], async (req, res) => {
  try {
    const car = await Car.findOne({
      _id: req.params.id,
      seller: req.user._id,
      status: "pending",
    })

    if (!car) {
      return res.status(404).json({
        success: false,
        error: "Car not found or cannot be deleted",
      })
    }

    // Delete photos from Cloudinary
    for (const photoUrl of car.photos) {
      try {
        const publicId = photoUrl.split("/").pop().split(".")[0]
        await cloudinary.uploader.destroy(`primewheels/cars/${publicId}`)
      } catch (cleanupError) {
        console.error("Error deleting photo:", cleanupError)
      }
    }

    await Car.findByIdAndDelete(req.params.id)

    // Notify agent about cancellation
    if (car.agent) {
      await Notification.create({
        userId: car.agent,
        message: `Car listing cancelled: ${car.brand} ${car.model} by ${req.user.username}`,
        type: "general",
        priority: "low",
      })
    }

    res.json({
      success: true,
      message: "Car listing deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting car listing:", error)
    res.status(500).json({
      success: false,
      error: "Error deleting car listing",
    })
  }
})

export default router
