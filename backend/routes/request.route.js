import express from "express";
import { verifyToken, verifyAdmin } from "../utils/verifyUser.js";
import { requestCar, getUserRequests, deleteUserRequest, getAllRequests } from "../controllers/request.controller.js";


const router = express.Router();

router.post("/request", verifyToken, requestCar);
router.get('/my', verifyToken, getUserRequests);
// Admin: get all requests
router.get('/all', verifyToken, verifyAdmin, getAllRequests);
// Delete by id: owner or admin can delete (controller enforces)
router.delete('/:id', verifyToken, deleteUserRequest);

export default router;
