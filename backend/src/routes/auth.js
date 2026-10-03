import express from "express";
import { validateRequest } from "zod-express-middleware";

import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../libs/validate-schema.js";
import {
  loginUser,
  registerUser,
  resetPasswordRequest,
  verifyEmail,
  verifyResetPasswordTokenAndResetPassword,
} from "../controllers/auth.controller.js";
import {
  authLimiter,
  passwordResetLimiter,
} from "../middleware/rate-limiter.js";

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  validateRequest({
    body: registerSchema,
  }),
  registerUser
);

router.post(
  "/login",
  authLimiter,
  validateRequest({
    body: loginSchema,
  }),
  loginUser
);

router.post(
  "/verify-email",
  validateRequest({
    body: verifyEmailSchema,
  }),
  verifyEmail
);

router.post(
  "/reset-password-request",
  passwordResetLimiter,
  validateRequest({
    body: emailSchema,
  }),
  resetPasswordRequest
);

router.post(
  "/reset-password",
  passwordResetLimiter,
  validateRequest({
    body: resetPasswordSchema,
  }),
  verifyResetPasswordTokenAndResetPassword
);

export default router;
