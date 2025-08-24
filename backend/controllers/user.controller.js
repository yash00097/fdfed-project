import { errorHandler } from "../utils/error.js";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

/**
 * Update user info: username, email, password, avatar
 */
export const updateUser = async (req, res, next) => {
  // Ensure the user is updating their own account
  if (req.user.id !== req.params.id) {
    return next(errorHandler(403, "You can update only your own account!"));
  }

  try {
    // Prepare the fields to update
    const updateData = {
      username: req.body.username,
      email: req.body.email,
    };

    // Update password if provided
    if (req.body.password) {
      const salt = bcrypt.genSaltSync(10);
      updateData.password = bcrypt.hashSync(req.body.password, salt);
    }

    // Update avatar if a file is uploaded
    if (req.file) {
      updateData.avatar = req.file.path; // Cloudinary URL
    }

    // Update user in DB
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    // Exclude password from response
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

/**
 * Delete user account
 */
export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(403, "You can delete only your own account!"));
  }

  try {
    await User.findByIdAndDelete(req.params.id);

    // Clear authentication cookie
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