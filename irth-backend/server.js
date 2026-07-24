// Import Express to create and configure the backend server.
import express from "express";

// Import CORS middleware to control which frontend origins can access the backend.
import cors from "cors";

// Import dotenv to load environment variables from the local .env file.
import dotenv from "dotenv";

// Import file system utilities for checking and creating directories.
import fs from "fs";

// Import path utilities for building safe cross-platform file paths.
import path from "path";

// Import the routes responsible for handling architectural analysis requests.
import analyzeRoutes from "./routes/analyzeRoutes.js";

// Load environment variables before reading values from process.env.
dotenv.config();

// Create the Express application.
const app = express();

// Trust the first proxy because Render runs the application behind a proxy.
app.set("trust proxy", 1);

// Use the port provided by Render or port 5000 during local development.
const PORT = process.env.PORT || 5000;

/*
  Normalize a URL by removing extra spaces and trailing slashes.

  Example:
  https://example.vercel.app/
  becomes:
  https://example.vercel.app
*/
function normalizeOrigin(value) {
  if (!value) {
    return "";
  }

  return value.trim().replace(/\/+$/, "");
}

// Define the directories required by the backend.
const requiredDirectories = [
  "uploads",
  "reports",
];

// Create the uploads and reports directories if they do not exist.
requiredDirectories.forEach((directoryName) => {
  const directoryPath = path.join(
    process.cwd(),
    directoryName
  );

  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, {
      recursive: true,
    });

    console.log(
      `Created required directory: ${directoryPath}`
    );
  }
});

// Define the frontend origins allowed to communicate with the backend.
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  normalizeOrigin(process.env.FRONTEND_URL),
].filter(Boolean);

// Configure Cross-Origin Resource Sharing.
const corsOptions = {
  /*
    Check every incoming request origin.

    Requests without an origin are allowed because they may come
    from tools such as Postman, Render health checks, or another server.
  */
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const normalizedRequestOrigin =
      normalizeOrigin(origin);

    if (
      allowedOrigins.includes(
        normalizedRequestOrigin
      )
    ) {
      return callback(null, true);
    }

    console.error(
      `Blocked by CORS: ${normalizedRequestOrigin}`
    );

    return callback(
      new Error(
        `Origin is not allowed by CORS: ${normalizedRequestOrigin}`
      )
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

  // This public demo does not require browser cookies.
  credentials: false,

  // Return a successful response for preflight requests.
  optionsSuccessStatus: 204,
};

// Apply the CORS configuration to all backend routes.
app.use(cors(corsOptions));

// Parse incoming JSON request bodies.
app.use(
  express.json({
    limit: "10mb",
  })
);

// Parse URL-encoded form request bodies.
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// Make generated report files publicly accessible through /reports.
app.use(
  "/reports",
  express.static(
    path.join(
      process.cwd(),
      "reports"
    )
  )
);

/*
  Root route.

  This route can be opened in the browser to confirm that
  the backend service is running.
*/
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    service: "IRTH Backend",
    message: "Backend is running successfully",
    environment:
      process.env.NODE_ENV ||
      "development",
  });
});

/*
  Render health-check route.

  Render calls this endpoint during deployment.
  It must return a successful HTTP status code.
*/
app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    status: "healthy",
    service: "IRTH Backend",
    timestamp: new Date().toISOString(),
  });
});

/*
  API connection test route.

  This route can be used to confirm that the frontend
  can successfully reach the backend API.
*/
app.get("/api/ping", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "IRTH API is reachable",
  });
});

/*
  Register the architectural analysis routes.

  Example:
  POST /api/analyze
*/
app.use("/api", analyzeRoutes);

/*
  Handle routes that do not exist.

  This middleware must be placed after all valid routes.
*/
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

/*
  Handle unexpected server errors and return
  a consistent JSON response.
*/
app.use((error, req, res, next) => {
  console.error(
    "SERVER ERROR:",
    error
  );

  // Return a specific response for blocked CORS origins.
  if (
    error.message?.includes(
      "Origin is not allowed by CORS"
    )
  ) {
    return res.status(403).json({
      success: false,
      error:
        "The frontend origin is not allowed by CORS",
      details: error.message,
    });
  }

  // Return a general server error response.
  return res.status(
    error.status || 500
  ).json({
    success: false,
    error:
      error.message ||
      "Internal server error",

    /*
      Hide technical stack details in production,
      but keep them visible during local development.
    */
    details:
      process.env.NODE_ENV ===
      "production"
        ? undefined
        : error.stack,
  });
});

/*
  Start the backend server.

  Render requires the application to:
  1. Use process.env.PORT.
  2. Listen on 0.0.0.0.
*/
app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `IRTH backend running on port ${PORT}`
    );

    console.log(
      `Environment: ${
        process.env.NODE_ENV ||
        "development"
      }`
    );

    console.log(
      `Allowed origins: ${
        allowedOrigins.length > 0
          ? allowedOrigins.join(", ")
          : "No frontend origin configured"
      }`
    );

    console.log(
      `Gemini key loaded: ${
        process.env.GEMINI_API_KEY
          ? "YES"
          : "NO"
      }`
    );
  }
);