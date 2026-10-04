import express from "express";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";

import {
  acceptGenerateInvite,
  acceptInviteByToken,
  createWorkspace,
  getWorkspaceDetails,
  getWorkspacePreview,
  getWorkspaceProjects,
  getWorkspaces,
  getWorkspaceStats,
  inviteUserToWorkspace,
  deleteWorkspace,
  updateWorkspace,
  removeMember,
  changeMemberRole,
  transferOwnership,
} from "../controllers/workspace.controller.js";
import {
  inviteMemberSchema,
  objectIdSchema,
  paginationQuerySchema,
  tokenSchema,
  workspaceSchema,
} from "../libs/validate-schema.js";
import { INVITE_ROLES } from "../constants/enums.js";
import authMiddleware from "../middleware/auth-middleware.js";
import { checkWorkspaceMember } from "../middleware/permission-middleware.js";

const router = express.Router();

// Create workspace
router.post(
  "/",
  authMiddleware,
  validateRequest({ body: workspaceSchema }),
  createWorkspace
);

// Accept invitation via token
router.post(
  "/accept-invite-token",
  authMiddleware,
  validateRequest({ body: tokenSchema }),
  acceptInviteByToken
);

// Invite member to workspace
router.post(
  "/:workspaceId/invite-member",
  authMiddleware,
  checkWorkspaceMember,
  validateRequest({
    params: z.object({ workspaceId: objectIdSchema }),
    body: inviteMemberSchema,
  }),
  inviteUserToWorkspace
);

// Join workspace via public generate link
router.post(
  "/:workspaceId/accept-generate-invite",
  authMiddleware,
  validateRequest({ params: z.object({ workspaceId: objectIdSchema }) }),
  acceptGenerateInvite
);

// Change member role: Changed from POST to PATCH
router.patch(
  "/:workspaceId/change-member-role/:memberId",
  authMiddleware,
  checkWorkspaceMember,
  validateRequest({
    params: z.object({
      workspaceId: objectIdSchema,
      memberId: objectIdSchema,
    }),
    body: z.object({
      role: z.enum(INVITE_ROLES, {
        errorMap: () => ({
          message: `Role must be one of: ${INVITE_ROLES.join(", ")}`,
        }),
      }),
    }),
  }),
  changeMemberRole
);

// Remove member from workspace: Changed from POST to DELETE
router.delete(
  "/:workspaceId/remove-member/:memberId",
  authMiddleware,
  checkWorkspaceMember,
  validateRequest({
    params: z.object({
      workspaceId: objectIdSchema,
      memberId: objectIdSchema,
    }),
  }),
  removeMember
);

// Transfer workspace ownership: Changed from POST to PATCH
router.patch(
  "/:workspaceId/transfer-ownership",
  authMiddleware,
  checkWorkspaceMember,
  validateRequest({
    params: z.object({ workspaceId: objectIdSchema }),
    body: z.object({ newOwnerId: objectIdSchema }),
  }),
  transferOwnership
);

// Query all user workspaces
router.get(
  "/",
  authMiddleware,
  validateRequest({ query: paginationQuerySchema }),
  getWorkspaces
);

// Get workspace preview for invitations
router.get(
  "/:workspaceId/preview",
  authMiddleware,
  validateRequest({ params: z.object({ workspaceId: objectIdSchema }) }),
  getWorkspacePreview
);

// Get workspace details
router.get(
  "/:workspaceId",
  authMiddleware,
  checkWorkspaceMember,
  validateRequest({ params: z.object({ workspaceId: objectIdSchema }) }),
  getWorkspaceDetails
);

// Get workspace projects with pagination support
router.get(
  "/:workspaceId/projects",
  authMiddleware,
  checkWorkspaceMember,
  validateRequest({
    params: z.object({ workspaceId: objectIdSchema }),
    query: paginationQuerySchema,
  }),
  getWorkspaceProjects
);

// Get workspace statistics
router.get(
  "/:workspaceId/stats",
  authMiddleware,
  checkWorkspaceMember,
  validateRequest({ params: z.object({ workspaceId: objectIdSchema }) }),
  getWorkspaceStats
);

// Update workspace: Supports both PATCH and PUT
const updateWorkspaceHandler = [
  authMiddleware,
  checkWorkspaceMember,
  validateRequest({
    params: z.object({ workspaceId: objectIdSchema }),
    body: workspaceSchema.partial(),
  }),
  updateWorkspace,
];
router.patch("/:workspaceId", ...updateWorkspaceHandler);
router.put("/:workspaceId", ...updateWorkspaceHandler);

// Delete workspace
router.delete(
  "/:workspaceId",
  authMiddleware,
  checkWorkspaceMember,
  validateRequest({ params: z.object({ workspaceId: objectIdSchema }) }),
  deleteWorkspace
);

export default router;
