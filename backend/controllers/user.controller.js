import {errorHandler} from "../utils/error.js";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";


export const updateUser = async (req, res, next) => {
    if (req.user.id !== req.params.id) {
        return next(errorHandler(401, 'You can only update your own account!'));
    }
    
    try {
        const updateData = { ...req.body };
        
        if (updateData.password) {
            updateData.password = bcrypt.hashSync(updateData.password, 10);
        }


        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    username: updateData.username,
                    email: updateData.email,
                    password: updateData.password,
                    avatar: updateData.avatar
                }
            },
            { new: true }
        );

        const { password, ...others } = updatedUser._doc;
        res.status(200).json(others);
    } catch (err) {
        next(err);
    }
};

export const deleteUser = async (req, res, next) => {
    if(req.user.id !== req.params.id){
        return next(errorHandler(res, 401, 'you can only delete your own account!'));
    }
    try {
        await User.findByIdAndDelete(req.params.id);
        res.clearCookie("access_token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        res.status(200).json('User has been deleted successfully!');
        
    } catch (error) {
        next(error);
    }
}
