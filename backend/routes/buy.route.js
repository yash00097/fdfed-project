import express from "express"
import Car from "../models/car.model.js"
import Purchase from "../models/purchase.model.js"
import Notification from "../models/notification.model.js"
import { isLoggedIn, validateObjectId } from "../middleware.js"
import { body, validationResult } from "express-validator"
import rateLimit from "express-rate-limit"

const router = express.Router()

// Rate limiting for purchases
const purchaseLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each user to 3 purchases per hour
  message: "Too many purchase attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
})

// Validation middleware for purchase
const validatePurchase = [
  body("firstName").isLength({ min: 2, max: 50 }).withMessage("First name must be between 2 and 50 characters"),
  body("lastName").isLength({ min: 2, max: 50 }).withMessage("Last name must be between 2 and 50 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),
  body("phone")
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be exactly 10 digits"),
  body("address").isLength({ min: 10, max: 200 }).withMessage("Address must be between 10 and 200 characters"),
  body("city").isLength({ min: 2, max: 50 }).withMessage("City must be between 2 and 50 characters"),
  body("state").isLength({ min: 2, max: 50 }).withMessage("State must be between 2 and 50 characters"),
  body("pincode")
    .matches(/^\d{6}$/)
    .withMessage("Pincode must be exactly 6 digits"),
  body("paymentMethod").isIn(["cod", "netbanking", "online"]).withMessage("Invalid payment method"),
]

// Netbanking validation middleware
const validateNetbanking = [
  body("bankName")
    .if(body("paymentMethod").equals("netbanking"))
    .notEmpty()
    .withMessage("Bank name is required for netbanking"),
  body("accountNumber")
    .if(body("paymentMethod").equals("netbanking"))
    .matches(/^[0-9]{9,18}$/)
    .withMessage("Account number must be between 9-18 digits"),
  body("ifscCode")
    .if(body("paymentMethod").equals("netbanking"))
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .withMessage("Invalid IFSC code format"),
]

// Get car details for purchase
router.get("/:id", [isLoggedIn, validateObjectId], async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate("seller", "username email mobileNumber")

    if (!car) {
      req.flash("error", "Car not found.")
      return res.redirect("/inventory")
    }

    if (car.status !== "available") {
      req.flash("error", "This car is no longer available for purchase.")
      return res.redirect("/inventory")
    }

    if (!car.sellerName) {
      req.flash("error", "Car has invalid seller information.")
      return res.redirect("/inventory")
    }

    // Prevent self-purchase
    if (car.seller._id.toString() === req.user._id.toString()) {
      req.flash("error", "You cannot purchase your own car.")
      return res.redirect("/inventory")
    }

    // Increment view count
    await car.incrementViewCount()

    res.render("buyCar", { car })
  } catch (error) {
    console.error("Error fetching car:", error)
    req.flash("error", "Something went wrong.")
    res.redirect("/inventory")
  }
})

// API endpoint for car details
router.get("/api/car/:id", [isLoggedIn, validateObjectId], async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate("seller", "username email mobileNumber")

    if (!car) {
      return res.status(404).json({
        success: false,
        error: "Car not found",
      })
    }

    if (car.status !== "available") {
      return res.status(400).json({
        success: false,
        error: "This car is no longer available for purchase",
      })
    }

    if (car.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: "You cannot purchase your own car",
      })
    }

    // Increment view count
    await car.incrementViewCount()

    res.json({
      success: true,
      data: { car },
    })
  } catch (error) {
    console.error("API Error fetching car:", error)
    res.status(500).json({
      success: false,
      error: "Error fetching car details",
    })
  }
})

// Confirm purchase
router.post(
  "/:id/confirm",
  [isLoggedIn, validateObjectId, purchaseLimiter, ...validatePurchase, ...validateNetbanking],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash("error", errors.array()[0].msg)
        return res.redirect(`/buyCar/${req.params.id}`)
      }

      const car = await Car.findById(req.params.id)
      if (!car) {
        req.flash("error", "Car not found.")
        return res.redirect("/inventory")
      }

      if (car.status !== "available") {
        req.flash("error", "This car is no longer available for purchase.")
        return res.redirect("/inventory")
      }

      if (!car.sellerName) {
        req.flash("error", "Car has invalid seller information.")
        return res.redirect("/inventory")
      }

      // Prevent self-purchase
      if (car.seller.toString() === req.user._id.toString()) {
        req.flash("error", "You cannot purchase your own car.")
        return res.redirect("/inventory")
      }

      const {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        paymentMethod,
        bankName,
        accountNumber,
        ifscCode,
      } = req.body

      // Create purchase object
      const purchaseData = {
        car: car._id,
        buyer: req.user._id,
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        paymentMethod,
        totalPrice: car.price,
        status: "confirmed",
      }

      // Add netbanking details if applicable
      if (paymentMethod === "netbanking") {
        purchaseData.bankName = bankName
        purchaseData.accountNumber = accountNumber
        purchaseData.ifscCode = ifscCode.toUpperCase()
      }

      const purchase = new Purchase(purchaseData)
      await purchase.save()

      // Update car status to sold
      car.status = "sold"
      await car.save()

      // Create notifications
      await Promise.all([
        // Buyer notification
        Notification.createPurchaseUpdateNotification(
          req.user._id,
          purchase,
          `Congratulations! You have successfully purchased the ${car.brand} ${car.model}. Your order is being processed.`,
        ),
        // Seller notification
        Notification.create({
          userId: car.seller,
          message: `Great news! Your ${car.brand} ${car.model} has been sold to ${firstName} ${lastName}.`,
          type: "purchase_update",
          relatedPurchase: purchase._id,
          relatedCar: car._id,
          priority: "high",
        }),
      ])

      req.flash("success", "Purchase completed successfully!")
      res.render("confirm", { purchase, car })
    } catch (error) {
      console.error("Error processing purchase:", error)
      req.flash("error", "Something went wrong with your purchase.")
      res.redirect(`/buyCar/${req.params.id}`)
    }
  },
)

// API endpoint for purchase confirmation
router.post(
  "/api/:id/confirm",
  [isLoggedIn, validateObjectId, purchaseLimiter, ...validatePurchase, ...validateNetbanking],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        })
      }

      const car = await Car.findById(req.params.id)
      if (!car) {
        return res.status(404).json({
          success: false,
          error: "Car not found",
        })
      }

      if (car.status !== "available") {
        return res.status(400).json({
          success: false,
          error: "This car is no longer available for purchase",
        })
      }

      if (car.seller.toString() === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          error: "You cannot purchase your own car",
        })
      }

      const {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        paymentMethod,
        bankName,
        accountNumber,
        ifscCode,
      } = req.body

      const purchaseData = {
        car: car._id,
        buyer: req.user._id,
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        paymentMethod,
        totalPrice: car.price,
        status: "confirmed",
      }

      if (paymentMethod === "netbanking") {
        purchaseData.bankName = bankName
        purchaseData.accountNumber = accountNumber
        purchaseData.ifscCode = ifscCode.toUpperCase()
      }

      const purchase = new Purchase(purchaseData)
      await purchase.save()

      // Update car status
      car.status = "sold"
      await car.save()

      // Create notifications
      await Promise.all([
        Notification.createPurchaseUpdateNotification(
          req.user._id,
          purchase,
          `Congratulations! You have successfully purchased the ${car.brand} ${car.model}.`,
        ),
        Notification.create({
          userId: car.seller,
          message: `Your ${car.brand} ${car.model} has been sold to ${firstName} ${lastName}.`,
          type: "purchase_update",
          relatedPurchase: purchase._id,
          relatedCar: car._id,
          priority: "high",
        }),
      ])

      res.json({
        success: true,
        message: "Purchase completed successfully!",
        data: {
          purchase,
          car: {
            brand: car.brand,
            model: car.model,
            price: car.price,
          },
        },
      })
    } catch (error) {
      console.error("API Error processing purchase:", error)
      res.status(500).json({
        success: false,
        error: "Something went wrong with your purchase",
      })
    }
  },
)

// Get purchase history
router.get("/history", isLoggedIn, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const [purchases, totalPurchases] = await Promise.all([
      Purchase.find({ buyer: req.user._id })
        .populate("car", "brand model carNumber photos price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Purchase.countDocuments({ buyer: req.user._id }),
    ])

    const totalPages = Math.ceil(totalPurchases / limit)

    res.render("purchases/history", {
      purchases,
      pagination: {
        currentPage: page,
        totalPages,
        totalPurchases,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching purchase history:", error)
    req.flash("error", "Error loading purchase history.")
    res.redirect("/")
  }
})

// API endpoint for purchase history
router.get("/api/history", isLoggedIn, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const [purchases, totalPurchases] = await Promise.all([
      Purchase.find({ buyer: req.user._id })
        .populate("car", "brand model carNumber photos price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Purchase.countDocuments({ buyer: req.user._id }),
    ])

    res.json({
      success: true,
      data: {
        purchases,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalPurchases / limit),
          totalPurchases,
          hasNext: page * limit < totalPurchases,
          hasPrev: page > 1,
        },
      },
    })
  } catch (error) {
    console.error("API Error fetching purchase history:", error)
    res.status(500).json({
      success: false,
      error: "Error loading purchase history",
    })
  }
})

export default router
