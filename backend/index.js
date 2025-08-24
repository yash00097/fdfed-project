import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db/connectDB.js';
import cookieParser from "cookie-parser";
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';




dotenv.config();
const app = express();
const __dirname = path.resolve();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json()); 
app.use(cookieParser());


app.use("/backend/auth", authRoutes);
app.use("/backend/user", userRoutes);

app.use('/backend', (req,res)=>{
    res.send("Hello from backend");
})


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong';
    
    // Handle MongoDB duplicate key errors
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        return res.status(400).json({
            success: false,
            statusCode: 400,
            error: message
        });
    }
    
    return res.status(statusCode).json({ 
        success: false, 
        statusCode,
        error: message 
    });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
    connectDB();
});