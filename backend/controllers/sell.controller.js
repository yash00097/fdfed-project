import Car from "../models/car.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { errorHandler } from "../utils/error.js";
import { sendEmail } from "../utils/emailService.js";


// Handle car selling (basic details from user)
export const sellCar = async (req, res, next) => {
  try {
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
      accidentHistory,
      ownershipHistory,
      insuranceDetails,
      documentUploads,
    } = req.body;

    // Get photos from request body (now they're Cloudinary URLs)
    const { photos } = req.body;

    // Validate photos
    if (!photos || !Array.isArray(photos) || photos.length < 4) {
      return next(errorHandler(400, "Please upload at least 4 photos."));
    }


    if (!Array.isArray(ownershipHistory) || ownershipHistory.length === 0) {
      return next(errorHandler(400, "Please add at least one ownership history record."));
    }

    if (
      !insuranceDetails ||
      !insuranceDetails.policyType ||
      !insuranceDetails.providerName ||
      !insuranceDetails.expiryDate ||
      insuranceDetails.ncbPercentage === undefined ||
      insuranceDetails.ncbPercentage === null
    ) {
      return next(errorHandler(400, "Please provide complete insurance details."));
    }

    if (
      !documentUploads ||
      !documentUploads.rcFront ||
      !documentUploads.rcBack ||
      !documentUploads.insuranceCopy ||
      !documentUploads.pucCertificate ||
      !Array.isArray(documentUploads.serviceLogs) ||
      documentUploads.serviceLogs.length === 0 ||
      !documentUploads.nocDocument
    ) {
      return next(errorHandler(400, "Please upload all required documents."));
    }

    // Photos are already Cloudinary URLs from frontend
    const photoUrls = photos;

    const normalizedAccidentHistory = Array.isArray(accidentHistory)
    ? accidentHistory.map((item) => ({
        incidentType: item.incidentType,
        accidentDate: new Date(item.accidentDate),
        repairStatus: item.repairStatus,
        airbagsDeployed: Boolean(item.airbagsDeployed),
        insuranceClaimed: Boolean(item.insuranceClaimed),
      }))
    : [];

    const normalizedOwnershipHistory = ownershipHistory.map((item) => ({
      ownerSequence: Number(item.ownerSequence),
      usageCategory: item.usageCategory,
      registrationCity: item.registrationCity?.trim(),
      ownershipDuration: item.ownershipDuration?.trim(),
    }));

    const normalizedInsuranceDetails = {
      policyType: insuranceDetails.policyType,
      providerName: insuranceDetails.providerName?.trim(),
      expiryDate: new Date(insuranceDetails.expiryDate),
      ncbPercentage: Number(insuranceDetails.ncbPercentage),
    };

    const normalizedDocumentUploads = {
      rcFront: documentUploads.rcFront,
      rcBack: documentUploads.rcBack,
      insuranceCopy: documentUploads.insuranceCopy,
      pucCertificate: documentUploads.pucCertificate,
      serviceLogs: documentUploads.serviceLogs,
      nocDocument: documentUploads.nocDocument,
    };

    if(!req.user){
      return next(errorHandler(404, "You must be logged in to sell a car"));
    }
    const seller = req.user.id;

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
      accidentHistory: normalizedAccidentHistory,
      ownershipHistory: normalizedOwnershipHistory,
      insuranceDetails: normalizedInsuranceDetails,
      documentUploads: normalizedDocumentUploads,
      sellerName: sellerName.trim(),
      sellerphone: sellerphone.trim(),
      seller: seller,
      status: "pending",
    };

    // Create and save car
    const car = new Car(carData);
    await car.save();

    // For seller
    await Notification.create({
      userId: seller,
      type: "verification_request",
      message: `mr. ${sellerName} thanks for listing your ${brand} ${model}! One of our trusted agent will soon review and call you with the verification schedule,stay tuned!`,
    });

    // For all agents
    const agents = await User.find({ role: "agent" });

    if (agents.length > 0) {
      const fullAddress = `${address}, ${city}, ${state} - ${pincode}`;

      const agentNotifications = agents.map(agent => ({
        userId: agent._id,
        type: "verification_request",
        message: `New car ${brand} ${model} listed from ${sellerName} (Phone: ${sellerphone}) at ${fullAddress}. Please verify the car: ${brand} ${model} (${carNumber}).`
      }));

      await Notification.insertMany(agentNotifications);
    }

    const sellerData = await User.findById(seller).select("email");

    if (!sellerData || !sellerData.email) {
      throw new Error("Seller email not found");
    }

    await sendEmail(
      sellerData.email,
      "PrimeWheels - Car Sell Request",
      `mr. ${sellerName} thanks for listing your ${brand} ${model}! One of our trusted agent will soon review and call you with the verification schedule,stay tuned!`
    );

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
    next(err);
  }
};
