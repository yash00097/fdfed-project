import Purchase from '../models/purchase.model.js';
import Car from '../models/car.model.js';
import { errorHandler } from '../utils/error.js';
import Notification from "../models/notification.model.js";
import { sendEmail } from "../utils/emailService.js";
import User from "../models/user.model.js";
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
      console.error('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate car exists
    const carExists = await Car.findById(car);
    if (!carExists) {
      console.error('Car not found:', car);
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Check if car is available
    if (carExists.status !== 'available') {
      console.error('Car not available:', carExists.status);
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
    await sendEmail(email, "PrimeWheels-Purchase Confirmation", `Your purchase for ${carExists.brand} ${carExists.model} has been confirmed! our agents will contact you shortly.Thank you for choosing us!`);

    res.status(201).json(purchase);
  } catch (error) {
    console.error('Error creating purchase:', error);
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

export const updatePurchaseStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const purchase = await Purchase.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('car');

    if (!purchase) {
      return next(errorHandler(404, 'Purchase not found'));
    }

    // If purchase is cancelled, make car available again
    if (status === 'cancelled') {
      await Car.findByIdAndUpdate(purchase.car._id, { status: 'available' });
    }

    // If purchase is sold, keep car as sold
    if (status === 'sold') {
      await Car.findByIdAndUpdate(purchase.car._id, { status: 'sold' });
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
