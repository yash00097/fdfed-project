import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db/connectDB.js';
import cookieParser from "cookie-parser";
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import helmet from "helmet";
import morgan from "morgan";
import * as rfs from "rotating-file-stream";
import { fileURLToPath } from "url";
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import sellRoutes from './routes/sell.route.js';
import agentRoutes from './routes/agent.route.js';
import inventoryRoutes from './routes/inventory.route.js';
import requestRoutes from './routes/request.route.js';
import uploadRoutes from './routes/upload.route.js';
import adminRoutes from './routes/admin.route.js';
import notificationRoutes from './routes/notification.route.js';
import purchaseRoutes from './routes/purchase.route.js';
import reviewRoutes from './routes/review.route.js';

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Create rotating log file stream (rotates daily, keeps 7 days)
const logStream = rfs.createStream("requests.log", {
    interval: "1d",        // Rotate daily
    path: logDir,          // Log directory
    maxFiles: 7            // Keep only 7 days of logs
});

// File logger
app.use(
    morgan(
        ":date[iso] :method :url :status :res[content-length] - :response-time ms",
        { stream: logStream }
    )
);

// Console logger (for development)
app.use(morgan("dev"));

app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use(helmet())
app.use("/backend/auth", authRoutes);
app.use("/backend/user", userRoutes);
app.use("/backend/sell-car", sellRoutes);
app.use("/backend/agent", agentRoutes);
app.use("/backend/cars", inventoryRoutes);
app.use("/backend/request-car", requestRoutes);
app.use("/backend/upload", uploadRoutes);
app.use("/backend/admin", adminRoutes);
app.use("/backend/notification", notificationRoutes);
app.use("/backend/request", requestRoutes);
app.use("/backend/purchase", purchaseRoutes);
app.use("/backend/reviews", reviewRoutes);


app.use('/backend', (req, res) => {
    res.json({ message: "Hello from backend" });
});

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
