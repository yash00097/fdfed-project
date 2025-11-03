import cron from 'node-cron';
import Car from '../models/car.model.js';

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

    if (result.modifiedCount > 0) {
      console.log(`[${new Date().toISOString()}] Automatically reset ${result.modifiedCount} expired verification cars back to pending`);
    }
  } catch (error) {
    console.error('Error in scheduled verification reset:', error);
  }
};

// Schedule to run every hour
export const startScheduler = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', resetExpiredVerifications, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Adjust to your timezone
  });

  console.log('Verification expiry scheduler started - runs every hour');
};

// Manual function for immediate execution
export { resetExpiredVerifications };
