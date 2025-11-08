import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { requestCar, getUserRequests, deleteUserRequest } from "../controllers/request.controller.js";


const router = express.Router();

router.post("/request", verifyToken, requestCar);
router.get('/my', verifyToken, getUserRequests);
router.delete('/:id', verifyToken, deleteUserRequest);

export default router;
