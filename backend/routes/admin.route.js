import { Router } from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { getAnalytics, getDetails, getPublicStats } from '../controllers/admin.controller.js';

const router = Router();

router.get('/analytics', verifyToken, getAnalytics);
router.get('/details', verifyToken, getDetails);
router.get('/public-stats', getPublicStats); // Public route - no authentication

export default router;