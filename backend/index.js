import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./src/config/env.js";
import { connectDB, closeDB } from "./src/config/database.js";
import { logger } from "./src/utils/logger.js";
import { notFoundHandler, errorHandler } from "./src/middleware/error-middleware.js";
import { globalLimiter } from "./src/middleware/rate-limiter.js";
import routes from "./routes/index.js";

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration driven by FRONTEND_URL
app.use(
  cors({
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Global looser rate limiter across all routes
app.use(globalLimiter);

app.use(morgan("dev"));
app.use(express.json());

app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Welcome to TaskHub API",
  });
});

// http://localhost:5000/api-v1/
app.use("/api-v1", routes);

// 404 handler for unknown routes
app.use(notFoundHandler);

// Global centralized error handler
app.use(errorHandler);

let server;

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

const handleShutdown = async (signal) => {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);
  if (server) {
    server.close(async () => {
      logger.info("HTTP server closed.");
      try {
        await closeDB();
        process.exit(0);
      } catch (err) {
        logger.error("Error during database shutdown:", err);
        process.exit(1);
      }
    });
  } else {
    try {
      await closeDB();
    } catch (err) {
      logger.error("Error during database shutdown:", err);
    }
    process.exit(0);
  }
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

startServer();

export { app, server };
