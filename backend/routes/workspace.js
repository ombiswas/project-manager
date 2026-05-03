import express from "express";
import { validateRequest } from "zod-express-middleware";
import {
  acceptGenerateInvite,
  acceptInviteByToken,
  createWorkspace,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getWorkspaces,
  getWorkspaceStats,
  inviteUserToWorkspace,
  deleteWorkspace,
  updateWorkspace,
} from "../controllers/workspace.js";
import {
  inviteMemberSchema,
  tokenSchema,
  workspaceSchema,
} from "../libs/validate-schema.js";
import authMiddleware from "../middleware/auth-middleware.js";
import { checkWorkspaceMember } from "../middleware/permission-middleware.js";
import { z } from "zod";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validateRequest({ body: workspaceSchema }),
  createWorkspace
);

router.post(
  "/accept-invite-token",
  authMiddleware,
  validateRequest({ body: tokenSchema }),
  acceptInviteByToken
);

router.post(
  "/:workspaceId/invite-member",
  authMiddleware,
  checkWorkspaceMember,
  validateRequest({
    params: z.object({ workspaceId: z.string() }),
    body: inviteMemberSchema,
  }),
  inviteUserToWorkspace
);

router.post(
  "/:workspaceId/accept-generate-invite",
  authMiddleware,
  validateRequest({ params: z.object({ workspaceId: z.string() }) }),
  acceptGenerateInvite
);

router.get("/", authMiddleware, getWorkspaces);

router.get("/:workspaceId", authMiddleware, checkWorkspaceMember, getWorkspaceDetails);
router.get("/:workspaceId/projects", authMiddleware, checkWorkspaceMember, getWorkspaceProjects);
router.get("/:workspaceId/stats", authMiddleware, checkWorkspaceMember, getWorkspaceStats);

router.put(
  "/:workspaceId",
  authMiddleware,
  checkWorkspaceMember,
  validateRequest({
    params: z.object({ workspaceId: z.string() }),
    body: workspaceSchema.partial(),
  }),
  updateWorkspace
);

router.delete("/:workspaceId", authMiddleware, checkWorkspaceMember, deleteWorkspace);

export default router;
