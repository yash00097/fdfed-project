import express from 'express';
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js';
import {
  submitApplication,
  getMyApplication,
  listApplications,
  approveApplication,
  rejectApplication,
  getApplicationById,
} from '../controllers/agentHiring.controller.js';

const router = express.Router();

// User: check their own application status
router.get('/my-application', verifyToken, getMyApplication);
// User: submit application
router.post('/apply', verifyToken, submitApplication);
// Admin: list all applications
router.get('/applications', verifyToken, verifyAdmin, listApplications);
// Admin: get single application
router.get('/:id', verifyToken, verifyAdmin, getApplicationById);
// Admin: approve application
router.post('/approve/:id', verifyToken, verifyAdmin, approveApplication);
// Admin: reject application
router.post('/reject/:id', verifyToken, verifyAdmin, rejectApplication);

export default router;
