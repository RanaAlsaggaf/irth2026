// Import the file system module for reading and deleting local files.
import fs from "fs";

// Import path utilities for extracting file extensions.
import path from "path";

// Return the file extension in lowercase format.
export function getFileExtension(filename) {
  return path.extname(filename).toLowerCase();
}

// Check whether the provided MIME type belongs to a supported image format.
export function isImageFile(mimeType) {
  return ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
    mimeType
  );
}

// Check whether the provided MIME type belongs to a PDF file.
export function isPdfFile(mimeType) {
  return mimeType === "application/pdf";
}

// Read a local file and convert its content into a Base64 string.
export function fileToBase64(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.toString("base64");
}

// Safely delete a temporary local file after processing.
export function cleanupLocalFile(filePath) {
  try {
    // Delete the file only when it exists.
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    // Log cleanup errors without interrupting the main application process.
    console.error("Failed to delete local uploaded file:", error.message);
  }
}