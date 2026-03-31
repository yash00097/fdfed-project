import express from "express";
import { pdfUpload, upload } from "../config/cloudinaryConfig.js";
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

router.post(
  "/document",
  verifyToken,
  pdfUpload.single("document"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No document uploaded",
        });
      }

      res.status(200).json({
        success: true,
        url: req.file.path,
        message: "Document uploaded successfully",
      });
    } catch (error) {
      console.error("Document upload error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to upload document",
      });
    }
  }
);

export default router;
