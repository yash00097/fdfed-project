import Car from "../models/car.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { errorHandler } from "../utils/error.js";


// Handle car selling (basic details from user)
export const sellCar = async (req, res, next) => {
  try {

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
    };

    // Create and save car
    const car = new Car(carData);
    await car.save();

    // For seller
    await Notification.create({
      userId: seller,
      type: "review_request",
      message: `mr. ${sellerName} thanks for listing your ${brand} ${model}! One of our trusted agent will soon review and call you with the verification schedule,stay tuned!`,
    });

    // For all agents
    const agents = await User.find({ role: "agent" });

    if (agents.length > 0) {
      const fullAddress = `${address}, ${city}, ${state} - ${pincode}`;

      const agentNotifications = agents.map(agent => ({
        userId: agent._id,
        type: "review_request",
        message: `New car ${brand} ${model} listed from ${sellerName} (Phone: ${sellerphone}) at ${fullAddress}. Please verify the car: ${brand} ${model} (${carNumber}).`
      }));

      await Notification.insertMany(agentNotifications);
    }

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
