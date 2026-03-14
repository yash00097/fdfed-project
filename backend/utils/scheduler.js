import cron from 'node-cron';
import Car from '../models/car.model.js';
import TestDrive from '../models/testdrive.model.js';
import Notification from '../models/notification.model.js';

// Function to check and reset expired verifications
const resetExpiredVerifications = async () => {
  try {
    // Set verification timeout (24 hours)
    const VERIFICATION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const cutoffTime = new Date(Date.now() - VERIFICATION_TIMEOUT);

    // Find and reset expired verification cars
    const result = await Car.updateMany(
      {
        status: "verification",
        verificationStartTime: { $lt: cutoffTime }
      },
      {
        $set: {
          status: "pending",
          agent: null,
          agentName: null
        },
        $unset: {
          verificationDays: "",
          verificationDeadline: "",
          verificationStartTime: ""
        }
      }
    );

  } catch (error) {
    console.error('Error in scheduled verification reset:', error);
  }
};

// Function to expire test drives where scheduled time has passed with no action
const expireTestDrives = async () => {
  try {
    const now = new Date();

    // Find pending/accepted test drives whose scheduled time has already passed
    const overdueTestDrives = await TestDrive.find({
      status: { $in: ['pending', 'accepted'] },
      requestedDateTime: { $lt: now },
    })
      .populate('buyer', '_id username')
      .populate('car', 'brand model')
      .populate('agent', '_id');

    if (overdueTestDrives.length === 0) return;

    const ids = overdueTestDrives.map((td) => td._id);

    // Bulk update all overdue test drives to expired
    await TestDrive.updateMany(
      { _id: { $in: ids } },
      { $set: { status: 'expired', expiredAt: now } }
    );

    // Send notifications for each expired test drive
    const notifications = [];
    for (const testDrive of overdueTestDrives) {
      const dateStr = new Date(testDrive.requestedDateTime).toLocaleDateString('en-IN');

      // Notify buyer
      notifications.push({
        userId: testDrive.buyer._id,
        type: 'test_drive_expired',
        message: `Your test drive for ${testDrive.car.brand} ${testDrive.car.model} scheduled on ${dateStr} has expired as no action was taken.`,
      });

      // Notify assigned agent if any
      if (testDrive.agent) {
        notifications.push({
          userId: testDrive.agent._id,
          type: 'test_drive_expired',
          message: `The test drive for ${testDrive.car.brand} ${testDrive.car.model} by ${testDrive.buyer.username} scheduled on ${dateStr} has expired.`,
        });
      }
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    console.log(`Expired ${overdueTestDrives.length} overdue test drive(s).`);
  } catch (error) {
    console.error('Error in test drive expiry scheduler:', error);
  }
};

// Schedule to run every hour
export const startScheduler = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', resetExpiredVerifications, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  // Run every 30 minutes to expire overdue test drives
  cron.schedule('*/30 * * * *', expireTestDrives, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });
};

// Manual function for immediate execution
export { resetExpiredVerifications, expireTestDrives };
