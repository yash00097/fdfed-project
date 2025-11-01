import mongoose from "mongoose";
import Car from "../models/car.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

// Get stats for cars handled by this agent (approved/rejected/sold)
// Returns overall counts and a monthly breakdown for the last 6 months.
export const getAgentStats = async (req, res, next) => {
  try {
    const agentId = req.user.id;

    // Overall totals (across all time)
    const [availableCount, rejectedCount, soldCount] = await Promise.all([
      Car.countDocuments({ agent: agentId, status: "available" }),
      Car.countDocuments({ agent: agentId, status: "rejected" }),
      Car.countDocuments({ agent: agentId, status: "sold" }),
    ]);

    const stats = {
      available: availableCount,
      rejected: rejectedCount,
      sold: soldCount,
    };

    // Prepare last 6 months array (inclusive of current month)
    const months = [];
    const now = new Date();
    // Start from 5 months ago up to current month
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1 }); // month is 1-12
    }

    const firstMonth = months[0];
    const firstMonthStart = new Date(firstMonth.year, firstMonth.month - 1, 1);

    // Aggregate counts and revenue per month for statuses in scope
    const agg = await Car.aggregate([
      {
        $match: {
          agent: new mongoose.Types.ObjectId(agentId),
          status: { $in: ["available", "rejected", "sold"] },
          updatedAt: { $gte: firstMonthStart },
        },
      },
      {
        $project: {
          status: 1,
          price: 1,
          year: { $year: "$updatedAt" },
          month: { $month: "$updatedAt" },
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month", status: "$status" },
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "sold"] }, { $ifNull: ["$price", 0] }, 0],
            },
          },
        },
      },
    ]);

    // Build a lookup for quick mapping
    const lookup = {};
    agg.forEach((row) => {
      const key = `${row._id.year}-${String(row._id.month).padStart(2, "0")}`;
      if (!lookup[key]) lookup[key] = { available: 0, rejected: 0, sold: 0, revenue: 0 };
      lookup[key][row._id.status] = row.count;
      if (row.revenue) lookup[key].revenue = (lookup[key].revenue || 0) + row.revenue;
    });

    // Prepare final monthly array with zeros where data is missing
    const monthly = months.map((m) => {
      const key = `${m.year}-${String(m.month).padStart(2, "0")}`;
      const label = new Date(m.year, m.month - 1, 1).toLocaleString("default", { month: "short", year: "numeric" });
      const entry = lookup[key] || { available: 0, rejected: 0, sold: 0, revenue: 0 };
      return {
        year: m.year,
        month: m.month,
        label,
        available: entry.available || 0,
        rejected: entry.rejected || 0,
        sold: entry.sold || 0,
        revenue: entry.revenue || 0,
      };
    });

    res.status(200).json({ success: true, stats, monthly });
  } catch (err) {
    next(err);
  }
};

// List cars assigned to the logged-in agent that are pending verification
export const listAssignedCars = async (req, res, next) => {
  try {
    const agentId = req.user.id;
    const cars = await Car.find({ agent: agentId, status: "pending" })
      .select("brand model carNumber photos price sellerName sellerphone createdAt vehicleType transmission manufacturedYear fuelType seater exteriorColor traveledKm address city state pincode")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, cars });
  } catch (err) {
    next(err);
  }
};

// Approve a car: optionally update technical specs and set status to available
export const approveCar = async (req, res, next) => {
  try {
    const carId = req.params.id;
    const agentId = req.user.id;

    const car = await Car.findById(carId);
    if (!car) return next(errorHandler(404, "Car not found"));
    if (!car.agent || car.agent.toString() !== agentId) {
      return next(errorHandler(403, "Forbidden: Car not assigned to this agent"));
    }
    if (car.status !== "pending") {
      return next(errorHandler(400, "Only pending cars can be approved"));
    }

    // Optional tech spec updates supplied by agent
    const {
      engine,
      torque,
      power,
      groundClearance,
      topSpeed,
      fuelTank,
      driveType,
    } = req.body || {};

    if (engine !== undefined) car.engine = Number(engine);
    if (torque !== undefined) car.torque = Number(torque);
    if (power !== undefined) car.power = Number(power);
    if (groundClearance !== undefined) car.groundClearance = Number(groundClearance);
    if (topSpeed !== undefined) car.topSpeed = Number(topSpeed);
    if (fuelTank !== undefined) car.fuelTank = Number(fuelTank);
    if (driveType !== undefined) car.driveType = driveType;

    // stamp agentName for convenience
    const agent = await User.findById(agentId).select("username");
    car.agentName = agent ? agent.username : undefined;
    car.status = "available";

    await car.save();
    res.status(200).json({ success: true, message: "Car approved and moved to inventory", carId: car._id });
  } catch (err) {
    next(err);
  }
};

// Reject a car: set status to rejected
export const rejectCar = async (req, res, next) => {
  try {
    const carId = req.params.id;
    const agentId = req.user.id;

    const car = await Car.findById(carId);
    if (!car) return next(errorHandler(404, "Car not found"));
    if (!car.agent || car.agent.toString() !== agentId) {
      return next(errorHandler(403, "Forbidden: Car not assigned to this agent"));
    }
    if (car.status !== "pending") {
      return next(errorHandler(400, "Only pending cars can be rejected"));
    }

    car.status = "rejected";
    await car.save();
    res.status(200).json({ success: true, message: "Car request rejected", carId: car._id });
  } catch (err) {
    next(err);
  }
};


