import cors from "cors";
import express from "express";
import morgan from "morgan";

import { env } from "./src/config/env.js";
import { connectDB, closeDB } from "./src/config/database.js";
import routes from "./routes/index.js";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan("dev"));
app.use(express.json());

app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Welcome to TaskHub API",
  });
});

// http://localhost:5000/api-v1/
app.use("/api-v1", routes);

// error middleware
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({ 
    message: "Internal server error",
    error: err.message // Temporarily show error message to debug production issue
  });
});

// not found middleware
app.use((req, res) => {
  res.status(404).json({
    message: "Not found",
  });
});

let server;

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

const handleShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");
      try {
        await closeDB();
        process.exit(0);
      } catch (err) {
        console.error("Error during database shutdown:", err);
        process.exit(1);
      }
    });
  } else {
    try {
      await closeDB();
    } catch (err) {
      console.error("Error during database shutdown:", err);
    }
    process.exit(0);
  }
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

startServer();

export { app, server };
