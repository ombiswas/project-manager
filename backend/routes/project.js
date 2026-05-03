import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import { checkProjectMember } from "../middleware/permission-middleware.js";
import { validateRequest } from "zod-express-middleware";
import { projectSchema } from "../libs/validate-schema.js";
import { z } from "zod";
import {
  createProject,
  getProjectDetails,
  getProjectTasks,
  deleteProject,
  updateProject,
} from "../controllers/project.js";

const router = express.Router();

router.post(
  "/:workspaceId/create-project",
  authMiddleware,
  validateRequest({
    params: z.object({
      workspaceId: z.string(),
    }),
    body: projectSchema,
  }),
  createProject
);

router.get(
  "/:projectId",
  authMiddleware,
  checkProjectMember,
  validateRequest({
    params: z.object({ projectId: z.string() }),
  }),
  getProjectDetails
);

router.get(
  "/:projectId/tasks",
  authMiddleware,
  checkProjectMember,
  validateRequest({ params: z.object({ projectId: z.string() }) }),
  getProjectTasks
);

router.put(
  "/:projectId",
  authMiddleware,
  checkProjectMember,
  updateProject
);

router.delete(
  "/:projectId",
  authMiddleware,
  checkProjectMember,
  validateRequest({
    params: z.object({ projectId: z.string() }),
  }),
  deleteProject
);

export default router;
