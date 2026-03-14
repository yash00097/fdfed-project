import mongoose from 'mongoose';

const testDriveSchema = new mongoose.Schema(
  {
    // References
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
      index: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    // Test Drive Details
    requestedDateTime: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // Status and Tracking
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled', 'expired'],
      default: 'pending',
      index: true,
    },

    // Rejection and Cancellation
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Completion Feedback
    feedback: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // Action tracking
    acceptedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    expiredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model('TestDrive', testDriveSchema);
