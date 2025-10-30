import Car from "../models/car.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

// Get stats for cars handled by this agent (approved/rejected/sold)
export const getAgentStats = async (req, res, next) => {
  try {
    const agentId = req.user.id;
    
    // Get all cars assigned to this agent
    const cars = await Car.find({ 
      agent: agentId,
      // Include all statuses except pending since we want to show historical data
      status: { $in: ["available", "rejected", "sold"] }
    }).select("status");

    // Count by status
    const stats = {
      available: 0,
      rejected: 0,
      sold: 0
    };

    cars.forEach(car => {
      if (stats[car.status] !== undefined) {
        stats[car.status]++;
      }
    });

    res.status(200).json({ 
      success: true, 
      stats,
      // Include total for convenience
      total: cars.length
    });
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


