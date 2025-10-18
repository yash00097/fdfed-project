import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { requestCar } from "../controllers/request.controller.js";


const router = express.Router();

router.post("/request", verifyToken, requestCar);

export default router;
