import { env } from "../config/env.js";
import { AppError, NotFoundError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

/**
 * Express middleware to catch 404 routes and forward to error handler
 */
export const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`Cannot find ${req.method} ${req.originalUrl} on this server`));
};

/**
 * Global Express error-handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let details = err.details || null;

  // 1. Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // 2. Handle Mongoose ValidationError
  else if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors).map((el) => el.message);
    message = `Validation failed: ${errors.join(", ")}`;
    details = Object.entries(err.errors).reduce((acc, [field, errorObj]) => {
      acc[field] = errorObj.message;
      return acc;
    }, {});
  }

  // 3. Handle MongoDB duplicate key error (code 11000)
  else if (err.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(err.keyValue || {}).join(", ");
    message = `Duplicate value for field(s): ${fields}. Please use a unique value.`;
    details = err.keyValue;
  }

  // 4. Handle JWT errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please authenticate again.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your token has expired. Please authenticate again.";
  }

  // 5. Handle Zod validation errors
  else if (err.name === "ZodError" && Array.isArray(err.errors)) {
    statusCode = 400;
    message = "Invalid input data";
    details = err.errors.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }));
  }

  // 6. Handle Malformed JSON payload syntax error
  else if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    message = "Malformed JSON payload in request body";
  }

  // Log server errors (5xx)
  if (statusCode >= 500) {
    logger.error(`[500 Server Error] ${req.method} ${req.originalUrl}:`, {
      message: err.message,
      stack: err.stack,
    });
  } else {
    logger.warn(`[${statusCode} Client Error] ${req.method} ${req.originalUrl} - ${message}`);
  }

  // In production, sanitize 500 messages to prevent leaking internal details
  if (env.NODE_ENV === "production" && statusCode >= 500) {
    message = "Internal server error";
    details = null;
  }

  res.status(statusCode).json({
    status: `${statusCode}`.startsWith("4") ? "fail" : "error",
    message,
    ...(details ? { details } : {}),
    ...(env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
};

export default {
  notFoundHandler,
  errorHandler,
};
