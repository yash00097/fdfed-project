import express from "express";
import { upload } from "../config/cloudinaryConfig.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/photo", verifyToken, upload.single("photo"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No photo uploaded"
      });
    }

    res.status(200).json({
      success: true,
      url: req.file.path,
      message: "Photo uploaded successfully"
    });
  } catch (error) {
    console.error("Photo upload error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload photo"
    });
  }
});

export default router;
