import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db/connectDB.js';
import cookieParser from "cookie-parser";


dotenv.config();
const app = express();
app.use(express.json()); 
app.use(cookieParser());

app.use("/api", (req, res) => {
    res.send("API is running...");
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong';
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