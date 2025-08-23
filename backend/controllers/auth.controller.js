import  User  from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import { errorHandler } from "../utils/error.js";
import jwt from 'jsonwebtoken';

export const signup = async (req, res, next) => {

    const { username, email, password } = req.body;
    const hashedPassword =  bcrypt.hashSync(password, 10);
    const newUser = new User({
        username,
        email,
        password: hashedPassword
    });

    try{
        await newUser.save();
        res.status(201).json({
        message: "User created successfully",
        user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email
        }
    });
    }catch (error) {
        next(error);
    }

};

export const signin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const validUser = await User.findOne({ email });
        if (!validUser) {
            return next(errorHandler(404, "User not found"));
        }
        const validPassword = bcrypt.compareSync(password, validUser.password);
        if (!validPassword) {
            return next(errorHandler(401, "Invalid credentials"));
        }
        const token = jwt.sign(
            { id: validUser._id , role: validUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );
        const { password: pass , ...userWithoutPassword } = validUser._doc;
        res
          .cookie('access_token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict' 
          })
          .status(200)
          .json(userWithoutPassword);

    } catch (error) {
        next(error);
    }
}

export const googleAuth = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (user) {
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET,{ expiresIn: "24h" });
      const { password: pass, ...rest } = user._doc;
      res
        .cookie('access_token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' })
        .status(200)
        .json(rest);
        
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcrypt.hashSync(generatedPassword, 10);
      const newUser = new User({ username: req.body.name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4) , email: req.body.email, password: hashedPassword, avatar: req.body.photo });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET,{ expiresIn: "24h" });
      const { password: pass, ...rest } = newUser._doc;
      res.cookie('access_token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' }).status(200).json(rest);
      
    }
  } catch (error) {
    next(error)
  }
}

export const signout = (req, res,next) => {
    try {
        res.clearCookie("access_token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    res.status(200).json("User has been signed out successfully!");
    } catch (error) {
        next(error);
    }
}