import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            trim: true,
            minlength: [3, 'Username must be at least 3 characters long'],
            maxlength: [30, 'Username cannot exceed 30 characters']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
            match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, 'Please provide a valid email address']
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters long']
        },
        avatar: {
            type: String,
            default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUGrIHB1yibmpfI1LGnHvYrBr4C0oHhMcyLg&s",
        },
        role: {
            type: String,
            enum: ['admin', 'agent', 'normalUser'],
            default: 'normalUser'
        },
        mobileNumber:{
            type: String,
            sparse: true,
            match:[/^\d{10}$/, "Mobile number must be exactly 10 digits"]
        },
        otp: {
            type: String,
            match:[/^\d{6}$/, "OTP must be exactly 6 digits"]
        },
        otpExpires: {
            type: Date,
        }
    },
    { timestamps: true }
);


// Create indexes to ensure uniqueness
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
export default User;
