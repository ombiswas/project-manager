import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

/**
 * Factory to create configured express-rate-limit instances with consistent JSON responses
 */
const createRateLimiter = ({ windowMs, max, message }) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => env.NODE_ENV === "test",
    handler: (req, res) => {
      res.status(429).json({
        status: "fail",
        message:
          message || "Too many requests from this IP address, please try again later.",
      });
    },
  });
};

/**
 * Looser global rate limiter applied across all incoming API requests
 * 200 requests per 15-minute window per IP
 */
export const globalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: "Too many requests. Please try again after 15 minutes.",
});

/**
 * Strict rate limiter for authentication endpoints (login, registration)
 * 15 requests per 15-minute window per IP
 */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message:
    "Too many authentication attempts from this IP. Please try again after 15 minutes.",
});

/**
 * Strict rate limiter for password reset requests to protect against email spam and enumeration
 * 5 requests per 15-minute window per IP
 */
export const passwordResetLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message:
    "Too many password reset requests from this IP. Please try again after 15 minutes.",
});

export default {
  globalLimiter,
  authLimiter,
  passwordResetLimiter,
};
