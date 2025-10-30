import Car from "../models/car.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

// List cars assigned to this agent with pending status
export const listAssignedCars = async (req, res, next) => {
  try {
    const agentId = req.user.id;
    const { status } = req.query; // optional filter

    const query = { agent: agentId };
    if (status) query.status = status; // dynamically filter if provided

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


// ✅ Accept car for verification
export const acceptCarForVerification = async (req, res, next) => {
  try {
    const carId = req.params.id;
    const agentId = req.user.id;

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    // Only allow accepting if status is pending
    if (car.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This car has already been processed.",
      });
    }

    // Assign the agent and mark as under verification
    car.agent = agentId;
    car.status = "verification";
    await car.save();

    res.status(200).json({
      success: true,
      message: "Car accepted for verification.",
      car,
    });
  } catch (err) {
    next(err);
  }
};

// Get all cars under verification for this agent
export const listCarsForVerification = async (req, res, next) => {
  try {
    const agentId = req.user.id;
    const cars = await Car.find({ agent: agentId, status: "verification" })
      .select(
        "brand model carNumber photos price sellerName sellerphone createdAt vehicleType transmission manufacturedYear fuelType seater exteriorColor traveledKm address city state pincode"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, cars });
  } catch (err) {
    next(err);
  }
};

// Approve car → move to available
export const approveCar = async (req, res, next) => {
  try {
    const carId = req.params.id;
    const agentId = req.user.id;

    const car = await Car.findById(carId);
    if (!car) return next(errorHandler(404, "Car not found"));
    if (!car.agent || car.agent.toString() !== agentId) {
      return next(errorHandler(403, "Forbidden: Car not assigned to this agent"));
    }
    if (car.status !== "verification") {
      return next(errorHandler(400, "Only cars under verification can be approved"));
    }

    const { engine, torque, power, groundClearance, topSpeed, fuelTank, driveType } = req.body || {};

    if (engine !== undefined) car.engine = Number(engine);
    if (torque !== undefined) car.torque = Number(torque);
    if (power !== undefined) car.power = Number(power);
    if (groundClearance !== undefined) car.groundClearance = Number(groundClearance);
    if (topSpeed !== undefined) car.topSpeed = Number(topSpeed);
    if (fuelTank !== undefined) car.fuelTank = Number(fuelTank);
    if (driveType !== undefined) car.driveType = driveType;

    const agent = await User.findById(agentId).select("username");
    car.agentName = agent ? agent.username : undefined;
    car.status = "available";

    await car.save();
    res.status(200).json({ success: true, message: "Car approved successfully", carId: car._id });
  } catch (err) {
    next(err);
  }
};

// Reject car
export const rejectCar = async (req, res, next) => {
  try {
    const carId = req.params.id;
    const agentId = req.user.id;

    const car = await Car.findById(carId);
    if (!car) return next(errorHandler(404, "Car not found"));
    if (!car.agent || car.agent.toString() !== agentId) {
      return next(errorHandler(403, "Forbidden: Car not assigned to this agent"));
    }
    if (car.status !== "verification") {
      return next(errorHandler(400, "Only cars under verification can be rejected"));
    }

    car.status = "rejected";
    await car.save();

    res.status(200).json({ success: true, message: "Car rejected successfully", carId: car._id });
  } catch (err) {
    next(err);
  }
};