import Car from "../models/car.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";


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

    const car = await Car.findById(carId);
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

    const verificationDeadline = new Date();
    verificationDeadline.setDate(verificationDeadline.getDate() + days);

    car.agent = agentId;
    car.status = "verification";
    car.verificationDays = days;
    car.verificationDeadline = verificationDeadline;
    car.verificationStartTime = new Date();
    await car.save();

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

    const car = await Car.findById(carId);
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

    console.log(
      `[${new Date().toISOString()}] Car ${car._id} (${car.brand} ${
        car.model
      }) status changed to AVAILABLE by agent ${agentId} (${agent?.username})`
    );

    await car.save();
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

    const car = await Car.findById(carId);
    if (!car) return next(errorHandler(404, "Car not found"));

    // Allow agent to reject only cars under their verification
    if (car.status !== "verification" || car.agent.toString() !== agentId) {
      return next(
        errorHandler(400, "You can only reject cars under your verification")
      );
    }

    car.status = "rejected";
    car.verificationDays = undefined;
    car.verificationDeadline = undefined;
    car.verificationStartTime = undefined;

    console.log(
      `[${new Date().toISOString()}] Car ${car._id} (${car.brand} ${
        car.model
      }) status changed to REJECTED by agent ${agentId}`
    );

    await car.save();

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
    });

    for (const car of expiredCars) {
      console.log(
        `[${new Date().toISOString()}] Car ${car._id} (${car.brand} ${
          car.model
        }) verification period expired. Resetting to pending.`
      );

      car.status = "pending";
      car.agent = undefined;
      car.verificationDays = undefined;
      car.verificationDeadline = undefined;
      car.verificationStartTime = undefined;
      await car.save();
    }

    return expiredCars.length;
  } catch (err) {
    console.error("Error checking expired verifications:", err);
    return 0;
  }
};
