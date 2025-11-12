import { errorHandler } from "../utils/error.js";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import mongoose from 'mongoose';
import Car from '../models/car.model.js';
import Purchase from '../models/purchase.model.js';
import Request from '../models/request.model.js';

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(403, "You can update only your own account!"));
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(errorHandler(404, "User not found"));

    const updateData = {
      username: req.body.username,
      email: req.body.email,
    };

    const currentPassword = req.body.currentPassword || req.body.oldPassword;
    const newPassword = req.body.newPassword || req.body.password;

    if (currentPassword && !newPassword) {
      return next(errorHandler(400, "New password is required"));
    }
    if (newPassword && !currentPassword) {
      return next(errorHandler(400, "Current password is required"));
    }

    if (newPassword && currentPassword) {
      const validPassword = bcrypt.compareSync(currentPassword, user.password);
      if (!validPassword) {
        return next(errorHandler(400, "Current password is incorrect"));
      }

      const salt = bcrypt.genSaltSync(10);
      updateData.password = bcrypt.hashSync(newPassword, salt);
    }

    if (req.file) {
      updateData.avatar = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    const { password, ...others } = updatedUser._doc;

    res.status(200).json({
      success: true,
      message: "User updated successfully!",
      user: others,
    });
  } catch (error) {
    next(error);
  }
};

// Get analytics/stats for the logged-in normal user
export const getUserAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Count cars listed by this user (any status)
    const sellsCount = await Car.countDocuments({ seller: userId });

    // Count purchases where this user is the buyer and purchase status is sold
    const purchasesCount = await Purchase.countDocuments({ buyer: userId, status: 'sold' });

    // Count requests made by this user
    const requestsCount = await Request.countDocuments({ buyer: userId });

    // Get all cars with full details including agent information
    const cars = await Car.aggregate([
      { 
        $match: { 
          seller: new mongoose.Types.ObjectId(userId) 
        }
      },
      {
        $lookup: {
          from: 'users',  // Changed from 'agents' to 'users' since agents are users
          localField: 'agent',
          foreignField: '_id',
          as: 'agentDetails'
        }
      },
      {
        $addFields: {
          agentName: { $ifNull: [{ $arrayElemAt: ['$agentDetails.username', 0] }, null] },
          carId: '$_id',
          status: {
            $switch: {
              branches: [
                { case: { $eq: ['$status', 'pending'] }, then: 'pending' },
                { case: { $eq: ['$status', 'verification'] }, then: 'verification' },
                { case: { $eq: ['$status', 'available'] }, then: 'available' },
                { case: { $eq: ['$status', 'sold'] }, then: 'sold' },
                { case: { $eq: ['$status', 'rejected'] }, then: 'rejected' }
              ],
              default: 'pending'
            }
          }
        }
      }
    ]);

    // Organize cars by their ID for easy frontend access
    const sellsByStatus = {};
    cars.forEach(car => {
      sellsByStatus[car.carId.toString()] = {
        ...car,
        createdAt: car.createdAt?.toISOString(),
        updatedAt: car.updatedAt?.toISOString(),
        verificationStartTime: car.verificationStartTime?.toISOString()
      }
    });

    res.status(200).json({
      success: true,
      sellsCount,
      purchasesCount,
      requestsCount,
      sellsByStatus
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(403, "You can delete only your own account!"));
  }

  try {
    await User.findByIdAndDelete(req.params.id);

    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "User has been deleted successfully!",
    });
  } catch (error) {
    next(error);
  }
};
