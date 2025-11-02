import express from "express";
import { verifyToken, verifyAgent } from "../utils/verifyUser.js";

import { listAssignedCars, acceptCarForVerification, listCarsForVerification, approveCar, rejectCar, getAgentStats  } from "../controllers/agent.controller.js";

const router = express.Router();

// All routes require agent auth
router.get("/assigned", verifyToken, verifyAgent, listAssignedCars);

router.get("/stats", verifyToken, verifyAgent, getAgentStats);

router.post("/accept/:id", verifyToken, verifyAgent, acceptCarForVerification);
router.get("/verification", verifyToken, verifyAgent, listCarsForVerification);

router.post("/approve/:id", verifyToken, verifyAgent, approveCar);
router.post("/reject/:id", verifyToken, verifyAgent, rejectCar);

export default router;
