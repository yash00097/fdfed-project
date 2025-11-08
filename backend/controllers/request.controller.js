import Request from "../models/request.model.js";
import { errorHandler } from "../utils/error.js";

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
        if (reqDoc.buyer.toString() !== req.user.id) return next(errorHandler(403, 'Not authorized'));
        await Request.findByIdAndDelete(requestId);
        res.status(200).json({ success: true, message: 'Request deleted' });
    } catch (err) {
        next(err);
    }
};
