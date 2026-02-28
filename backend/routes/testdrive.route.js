import express from 'express';
import { verifyToken, verifyAgent, verifyAdmin } from '../utils/verifyUser.js';
import {
  requestTestDrive,
  getMyTestDrives,
  getPendingTestDriveRequests,
  getAgentTestDrives,
  getAllTestDrives,
  approveTestDrive,
  rejectTestDrive,
  completeTestDrive,
  cancelTestDrive
} from '../controllers/testdrive.controller.js';

const router = express.Router();

// User routes
router.post('/request', verifyToken, requestTestDrive);
router.get('/my', verifyToken, getMyTestDrives);
router.post('/cancel/:id', verifyToken, cancelTestDrive);

// Agent routes (only assigned agent can manage)
router.get('/agent/pending', verifyToken, verifyAgent, getPendingTestDriveRequests);
router.get('/agent/list', verifyToken, verifyAgent, getAgentTestDrives);
router.post('/:id/approve', verifyToken, verifyAgent, approveTestDrive);
router.post('/:id/reject', verifyToken, verifyAgent, rejectTestDrive);
router.post('/:id/complete', verifyToken, verifyAgent, completeTestDrive);

// Admin only routes
router.get('/all', verifyToken, verifyAdmin, getAllTestDrives);

export default router;
