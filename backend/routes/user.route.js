import express from 'express';
import {updateUser,deleteUser,getUser,  getDetailedUser, getUserAnalytics} from '../controllers/user.controller.js';
import {verifyToken} from "../utils/verifyUser.js";
import {upload} from "../config/cloudinaryConfig.js";
import { cacheResponse } from "../middleware/cache.js";
import { userAnalyticsCacheKey } from "../utils/cache.js";


const router = express.Router();

router.get(
  '/analytics',
  verifyToken,
  cacheResponse("user:analytics", 180, (req) => userAnalyticsCacheKey(req.user.id)),
  getUserAnalytics
);
router.get('/detailed/:id', verifyToken, getDetailedUser);

// Parameterized routes come after
router.get('/:id', verifyToken, getUser);
router.put('/update/:id' ,verifyToken, upload.single("avatar"), updateUser);
router.delete('/delete/:id' ,verifyToken, deleteUser);

export default router;