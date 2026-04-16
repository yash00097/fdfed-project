import mongoose from "mongoose";
import Car from "../models/car.model.js";

export const listAvailableCars = async (req, res, next) => {
  try {
    const query = { status: "available" };
    const {
      brand,
      model,
      vehicleType,
      transmission,
      fuelType,
      seater,
      exteriorColor,
      manufacturedYear,
      traveledKm,
      price,
      priceRange,
    } = req.query;

    if (brand) query.brand = { $regex: new RegExp(`^${brand}`, "i") };
    if (model) query.model = { $regex: new RegExp(`^${model}`, "i") };
    if (vehicleType) query.vehicleType = vehicleType;
    if (transmission) query.transmission = transmission;
    if (fuelType) query.fuelType = fuelType;
    if (seater) query.seater = Number(seater);
    if (exteriorColor) {
      query.exteriorColor = { $regex: new RegExp(`^${exteriorColor}$`, "i") };
    }
    if (manufacturedYear) query.manufacturedYear = { $gte: Number(manufacturedYear) };
    if (traveledKm) query.traveledKm = { $lte: Number(traveledKm) };
    if (price) query.price = { $lte: Number(price) };

    if (priceRange) {
      if (priceRange.includes("-")) {
        const [minPrice, maxPrice] = priceRange.split("-").map(Number);
        query.price = { $gte: minPrice, $lte: maxPrice };
      } else {
        query.price = { $gte: Number(priceRange) };
      }
    }

    const cars = await Car.find(query)
      .select(
        "brand model price photos carNumber manufacturedYear vehicleType transmission seater exteriorColor fuelType traveledKm sellerName sellerphone"
      )
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, cars });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    next(error);
  }
};

export const getTopBrands = async (req, res, next) => {
  try {
    const months = Math.max(parseInt(req.query.months || "12", 10) || 12, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "9", 10) || 9, 1), 50);

    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - (months - 1));
    fromDate.setDate(1);
    fromDate.setHours(0, 0, 0, 0);

    const brands = await Car.aggregate([
      {
        $match: {
          status: "sold",
          updatedAt: { $gte: fromDate },
        },
      },
      {
        $group: {
          _id: "$brand",
          soldCount: { $sum: 1 },
        },
      },
      { $sort: { soldCount: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          brand: { $ifNull: ["$_id", "Unknown"] },
          soldCount: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, brands, windowMonths: months, fromDate });
  } catch (error) {
    console.error("Error fetching top brands:", error);
    next(error);
  }
};

export const getCarById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID",
      });
    }

    const car = await Car.findById(id).lean();

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    const transformedCar = {
      ...car,
      year: car.manufacturedYear,
      mileage: car.traveledKm,
      bodyType: car.vehicleType,
      color: car.exteriorColor,
      seatingCapacity: car.seater,
      images: car.photos,
    };

    res.status(200).json({ success: true, car: transformedCar });
  } catch (error) {
    console.error("Error fetching car:", error);
    next(error);
  }
};
