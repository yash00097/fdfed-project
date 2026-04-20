import mongoose from 'mongoose';
import TestDrive from '../models/testdrive.model.js';
import Car from '../models/car.model.js';
import { errorHandler } from '../utils/error.js';
import Notification from '../models/notification.model.js';
import { sendEmail } from '../utils/emailService.js';

// Request a test drive
export const requestTestDrive = async (req, res, next) => {
  try {
    const { carId, requestedDateTime, location, notes } = req.body;
    const buyerId = req.user.id;

    // Validate required fields
    if (!carId || !requestedDateTime || !location) {
      return next(errorHandler(400, 'Car ID, requested date/time, and location are required'));
    }

    // Validate car exists and is available
    const car = await Car.findById(carId);
    if (!car) {
      return next(errorHandler(404, 'Car not found'));
    }

    if (car.status !== 'available') {
      return next(errorHandler(400, 'Test drive can only be requested for available cars'));
    }

    // Check if buyer already has pending test drive for this car
    const existingRequest = await TestDrive.findOne({
      car: carId,
      buyer: buyerId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingRequest) {
      return next(errorHandler(400, 'You already have a pending or accepted test drive for this car'));
    }

    // Create test drive request
    const testDrive = new TestDrive({
      car: carId,
      buyer: buyerId,
      requestedDateTime,
      location,
      notes
    });

    await testDrive.save();

    res.status(201).json({
      success: true,
      message: 'Test drive requested successfully',
      testDrive
    });
  } catch (err) {
    next(err);
  }
};

// Get all unassigned pending test drive requests for agents
export const getPendingTestDriveRequests = async (req, res, next) => {
  try {
    const testDrives = await TestDrive.find({
      status: 'pending',
      $or: [{ agent: null }, { agent: { $exists: false } }]
    })
      .populate('car', '_id brand model carNumber photos price vehicleType')
      .populate('buyer', '_id username email mobileNumber')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      testDrives
    });
  } catch (err) {
    next(err);
  }
};

// Get user's test drive requests
export const getMyTestDrives = async (req, res, next) => {
  try {
    const buyerId = req.user.id;

    const testDrives = await TestDrive.find({ buyer: buyerId })
      .populate('car', '_id brand model carNumber photos price vehicleType')
      .populate('agent', '_id username email avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      testDrives
    });
  } catch (err) {
    next(err);
  }
};

// Get test drives assigned to the logged-in agent
export const getAgentTestDrives = async (req, res, next) => {
  try {
    const agentId = req.user.id;
    const { status } = req.query;

    const query = { agent: agentId };

    if (status) {
      query.status = status;
    }

    const testDrives = await TestDrive.find(query)
      .populate('car', '_id brand model carNumber photos price vehicleType')
      .populate('buyer', '_id username email mobileNumber')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      testDrives
    });
  } catch (err) {
    next(err);
  }
};

// Get all test drives (admin only)
export const getAllTestDrives = async (req, res, next) => {
  try {
    const { status } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const testDrives = await TestDrive.find(query)
      .populate('car', '_id brand model carNumber photos price vehicleType')
      .populate('buyer', '_id username email mobileNumber')
      .populate('agent', '_id username email avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      testDrives
    });
  } catch (err) {
    next(err);
  }
};

// Approve test drive
export const approveTestDrive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(errorHandler(400, 'Invalid test drive ID'));
    }

    if (userRole !== 'agent') {
      return next(errorHandler(403, 'Only agents can accept test drive requests'));
    }

    const testDrive = await TestDrive.findOneAndUpdate(
      {
        _id: id,
        status: 'pending',
        $or: [{ agent: null }, { agent: { $exists: false } }]
      },
      {
        $set: {
          agent: userId,
          status: 'accepted',
          acceptedAt: new Date()
        }
      },
      { new: true }
    )
      .populate('buyer')
      .populate('car')
      .populate('agent');

    if (!testDrive) {
      return next(errorHandler(400, 'This test drive was already accepted or is no longer pending'));
    }

    // Send notification to buyer
    await Notification.create({
      userId: testDrive.buyer._id,
      type: 'test_drive_accepted',
      message: `Your test drive request for ${testDrive.car.brand} ${testDrive.car.model} on ${new Date(testDrive.requestedDateTime).toLocaleDateString()} has been accepted!`,
    });

    // Send email to buyer
    await sendEmail(
      testDrive.buyer.email,
      'Test Drive Accepted - PrimeWheels',
      `Dear ${testDrive.buyer.username},\n\nYour test drive request for ${testDrive.car.brand} ${testDrive.car.model} has been accepted!\n\nDate/Time: ${new Date(testDrive.requestedDateTime).toLocaleString()}\nLocation: ${testDrive.location}\n\nPlease arrive 5 minutes early. For any questions, contact the agent.\n\nBest regards,\nPrimeWheels Team`
    );

    res.status(200).json({
      success: true,
      message: 'Test drive accepted successfully',
      testDrive
    });
  } catch (err) {
    next(err);
  }
};

// Reject test drive
export const rejectTestDrive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(errorHandler(400, 'Invalid test drive ID'));
    }

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return next(errorHandler(400, 'Rejection reason is required'));
    }

    const testDrive = await TestDrive.findById(id).populate('buyer').populate('car').populate('agent');

    if (!testDrive) {
      return next(errorHandler(404, 'Test drive request not found'));
    }

    if (testDrive.status !== 'accepted') {
      return next(errorHandler(400, 'Can only reject accepted test drive requests'));
    }

    // Check permissions: only the agent who accepted can reject
    if (userRole !== 'agent' || !testDrive.agent || testDrive.agent._id.toString() !== userId) {
      return next(errorHandler(403, 'Only the assigned agent can reject test drives'));
    }

    testDrive.status = 'rejected';
    testDrive.rejectionReason = rejectionReason;
    testDrive.rejectedAt = new Date();
    await testDrive.save();

    // Send notification to buyer
    await Notification.create({
      userId: testDrive.buyer._id,
      type: 'test_drive_rejected',
      message: `Your test drive request for ${testDrive.car.brand} ${testDrive.car.model} has been rejected. Reason: ${rejectionReason}`,
    });

    // Send email to buyer
    await sendEmail(
      testDrive.buyer.email,
      'Test Drive Request Rejected - PrimeWheels',
      `Dear ${testDrive.buyer.username},\n\nWe regret to inform you that your test drive request for ${testDrive.car.brand} ${testDrive.car.model} has been rejected.\n\nReason: ${rejectionReason}\n\nPlease feel free to request another test drive or contact us for more information.\n\nBest regards,\nPrimeWheels Team`
    );

    res.status(200).json({
      success: true,
      message: 'Test drive rejected successfully',
      testDrive
    });
  } catch (err) {
    next(err);
  }
};

// Complete test drive
export const completeTestDrive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(errorHandler(400, 'Invalid test drive ID'));
    }

    const testDrive = await TestDrive.findById(id).populate('buyer').populate('car').populate('agent');

    if (!testDrive) {
      return next(errorHandler(404, 'Test drive request not found'));
    }

    if (testDrive.status !== 'accepted') {
      return next(errorHandler(400, 'Can only complete accepted test drives'));
    }

    // Check permissions: only the agent who accepted can complete
    if (userRole !== 'agent' || !testDrive.agent || testDrive.agent._id.toString() !== userId) {
      return next(errorHandler(403, 'Only the assigned agent can complete test drives'));
    }

    testDrive.status = 'completed';
    testDrive.feedback = feedback || '';
    testDrive.completedAt = new Date();
    await testDrive.save();

    // Send notification to buyer
    await Notification.create({
      userId: testDrive.buyer._id,
      type: 'test_drive_completed',
      message: `Your test drive for ${testDrive.car.brand} ${testDrive.car.model} has been completed. Thank you for testing!`,
    });

    // Send email to buyer
    await sendEmail(
      testDrive.buyer.email,
      'Test Drive Completed - PrimeWheels',
      `Dear ${testDrive.buyer.username},\n\nThank you for completing the test drive for ${testDrive.car.brand} ${testDrive.car.model}!\n\nWe hope you enjoyed the experience. If you have any questions or would like to proceed with the purchase, please contact us.\n\nBest regards,\nPrimeWheels Team`
    );

    res.status(200).json({
      success: true,
      message: 'Test drive completed successfully',
      testDrive
    });
  } catch (err) {
    next(err);
  }
};

// Cancel test drive (by buyer)
export const cancelTestDrive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const buyerId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(errorHandler(400, 'Invalid test drive ID'));
    }

    if (!cancellationReason || cancellationReason.trim().length === 0) {
      return next(errorHandler(400, 'Cancellation reason is required'));
    }

    const testDrive = await TestDrive.findById(id).populate('buyer').populate('car').populate('agent');

    if (!testDrive) {
      return next(errorHandler(404, 'Test drive request not found'));
    }

    // Only the buyer can cancel
    if (testDrive.buyer._id.toString() !== buyerId) {
      return next(errorHandler(403, 'You can only cancel your own test drive requests'));
    }

    // Can cancel pending or accepted test drives
    if (!['pending', 'accepted'].includes(testDrive.status)) {
      return next(errorHandler(400, 'Can only cancel pending or accepted test drives'));
    }

    testDrive.status = 'cancelled';
    testDrive.cancellationReason = cancellationReason;
    testDrive.cancelledAt = new Date();
    await testDrive.save();

    if (testDrive.agent) {
      await Notification.create({
        userId: testDrive.agent._id,
        type: 'test_drive_cancelled',
        message: `Test drive request for ${testDrive.car.brand} ${testDrive.car.model} by ${testDrive.buyer.username} has been cancelled. Reason: ${cancellationReason}`,
      });

      await sendEmail(
        testDrive.agent.email,
        'Test Drive Request Cancelled - PrimeWheels',
        `Dear ${testDrive.agent.username},\n\nThe test drive request for ${testDrive.car.brand} ${testDrive.car.model} by ${testDrive.buyer.username} has been cancelled.\n\nReason: ${cancellationReason}\n\nBest regards,\nPrimeWheels Team`
      );
    }

    res.status(200).json({
      success: true,
      message: 'Test drive cancelled successfully',
      testDrive
    });
  } catch (err) {
    next(err);
  }
};
