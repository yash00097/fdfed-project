import Car from "../models/car.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

// Handle car selling (basic details from user)
export const sellCar = async (req, res, next) => {
  try {
    console.log("=== DEBUGGING SELL CAR REQUEST ===");
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    console.log("User from middleware:", req.user);

    const {
      brand,
      model,
      vehicleType,
      transmission,
      manufacturedYear,
      fuelType,
      seater,
      exteriorColor,
      carNumber,
      traveledKm,
      price,
      address,
      city,
      state,
      pincode,
      sellerName,
      sellerphone,
    } = req.body;

    // Validate photos
    if (!req.files || req.files.length < 4) {
      return next(errorHandler(400, "Please upload at least 4 photos."));
    }

    // Cloudinary URLs from multer-storage-cloudinary
    const photoUrls = req.files.map((file) => file.path);

    //assign agent
    const agentEmails = process.env.AGENT_EMAILS ? process.env.AGENT_EMAILS.split(',') : [];
    const agents = await User.find({ 
        email: { $in: agentEmails },
        role: 'agent' 
    }).sort({ createdAt: 1 }); 
    if (agents.length === 0) {
        return next(errorHandler(404, "No agents found for car selling"));
    }
    const agentWorkloads = await Car.aggregate([
          { $match: { status: 'pending' } },
          { $group: { _id: "$agent", count: { $sum: 1 } } }
    ]);
    let leastBusyAgent = agents[0];
    let minWorkload = Infinity;
    agents.forEach(agent => {
      const match = agentWorkloads.find(w => w._id && w._id.equals(agent._id));
      const workload = match ? match.count : 0;
      if (workload < minWorkload) {
        minWorkload = workload;
        leastBusyAgent = agent;
      }
    });
    if(!req.user){
      return next(errorHandler(404, "You must be logged in to sell a car"));
    }
    const seller = req.user.id;

    // Prepare car data
    const carData = {
      brand: brand.trim(),
      model: model.trim(),
      vehicleType,
      transmission,
      manufacturedYear: parseInt(manufacturedYear),
      fuelType,
      seater: parseInt(seater),
      exteriorColor: exteriorColor.trim(),
      carNumber: carNumber.trim().toUpperCase(),
      traveledKm: parseInt(traveledKm),
      price: parseInt(price),
      address: address?.trim() || undefined,
      city: city?.trim() || undefined,
      state: state?.trim() || undefined,
      pincode: pincode?.trim() || undefined,
      photos: photoUrls,
      sellerName: sellerName.trim(),
      sellerphone: sellerphone.trim(),
      seller: seller,
      status: "pending",
      agent: leastBusyAgent._id
    };


    // Create and save car
    const car = new Car(carData);

    await car.save();

    res.status(201).json({
      success: true,
      message: "Car sell request submitted successfully",
      car: {
        id: car._id,
        brand: car.brand,
        model: car.model,
        status: car.status,
        carNumber: car.carNumber
      },
    });
  } catch (err) {
    next(err);
  }
};