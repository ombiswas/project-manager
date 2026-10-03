import jwt from "jsonwebtoken";
import userRepository from "../repositories/user.repository.js";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../utils/errors.js";
import { asyncHandler } from "../utils/async-handler.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Missing header
  if (!authHeader) {
    throw new UnauthorizedError("Authorization header missing");
  }

  // 2. Malformed header (must be 'Bearer <token>')
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1].trim()) {
    throw new UnauthorizedError("Invalid authorization format. Expected 'Bearer <token>'");
  }

  const token = parts[1].trim();

  // 3. JWT verification (expired vs invalid)
  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Token expired. Please log in again.");
    }
    throw new UnauthorizedError("Invalid token. Please authenticate again.");
  }

  if (!decoded || !decoded.userId) {
    throw new UnauthorizedError("Invalid token payload");
  }

  // 4. Check for deleted or non-existent user
  const user = await userRepository.findById(decoded.userId);
  if (!user) {
    throw new UnauthorizedError("User account no longer exists");
  }

  req.user = user;
  next();
});

export default authMiddleware;
