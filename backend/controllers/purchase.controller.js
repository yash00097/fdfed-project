import Purchase from '../models/purchase.model.js';
import Car from '../models/car.model.js';
import { errorHandler } from '../utils/error.js';
import Notification from "../models/notification.model.js";
import { sendEmail } from "../utils/emailService.js";
import User from "../models/user.model.js";
import {
  invalidateCarCache,
  invalidateNotificationCache,
  invalidateNotificationCacheForUsers,
} from "../utils/cache.js";
export const createPurchase = async (req, res, next) => {
  try {


    const {
      car,
      buyer,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      paymentMethod,
      totalPrice
    } = req.body;

    // Validate required fields
    if (!car || !buyer || !firstName || !lastName || !email || !phone || !address || !city || !state || !pincode || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate car exists
    const carExists = await Car.findById(car);
    if (!carExists) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Check if car is available
    if (carExists.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Car is not available for purchase'
      });
    }

    // Create purchase
    const purchase = await Purchase.create({
      car,
      buyer,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      paymentMethod,
      totalPrice,
      status: 'sold'
    });

    // Update car status to sold
    await Car.findByIdAndUpdate(car, { status: 'sold' });
    await invalidateCarCache(car);

    await Notification.create({
      userId: buyer,
      type: "purchase_update",
      message: `Your purchase for ${carExists.brand} ${carExists.model} has been confirmed! our agents will contact you shortly.Thank you for choosing us!`,
    });

    const agents = await User.find({ role: "agent" });

    if (agents.length > 0) {
      const fullAddress = `${address}, ${city}, ${state} - ${pincode}`;

      const agentNotifications = agents.map(agent => ({
        userId: agent._id,
        type: "purchase_update",
        message: `New purchase for ${carExists.brand} ${carExists.model} from ${firstName} ${lastName} at ${fullAddress} and phone number ${phone} has been confirmed.`,
      }));

      await Notification.insertMany(agentNotifications);
    }
    await Promise.allSettled([
      invalidateNotificationCache(buyer),
      invalidateNotificationCacheForUsers(agents.map((agent) => agent._id.toString())),
    ]);
    await sendEmail(email, "PrimeWheels-Purchase Confirmation", `Your purchase for ${carExists.brand} ${carExists.model} has been confirmed! our agents will contact you shortly.Thank you for choosing us!`);

    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create purchase'
    });
  }
};

export const getUserPurchases = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const purchases = await Purchase.find({ buyer: userId })
      .populate('car')
      .sort({ createdAt: -1 });

    res.status(200).json(purchases);
  } catch (error) {
    next(error);
  }
};

export const getPurchaseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const purchase = await Purchase.findById(id)
      .populate('car')
      .populate('buyer', 'username email');

    if (!purchase) {
      return next(errorHandler(404, 'Purchase not found'));
    }

    res.status(200).json(purchase);
  } catch (error) {
    next(error);
  }
};

export const getAllPurchases = async (req, res, next) => {
  try {
    const purchases = await Purchase.find()
      .populate('car')
      .populate('buyer', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json(purchases);
  } catch (error) {
    next(error);
  }
};

// Get purchase by car ID
export const getPurchaseByCarId = async (req, res, next) => {
  try {
    const { carId } = req.params;
    const purchase = await Purchase.findOne({ car: carId })
      .populate('car')
      .populate('buyer', 'username email phoneNumber');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found for this car'
      });
    }

    res.status(200).json({
      success: true,
      purchase
    });
  } catch (error) {
    next(error);
  }
};
