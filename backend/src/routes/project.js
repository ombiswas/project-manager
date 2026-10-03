import express from "express";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";

import authMiddleware from "../middleware/auth-middleware.js";
import { checkProjectMember } from "../middleware/permission-middleware.js";
import {
  objectIdSchema,
  paginationQuerySchema,
  projectSchema,
} from "../libs/validate-schema.js";
import {
  createProject,
  getProjectDetails,
  getProjectTasks,
  deleteProject,
  updateProject,
} from "../controllers/project.controller.js";

const router = express.Router();

// Create project in workspace
router.post(
  "/:workspaceId/create-project",
  authMiddleware,
  validateRequest({
    params: z.object({
      workspaceId: objectIdSchema,
    }),
    body: projectSchema,
  }),
  createProject
);

// Get project details
router.get(
  "/:projectId",
  authMiddleware,
  checkProjectMember,
  validateRequest({
    params: z.object({ projectId: objectIdSchema }),
  }),
  getProjectDetails
);

// Get project tasks with pagination/filter query support
router.get(
  "/:projectId/tasks",
  authMiddleware,
  checkProjectMember,
  validateRequest({
    params: z.object({ projectId: objectIdSchema }),
    query: paginationQuerySchema,
  }),
  getProjectTasks
);

// Update project: Supports both PATCH and PUT
const updateProjectHandler = [
  authMiddleware,
  checkProjectMember,
  validateRequest({
    params: z.object({ projectId: objectIdSchema }),
    body: projectSchema.partial(),
  }),
  updateProject,
];
router.patch("/:projectId", ...updateProjectHandler);
router.put("/:projectId", ...updateProjectHandler);

// Delete project
router.delete(
  "/:projectId",
  authMiddleware,
  checkProjectMember,
  validateRequest({
    params: z.object({ projectId: objectIdSchema }),
  }),
  deleteProject
);

export default router;
