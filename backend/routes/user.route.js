import express from 'express';
import {updateUser,deleteUser} from '../controllers/user.controller.js';
import {verifyToken} from "../utils/verifyUser.js";
import {upload} from "../config/cloudinaryConfig.js";


const router = express.Router();

router.put('/update/:id' ,verifyToken, upload.single("avatar"), updateUser);
router.delete('/delete/:id' ,verifyToken, deleteUser);

export default router; 