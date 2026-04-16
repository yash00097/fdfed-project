import mongoose from "mongoose";
import Car from "../models/car.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import Notification from "../models/notification.model.js";
import { sendEmail } from "../utils/emailService.js";
import {
  invalidateCarCache,
  invalidateNotificationCache,
} from "../utils/cache.js";



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

// Leaderboard across all agents (last 6 months of activity)
export const getAgentLeaderboard = async (req, res, next) => {
  try {
    // Build six-month window starting from first day five months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const agentPerformance = await User.aggregate([
      { $match: { role: 'agent' } },
      {
        $lookup: {
          from: 'cars',
          let: { agentId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$agent', '$$agentId'] },
                updatedAt: { $gte: sixMonthsAgo }
              }
            },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                revenue: {
                  $sum: {
                    $cond: [
                      { $eq: ['$status', 'sold'] },
                      { $ifNull: ['$price', 0] },
                      0
                    ]
                  }
                }
              }
            }
          ],
          as: 'carStats'
        }
      },
      {
        $project: {
          _id: 1,
          name: '$username',
          avatar: '$avatar',
          email: '$email',
          revenue: {
            $reduce: {
              input: '$carStats',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.revenue'] }
            }
          },
          availableCars: {
            $reduce: {
              input: {
                $filter: {
                  input: '$carStats',
                  as: 'stat',
                  cond: { $eq: ['$$stat._id', 'available'] }
                }
              },
              initialValue: 0,
              in: { $add: ['$$value', '$$this.count'] }
            }
          },
          soldCars: {
            $reduce: {
              input: {
                $filter: {
                  input: '$carStats',
                  as: 'stat',
                  cond: { $eq: ['$$stat._id', 'sold'] }
                }
              },
              initialValue: 0,
              in: { $add: ['$$value', '$$this.count'] }
            }
          },
          rejectedCars: {
            $reduce: {
              input: {
                $filter: {
                  input: '$carStats',
                  as: 'stat',
                  cond: { $eq: ['$$stat._id', 'rejected'] }
                }
              },
              initialValue: 0,
              in: { $add: ['$$value', '$$this.count'] }
            }
          }
        }
      }
    ]);

    const agents = agentPerformance.map(agent => {
      const available = Number(agent.availableCars || 0);
      const sold = Number(agent.soldCars || 0);
      const rejected = Number(agent.rejectedCars || 0);
      const total = available + sold + rejected;
      const successRate = Number(((sold / Math.max(total, 1)) * 100).toFixed(1));
      return {
        ...agent,
        availableCars: available,
        soldCars: sold,
        rejectedCars: rejected,
        totalCars: total,
        successRate
      };
    });

    res.status(200).json({ success: true, agents });
  } catch (err) {
    next(err);
  }
};

// List cars assigned to the logged-in agent that are pending verification
export const listAssignedCars = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { status: status || "pending" };
    const cars = await Car.find(query)
      .select(
        "brand model carNumber photos price sellerName sellerphone createdAt vehicleType transmission manufacturedYear fuelType seater exteriorColor traveledKm address city state pincode status"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, cars });
  } catch (err) {
    next(err);
  }
};

export const acceptCarForVerification = async (req, res, next) => {
  try {
    const carId = req.params.id;
    const agentId = req.user.id;
    const { verificationDays } = req.body;

    const car = await Car.findById(carId).populate("seller");
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    if (car.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This car has already been processed.",
      });
    }

    const days = parseInt(verificationDays);
    if (!days || days < 1 || days > 10) {
      return res.status(400).json({
        success: false,
        message: "Verification days must be between 1 and 10",
      });
    }

    // Get agent details
    const agent = await User.findById(agentId).select("username");
    const agentName = agent ? agent.username : "our agent";

    const verificationDeadline = new Date();
    verificationDeadline.setDate(verificationDeadline.getDate() + days);

    car.agent = agentId;
    car.status = "verification";
    car.verificationDays = days;
    car.verificationDeadline = verificationDeadline;
    car.verificationStartTime = new Date();
    await car.save();
    await invalidateCarCache(car._id.toString());

    // Send notification to seller
    await Notification.create({
      userId: car.seller._id,
      type: "verification_update",
      message: `Your car ${car.brand} ${car.model} has been accepted for verification by agent ${agentName}. The process will take approximately ${days} days.`,
    });
    await invalidateNotificationCache(car.seller._id.toString());

    // Send email to seller
    await sendEmail(
      car.seller.email,
      "Car Accepted for Verification - PrimeWheels",
      `Dear ${car.seller.username},\n\nYour car ${car.brand} ${car.model} has been accepted for verification by agent ${agentName}. The verification process is expected to take ${days} days.\n\nThank you for choosing PrimeWheels.`
    );

    res.status(200).json({
      success: true,
      message: `Car accepted for verification. You have ${days} day(s) to complete verification.`,
      car,
    });
  } catch (err) {
    next(err);
  }
};


export const listCarsForVerification = async (req, res, next) => {
  try {
    await checkExpiredVerifications(); // This will reset expired cars to pending before listing
    const agentId = req.user.id;
    const cars = await Car.find({ agent: agentId, status: "verification" })
      .select(
        "brand model carNumber photos price sellerName sellerphone createdAt updatedAt vehicleType transmission manufacturedYear fuelType seater exteriorColor traveledKm address city state pincode verificationDays verificationDeadline verificationStartTime status"
      )
      .sort({ createdAt: -1 });

    const carsWithVerificationTime = cars.map((car) => {
      const carObj = car.toObject();
      if (car.status === "verification" && car.verificationStartTime) {
        const verificationStartTime = new Date(car.verificationStartTime);
        const now = new Date();
        const timeInVerification = now - verificationStartTime;
        const hoursInVerification = Math.floor(
          timeInVerification / (1000 * 60 * 60)
        );
        const daysInVerification = Math.floor(hoursInVerification / 24);

        carObj.timeInVerification = {
          hours: hoursInVerification,
          days: daysInVerification,
          startTime: verificationStartTime,
        };
      }
      return carObj;
    });

    res.status(200).json({ success: true, cars: carsWithVerificationTime });
  } catch (err) {
    next(err);
  }
};

// Approve car → move to available
export const approveCar = async (req, res, next) => {
  try {
    const carId = req.params.id;
    const agentId = req.user.id;

    const car = await Car.findById(carId).populate("seller");
    if (!car) return next(errorHandler(404, "Car not found"));

    // Allow agent to approve only cars under their verification
    if (car.status !== "verification" || car.agent.toString() !== agentId) {
      return next(
        errorHandler(400, "You can only approve cars under your verification")
      );
    }

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
    if (groundClearance !== undefined)
      car.groundClearance = Number(groundClearance);
    if (topSpeed !== undefined) car.topSpeed = Number(topSpeed);
    if (fuelTank !== undefined) car.fuelTank = Number(fuelTank);
    if (driveType !== undefined) car.driveType = driveType;

    // Assign the approving agent to the car and clear verification deadline
    const agent = await User.findById(agentId).select("username");
    car.agent = agentId;
    car.agentName = agent ? agent.username : undefined;
    car.status = "available";
    car.verificationStartTime = undefined;
    car.verificationDays = undefined;
    car.verificationDeadline = undefined;



    await car.save();
    await invalidateCarCache(car._id.toString());

    // Send notification to seller
    await Notification.create({
      userId: car.seller._id,
      type: "verification_update",
      message: `Great news! Your car ${car.brand} ${car.model} has been approved and is now listed as Available on PrimeWheels.`,
    });
    await invalidateNotificationCache(car.seller._id.toString());

    // Send email to seller
    await sendEmail(
      car.seller.email,
      "Car Approved - PrimeWheels",
      `Dear ${car.seller.username},\n\nGreat news! Your car ${car.brand} ${car.model} has been successfully verified and approved. It is now listed as "Available" on our platform.\n\nGood luck with your sale!\n\nBest regards,\nPrimeWheels Team`
    );
    res.status(200).json({
      success: true,
      message: "Car approved successfully",
      carId: car._id,
    });
  } catch (err) {
    next(err);
  }
};

export const rejectCar = async (req, res, next) => {
  try {
    const carId = req.params.id;
    const agentId = req.user.id;
    const { rejectionReason } = req.body;

    const car = await Car.findById(carId).populate("seller");
    if (!car) return next(errorHandler(404, "Car not found"));

    // Allow agent to reject only cars under their verification
    if (car.status !== "verification" || car.agent.toString() !== agentId) {
      return next(
        errorHandler(400, "You can only reject cars under your verification")
      );
    }

    car.status = "rejected";
    car.rejectionReason = rejectionReason || "No specific reason provided";
    car.verificationDays = undefined;
    car.verificationDeadline = undefined;
    car.verificationStartTime = undefined;



    await car.save();
    await invalidateCarCache(car._id.toString());

    // Send notification to seller
    await Notification.create({
      userId: car.seller._id,
      type: "verification_update",
      message: `We're sorry, but your car ${car.brand} ${car.model} did not pass our verification process and has been rejected. Reason: ${car.rejectionReason}`,
    });
    await invalidateNotificationCache(car.seller._id.toString());

    // Send email to seller
    await sendEmail(
      car.seller.email,
      "Car Verification Rejected - PrimeWheels",
      `Dear ${car.seller.username},\n\nWe regret to inform you that your car ${car.brand} ${car.model} did not pass our verification process. As a result, it has been marked as "Rejected".\n\nReason for rejection: ${car.rejectionReason}\n\nPlease contact our support team if you have any questions.\n\nBest regards,\nPrimeWheels Team`
    );

    res.status(200).json({
      success: true,
      message: "Car rejected successfully",
      carId: car._id,
    });
  } catch (err) {
    next(err);
  }
};

export const checkExpiredVerifications = async () => {
  try {
    const now = new Date();
    const expiredCars = await Car.find({
      status: "verification",
      verificationDeadline: { $lt: now },
    }).populate("seller");

    for (const car of expiredCars) {
      

      car.status = "pending";
      car.agent = undefined;
      car.verificationDays = undefined;
      car.verificationDeadline = undefined;
      car.verificationStartTime = undefined;
      await car.save();
      await invalidateCarCache(car._id.toString());

      if (car.seller) {
        // Send notification to seller
        await Notification.create({
          userId: car.seller._id,
          type: "verification_update",
          message: `The verification period for your car ${car.brand} ${car.model} has expired. The status has been reset to Pending.`,
        });
        await invalidateNotificationCache(car.seller._id.toString());

        // Send email to seller
        await sendEmail(
          car.seller.email,
          "Verification Expired - PrimeWheels",
          `Dear ${car.seller.username},\n\nThe verification period for your car ${car.brand} ${car.model} has expired without a final decision. The car status has been reset to "Pending".\n\nOur agents will pick it up again shortly.\n\nBest regards,\nPrimeWheels Team`
        );
      }
    }

    return expiredCars.length;
  } catch (err) {
    console.error("Error checking expired verifications:", err);
    return 0;
  }
};
// Get detailed analysis of a specific agent (admin only)
export const getDetailedAgent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate agent ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent ID format",
      });
    }

    // Get agent details
    const agent = await User.findById(id).select("_id username email avatar role status createdAt");
    
    if (!agent || agent.role !== "agent") {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    // Get all cars handled by this agent
    const cars = await Car.find({ agent: id })
      .select("_id brand model carNumber price status rejectionReason sellerName createdAt updatedAt vehicleType seater price");

    // Categorize cars
    const approvedCars = cars.filter((car) => car.status === "available");
    const rejectedCars = cars.filter((car) => car.status === "rejected");
    const pendingCars = cars.filter((car) => car.status === "pending");
    const verificationCars = cars.filter((car) => car.status === "verification");
    const soldCars = cars.filter((car) => car.status === "sold");

    // Calculate metrics
    const totalCars = cars.length;
    const approvalRate = totalCars > 0 ? ((approvedCars.length / totalCars) * 100).toFixed(2) : 0;
    const rejectionRate = totalCars > 0 ? ((rejectedCars.length / totalCars) * 100).toFixed(2) : 0;
    const totalRevenue = soldCars.reduce((sum, car) => sum + (car.price || 0), 0);

    // Build rejection reasons array with car details
    const rejectionDetails = rejectedCars.map((car) => ({
      _id: car._id,
      carNumber: car.carNumber,
      brand: car.brand,
      model: car.model,
      reason: car.rejectionReason || "No reason specified",
      rejectedAt: car.updatedAt,
    }));

    // Build vehicle type breakdown
    const vehicleTypeBreakdown = {};
    approvedCars.forEach((car) => {
      vehicleTypeBreakdown[car.vehicleType] = (vehicleTypeBreakdown[car.vehicleType] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      agent: {
        _id: agent._id,
        username: agent.username,
        email: agent.email,
        avatar: agent.avatar,
        joinedDate: agent.createdAt,
      },
      stats: {
        totalCars,
        approvedCars: approvedCars.length,
        rejectedCars: rejectedCars.length,
        pendingCars: pendingCars.length,
        verificationCars: verificationCars.length,
        soldCars: soldCars.length,
        approvalRate: parseFloat(approvalRate),
        rejectionRate: parseFloat(rejectionRate),
        totalRevenue,
      },
      vehicleTypeBreakdown,
      carsList: {
        approved: approvedCars.map((car) => ({
          _id: car._id,
          brand: car.brand,
          model: car.model,
          carNumber: car.carNumber,
          price: car.price,
          listedAt: car.createdAt,
        })),
        rejected: rejectionDetails,
        sold: soldCars.map((car) => ({
          _id: car._id,
          brand: car.brand,
          model: car.model,
          carNumber: car.carNumber,
          price: car.price,
          soldAt: car.updatedAt,
        })),
        verification: verificationCars.map((car) => ({
          _id: car._id,
          brand: car.brand,
          model: car.model,
          carNumber: car.carNumber,
          price: car.price,
          vehicleType: car.vehicleType,
          seater: car.seater,
          verificationStartTime: car.verificationStartTime,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};
