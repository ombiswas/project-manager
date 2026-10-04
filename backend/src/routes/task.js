import express from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";

import {
  objectIdSchema,
  paginationQuerySchema,
  taskSchema,
  updateTaskDescriptionSchema,
  updateTaskPrioritySchema,
  updateTaskStatusSchema,
  updateTaskTitleSchema,
} from "../libs/validate-schema.js";
import {
  achievedTask,
  addComment,
  addSubTask,
  createTask,
  getActivityByResourceId,
  getCommentsByTaskId,
  getMyTasks,
  getArchivedTasks,
  getTaskById,
  updateSubTask,
  updateTaskAssignees,
  updateTaskDescription,
  updateTaskPriority,
  updateTaskStatus,
  updateTaskTitle,
  watchTask,
  deleteTask,
} from "../controllers/task.controller.js";
import authMiddleware from "../middleware/auth-middleware.js";
import { checkTaskMember } from "../middleware/permission-middleware.js";

const router = express.Router();

// Create task in project
router.post(
  "/:projectId/create-task",
  authMiddleware,
  validateRequest({
    params: z.object({
      projectId: objectIdSchema,
    }),
    body: taskSchema,
  }),
  createTask
);

// Add subtask to task
router.post(
  "/:taskId/add-subtask",
  authMiddleware,
  checkTaskMember,
  validateRequest({
    params: z.object({ taskId: objectIdSchema }),
    body: z.object({
      title: z.string().trim().min(1, "Subtask title is required"),
    }),
  }),
  addSubTask
);

// Add comment to task
router.post(
  "/:taskId/add-comment",
  authMiddleware,
  checkTaskMember,
  validateRequest({
    params: z.object({ taskId: objectIdSchema }),
    body: z.object({
      text: z.string().trim().min(1, "Comment text is required"),
    }),
  }),
  addComment
);

// Toggle watch task
router.post(
  "/:taskId/watch",
  authMiddleware,
  checkTaskMember,
  validateRequest({
    params: z.object({ taskId: objectIdSchema }),
  }),
  watchTask
);

// Archive/unarchive task: Changed from POST to PATCH (with POST alias)
const archiveTaskHandler = [
  authMiddleware,
  checkTaskMember,
  validateRequest({
    params: z.object({ taskId: objectIdSchema }),
  }),
  achievedTask,
];
router.patch("/:taskId/achieved", ...archiveTaskHandler);
router.post("/:taskId/achieved", ...archiveTaskHandler);

// Update subtask: Supports PATCH and PUT
const updateSubTaskHandler = [
  authMiddleware,
  checkTaskMember,
  validateRequest({
    params: z.object({
      taskId: objectIdSchema,
      subTaskId: objectIdSchema,
    }),
    body: z.object({ completed: z.boolean() }),
  }),
  updateSubTask,
];
router.patch("/:taskId/update-subtask/:subTaskId", ...updateSubTaskHandler);
router.put("/:taskId/update-subtask/:subTaskId", ...updateSubTaskHandler);

// Update task title: Supports PATCH and PUT
const updateTitleHandler = [
  authMiddleware,
  checkTaskMember,
  validateRequest({
    params: z.object({ taskId: objectIdSchema }),
    body: updateTaskTitleSchema,
  }),
  updateTaskTitle,
];
router.patch("/:taskId/title", ...updateTitleHandler);
router.put("/:taskId/title", ...updateTitleHandler);

// Update task description: Supports PATCH and PUT
const updateDescriptionHandler = [
  authMiddleware,
  checkTaskMember,
  validateRequest({
    params: z.object({ taskId: objectIdSchema }),
    body: updateTaskDescriptionSchema,
  }),
  updateTaskDescription,
];
router.patch("/:taskId/description", ...updateDescriptionHandler);
router.put("/:taskId/description", ...updateDescriptionHandler);

// Update task status with validated enum: Supports PATCH and PUT
const updateStatusHandler = [
  authMiddleware,
  checkTaskMember,
  validateRequest({
    params: z.object({ taskId: objectIdSchema }),
    body: updateTaskStatusSchema,
  }),
  updateTaskStatus,
];
router.patch("/:taskId/status", ...updateStatusHandler);
router.put("/:taskId/status", ...updateStatusHandler);

// Update task priority with validated enum: Supports PATCH and PUT
const updatePriorityHandler = [
  authMiddleware,
  checkTaskMember,
  validateRequest({
    params: z.object({ taskId: objectIdSchema }),
    body: updateTaskPrioritySchema,
  }),
  updateTaskPriority,
];
router.patch("/:taskId/priority", ...updatePriorityHandler);
router.put("/:taskId/priority", ...updatePriorityHandler);

// Update task assignees: Supports PATCH and PUT
const updateAssigneesHandler = [
  authMiddleware,
  checkTaskMember,
  validateRequest({
    params: z.object({ taskId: objectIdSchema }),
    body: z.object({ assignees: z.array(objectIdSchema) }),
  }),
  updateTaskAssignees,
];
router.patch("/:taskId/assignees", ...updateAssigneesHandler);
router.put("/:taskId/assignees", ...updateAssigneesHandler);

// Get my tasks with pagination support
router.get(
  "/my-tasks",
  authMiddleware,
  validateRequest({ query: paginationQuerySchema }),
  getMyTasks
);

// Get archived tasks with pagination support
router.get(
  "/archived",
  authMiddleware,
  validateRequest({ query: paginationQuerySchema }),
  getArchivedTasks
);

// Get task details by ID
router.get(
  "/:taskId",
  authMiddleware,
  checkTaskMember,
  validateRequest({
    params: z.object({
      taskId: objectIdSchema,
    }),
  }),
  getTaskById
);

// Get resource activity audit log
router.get(
  "/:resourceId/activity",
  authMiddleware,
  validateRequest({
    params: z.object({ resourceId: objectIdSchema }),
    query: paginationQuerySchema,
  }),
  getActivityByResourceId
);

// Get task comments
router.get(
  "/:taskId/comments",
  authMiddleware,
  checkTaskMember,
  validateRequest({
    params: z.object({ taskId: objectIdSchema }),
    query: paginationQuerySchema,
  }),
  getCommentsByTaskId
);

// Delete task
router.delete(
  "/:taskId",
  authMiddleware,
  checkTaskMember,
  validateRequest({
    params: z.object({ taskId: objectIdSchema }),
  }),
  deleteTask
);

export default router;
