import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db/connectDB.js';
import cookieParser from "cookie-parser";
import path from 'path';

dotenv.config();
const app = express();
const __dirname = path.resolve();

app.use(express.json()); 
app.use(cookieParser());

app.use("/api", (req, res) => {
    res.send("API is running...");
});

//production
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
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