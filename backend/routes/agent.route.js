import express from "express";
import { verifyToken, verifyAgent } from "../utils/verifyUser.js";


import { listAssignedCars, acceptCarForVerification, listCarsForVerification, approveCar, rejectCar, getAgentStats, getAgentLeaderboard } from "../controllers/agent.controller.js";

const router = express.Router();

// All routes require agent auth
router.get("/assigned", verifyToken, verifyAgent, listAssignedCars);
router.post("/accept/:id", verifyToken, verifyAgent, acceptCarForVerification);
router.get("/verification", verifyToken, verifyAgent, listCarsForVerification);

router.get("/stats", verifyToken, verifyAgent, getAgentStats);
router.get("/leaderboard", verifyToken, verifyAgent, getAgentLeaderboard);


router.post("/approve/:id", verifyToken, verifyAgent, approveCar);
router.post("/reject/:id", verifyToken, verifyAgent, rejectCar);

export default router;
