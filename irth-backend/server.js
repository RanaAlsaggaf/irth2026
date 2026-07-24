// Import Express to create and configure the backend server.
import express from "express";

// Import CORS middleware to control allowed frontend origins.
import cors from "cors";

// Import dotenv to load environment variables from the .env file.
import dotenv from "dotenv";

// Import file system utilities for creating required directories.
import fs from "fs";

// Import path utilities for building cross-platform file paths.
import path from "path";

// Import the routes responsible for handling design analysis requests.
import analyzeRoutes from "./routes/analyzeRoutes.js";

// Load environment variables before accessing process.env values.
dotenv.config();

// Create the Express application.
const app = express();

// Trust the first proxy used by hosting services such as Render.
app.set("trust proxy", 1);

// Use the environment port in production or port 5000 locally.
const PORT = process.env.PORT || 5000;

// Define the directories required for uploaded files and generated reports.
const requiredDirs = ["uploads", "reports"];

// Create any required directory that does not already exist.
requiredDirs.forEach((dir) => {
  const fullPath = path.join(process.cwd(), dir);

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Define the frontend origins allowed to communicate with the backend.
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

// Configure Cross-Origin Resource Sharing rules.
app.use(
  cors({
    // Validate each incoming request origin.
    origin: (origin, callback) => {

      // Allow requests without an origin, such as server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      // Allow requests coming from an approved frontend origin.
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Log and reject requests coming from unauthorized origins.
      console.error("Blocked by CORS:", origin);

      return callback(
        new Error("This origin is not allowed by CORS.")
      );
    },

    // Define the HTTP methods accepted by the backend.
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    // Define the request headers accepted by the backend.
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// Parse incoming JSON request bodies.
app.use(express.json());

// Parse URL-encoded form request bodies.
app.use(express.urlencoded({ extended: true }));

// Make generated report files publicly accessible through the /reports route.
app.use("/reports", express.static(path.join(process.cwd(), "reports")));

// Provide a basic route for checking whether the backend is running.
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running",
  });
});

// Provide an API health-check endpoint.
app.get("/api/ping", (req, res) => {
  res.json({
    success: true,
    message: "API is reachable",
  });
});

// Register the architectural analysis routes under the /api prefix.
app.use("/api", analyzeRoutes);

// Handle unexpected server errors and return a consistent JSON response.
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// Start the backend server and listen for incoming requests.
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});