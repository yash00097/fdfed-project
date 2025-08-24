import express from "express"
import Car from "../models/car.model.js"
import User from "../models/user.model.js"
import Request from "../models/request.model.js"
import Purchase from "../models/purchase.model.js"
import { isHost, validateObjectId } from "../middleware.js"
import { query, validationResult } from "express-validator"

const router = express.Router()

// Validation middleware
const validatePagination = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
]

// Get comprehensive dashboard with agent and user details
router.get("/details", [isHost, ...validatePagination], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg)
      return res.redirect("/host/details")
    }

    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    // Fetch agents with optimized aggregation
    const agents = await User.find({ role: "agent", isActive: true })
    const users = await User.find({ role: "normalUser", isActive: true }).skip(skip).limit(limit)

    if (!agents.length) {
      req.flash("error", "No agents found")
      return res.redirect("/")
    }

    // Get agent statistics using aggregation
    const agentDetails = await Promise.all(
      agents.map(async (agent) => {
        const [carStats, revenueStats] = await Promise.all([
          Car.aggregate([
            { $match: { agent: agent._id } },
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
                totalValue: { $sum: "$price" },
              },
            },
          ]),
          Car.aggregate([
            { $match: { agent: agent._id, status: "sold" } },
            { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
          ]),
        ])

        const stats = {
          approved: 0,
          rejected: 0,
          pending: 0,
          sold: 0,
          totalRevenue: revenueStats[0]?.totalRevenue || 0,
        }

        carStats.forEach((stat) => {
          if (stat._id === "available") stats.approved = stat.count
          else if (stat._id === "rejected") stats.rejected = stat.count
          else if (stat._id === "pending") stats.pending = stat.count
          else if (stat._id === "sold") stats.sold = stat.count
        })

        const approvalRate =
          stats.approved + stats.rejected > 0
            ? ((stats.approved / (stats.approved + stats.rejected)) * 100).toFixed(2)
            : 0

        return {
          agentId: agent._id,
          agentName: agent.username,
          agentEmail: agent.email,
          mobileNumber: agent.mobileNumber || "Not provided",
          joinedDate: agent.createdAt,
          lastLogin: agent.lastLogin,
          ...stats,
          approvalRate: Number.parseFloat(approvalRate),
        }
      }),
    )

    // Get user statistics with optimized queries
    const userDetails = await Promise.all(
      users.map(async (user) => {
        const [sellStats, buyStats, requestCount] = await Promise.all([
          Car.aggregate([
            { $match: { seller: user._id } },
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
                totalValue: { $sum: "$price" },
              },
            },
          ]),
          Purchase.aggregate([
            { $match: { buyer: user._id } },
            { $group: { _id: null, count: { $sum: 1 }, totalValue: { $sum: "$totalPrice" } } },
          ]),
          Request.countDocuments({ buyer: user._id }),
        ])

        const sellData = {
          totalCars: 0,
          availableCars: 0,
          soldCars: 0,
          pendingCars: 0,
          rejectedCars: 0,
          sellValue: 0,
        }

        sellStats.forEach((stat) => {
          sellData.totalCars += stat.count
          if (stat._id === "available") {
            sellData.availableCars = stat.count
            sellData.sellValue = stat.totalValue
          } else if (stat._id === "sold") sellData.soldCars = stat.count
          else if (stat._id === "pending") sellData.pendingCars = stat.count
          else if (stat._id === "rejected") sellData.rejectedCars = stat.count
        })

        return {
          id: user._id,
          username: user.username,
          email: user.email,
          mobileNumber: user.mobileNumber || "Not provided",
          joinedDate: user.createdAt,
          lastLogin: user.lastLogin,
          ...sellData,
          purchaseCount: buyStats[0]?.count || 0,
          purchaseValue: buyStats[0]?.totalValue || 0,
          requestCount,
        }
      }),
    )

    const totalUsers = await User.countDocuments({ role: "normalUser", isActive: true })
    const totalPages = Math.ceil(totalUsers / limit)

    res.render("host/dashboard", {
      agentDetails,
      userDetails,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching host dashboard:", error)
    req.flash("error", "Error loading dashboard")
    res.redirect("/")
  }
})

// API endpoint for React.js - Get dashboard data
router.get("/api/dashboard", [isHost, ...validatePagination], async (req, res) => {
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
    const skip = (page - 1) * limit

    const [agents, users, totalUsers] = await Promise.all([
      User.find({ role: "agent", isActive: true }),
      User.find({ role: "normalUser", isActive: true }).skip(skip).limit(limit),
      User.countDocuments({ role: "normalUser", isActive: true }),
    ])

    // Get agent statistics
    const agentDetails = await Promise.all(
      agents.map(async (agent) => {
        const [carStats, revenueStats] = await Promise.all([
          Car.aggregate([{ $match: { agent: agent._id } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
          Car.aggregate([
            { $match: { agent: agent._id, status: "sold" } },
            { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
          ]),
        ])

        const stats = { approved: 0, rejected: 0, pending: 0, sold: 0 }
        carStats.forEach((stat) => {
          if (stat._id === "available") stats.approved = stat.count
          else stats[stat._id] = stat.count
        })

        return {
          agentId: agent._id,
          agentName: agent.username,
          agentEmail: agent.email,
          ...stats,
          totalRevenue: revenueStats[0]?.totalRevenue || 0,
          approvalRate:
            stats.approved + stats.rejected > 0
              ? ((stats.approved / (stats.approved + stats.rejected)) * 100).toFixed(2)
              : 0,
        }
      }),
    )

    // Get user statistics
    const userDetails = await Promise.all(
      users.map(async (user) => {
        const [sellStats, buyStats, requestCount] = await Promise.all([
          Car.aggregate([
            { $match: { seller: user._id } },
            { $group: { _id: "$status", count: { $sum: 1 }, totalValue: { $sum: "$price" } } },
          ]),
          Purchase.aggregate([
            { $match: { buyer: user._id } },
            { $group: { _id: null, count: { $sum: 1 }, totalValue: { $sum: "$totalPrice" } } },
          ]),
          Request.countDocuments({ buyer: user._id }),
        ])

        const sellData = { totalCars: 0, sellValue: 0 }
        sellStats.forEach((stat) => {
          sellData.totalCars += stat.count
          if (stat._id === "available") sellData.sellValue = stat.totalValue
        })

        return {
          id: user._id,
          username: user.username,
          email: user.email,
          ...sellData,
          purchaseCount: buyStats[0]?.count || 0,
          purchaseValue: buyStats[0]?.totalValue || 0,
          requestCount,
        }
      }),
    )

    res.json({
      success: true,
      data: {
        agents: agentDetails,
        users: userDetails,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          hasNext: page * limit < totalUsers,
          hasPrev: page > 1,
        },
      },
    })
  } catch (error) {
    console.error("API Error fetching dashboard:", error)
    res.status(500).json({
      success: false,
      error: "Error loading dashboard data",
    })
  }
})

// Get detailed user information
router.get("/viewdetails/:id", [isHost, validateObjectId], async (req, res) => {
  try {
    const userId = req.params.id
    const user = await User.findById(userId)

    if (!user) {
      req.flash("error", "User not found")
      return res.redirect("/host/details")
    }

    const [soldCars, requests, purchases] = await Promise.all([
      Car.find({ seller: userId }).populate("agent", "username"),
      Request.find({ buyer: userId }).sort({ createdAt: -1 }),
      Purchase.find({ buyer: userId }).populate("car", "brand model carNumber price"),
    ])

    const [sellStats, buyStats] = await Promise.all([
      Car.aggregate([
        { $match: { seller: user._id } },
        { $group: { _id: "$status", count: { $sum: 1 }, totalValue: { $sum: "$price" } } },
      ]),
      Purchase.aggregate([
        { $match: { buyer: user._id } },
        { $group: { _id: null, totalValue: { $sum: "$totalPrice" } } },
      ]),
    ])

    const userStats = {
      totalSellValue: 0,
      totalBuyValue: buyStats[0]?.totalValue || 0,
      activeCars: 0,
      soldCars: 0,
      pendingCars: 0,
      rejectedCars: 0,
      activeRequests: requests.filter((req) => req.status === "active").length,
    }

    sellStats.forEach((stat) => {
      if (stat._id === "available") {
        userStats.activeCars = stat.count
        userStats.totalSellValue = stat.totalValue
      } else if (stat._id === "sold") userStats.soldCars = stat.count
      else if (stat._id === "pending") userStats.pendingCars = stat.count
      else if (stat._id === "rejected") userStats.rejectedCars = stat.count
    })

    res.render("host/userDetails", {
      user,
      soldCars,
      requests,
      purchases,
      userStats,
    })
  } catch (error) {
    console.error("Error fetching user details:", error)
    req.flash("error", "Error loading user details")
    res.redirect("/host/details")
  }
})

// API endpoint for user details
router.get("/api/user/:id", [isHost, validateObjectId], async (req, res) => {
  try {
    const userId = req.params.id
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      })
    }

    const [soldCars, requests, purchases, sellStats, buyStats] = await Promise.all([
      Car.find({ seller: userId }).populate("agent", "username"),
      Request.find({ buyer: userId }).sort({ createdAt: -1 }),
      Purchase.find({ buyer: userId }).populate("car", "brand model carNumber price"),
      Car.aggregate([
        { $match: { seller: user._id } },
        { $group: { _id: "$status", count: { $sum: 1 }, totalValue: { $sum: "$price" } } },
      ]),
      Purchase.aggregate([
        { $match: { buyer: user._id } },
        { $group: { _id: null, totalValue: { $sum: "$totalPrice" } } },
      ]),
    ])

    const userStats = {
      totalSellValue: 0,
      totalBuyValue: buyStats[0]?.totalValue || 0,
      activeCars: 0,
      soldCars: 0,
      pendingCars: 0,
      rejectedCars: 0,
      activeRequests: requests.filter((req) => req.status === "active").length,
    }

    sellStats.forEach((stat) => {
      if (stat._id === "available") {
        userStats.activeCars = stat.count
        userStats.totalSellValue = stat.totalValue
      } else {
        userStats[`${stat._id}Cars`] = stat.count
      }
    })

    res.json({
      success: true,
      data: {
        user,
        soldCars,
        requests,
        purchases,
        userStats,
      },
    })
  } catch (error) {
    console.error("API Error fetching user details:", error)
    res.status(500).json({
      success: false,
      error: "Error loading user details",
    })
  }
})

// Get system statistics
router.get("/statistics", isHost, async (req, res) => {
  try {
    const [carStats, userStats, purchaseStats, requestStats, monthlyStats] = await Promise.all([
      Car.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, totalValue: { $sum: "$price" } } }]),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Purchase.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, totalValue: { $sum: "$totalPrice" } } }]),
      Request.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Purchase.aggregate([
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            count: { $sum: 1 },
            revenue: { $sum: "$totalPrice" },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 12 },
      ]),
    ])

    res.render("host/statistics", {
      carStats,
      userStats,
      purchaseStats,
      requestStats,
      monthlyStats,
    })
  } catch (error) {
    console.error("Error fetching statistics:", error)
    req.flash("error", "Error loading statistics")
    res.redirect("/host/details")
  }
})

// API endpoint for statistics
router.get("/api/statistics", isHost, async (req, res) => {
  try {
    const [carStats, userStats, purchaseStats, requestStats, monthlyStats] = await Promise.all([
      Car.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, totalValue: { $sum: "$price" } } }]),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Purchase.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, totalValue: { $sum: "$totalPrice" } } }]),
      Request.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Purchase.aggregate([
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            count: { $sum: 1 },
            revenue: { $sum: "$totalPrice" },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 12 },
      ]),
    ])

    res.json({
      success: true,
      data: {
        carStats,
        userStats,
        purchaseStats,
        requestStats,
        monthlyStats,
      },
    })
  } catch (error) {
    console.error("API Error fetching statistics:", error)
    res.status(500).json({
      success: false,
      error: "Error loading statistics",
    })
  }
})

export default router
