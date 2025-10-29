import express from 'express';
import { signup, signin, signout, googleAuth, requestOTP, verifyOTP, resetPassword } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup',signup);
router.post('/signin',signin);
router.post('/google', googleAuth);
router.get('/signout',signout);
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

export default router;
