// Import Express to create a modular API router.
import express from "express";

// Import Multer to handle uploaded files.
import multer from "multer";

// Import the controller responsible for processing and analyzing uploaded files.
import { analyzeUploadedFile } from "../controllers/analyzeController.js";

// Create a new Express router instance.
const router = express.Router();

// Configure how uploaded files are stored on the server.
const storage = multer.diskStorage({
  // Save uploaded files inside the uploads directory.
  destination(req, file, callback) {
    callback(null, "uploads/");
  },

  // Generate a unique and safe filename for each uploaded file.
  filename(req, file, callback) {
    const safeName = file.originalname.replace(/\s+/g, "_");
    callback(null, `${Date.now()}-${safeName}`);
  },
});

// Define the file types accepted by the analysis endpoint.
const allowedMimeTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
]);

// Configure Multer upload behavior and validation rules.
const upload = multer({
  storage,

  // Limit uploaded files to a maximum size of 100 MB.
  limits: { fileSize: 100 * 1024 * 1024 },

  // Validate the uploaded file type before accepting it.
  fileFilter(req, file, callback) {
    if (allowedMimeTypes.has(file.mimetype)) {
      callback(null, true);
      return;
    }

    // Reject files that do not match the supported MIME types.
    callback(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

router.post("/analyze", upload.single("file"), analyzeUploadedFile);

// Export the router so it can be registered by the main server.
export default router;