import { errorHandler } from "../utils/error.js";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

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
