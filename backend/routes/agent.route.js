import express from "express";
import { verifyToken, verifyAgent } from "../utils/verifyUser.js";
import { listAssignedCars, approveCar, rejectCar } from "../controllers/agent.controller.js";

const router = express.Router();

// All routes require agent auth
router.get("/assigned", verifyToken, verifyAgent, listAssignedCars);
router.post("/approve/:id", verifyToken, verifyAgent, approveCar);
router.post("/reject/:id", verifyToken, verifyAgent, rejectCar);

export default router;