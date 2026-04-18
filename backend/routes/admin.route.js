import { Router } from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { verifyAdmin } from '../utils/verifyUser.js';
import { cacheResponse } from '../middleware/cache.js';
import { getAnalytics, getDetails, getPublicStats, getCarById } from '../controllers/admin.controller.js';

const router = Router();

router.get('/analytics', verifyToken, verifyAdmin, cacheResponse('admin:analytics', 180, (req) => `admin:analytics:${req.user._id}`), getAnalytics);
router.get('/details', verifyToken, verifyAdmin, cacheResponse('admin:details', 180, (req) => `admin:details:${req.user._id}`), getDetails);
router.get('/car/:carId', verifyToken, getCarById); // Role-based auth handled in controller (admin, agent, seller, buyer)
router.get('/public-stats', cacheResponse('admin:public-stats', 300), getPublicStats); // Public route - no authentication

export default router;