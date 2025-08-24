import express from "express"
import Car from "../models/car.model.js"
import Notification from "../models/notification.model.js"
import { isAgent, validateObjectId } from "../middleware.js"
import { body, validationResult } from "express-validator"

const router = express.Router()

// Validation middleware
const validateCarApproval = [
  body("price").isFloat({ min: 1000 }).withMessage("Price must be at least ₹1,000"),
  body("driveType").isIn(["FWD", "RWD", "AWD", "4WD"]).withMessage("Invalid drive type"),
  body("engine")
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage("Engine displacement must be between 0-10000cc"),
  body("torque").optional().isFloat({ min: 0 }).withMessage("Torque must be a positive number"),
  body("power").optional().isFloat({ min: 0 }).withMessage("Power must be a positive number"),
  body("groundClearance")
    .optional()
    .isFloat({ min: 0, max: 500 })
    .withMessage("Ground clearance must be between 0-500mm"),
  body("topSpeed").optional().isFloat({ min: 0, max: 500 }).withMessage("Top speed must be between 0-500 km/h"),
  body("fuelTank")
    .optional()
    .isFloat({ min: 0, max: 200 })
    .withMessage("Fuel tank capacity must be between 0-200 liters"),
]

// Get all pending cars for approval
router.get("/approval", isAgent, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const [pendingCars, totalCars] = await Promise.all([
      Car.find({
        status: "pending",
        agent: req.user._id,
      })
        .populate("seller", "username email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Car.countDocuments({
        status: "pending",
        agent: req.user._id,
      }),
    ])

    const totalPages = Math.ceil(totalCars / limit)

    res.render("approve", {
      pendingCars,
      pagination: {
        currentPage: page,
        totalPages,
        totalCars,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching pending cars:", error)
    req.flash("error", "Error loading pending approvals.")
    res.redirect("/")
  }
})

// API endpoint for pending cars
router.get("/api/approval", isAgent, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const [pendingCars, totalCars] = await Promise.all([
      Car.find({
        status: "pending",
        agent: req.user._id,
      })
        .populate("seller", "username email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Car.countDocuments({
        status: "pending",
        agent: req.user._id,
      }),
    ])

    res.json({
      success: true,
      data: {
        pendingCars,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCars / limit),
          totalCars,
          hasNext: page * limit < totalCars,
          hasPrev: page > 1,
        },
      },
    })
  } catch (error) {
    console.error("API Error fetching pending cars:", error)
    res.status(500).json({
      success: false,
      error: "Error loading pending approvals",
    })
  }
})

// Get car details for verification
router.get("/:id/verify", [isAgent, validateObjectId], async (req, res) => {
  try {
    const car = await Car.findOne({
      _id: req.params.id,
      agent: req.user._id,
      status: "pending",
    }).populate("seller", "username email mobileNumber")

    if (!car) {
      req.flash("error", "Car not found or not assigned to you.")
      return res.redirect("/agent/approval")
    }

    if (car.status !== "pending") {
      req.flash("warning", "Car has already been processed.")
      return res.redirect("/agent/approval")
    }

    res.render("carapproveform", { car, user: req.user })
  } catch (error) {
    console.error("Error fetching car details:", error)
    req.flash("error", "Error fetching car details.")
    res.redirect("/agent/approval")
  }
})

// API endpoint for car verification details
router.get("/api/:id/verify", [isAgent, validateObjectId], async (req, res) => {
  try {
    const car = await Car.findOne({
      _id: req.params.id,
      agent: req.user._id,
      status: "pending",
    }).populate("seller", "username email mobileNumber")

    if (!car) {
      return res.status(404).json({
        success: false,
        error: "Car not found or not assigned to you",
      })
    }

    if (car.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Car has already been processed",
      })
    }

    res.json({
      success: true,
      data: { car },
    })
  } catch (error) {
    console.error("API Error fetching car details:", error)
    res.status(500).json({
      success: false,
      error: "Error fetching car details",
    })
  }
})

// Approve a car with specifications
router.post("/:id/approve", [isAgent, validateObjectId, ...validateCarApproval], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg)
      return res.redirect(`/agent/${req.params.id}/verify`)
    }

    const { driveType, price, engine, torque, power, groundClearance, topSpeed, fuelTank } = req.body

    const car = await Car.findOne({
      _id: req.params.id,
      agent: req.user._id,
      status: "pending",
    })

    if (!car) {
      req.flash("error", "Car not found or already processed.")
      return res.redirect("/agent/approval")
    }

    // Update car with approval details
    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      {
        status: "available",
        driveType,
        price: Number.parseFloat(price),
        engine: engine ? Number.parseFloat(engine) : undefined,
        torque: torque ? Number.parseFloat(torque) : undefined,
        power: power ? Number.parseFloat(power) : undefined,
        groundClearance: groundClearance ? Number.parseFloat(groundClearance) : undefined,
        topSpeed: topSpeed ? Number.parseFloat(topSpeed) : undefined,
        fuelTank: fuelTank ? Number.parseFloat(fuelTank) : undefined,
      },
      { new: true, runValidators: true },
    )

    // Create notification for seller
    await Notification.create({
      userId: car.seller,
      message: `Great news! Your ${car.brand} ${car.model} has been approved and is now available for sale.`,
      type: "general",
      relatedCar: car._id,
      actionUrl: `/cars/${car._id}`,
      priority: "medium",
    })

    req.flash("success", "Car approved and added to inventory successfully.")
    res.redirect("/inventory")
  } catch (error) {
    console.error("Error approving car:", error)
    req.flash("error", "Error approving car. Please try again.")
    res.redirect(`/agent/${req.params.id}/verify`)
  }
})

// API endpoint for car approval
router.post("/api/:id/approve", [isAgent, validateObjectId, ...validateCarApproval], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { driveType, price, engine, torque, power, groundClearance, topSpeed, fuelTank } = req.body

    const car = await Car.findOne({
      _id: req.params.id,
      agent: req.user._id,
      status: "pending",
    })

    if (!car) {
      return res.status(404).json({
        success: false,
        error: "Car not found or already processed",
      })
    }

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      {
        status: "available",
        driveType,
        price: Number.parseFloat(price),
        engine: engine ? Number.parseFloat(engine) : undefined,
        torque: torque ? Number.parseFloat(torque) : undefined,
        power: power ? Number.parseFloat(power) : undefined,
        groundClearance: groundClearance ? Number.parseFloat(groundClearance) : undefined,
        topSpeed: topSpeed ? Number.parseFloat(topSpeed) : undefined,
        fuelTank: fuelTank ? Number.parseFloat(fuelTank) : undefined,
      },
      { new: true, runValidators: true },
    )

    // Create notification for seller
    await Notification.create({
      userId: car.seller,
      message: `Great news! Your ${car.brand} ${car.model} has been approved and is now available for sale.`,
      type: "general",
      relatedCar: car._id,
      actionUrl: `/cars/${car._id}`,
      priority: "medium",
    })

    res.json({
      success: true,
      message: "Car approved successfully",
      data: { car: updatedCar },
    })
  } catch (error) {
    console.error("API Error approving car:", error)
    res.status(500).json({
      success: false,
      error: "Error approving car",
    })
  }
})

// Reject a car
router.post("/:id/decision", [isAgent, validateObjectId], async (req, res) => {
  try {
    const { decision, rejectionReason } = req.body

    const car = await Car.findOne({
      _id: req.params.id,
      agent: req.user._id,
      status: "pending",
    })

    if (!car) {
      req.flash("error", "Car not found or already processed.")
      return res.redirect("/agent/approval")
    }

    if (decision === "rejected") {
      car.status = "rejected"
      car.rejectionReason = rejectionReason || "No reason provided"
      await car.save()

      // Create notification for seller
      await Notification.create({
        userId: car.seller,
        message: `Unfortunately, your ${car.brand} ${car.model} listing has been rejected. Reason: ${car.rejectionReason}`,
        type: "general",
        relatedCar: car._id,
        priority: "high",
      })

      req.flash("info", "Car has been rejected successfully.")
    }

    res.redirect("/agent/approval")
  } catch (error) {
    console.error("Error processing rejection:", error)
    req.flash("error", "Error processing rejection.")
    res.redirect("/agent/approval")
  }
})

// API endpoint for car rejection
router.post("/api/:id/reject", [isAgent, validateObjectId], async (req, res) => {
  try {
    const { rejectionReason } = req.body

    const car = await Car.findOne({
      _id: req.params.id,
      agent: req.user._id,
      status: "pending",
    })

    if (!car) {
      return res.status(404).json({
        success: false,
        error: "Car not found or already processed",
      })
    }

    car.status = "rejected"
    car.rejectionReason = rejectionReason || "No reason provided"
    await car.save()

    // Create notification for seller
    await Notification.create({
      userId: car.seller,
      message: `Unfortunately, your ${car.brand} ${car.model} listing has been rejected. Reason: ${car.rejectionReason}`,
      type: "general",
      relatedCar: car._id,
      priority: "high",
    })

    res.json({
      success: true,
      message: "Car rejected successfully",
      data: { car },
    })
  } catch (error) {
    console.error("API Error rejecting car:", error)
    res.status(500).json({
      success: false,
      error: "Error rejecting car",
    })
  }
})

// Update car price separately
router.post("/update-price/:id", [isAgent, validateObjectId], async (req, res) => {
  try {
    const { newPrice } = req.body
    const price = Number.parseFloat(newPrice)

    if (isNaN(price) || price < 1000) {
      req.flash("error", "Price must be at least ₹1,000.")
      return res.redirect(req.get("Referer") || "/agent/approval")
    }

    const car = await Car.findOne({
      _id: req.params.id,
      agent: req.user._id,
      status: { $in: ["available", "sold"] },
    })

    if (!car) {
      req.flash("error", "Car not found or not authorized.")
      return res.redirect("/agent/approval")
    }

    car.price = price
    await car.save()

    // Create notification for seller
    await Notification.create({
      userId: car.seller,
      message: `The price of your ${car.brand} ${car.model} has been updated to ₹${price.toLocaleString()}.`,
      type: "general",
      relatedCar: car._id,
      actionUrl: `/cars/${car._id}`,
    })

    req.flash("success", "Car price updated successfully.")
    res.redirect("/inventory")
  } catch (error) {
    console.error("Error updating car price:", error)
    req.flash("error", "Server error while updating price.")
    res.redirect(req.get("Referer") || "/agent/approval")
  }
})

// API endpoint for updating car price
router.patch("/api/update-price/:id", [isAgent, validateObjectId], async (req, res) => {
  try {
    const { newPrice } = req.body
    const price = Number.parseFloat(newPrice)

    if (isNaN(price) || price < 1000) {
      return res.status(400).json({
        success: false,
        error: "Price must be at least ₹1,000",
      })
    }

    const car = await Car.findOne({
      _id: req.params.id,
      agent: req.user._id,
      status: { $in: ["available", "sold"] },
    })

    if (!car) {
      return res.status(404).json({
        success: false,
        error: "Car not found or not authorized",
      })
    }

    car.price = price
    await car.save()

    // Create notification for seller
    await Notification.create({
      userId: car.seller,
      message: `The price of your ${car.brand} ${car.model} has been updated to ₹${price.toLocaleString()}.`,
      type: "general",
      relatedCar: car._id,
      actionUrl: `/cars/${car._id}`,
    })

    res.json({
      success: true,
      message: "Car price updated successfully",
      data: { car },
    })
  } catch (error) {
    console.error("API Error updating car price:", error)
    res.status(500).json({
      success: false,
      error: "Error updating car price",
    })
  }
})

// Get agent dashboard statistics
router.get("/dashboard", isAgent, async (req, res) => {
  try {
    const agentId = req.user._id

    const stats = await Car.aggregate([
      { $match: { agent: agentId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$price" },
        },
      },
    ])

    const formattedStats = {
      pending: 0,
      available: 0,
      sold: 0,
      rejected: 0,
      totalValue: 0,
    }

    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count
      if (stat._id === "available" || stat._id === "sold") {
        formattedStats.totalValue += stat.totalValue
      }
    })

    res.render("agent/dashboard", { stats: formattedStats })
  } catch (error) {
    console.error("Error fetching agent dashboard:", error)
    req.flash("error", "Error loading dashboard.")
    res.redirect("/")
  }
})

// API endpoint for agent dashboard
router.get("/api/dashboard", isAgent, async (req, res) => {
  try {
    const agentId = req.user._id

    const stats = await Car.aggregate([
      { $match: { agent: agentId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$price" },
        },
      },
    ])

    const formattedStats = {
      pending: 0,
      available: 0,
      sold: 0,
      rejected: 0,
      totalValue: 0,
    }

    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count
      if (stat._id === "available" || stat._id === "sold") {
        formattedStats.totalValue += stat.totalValue
      }
    })

    res.json({
      success: true,
      data: { stats: formattedStats },
    })
  } catch (error) {
    console.error("API Error fetching agent dashboard:", error)
    res.status(500).json({
      success: false,
      error: "Error loading dashboard",
    })
  }
})

export default router
