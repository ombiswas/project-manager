import express from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";

import authenticateUser from "../middleware/auth-middleware.js";
import {
  changePassword,
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.controller.js";

const router = express.Router();

// Get current user profile
router.get("/profile", authenticateUser, getUserProfile);

// Update user profile: Supports PATCH and PUT
const updateProfileHandler = [
  authenticateUser,
  validateRequest({
    body: z.object({
      name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters long")
        .max(50, "Name cannot exceed 50 characters")
        .optional(),
      profilePicture: z.string().trim().optional(),
    }),
  }),
  updateUserProfile,
];
router.patch("/profile", ...updateProfileHandler);
router.put("/profile", ...updateProfileHandler);

// Change password: Supports PATCH and PUT
const changePasswordHandler = [
  authenticateUser,
  validateRequest({
    body: z
      .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z
          .string()
          .min(8, "New password must be at least 8 characters long")
          .max(128, "New password cannot exceed 128 characters"),
        confirmPassword: z.string().min(1, "Confirm password is required"),
      })
      .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      }),
  }),
  changePassword,
];
router.patch("/change-password", ...changePasswordHandler);
router.put("/change-password", ...changePasswordHandler);

export default router;
