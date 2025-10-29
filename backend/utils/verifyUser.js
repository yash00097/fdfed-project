import { errorHandler } from "./error.js";
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;

    if (!token) {
        console.log('No token provided in request');
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Please sign in.'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        // Handle token expiration specifically
        if (err) {
            if (err.name === 'TokenExpiredError') {
                // Clear expired cookie immediately
                res.clearCookie("access_token", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });
                return res.status(401).json({
                    success: false,
                    message: 'Session expired. Please sign in again.'
                });
            }
            return res.status(403).json({
                success: false,
                message: 'Invalid token. Please sign in again.'
            });
        }
        req.user = user;
        next();
    });
}

export const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return next(errorHandler(403, 'Forbidden: Admin access required'));
    }
};

export const verifyAgent = (req, res, next) => {
    if (req.user && req.user.role === 'agent') {
        next();
    } else {
        return next(errorHandler(403, 'Forbidden: Agent access required'));
    }
};