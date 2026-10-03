import { z } from "zod";
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  PROJECT_STATUSES,
  WORKSPACE_ROLES,
  INVITE_ROLES,
} from "../src/constants/enums.js";

const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name cannot exceed 50 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email address format")
    .max(255, "Email address is too long"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password cannot exceed 128 characters"),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email address format"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .max(128, "Password is too long"),
});

const verifyEmailSchema = z.object({
  token: z
    .string({ required_error: "Verification token is required" })
    .trim()
    .min(1, "Verification token is required"),
});

const resetPasswordSchema = z
  .object({
    token: z
      .string({ required_error: "Reset token is required" })
      .trim()
      .min(1, "Reset token is required"),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(8, "Password must be at least 8 characters long")
      .max(128, "Password cannot exceed 128 characters"),
    confirmPassword: z
      .string({ required_error: "Confirm password is required" })
      .min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const emailSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email address format")
    .max(255, "Email address is too long"),
});

/**
 * Validates 24-character hexadecimal MongoDB ObjectIds in route params
 */
export const objectIdSchema = z
  .string({ required_error: "ID parameter is required" })
  .regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid ID format: must be a 24-character hexadecimal ObjectId"
  );

/**
 * Standard query parameter validation schema for pagination and filtering
 */
export const paginationQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().optional(),
    status: z.string().trim().optional(),
    priority: z.string().trim().optional(),
    sortBy: z.string().trim().optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .partial();

const inviteMemberSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email address"),
  role: z.enum(INVITE_ROLES).default("member"),
});

const tokenSchema = z.object({
  token: z
    .string({ required_error: "Token is required" })
    .trim()
    .min(1, "Token is required"),
});

const workspaceSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional().default(""),
  color: z.string().trim().min(1, "Color is required").default("#FF5733"),
});

const projectSchema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  description: z.string().trim().optional().default(""),
  status: z.enum(PROJECT_STATUSES).default("Planning"),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  members: z.array(objectIdSchema).optional(),
});

const taskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required"),
  description: z.string().trim().optional().default(""),
  status: z.enum(TASK_STATUSES).default("To Do"),
  priority: z.enum(TASK_PRIORITIES).default("Medium"),
  dueDate: z.string().optional(),
  assignees: z.array(objectIdSchema).optional().default([]),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(TASK_STATUSES, {
    errorMap: () => ({
      message: `Invalid status. Must be one of: ${TASK_STATUSES.join(", ")}`,
    }),
  }),
});

export const updateTaskPrioritySchema = z.object({
  priority: z.enum(TASK_PRIORITIES, {
    errorMap: () => ({
      message: `Invalid priority. Must be one of: ${TASK_PRIORITIES.join(", ")}`,
    }),
  }),
});

export const updateTaskDescriptionSchema = z.object({
  description: z.string().default(""),
});

export const updateTaskTitleSchema = z.object({
  title: z.string().trim().min(1, "Task title cannot be empty"),
});

export {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resetPasswordSchema,
  emailSchema,
  workspaceSchema,
  projectSchema,
  taskSchema,
  inviteMemberSchema,
  tokenSchema,
};

