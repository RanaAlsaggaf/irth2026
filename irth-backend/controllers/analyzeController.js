// Import the AI service responsible for analyzing the uploaded design.
import { analyzeFileWithRegion } from "../services/openaiService.js";

// Import the service used to save the analysis result as a JSON report.
import { saveJsonReport } from "../services/reportService.js";

// Import the utility used to remove temporary uploaded files.
import { cleanupLocalFile } from "../utils/fileHelpers.js";

// Handle uploaded files and return their architectural analysis results.
export async function analyzeUploadedFile(req, res) {
  // Track the temporary file path so it can be deleted if an error occurs.
  let filePath = null;

  try {
    // Extract the selected architectural region from the request body.
    const { region } = req.body;

    // Retrieve the file processed by Multer.
    const file = req.file;

    // Reject the request when no architectural region is provided.
    if (!region || !region.trim()) {
      return res.status(400).json({
        success: false,
        error: "Region is required.",
      });
    }

    // Reject the request when no file is uploaded.
    if (!file) {
      return res.status(400).json({
        success: false,
        error: "File is required.",
      });
    }

    // Remove unnecessary whitespace from the selected region.
    const cleanRegion = region.trim();

    // Store the temporary file path for cleanup handling.
    filePath = file.path;

    // Send the uploaded file and selected region to the AI analysis service.
    const analysisResult = await analyzeFileWithRegion({
      region: cleanRegion,
      filePath: file.path,
      originalName: file.originalname,
      mimeType: file.mimetype,
    });

    // Save the completed analysis as a JSON report.
    const reportInfo = saveJsonReport({
      region: cleanRegion,
      originalName: file.originalname,
      analysisResult,
    });

    // Delete the temporary uploaded file after the analysis is completed.
    cleanupLocalFile(file.path);

    // Clear the stored path to prevent duplicate cleanup in the catch block.
    filePath = null;

    // Use the configured public URL or construct one from the current request.
    const publicBaseUrl =
      process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;

    // Return the analysis result and generated report information.
    return res.status(200).json({
      success: true,
      message: "Analysis completed successfully.",

      // Include basic information about the uploaded input.
      input: {
        region: cleanRegion,
        fileName: file.originalname,
        fileType: file.mimetype,
      },

      // Include the normalized AI analysis result.
      result: analysisResult,

      // Include information required to identify and download the report.
      report: {
        reportId: reportInfo.reportId,
        fileName: reportInfo.reportFileName,
        downloadUrl: `${publicBaseUrl}/reports/${reportInfo.reportFileName}`,
      },
    });
  } catch (error) {
    // Log the full controller error for backend debugging.
    console.error("CONTROLLER ERROR:", error);

    // Delete the temporary file if the process failed before normal cleanup.
    if (filePath) {
      cleanupLocalFile(filePath);
    }

    // Return a consistent server error response.
    return res.status(500).json({
      success: false,
      error: "Failed to analyze file.",
      details: error.message,
    });
  }
}