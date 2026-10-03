import { z } from "zod";

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

const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member", "viewer"]),
});

const tokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

const workspaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().min(1, "Color is required"),
});

const projectSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  status: z.enum([
    "Planning",
    "In Progress",
    "On Hold",
    "Completed",
    "Cancelled",
  ]),
  startDate: z.string(),
  dueDate: z.string().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  members: z.array(z.string()).optional(),
});

const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  status: z.enum(["To Do", "In Progress", "Done"]),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.string().min(1, "Due date is required"),
  assignees: z.array(z.string()).min(1, "At least one assignee is required"),
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
