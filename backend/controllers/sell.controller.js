import Car from "../models/car.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { errorHandler } from "../utils/error.js";
import { sendEmail } from "../utils/emailService.js";
import {
  invalidateCarCache,
  invalidateNotificationCache,
  invalidateNotificationCacheForUsers,
  invalidateUserAnalyticsCache,
} from "../utils/cache.js";

const isPdfUrl = (value) =>
  typeof value === "string" &&
  value.startsWith("http") &&
  value.toLowerCase().includes("/raw/upload/") &&
  value.toLowerCase().includes(".pdf");

const arePdfUrls = (values) =>
  Array.isArray(values) && values.length > 0 && values.every(isPdfUrl);

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
      description,
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

    if (!description || !description.trim()) {
      return next(errorHandler(400, "Car description is required."));
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
      !isPdfUrl(documentUploads.rcFront) ||
      !isPdfUrl(documentUploads.rcBack) ||
      !isPdfUrl(documentUploads.insuranceCopy) ||
      !isPdfUrl(documentUploads.pucCertificate) ||
      !arePdfUrls(documentUploads.serviceLogs) ||
      !isPdfUrl(documentUploads.nocDocument)
    ) {
      return next(
        errorHandler(400, "Please upload all required documents as PDF files.")
      );
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
          description: item.description?.trim() || "",
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
      description: description.trim(),
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

    await Promise.allSettled([
      invalidateCarCache(car._id.toString()),
      invalidateUserAnalyticsCache(seller),
      invalidateNotificationCache(seller),
      invalidateNotificationCacheForUsers(agents.map((agent) => agent._id.toString())),
    ]);

    const sellerData = await User.findById(seller).select("email");

    // Email notification is best-effort; listing should not fail if email is unavailable.
    if (!sellerData || !sellerData.email) {
      console.warn(`[sellCar] Seller email not found for user ${seller}`);
    } else {
      try {
        await sendEmail(
          sellerData.email,
          "PrimeWheels - Car Sell Request",
          `mr. ${sellerName} thanks for listing your ${brand} ${model}! One of our trusted agent will soon review and call you with the verification schedule,stay tuned!`
        );
      } catch (emailError) {
        console.error("[sellCar] Failed to send seller confirmation email:", emailError?.message || emailError);
      }
    }

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
