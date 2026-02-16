// server.js - Main entry point for the Express server
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const db = require("./models");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5001;

// ===============================================
// Middleware Setup
// ===============================================

// Trust proxy for Railway/Render deployment
app.set('trust proxy', 1);

// Enable CORS for all routes
app.use(cors({
  origin: '*', // Allow all origins in development
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// HTTP request logger
app.use(morgan("dev"));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ===============================================
// Routes
// ===============================================

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    message: "Server is running smoothly",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// API info endpoint
app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Electronic Store API!",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
      categories: "/api/categories",
      users: "/api/users",
      orders: "/api/orders",
      cloudinary: "/api/cloudinary",
      uploads: "/api/uploads"
    },
    documentation: "https://github.com/yourusername/api-docs"
  });
});

// Base route
app.get("/", (req, res) => {
  res.redirect("/api");
});

// Import routes (we'll create these next)
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const orderRoutes = require("./routes/orders");
const userRoutes = require("./routes/users");
const uploadRoutes = require("./routes/uploads");
const cloudinaryUploadRoutes = require("./routes/uploadCloudinary");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cloudinary", cloudinaryUploadRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

// ===============================================
// Error Handling Middleware
// ===============================================

// 404 handler - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: "Route not found",
      status: 404,
      path: req.originalUrl,
    },
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);

  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || "Internal Server Error",
      status: err.status || 500,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
});

// Database and Server Startup
const startServer = async () => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    console.log("✅ Database connection established");
    console.log(`📊 Database: ${db.sequelize.config.database}`);
    console.log(`🏠 Host: ${db.sequelize.config.host}`);

    // Sync models with database - create tables if they don't exist, but do not alter existing tables
    // Only sync in development
    if (process.env.NODE_ENV !== 'production') {
      await db.sequelize.sync({ alter: false });
      console.log("✅ Database models synchronized");
    } else {
      // In production, just verify connection
      console.log("✅ Production mode - skipping sync");
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log("\n🚀 Server started successfully!");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`📍 Server URL: http://localhost:${PORT}`);
      console.log(`📍 API Base: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      console.log("💡 Press Ctrl+C to stop the server\n");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    console.error("\nTroubleshooting:");
    console.error("1. Check your DATABASE_URL in .env file");
    console.error("2. Make sure all dependencies are installed: npm install");
    console.error("3. Verify your database is accessible\n");
    process.exit(1);
  }
};

// Handle SIGINT (Ctrl+C)
process.on("SIGINT", async () => {
  console.log("\n⚠️  Shutting down gracefully...");
  try {
    await db.sequelize.close();
    console.log("✅ Database connection closed");
    console.log("👋 Server stopped");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
});

// Handle SIGTERM
process.on("SIGTERM", async () => {
  console.log("\n⚠️  Shutting down gracefully...");
  try {
    await db.sequelize.close();
    console.log("✅ Database connection closed");
    console.log("👋 Server stopped");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
});

// Start the server
startServer();

// Export app for testing
module.exports = app;
