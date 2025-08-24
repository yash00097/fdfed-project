import { errorHandler } from "./error.js";
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;

    if (!token) return next(errorHandler(401, 'No token provided'));

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
                return next(errorHandler(401, 'Session expired'));
            }
            return next(errorHandler(403, 'Forbidden'));
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