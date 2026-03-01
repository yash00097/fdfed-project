import { Router } from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { verifyAdmin } from '../utils/verifyUser.js';
import { getAnalytics, getDetails, getPublicStats, getCarById } from '../controllers/admin.controller.js';

const router = Router();

router.get('/analytics', verifyToken, verifyAdmin, getAnalytics);
router.get('/details', verifyToken, verifyAdmin, getDetails);
router.get('/car/:carId', verifyToken, getCarById); // Role-based auth handled in controller (admin, agent, seller, buyer)
router.get('/public-stats', getPublicStats); // Public route - no authentication

export default router;