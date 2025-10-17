import express from 'express';
import { signup, signin, signout, googleAuth } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup',signup);
router.post('/signin',signin);
router.post('/google', googleAuth);
router.get('/signout',signout);

export default router;