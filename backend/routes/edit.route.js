import express from "express"
import User from "../models/user.model.js"
import { isLoggedIn } from "../middleware.js"
import { body, validationResult } from "express-validator"
import rateLimit from "express-rate-limit"

const router = express.Router()

// Rate limiting for profile updates
const editLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each user to 10 profile updates per 15 minutes
  message: "Too many profile update attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
})

// Validation middleware
const validateProfileUpdate = [
  body("username")
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("firstName").optional().isLength({ max: 50 }).withMessage("First name cannot exceed 50 characters"),
  body("lastName").optional().isLength({ max: 50 }).withMessage("Last name cannot exceed 50 characters"),
  body("mobileNumber")
    .optional()
    .matches(/^\d{10}$/)
    .withMessage("Mobile number must be exactly 10 digits"),
  body("oldPassword").optional().isLength({ min: 1 }).withMessage("Current password is required"),
  body("newPassword")
    .optional()
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
]

// Get edit profile form
router.get("/edit", isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      req.flash("error", "User not found.")
      return res.redirect("/profile")
    }

    res.render("users/edit", {
      user,
      errorMessage: null,
      successMessage: null,
    })
  } catch (error) {
    console.error("Error loading edit page:", error)
    req.flash("error", "Error loading edit page.")
    res.redirect("/profile")
  }
})

// API endpoint for getting user data for editing
router.get("/api/edit", isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      })
    }

    res.json({
      success: true,
      data: {
        user: {
          username: user.username,
          email: user.email,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          mobileNumber: user.mobileNumber || "",
          role: user.role,
          isGoogleUser: !!user.googleId,
        },
      },
    })
  } catch (error) {
    console.error("API Error loading user data:", error)
    res.status(500).json({
      success: false,
      error: "Error loading user data",
    })
  }
})

// Handle profile update
router.post("/edit", [isLoggedIn, editLimiter, ...validateProfileUpdate], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const user = await User.findById(req.user._id)
      return res.render("users/edit", {
        user,
        errorMessage: errors.array()[0].msg,
        successMessage: null,
      })
    }

    const { username, firstName, lastName, mobileNumber, oldPassword, newPassword } = req.body
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.render("users/edit", {
        user: req.user,
        errorMessage: "User not found.",
        successMessage: null,
      })
    }

    let updated = false
    const updateData = {}

    // Update username
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: user._id } })
      if (existingUser) {
        return res.render("users/edit", {
          user,
          errorMessage: "Username is already taken.",
          successMessage: null,
        })
      }
      updateData.username = username
      updated = true
    }

    // Update first name
    if (firstName !== undefined && firstName !== user.firstName) {
      updateData.firstName = firstName
      updated = true
    }

    // Update last name
    if (lastName !== undefined && lastName !== user.lastName) {
      updateData.lastName = lastName
      updated = true
    }

    // Update mobile number
    if (mobileNumber && mobileNumber !== user.mobileNumber) {
      const existingUser = await User.findOne({ mobileNumber, _id: { $ne: user._id } })
      if (existingUser) {
        return res.render("users/edit", {
          user,
          errorMessage: "Mobile number is already registered.",
          successMessage: null,
        })
      }
      updateData.mobileNumber = mobileNumber
      updated = true
    }

    // Handle password change for non-Google users
    if (!user.googleId && oldPassword && newPassword) {
      try {
        const authenticatedUser = await user.authenticate(oldPassword)
        if (!authenticatedUser.user) {
          return res.render("users/edit", {
            user,
            errorMessage: "Incorrect current password.",
            successMessage: null,
          })
        }

        await user.setPassword(newPassword)
        updated = true
      } catch (error) {
        return res.render("users/edit", {
          user,
          errorMessage: "Error updating password.",
          successMessage: null,
        })
      }
    }

    // Apply updates
    if (Object.keys(updateData).length > 0) {
      Object.assign(user, updateData)
    }

    if (updated) {
      await user.save()

      // Re-authenticate user if password was changed
      if (oldPassword && newPassword) {
        req.login(user, (err) => {
          if (err) {
            console.error("Error re-authenticating user:", err)
            return res.render("users/edit", {
              user,
              errorMessage: "Profile updated but please login again.",
              successMessage: null,
            })
          }
          return res.render("users/profile", {
            user,
            errorMessage: null,
            successMessage: "Profile updated successfully!",
          })
        })
      } else {
        return res.render("users/profile", {
          user,
          errorMessage: null,
          successMessage: "Profile updated successfully!",
        })
      }
    } else {
      return res.render("users/edit", {
        user,
        errorMessage: null,
        successMessage: "No changes made.",
      })
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    return res.render("users/edit", {
      user: req.user,
      errorMessage: "An error occurred while updating the profile.",
      successMessage: null,
    })
  }
})

// API endpoint for profile update
router.put("/api/edit", [isLoggedIn, editLimiter, ...validateProfileUpdate], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { username, firstName, lastName, mobileNumber, oldPassword, newPassword } = req.body
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      })
    }

    let updated = false
    const updateData = {}

    // Validate username uniqueness
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: user._id } })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "Username is already taken",
        })
      }
      updateData.username = username
      updated = true
    }

    // Update other fields
    if (firstName !== undefined && firstName !== user.firstName) {
      updateData.firstName = firstName
      updated = true
    }

    if (lastName !== undefined && lastName !== user.lastName) {
      updateData.lastName = lastName
      updated = true
    }

    // Validate mobile number uniqueness
    if (mobileNumber && mobileNumber !== user.mobileNumber) {
      const existingUser = await User.findOne({ mobileNumber, _id: { $ne: user._id } })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "Mobile number is already registered",
        })
      }
      updateData.mobileNumber = mobileNumber
      updated = true
    }

    // Handle password change
    if (!user.googleId && oldPassword && newPassword) {
      try {
        const authenticatedUser = await user.authenticate(oldPassword)
        if (!authenticatedUser.user) {
          return res.status(400).json({
            success: false,
            error: "Incorrect current password",
          })
        }

        await user.setPassword(newPassword)
        updated = true
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: "Error updating password",
        })
      }
    }

    // Apply updates
    if (Object.keys(updateData).length > 0) {
      Object.assign(user, updateData)
    }

    if (updated) {
      await user.save()

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: {
          user: {
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            mobileNumber: user.mobileNumber,
            role: user.role,
          },
          passwordChanged: !!(oldPassword && newPassword),
        },
      })
    } else {
      res.json({
        success: true,
        message: "No changes made",
        data: { user: user.toJSON() },
      })
    }
  } catch (error) {
    console.error("API Error updating profile:", error)
    res.status(500).json({
      success: false,
      error: "Error updating profile",
    })
  }
})

// Add mobile number
router.post("/add-mobile", [isLoggedIn, editLimiter], async (req, res) => {
  try {
    const { mobileNumber } = req.body

    if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
      req.flash("error", "Please provide a valid 10-digit mobile number.")
      return res.redirect("/profile")
    }

    // Check if mobile number already exists
    const existingUser = await User.findOne({ mobileNumber, _id: { $ne: req.user._id } })
    if (existingUser) {
      req.flash("error", "Mobile number is already registered.")
      return res.redirect("/profile")
    }

    await User.findByIdAndUpdate(req.user._id, { mobileNumber })
    req.flash("success", "Mobile number added successfully.")
    res.redirect("/profile")
  } catch (error) {
    console.error("Error adding mobile number:", error)
    req.flash("error", "Error adding mobile number.")
    res.redirect("/profile")
  }
})

// API endpoint for adding mobile number
router.post("/api/add-mobile", [isLoggedIn, editLimiter], async (req, res) => {
  try {
    const { mobileNumber } = req.body

    if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid 10-digit mobile number",
      })
    }

    const existingUser = await User.findOne({ mobileNumber, _id: { $ne: req.user._id } })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Mobile number is already registered",
      })
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, { mobileNumber }, { new: true }).select("-password")

    res.json({
      success: true,
      message: "Mobile number added successfully",
      data: { user: updatedUser },
    })
  } catch (error) {
    console.error("API Error adding mobile number:", error)
    res.status(500).json({
      success: false,
      error: "Error adding mobile number",
    })
  }
})

// Remove mobile number
router.delete("/remove-mobile", isLoggedIn, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $unset: { mobileNumber: 1 } })

    res.json({
      success: true,
      message: "Mobile number removed successfully",
    })
  } catch (error) {
    console.error("Error removing mobile number:", error)
    res.status(500).json({
      success: false,
      error: "Error removing mobile number",
    })
  }
})

export default router
