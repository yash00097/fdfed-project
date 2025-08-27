import Car from "../models/car.model.js";

// Handle car selling (basic details from user)
export const sellCar = async (req, res, next) => {
  try {
    console.log("=== DEBUGGING SELL CAR REQUEST ===");
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    console.log("User from middleware:", req.user);

    const {
      brand,
      model,
      vehicleType,
      transmission,
      manufacturedYear,
      fuelType,
      seater,
      exteriorColor,
      carNumber,
      traveledKm,
      price,
      address,
      city,
      state,
      pincode,
      sellerName,
      sellerphone,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      brand,
      model,
      vehicleType,
      transmission,
      manufacturedYear,
      fuelType,
      seater,
      exteriorColor,
      carNumber,
      traveledKm,
      price,
      sellerName,
      sellerphone,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.log("Missing fields:", missingFields);
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate photos
    if (!req.files || req.files.length < 4) {
      console.log("Photo validation failed:", {
        filesExists: !!req.files,
        fileCount: req.files?.length || 0
      });
      return res.status(400).json({
        success: false,
        error: "At least 4 photos are required"
      });
    }

    // Cloudinary URLs from multer-storage-cloudinary
    const photoUrls = req.files.map((file) => file.path);
    console.log("Photo URLs:", photoUrls);

    // Prepare car data
    const carData = {
      brand: brand.trim(),
      model: model.trim(),
      vehicleType,
      transmission,
      manufacturedYear: parseInt(manufacturedYear),
      fuelType,
      seater: parseInt(seater),
      exteriorColor: exteriorColor.trim(),
      carNumber: carNumber.trim().toUpperCase(),
      traveledKm: parseInt(traveledKm),
      price: parseInt(price),
      address: address?.trim() || undefined,
      city: city?.trim() || undefined,
      state: state?.trim() || undefined,
      pincode: pincode?.trim() || undefined,
      photos: photoUrls,
      sellerName: sellerName.trim(),
      sellerphone: sellerphone.trim(),
      seller: req.user?._id || null,
      status: "pending",
    };

    console.log("Final car data:", carData);

    // Create and save car
    const car = new Car(carData);
    
    // Validate before saving
    const validationError = car.validateSync();
    if (validationError) {
      console.log("Validation error:", validationError);
      const errors = Object.values(validationError.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: "Validation failed: " + errors.join(', ')
      });
    }

    console.log("Attempting to save car...");
    await car.save();
    console.log("Car saved successfully:", car._id);

    res.status(201).json({
      success: true,
      message: "Car sell request submitted successfully",
      car: {
        id: car._id,
        brand: car.brand,
        model: car.model,
        status: car.status,
        carNumber: car.carNumber
      },
    });
  } catch (err) {
    console.error("=== ERROR IN SELL CAR ===");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.error("Error details:", err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: "Validation failed: " + errors.join(', ')
      });
    }

    // Handle duplicate key errors (unique fields)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `${field} already exists. Please use a different value.`
      });
    }

    // Handle cast errors
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: `Invalid value for field: ${err.path}`
      });
    }

    // Generic error
    res.status(500).json({
      success: false,
      error: "Internal server error: " + err.message
    });
  }
};