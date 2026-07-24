// Import the file system module to save report files.
import fs from "fs";

// Import path utilities to build the report file path.
import path from "path";

// Create and save a JSON report for the completed architectural analysis.
export function saveJsonReport({
  region,
  originalName,
  analysisResult,
}) {
  // Generate a unique report identifier using the current timestamp.
  const reportId = Date.now().toString();

  // Organize the report information into a structured object.
  const reportData = {
    reportId,
    region,
    fileName: originalName,
    analysis: analysisResult,
    createdAt: new Date().toISOString(),
  };

  // Create the JSON report filename using the generated identifier.
  const reportFileName = `report-${reportId}.json`;

  // Build the full path where the report will be saved.
  const reportPath = path.join(
    process.cwd(),
    "reports",
    reportFileName
  );

  // Save the formatted report data as a JSON file.
  fs.writeFileSync(
    reportPath,
    JSON.stringify(reportData, null, 2),
    "utf-8"
  );

  // Return the saved report information to the calling service.
  return {
    reportId,
    reportFileName,
    reportPath,
  };
}