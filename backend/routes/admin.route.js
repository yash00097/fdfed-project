import { Router } from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { getAnalytics } from '../controllers/admin.controller.js';

const router = Router();

router.get('/analytics', verifyToken, getAnalytics);

export default router;