import Request from "../models/request.model.js";
import { errorHandler } from "../utils/error.js";
import Car from "../models/car.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { sendEmail } from "../utils/emailService.js";


export const requestCar = async (req, res, next) => {
    try {
        const { brand, model, vehicleType, transmission, fuelType } = req.body;

        const manufacturedYearRange = req.body.manufacturedYearRange || {};
        const minYear = parseInt(manufacturedYearRange.minYear, 10);
        const maxYear = parseInt(manufacturedYearRange.maxYear, 10);

        if (isNaN(minYear) || isNaN(maxYear) || minYear > maxYear) {
            return next(errorHandler(400, "Invalid manufactured year range"));
        }

        const newRequest = new Request({
            buyer: req.user.id,
            brand,
            model,
            vehicleType,
            transmission,
            manufacturedYearRange: {
                minYear: Math.max(1900, minYear),
                maxYear: Math.min(new Date().getFullYear(), maxYear)
            },
            fuelType,
        });

        await newRequest.save();

        const matchingCars = await Car.find({
            status: "available",
            brand: newRequest.brand,
            model: newRequest.model,
            vehicleType: newRequest.vehicleType,
            transmission: newRequest.transmission,
            fuelType: newRequest.fuelType,
            manufacturedYear: {
                $gte: newRequest.manufacturedYearRange.minYear,
                $lte: newRequest.manufacturedYearRange.maxYear
            },
            });

        const initialNotification = new Notification({
            userId: req.user.id,
            type: "review_request",
            message: `We received your request for ${newRequest.brand} ${newRequest.model}. Our team will review it and notify you when a matching car is available.`,
        });

        await initialNotification.save();

        if (matchingCars.length > 0) {
        for (const car of matchingCars) {
            const notification = new Notification({
            userId: req.user.id,
            type: "car_match",
            message: `We found a matching car: ${car.brand} ${car.model}.
            You can view and buy it here: /buyCar/${car._id}`,
            });
            await notification.save();
        }
        }

        const buyerData = await User.findById(req.user._id).select("email");
        if (buyerData && buyerData.email) {
            if (matchingCars.length > 0) {
                const car = matchingCars[0];
                await sendEmail(
                buyerData.email,
                "Car Match Found!",
                `We found a ${car.brand} ${car.model} matching your request.
                You can view it here: https://PrimeWheels.com/buyCar/${car._id}`
                );
            }
        }



        // ADD THIS RESPONSE - THIS WAS MISSING!
        res.status(201).json({
            success: true,
            message: "Car request submitted successfully",
            request: newRequest
        });

    } catch (error) {
        next(error);
    }
}

export const getUserRequests = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const requests = await Request.find({ buyer: userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, requests });
    } catch (err) {
        next(err);
    }
};

export const deleteUserRequest = async (req, res, next) => {
    try {
        const requestId = req.params.id;
        const reqDoc = await Request.findById(requestId);
        if (!reqDoc) return next(errorHandler(404, 'Request not found'));

        // Allow deletion if owner or admin (req.user.role may be present on token)
        if (reqDoc.buyer.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(errorHandler(403, 'Not authorized'));
        }

        await Request.findByIdAndDelete(requestId);
        res.status(200).json({ success: true, message: 'Request deleted' });
    } catch (err) {
        next(err);
    }
};

export const getAllRequests = async (req, res, next) => {
    try {
        // Admin-only route (route should already be protected by verifyAdmin)
        const requests = await Request.find().populate('buyer', 'username email avatar').sort({ createdAt: -1 });
        res.status(200).json({ success: true, requests });
    } catch (err) {
        next(err);
    }
};
