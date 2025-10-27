import express from 'express';
import {
  createPurchase,
  getUserPurchases,
  getPurchaseById,
  updatePurchaseStatus,
  getAllPurchases
} from '../controllers/purchase.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

// Create a new purchase
router.post('/create', verifyToken, createPurchase);

// Get all purchases for a specific user
router.get('/user/:userId', verifyToken, getUserPurchases);

// Get a specific purchase by ID
router.get('/:id', verifyToken, getPurchaseById);

// Update purchase status
router.patch('/:id/status', verifyToken, updatePurchaseStatus);

// Get all purchases (admin only)
router.get('/', verifyToken, getAllPurchases);

export default router;
