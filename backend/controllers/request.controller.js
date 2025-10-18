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
