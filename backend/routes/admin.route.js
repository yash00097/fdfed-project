import { Router } from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { getAnalytics, getDetails } from '../controllers/admin.controller.js';

const router = Router();

router.get('/analytics', verifyToken, getAnalytics);
router.get('/details', verifyToken, getDetails);

export default router;