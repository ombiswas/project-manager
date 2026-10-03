import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB runtime connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB connection lost. Reconnecting...");
    });

    return conn;
  } catch (error) {
    logger.error(`❌ Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close(false);
    logger.info("MongoDB connection closed gracefully.");
  } catch (error) {
    logger.error("Error closing MongoDB connection:", error);
    throw error;
  }
};
