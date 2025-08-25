import express from "express"
import Notification from "../models/notification.model.js"
import { isLoggedIn, validateObjectId } from "../middleware.js"
import { query, validationResult } from "express-validator"

const router = express.Router()

// Validation middleware
const validatePagination = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
  query("filter").optional().isIn(["all", "unread", "read"]).withMessage("Invalid filter option"),
]

// Get all notifications for user
router.get("/", [isLoggedIn, ...validatePagination], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg)
      return res.redirect("/notifications")
    }

    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const filter = req.query.filter || "all"
    const skip = (page - 1) * limit

    const query = { userId: req.user._id }

    if (filter === "unread") {
      query.read = false
    } else if (filter === "read") {
      query.read = true
    }

    const [notifications, totalNotifications, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate("relatedCar", "brand model")
        .populate("relatedPurchase", "totalPrice")
        .populate("relatedRequest", "vehicleType")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query),
      Notification.getUnreadCountForUser(req.user._id),
    ])

    const totalPages = Math.ceil(totalNotifications / limit)

    res.render("notifications", {
      notifications,
      unreadCount,
      pagination: {
        currentPage: page,
        totalPages,
        totalNotifications,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      currentFilter: filter,
    })
  } catch (error) {
    console.error("Error loading notifications:", error)
    req.flash("error", "Error loading notifications.")
    res.redirect("/")
  }
})

// API endpoint for getting notifications
router.get("/api/notifications", [isLoggedIn, ...validatePagination], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const filter = req.query.filter || "all"
    const skip = (page - 1) * limit

    const query = { userId: req.user._id }

    if (filter === "unread") {
      query.read = false
    } else if (filter === "read") {
      query.read = true
    }

    const [notifications, totalNotifications, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate("relatedCar", "brand model")
        .populate("relatedPurchase", "totalPrice")
        .populate("relatedRequest", "vehicleType")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query),
      Notification.getUnreadCountForUser(req.user._id),
    ])

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalNotifications / limit),
          totalNotifications,
          hasNext: page * limit < totalNotifications,
          hasPrev: page > 1,
        },
        currentFilter: filter,
      },
    })
  } catch (error) {
    console.error("API Error loading notifications:", error)
    res.status(500).json({
      success: false,
      error: "Error loading notifications",
    })
  }
})

// Mark single notification as read
router.post("/:id/mark-read", [isLoggedIn, validateObjectId], async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!notification) {
      req.flash("error", "Notification not found.")
      return res.redirect("/notifications")
    }

    await notification.markAsRead()

    // If there's an action URL, redirect there, otherwise back to notifications
    if (notification.actionUrl) {
      res.redirect(notification.actionUrl)
    } else {
      res.redirect("/notifications")
    }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    req.flash("error", "Error updating notification.")
    res.redirect("/notifications")
  }
})

// API endpoint for marking notification as read
router.patch("/api/:id/mark-read", [isLoggedIn, validateObjectId], async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
      })
    }

    await notification.markAsRead()

    res.json({
      success: true,
      message: "Notification marked as read",
      data: {
        notification,
        actionUrl: notification.actionUrl,
      },
    })
  } catch (error) {
    console.error("API Error marking notification as read:", error)
    res.status(500).json({
      success: false,
      error: "Error updating notification",
    })
  }
})

// Mark all notifications as read
router.post("/mark-all-read", isLoggedIn, async (req, res) => {
  try {
    await Notification.markAllAsReadForUser(req.user._id)
    req.flash("success", "All notifications marked as read.")
    res.redirect("/notifications")
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    req.flash("error", "Error updating notifications.")
    res.redirect("/notifications")
  }
})

// API endpoint for marking all notifications as read
router.patch("/api/mark-all-read", isLoggedIn, async (req, res) => {
  try {
    const result = await Notification.markAllAsReadForUser(req.user._id)

    res.json({
      success: true,
      message: "All notifications marked as read",
      data: {
        modifiedCount: result.modifiedCount,
      },
    })
  } catch (error) {
    console.error("API Error marking all notifications as read:", error)
    res.status(500).json({
      success: false,
      error: "Error updating notifications",
    })
  }
})

// Get unread count (API endpoint for frontend)
router.get("/api/unread-count", isLoggedIn, async (req, res) => {
  try {
    const count = await Notification.getUnreadCountForUser(req.user._id)
    res.json({
      success: true,
      data: { unreadCount: count },
    })
  } catch (error) {
    console.error("Error getting unread count:", error)
    res.status(500).json({
      success: false,
      error: "Error fetching unread count",
    })
  }
})

// Create test notification (development only)
router.get("/test-notification", isLoggedIn, async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      req.flash("error", "Test notifications are not available in production.")
      return res.redirect("/notifications")
    }

    await Notification.create({
      userId: req.user._id,
      message: "This is a test notification created at " + new Date().toLocaleString(),
      type: "general",
      priority: "low",
    })

    req.flash("success", "Test notification created.")
    res.redirect("/notifications")
  } catch (error) {
    console.error("Error creating test notification:", error)
    req.flash("error", "Error creating test notification.")
    res.redirect("/notifications")
  }
})

// API endpoint for creating test notification
router.post("/api/test", isLoggedIn, async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        error: "Not allowed in production",
      })
    }

    const notification = await Notification.create({
      userId: req.user._id,
      message: "This is a test notification created at " + new Date().toLocaleString(),
      type: "general",
      priority: "low",
    })

    res.json({
      success: true,
      message: "Test notification created",
      data: { notification },
    })
  } catch (error) {
    console.error("API Error creating test notification:", error)
    res.status(500).json({
      success: false,
      error: "Error creating test notification",
    })
  }
})

// Delete notification
router.delete("/:id", [isLoggedIn, validateObjectId], async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
      })
    }

    await Notification.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Notification deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting notification:", error)
    res.status(500).json({
      success: false,
      error: "Error deleting notification",
    })
  }
})

export default router
