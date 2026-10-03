import workspaceService from "../services/workspace.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const createWorkspace = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.createWorkspace(req.body, req.user._id);
  res.status(201).json(workspace);
});

export const getWorkspaces = asyncHandler(async (req, res) => {
  const result = await workspaceService.getWorkspaces(req.user._id, req.query);
  res.setHeader("X-Total-Count", result.pagination.total);
  res.setHeader("X-Page", result.pagination.page);
  res.setHeader("X-Limit", result.pagination.limit);
  res.setHeader("X-Total-Pages", result.pagination.totalPages);

  if (req.query.paginated === "true") {
    res.status(200).json(result);
  } else {
    res.status(200).json(result.workspaces);
  }
});

export const getWorkspaceDetails = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.getWorkspaceDetails(req.params.workspaceId);
  res.status(200).json(workspace);
});

export const getWorkspaceProjects = asyncHandler(async (req, res) => {
  const result = await workspaceService.getWorkspaceProjects(
    req.params.workspaceId,
    req.user._id,
    req.query
  );
  res.setHeader("X-Total-Count", result.pagination.total);
  res.setHeader("X-Page", result.pagination.page);
  res.setHeader("X-Limit", result.pagination.limit);
  res.setHeader("X-Total-Pages", result.pagination.totalPages);

  if (req.query.paginated === "true") {
    res.status(200).json(result);
  } else {
    res.status(200).json({
      projects: result.projects,
      workspace: result.workspace,
    });
  }
});

export const getWorkspaceStats = asyncHandler(async (req, res) => {
  const stats = await workspaceService.getWorkspaceStats(req.params.workspaceId, req.user._id);
  res.status(200).json(stats);
});

export const updateWorkspace = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.updateWorkspace(
    req.params.workspaceId,
    req.user._id,
    req.body
  );
  res.status(200).json(workspace);
});

export const deleteWorkspace = asyncHandler(async (req, res) => {
  const result = await workspaceService.deleteWorkspace(req.params.workspaceId, req.user._id);
  res.status(200).json(result);
});

export const inviteUserToWorkspace = asyncHandler(async (req, res) => {
  const result = await workspaceService.inviteUserToWorkspace(
    req.params.workspaceId,
    req.user._id,
    req.body
  );
  res.status(200).json(result);
});

export const acceptGenerateInvite = asyncHandler(async (req, res) => {
  const result = await workspaceService.acceptGenerateInvite(req.params.workspaceId, req.user._id);
  res.status(200).json(result);
});

export const acceptInviteByToken = asyncHandler(async (req, res) => {
  const result = await workspaceService.acceptInviteByToken(req.body.token, req.user);
  res.status(200).json(result);
});

export const removeMember = asyncHandler(async (req, res) => {
  const result = await workspaceService.removeMember(
    req.params.workspaceId,
    req.user._id,
    req.params.memberId
  );
  res.status(200).json(result);
});

export const changeMemberRole = asyncHandler(async (req, res) => {
  const result = await workspaceService.changeMemberRole(
    req.params.workspaceId,
    req.user._id,
    req.params.memberId,
    req.body.role
  );
  res.status(200).json(result);
});

export const transferOwnership = asyncHandler(async (req, res) => {
  const result = await workspaceService.transferOwnership(
    req.params.workspaceId,
    req.user._id,
    req.body.newOwnerId
  );
  res.status(200).json(result);
});

export default {
  createWorkspace,
  getWorkspaces,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getWorkspaceStats,
  updateWorkspace,
  deleteWorkspace,
  inviteUserToWorkspace,
  acceptGenerateInvite,
  acceptInviteByToken,
  removeMember,
  changeMemberRole,
  transferOwnership,
};
