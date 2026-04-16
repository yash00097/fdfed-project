import express from "express";
import { pdfUpload, upload } from "../config/cloudinaryConfig.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

const handleUpload = (fieldName, uploadMiddleware, label) =>
  (req, res) => {
    uploadMiddleware.single(fieldName)(req, res, (err) => {
      if (err) {
        console.error(`${label} upload middleware error:`, err);
        return res.status(400).json({
          success: false,
          error: err.message || `Failed to upload ${label.toLowerCase()}`,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: `No ${label.toLowerCase()} uploaded`,
        });
      }

      res.status(200).json({
        success: true,
        url: req.file.path,
        message: `${label} uploaded successfully`,
      });
    });
  };

router.post("/photo", verifyToken, handleUpload("photo", upload, "Photo"));

router.post(
  "/document",
  verifyToken,
  handleUpload("document", pdfUpload, "Document")
);

export default router;
