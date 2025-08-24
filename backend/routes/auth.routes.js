import express from "express"
import bcrypt from "bcrypt"
import Agent from "../models/agent.model.js"
import User from "../models/user.model.js"
import { body, validationResult } from "express-validator"
import rateLimit from "express-rate-limit"

const router = express.Router()

// Rate limiting for authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
})

// Validation middleware
const validateLogin = [
  body("username").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
]

// Get login page
router.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/")
  }
  res.render("auth/login")
})

// API endpoint for login page data
router.get("/api/login", (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      success: false,
      error: "Already authenticated",
      redirectTo: "/",
    })
  }

  res.json({
    success: true,
    data: {
      loginUrl: "/auth/login",
      signupUrl: "/signup",
      googleAuthUrl: "/auth/google",
    },
  })
})

// Handle login
router.post("/login", [authLimiter, ...validateLogin], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg)
      return res.redirect("/auth/login")
    }

    const { username, password } = req.body

    // Try to find user first (for regular users)
    let user = await User.findOne({ username })
    let isAgent = false

    // If not found in users, try agents
    if (!user) {
      user = await Agent.findOne({ username })
      isAgent = true
    }

    if (!user) {
      req.flash("error", "Invalid credentials.")
      return res.redirect("/auth/login")
    }

    // For agents, check approval status
    if (isAgent && user.status !== "approved") {
      req.flash("error", "Your agent application is still pending approval.")
      return res.redirect("/auth/login")
    }

    // Verify password
    let isMatch = false
    if (isAgent) {
      // For agents using bcrypt
      isMatch = await bcrypt.compare(password, user.password)
    } else {
      // For regular users using passport-local-mongoose
      const authenticatedUser = await user.authenticate(password)
      isMatch = !!authenticatedUser.user
    }

    if (!isMatch) {
      req.flash("error", "Incorrect password.")
      return res.redirect("/auth/login")
    }

    // Set session
    if (isAgent) {
      req.session.agent = user
      req.session.user = {
        id: user._id,
        name: user.username,
        role: "agent",
      }
    } else {
      req.session.user = {
        id: user._id,
        name: user.username,
        role: user.role,
      }
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    req.flash("success", "Login successful!")
    res.redirect(isAgent ? "/agent/dashboard" : "/")
  } catch (error) {
    console.error("Login error:", error)
    req.flash("error", "Login failed. Please try again.")
    res.redirect("/auth/login")
  }
})

// API endpoint for login
router.post("/api/login", [authLimiter, ...validateLogin], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { username, password } = req.body

    let user = await User.findOne({ username })
    let isAgent = false

    if (!user) {
      user = await Agent.findOne({ username })
      isAgent = true
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      })
    }

    if (isAgent && user.status !== "approved") {
      return res.status(401).json({
        success: false,
        error: "Your agent application is still pending approval",
      })
    }

    let isMatch = false
    if (isAgent) {
      isMatch = await bcrypt.compare(password, user.password)
    } else {
      const authenticatedUser = await user.authenticate(password)
      isMatch = !!authenticatedUser.user
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Incorrect password",
      })
    }

    // Set session
    if (isAgent) {
      req.session.agent = user
      req.session.user = {
        id: user._id,
        name: user.username,
        role: "agent",
      }
    } else {
      req.session.user = {
        id: user._id,
        name: user.username,
        role: user.role,
      }
    }

    user.lastLogin = new Date()
    await user.save()

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          username: user.username,
          role: isAgent ? "agent" : user.role,
        },
        redirectTo: isAgent ? "/agent/dashboard" : "/",
      },
    })
  } catch (error) {
    console.error("API Login error:", error)
    res.status(500).json({
      success: false,
      error: "Login failed. Please try again.",
    })
  }
})

// Logout route
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error logging out:", err)
      req.flash("error", "Error logging out")
      return res.redirect("/")
    }
    res.clearCookie("connect.sid")
    req.flash("success", "You have been logged out successfully")
    res.redirect("/")
  })
})

// API endpoint for logout
router.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("API Error logging out:", err)
      return res.status(500).json({
        success: false,
        error: "Error logging out",
      })
    }
    res.clearCookie("connect.sid")
    res.json({
      success: true,
      message: "Logged out successfully",
    })
  })
})

// Get current user info (API endpoint)
router.get("/api/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      error: "Not authenticated",
    })
  }

  res.json({
    success: true,
    data: {
      user: req.session.user,
    },
  })
})

// Check authentication status (API endpoint)
router.get("/api/status", (req, res) => {
  res.json({
    success: true,
    data: {
      isAuthenticated: !!req.session.user,
      user: req.session.user || null,
    },
  })
})

export default router
