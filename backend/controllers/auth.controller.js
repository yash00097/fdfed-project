import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const signUp = async (req, res, next) =>{
    const {username, email, password} = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User ({username, email, password: hashedPassword}); 
    
    try{
        await newUser.save();
        res.status(201).json({success: true, message: "User created successfully"});
    }
    catch{
        next(errorHandler(500, error.message || "Something went wrong"));
    }
}

export const signIn = async(req, res, next)=>{
    const {username, password} = req.body;
    try {
        const validUser = await User.findOne({username});

        if(!validUser){
            next(errorHandler(404, "User does not exist"));
        }

        const validPassword = await bcrypt.compare(password, validUser.password);

        if(!validPassword){
            next(errorHandler(400, "Invalid password"));
        }

        const token = jwt.sign({id: validUser._id}, process.env.JWT_SECRET);        //token for user authentication
        
        const {password: pass, ...rest} = validUser._doc;      //to avoid showing password in response

        res.cookie('access_token', token, {
            httpOnly: true,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }       //optional 
        ).status(200).json(rest);

    } catch (error) {
        next(errorHandler(500, error.message || "Something went wrong"));
    }
}

export const google = async(req, res, next)=>{
    try {
        let user = await User.findOne({email: req.body.email});

        if(!user){
            const generatedPassword = crypto.randomBytes(8).toString('hex');
            const hashedPassword = bcrypt.hashSync(generatedPassword, 10);

            user = new User({
                username: req.body.username.split(' ').join('').toLowerCase() + crypto.randomBytes(3).toString('hex'),
                email: req.body.email,
                password: hashedPassword,
                avatar: req.body.photo,
            });

            await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        const { password, ...rest } = user._doc;

        return res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }).status(user.isNew ? 201 : 200).json(rest);
        
    } catch (error) {
        next(errorHandler(500, error.message || "Something went wrong"));
    }
}