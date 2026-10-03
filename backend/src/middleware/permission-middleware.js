import workspaceRepository from "../repositories/workspace.repository.js";
import projectRepository from "../repositories/project.repository.js";
import taskRepository from "../repositories/task.repository.js";
import permissionService from "../services/permission.service.js";
import { ForbiddenError, NotFoundError } from "../utils/errors.js";

/**
 * Ensures requesting user is at least a member/owner of the workspace.
 * Attaches req.workspace to request.
 */
export const checkWorkspaceMember = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    if (!workspaceId) {
      throw new NotFoundError("Workspace ID parameter missing");
    }

    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    const role = permissionService.resolveUserRole(workspace, req.user._id);
    if (!role) {
      throw new ForbiddenError("You no longer have access to this workspace");
    }

    req.workspace = workspace;
    req.userWorkspaceRole = role;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Reusable middleware generator to assert a minimum role in a workspace.
 * e.g. authorize("admin"), authorize("owner")
 */
export const authorize = (minRole = "member") => {
  return async (req, res, next) => {
    try {
      let workspace = req.workspace;
      if (!workspace && req.params.workspaceId) {
        workspace = await workspaceRepository.findById(req.params.workspaceId);
        if (!workspace) {
          throw new NotFoundError("Workspace not found");
        }
        req.workspace = workspace;
      }

      if (!workspace) {
        throw new ForbiddenError("No workspace context available for authorization");
      }

      const role = permissionService.assertMinRole(workspace, req.user._id, minRole);
      req.userWorkspaceRole = role;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Ensures user has access to project.
 * Attaches req.project and req.workspace to request.
 */
export const checkProjectMember = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await projectRepository.findById(projectId);

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    const workspace = await workspaceRepository.findById(project.workspace);
    if (!workspace) {
      throw new NotFoundError("Associated workspace not found");
    }

    const role = permissionService.resolveUserRole(workspace, req.user._id);
    const isMember = project.members.some(
      (m) => (m._id || m).toString() === req.user._id.toString()
    );
    const isCreator = project.createdBy?._id
      ? project.createdBy._id.toString() === req.user._id.toString()
      : project.createdBy.toString() === req.user._id.toString();

    if (!role && !isMember && !isCreator) {
      throw new ForbiddenError("You no longer have access to this project");
    }

    req.project = project;
    req.workspace = workspace;
    req.userWorkspaceRole = role;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Ensures user has access to task.
 * Attaches req.task, req.project, and req.workspace to request.
 */
export const checkTaskMember = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    const project = await projectRepository.findById(task.project);
    if (!project) {
      throw new NotFoundError("Associated project not found");
    }

    const workspace = await workspaceRepository.findById(project.workspace);
    if (!workspace) {
      throw new NotFoundError("Associated workspace not found");
    }

    const role = permissionService.resolveUserRole(workspace, req.user._id);
    const isMember = project.members.some(
      (m) => (m._id || m).toString() === req.user._id.toString()
    );
    const isCreator = project.createdBy?._id
      ? project.createdBy._id.toString() === req.user._id.toString()
      : project.createdBy.toString() === req.user._id.toString();

    if (!role && !isMember && !isCreator) {
      throw new ForbiddenError("You no longer have access to this task");
    }

    req.task = task;
    req.project = project;
    req.workspace = workspace;
    req.userWorkspaceRole = role;
    next();
  } catch (error) {
    next(error);
  }
};
