import express from "express"
import User from "../models/user.model.js"
import Car from "../models/car.model.js"
import Request from "../models/request.model.js"
import Purchase from "../models/purchase.model.js"
import Notification from "../models/notification.model.js"
import passport from "passport"
import { isLoggedIn, storeReturnTo, validateObjectId } from "../middleware.js"
import { body, validationResult } from "express-validator"
import rateLimit from "express-rate-limit"

const router = express.Router()

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
})

// Validation middleware
const validateSignup = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address")
    .custom(async (email) => {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        throw new Error("Email already registered")
      }
      return true
    }),
  body("username")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores")
    .custom(async (username) => {
      const existingUser = await User.findOne({ username })
      if (existingUser) {
        throw new Error("Username already taken")
      }
      return true
    }),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
]

const validateLogin = [
  body("username").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
]

// Helper function to determine user role
const determineUserRole = (email) => {
  const emailLower = email.trim().toLowerCase()
  const hostEmails = process.env.HOST_EMAILS
    ? process.env.HOST_EMAILS.split(",").map((e) => e.trim().toLowerCase())
    : []
  const agentEmails = process.env.AGENT_EMAILS
    ? process.env.AGENT_EMAILS.split(",").map((e) => e.trim().toLowerCase())
    : []

  if (hostEmails.includes(emailLower)) return "host"
  if (agentEmails.includes(emailLower)) return "agent"
  return "normalUser"
}

// Signup Routes
router.get("/signup", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/")
  }
  res.render("users/signup")
})

router.post("/signup", authLimiter, validateSignup, async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg)
      return res.redirect("/signup")
    }

    const { email, username, password } = req.body
    const role = determineUserRole(email)

    const user = new User({ email, username, role })
    const registeredUser = await User.register(user, password)

    // Update last login
    registeredUser.lastLogin = new Date()
    await registeredUser.save()

    req.login(registeredUser, (err) => {
      if (err) return next(err)

      req.session.user = {
        id: registeredUser._id,
        name: registeredUser.username,
        role: registeredUser.role,
      }

      // Create welcome notification
      Notification.create({
        userId: registeredUser._id,
        message: `Welcome to PrimeWheels, ${registeredUser.username}! Start exploring our amazing car collection.`,
        type: "general",
        priority: "low",
      }).catch(console.error)

      req.flash("success", "Welcome to PrimeWheels! Your account has been created successfully.")
      res.redirect("/")
    })
  } catch (error) {
    console.error("Signup error:", error)
    req.flash("error", error.message || "Registration failed. Please try again.")
    res.redirect("/signup")
  }
})

// Login Routes
router.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/")
  }
  res.render("users/login")
})

router.post(
  "/login",
  authLimiter,
  validateLogin,
  storeReturnTo,
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg)
      return res.redirect("/login")
    }
    next()
  },
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  async (req, res) => {
    try {
      const user = req.user
      const newRole = determineUserRole(user.email)

      // Update role if changed
      if (user.role !== newRole) {
        user.role = newRole
        await user.save()
        req.user.role = newRole
      }

      // Update last login
      user.lastLogin = new Date()
      await user.save()

      req.session.user = {
        id: user._id,
        name: user.username,
        role: newRole,
      }

      req.flash("success", `Welcome back, ${user.username}!`)
      const redirectUrl = res.locals.returnTo || "/"
      delete req.session.returnTo
      res.redirect(redirectUrl)
    } catch (error) {
      console.error("Login error:", error)
      req.flash("error", "Login failed. Please try again.")
      res.redirect("/login")
    }
  },
)

// Logout Route
router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err)
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err)
        req.flash("error", "Error logging out")
        return res.redirect("/")
      }
      res.clearCookie("connect.sid")
      req.flash("success", "You have been logged out successfully")
      res.redirect("/")
    })
  })
})

// Google Authentication Routes
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }))

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", failureFlash: true }),
  async (req, res) => {
    try {
      const user = req.user
      const newRole = determineUserRole(user.email)

      // Update role if changed
      if (user.role !== newRole) {
        user.role = newRole
        await user.save()
        req.user.role = newRole
      }

      // Update last login
      user.lastLogin = new Date()
      await user.save()

      req.session.user = {
        id: user._id,
        name: user.username || user.displayName,
        role: newRole,
      }

      // Create welcome notification for new Google users
      if (user.isNew) {
        await Notification.create({
          userId: user._id,
          message: `Welcome to PrimeWheels! Your Google account has been successfully linked.`,
          type: "general",
          priority: "low",
        })
      }

      req.flash("success", "Successfully logged in with Google!")
      res.redirect("/")
    } catch (error) {
      console.error("Google auth error:", error)
      req.flash("error", "Google authentication failed")
      res.redirect("/login")
    }
  },
)

// Profile Route with enhanced statistics
router.get("/profile", isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      req.flash("error", "User not found")
      return res.redirect("/")
    }

    let profileData = { user }

    switch (user.role) {
      case "agent":
        const agentStats = await Car.aggregate([
          { $match: { agent: user._id } },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              totalValue: { $sum: "$price" },
            },
          },
        ])

        const agentData = {
          available: 0,
          rejected: 0,
          sold: 0,
          pending: 0,
          totalRevenue: 0,
        }

        agentStats.forEach((stat) => {
          agentData[stat._id] = stat.count
          if (stat._id === "sold") {
            agentData.totalRevenue = stat.totalValue
          }
        })

        const recentCars = await Car.find({ agent: user._id }).sort({ createdAt: -1 }).limit(5)

        profileData = { ...profileData, ...agentData, recentCars }
        break

      case "host":
        const [totalCars, totalUsers, totalRevenue, recentActivity] = await Promise.all([
          Car.countDocuments(),
          User.countDocuments({ role: "normalUser" }),
          Car.aggregate([{ $match: { status: "sold" } }, { $group: { _id: null, total: { $sum: "$price" } } }]),
          Car.find().sort({ createdAt: -1 }).limit(10).populate("seller", "username"),
        ])

        profileData = {
          ...profileData,
          totalCars,
          totalUsers,
          totalRevenue: totalRevenue[0]?.total || 0,
          recentActivity,
        }
        break

      default:
        // Normal user
        const [soldCars, requests, purchases] = await Promise.all([
          Car.find({ seller: user._id }).sort({ createdAt: -1 }),
          Request.find({ buyer: user._id }).sort({ createdAt: -1 }),
          Purchase.find({ buyer: user._id }).populate("car", "brand model carNumber price").sort({ createdAt: -1 }),
        ])

        const userStats = await Car.aggregate([
          { $match: { seller: user._id } },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              totalValue: { $sum: "$price" },
            },
          },
        ])

        const userData = {
          pending: 0,
          available: 0,
          sold: 0,
          rejected: 0,
          totalEarnings: 0,
        }

        userStats.forEach((stat) => {
          userData[stat._id] = stat.count
          if (stat._id === "sold") {
            userData.totalEarnings = stat.totalValue
          }
        })

        profileData = {
          ...profileData,
          soldCars,
          requests,
          purchases,
          ...userData,
        }
    }

    res.render("users/profile", profileData)
  } catch (error) {
    console.error("Profile error:", error)
    req.flash("error", "Error loading profile")
    res.redirect("/")
  }
})

// API Routes for React.js compatibility
router.get("/api/profile", isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    let profileData = { user: user.toJSON() }

    switch (user.role) {
      case "agent":
        const agentStats = await Car.aggregate([
          { $match: { agent: user._id } },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              totalValue: { $sum: "$price" },
            },
          },
        ])

        const agentData = {
          available: 0,
          rejected: 0,
          sold: 0,
          pending: 0,
          totalRevenue: 0,
        }

        agentStats.forEach((stat) => {
          agentData[stat._id] = stat.count
          if (stat._id === "sold") {
            agentData.totalRevenue = stat.totalValue
          }
        })

        profileData = { ...profileData, stats: agentData }
        break

      case "host":
        const [totalCars, totalUsers, totalRevenue] = await Promise.all([
          Car.countDocuments(),
          User.countDocuments({ role: "normalUser" }),
          Car.aggregate([{ $match: { status: "sold" } }, { $group: { _id: null, total: { $sum: "$price" } } }]),
        ])

        profileData = {
          ...profileData,
          stats: {
            totalCars,
            totalUsers,
            totalRevenue: totalRevenue[0]?.total || 0,
          },
        }
        break

      default:
        const userStats = await Car.aggregate([
          { $match: { seller: user._id } },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              totalValue: { $sum: "$price" },
            },
          },
        ])

        const userData = {
          pending: 0,
          available: 0,
          sold: 0,
          rejected: 0,
          totalEarnings: 0,
        }

        userStats.forEach((stat) => {
          userData[stat._id] = stat.count
          if (stat._id === "sold") {
            userData.totalEarnings = stat.totalValue
          }
        })

        profileData = { ...profileData, stats: userData }
    }

    res.json(profileData)
  } catch (error) {
    console.error("API Profile error:", error)
    res.status(500).json({ error: "Error loading profile" })
  }
})

// Delete request route with enhanced validation
router.delete("/request/:id", [isLoggedIn, validateObjectId], async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      buyer: req.user._id,
    })

    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Request not found or you don't have permission to delete it",
      })
    }

    await Request.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Request deleted successfully",
    })
  } catch (error) {
    console.error("Delete request error:", error)
    res.status(500).json({
      success: false,
      error: "Error deleting request",
    })
  }
})

// Get user's cars (API endpoint)
router.get("/api/my-cars", isLoggedIn, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const cars = await Car.find({ seller: req.user._id })
      .populate("agent", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalCars = await Car.countDocuments({ seller: req.user._id })

    res.json({
      cars,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCars / limit),
        totalCars,
        hasNext: page * limit < totalCars,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching user cars:", error)
    res.status(500).json({ error: "Error fetching cars" })
  }
})

// Get user's requests (API endpoint)
router.get("/api/my-requests", isLoggedIn, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const requests = await Request.find({ buyer: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit)

    const totalRequests = await Request.countDocuments({ buyer: req.user._id })

    res.json({
      requests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRequests / limit),
        totalRequests,
        hasNext: page * limit < totalRequests,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching user requests:", error)
    res.status(500).json({ error: "Error fetching requests" })
  }
})

// Get user's purchases (API endpoint)
router.get("/api/my-purchases", isLoggedIn, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const purchases = await Purchase.find({ buyer: req.user._id })
      .populate("car", "brand model carNumber price photos")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalPurchases = await Purchase.countDocuments({ buyer: req.user._id })

    res.json({
      purchases,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPurchases / limit),
        totalPurchases,
        hasNext: page * limit < totalPurchases,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching user purchases:", error)
    res.status(500).json({ error: "Error fetching purchases" })
  }
})

export default router
