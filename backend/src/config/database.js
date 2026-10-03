import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB runtime connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB connection lost. Reconnecting...");
    });

    return conn;
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close(false);
    console.log("MongoDB connection closed gracefully.");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    throw error;
  }
};
