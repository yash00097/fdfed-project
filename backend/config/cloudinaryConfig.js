import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
];

const PDF_MIME_TYPES = ["application/pdf"];

const sanitizePublicId = (filename) =>
  path
    .parse(filename)
    .name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const baseName = sanitizePublicId(file.originalname) || "image";

    return {
      folder: "fdfed-project/photos",
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png"],
      public_id: `${Date.now()}-${baseName}`,
    };
  },
});

const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const baseName = sanitizePublicId(file.originalname) || "document";

    return {
      folder: "fdfed-project/documents",
      resource_type: "raw",
      public_id: `${Date.now()}-${baseName}.pdf`,
    };
  },
});

const upload = multer({
  storage: imageStorage,

  fileFilter: (req, file, cb) => {
    if (!IMAGE_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        new Error("Only JPG and PNG image files are allowed"),
        false
      );
    }

    cb(null, true);
  },

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const pdfUpload = multer({
  storage: pdfStorage,

  fileFilter: (req, file, cb) => {
    if (!PDF_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("Only PDF files are allowed"), false);
    }

    cb(null, true);
  },

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export { cloudinary, upload, pdfUpload };
