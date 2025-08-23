import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String, 
            required: [true, 'Email is required'], 
            unique: true, 
            lowercase: true, 
            match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, 'Please provide a valid email address'] 
        },
        password: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUGrIHB1yibmpfI1LGnHvYrBr4C0oHhMcyLg&s",
        },
        role: { 
            type: String, 
            enum: ['host', 'agent', 'normalUser'], 
            default: 'normalUser' 
        },
        mobileNumber:{
            type: String,
            sparse: true,
            match:[/^\d{10}$/, "Mobile number must be exactly 10 digits"]
        }
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;