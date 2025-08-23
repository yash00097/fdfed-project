import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db/connectDB.js';
import cookieParser from "cookie-parser";
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.route.js';




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

app.use('/backend', (req,res)=>{
    res.send("Hello from backend");
})


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