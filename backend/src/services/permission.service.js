import workspaceRepository from "../repositories/workspace.repository.js";
import { ForbiddenError, NotFoundError } from "../utils/errors.js";

export const ROLE_HIERARCHY = {
  viewer: 1,
  member: 2,
  admin: 3,
  owner: 4,
};

class PermissionService {
  /**
   * Asserts project-level access respecting privacy:
   * - Allowed if user is project creator
   * - Allowed if user is in project.members
   * - Allowed if user is Workspace Owner or Admin
   * - Otherwise ForbiddenError (403)
   * - If project or workspace missing -> NotFoundError (404)
   */
  async assertProjectAccess(project, userId, workspace = null) {
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    if (!userId) {
      throw new ForbiddenError("User authentication required");
    }

    const userIdStr = (userId._id || userId).toString();
    const isCreator =
      (project.createdBy?._id || project.createdBy)?.toString() === userIdStr;
    const isMember = project.members?.some(
      (m) => (m._id || m)?.toString() === userIdStr
    );

    if (isCreator || isMember) {
      return true;
    }

    const ws =
      workspace || (await workspaceRepository.findById(project.workspace));
    if (!ws) {
      throw new NotFoundError("Workspace associated with project not found");
    }

    const requesterRole = this.resolveUserRole(ws, userId);
    if (requesterRole === "owner" || requesterRole === "admin") {
      return true;
    }

    throw new ForbiddenError("You are not a member of this project");
  }
  /**
   * Resolves the user's role in a given workspace document.
   *
   * @param {Object} workspace - Workspace document or object
   * @param {string|ObjectId} userId - Requesting user ID
   * @returns {"owner" | "admin" | "member" | "viewer" | null}
   */
  resolveUserRole(workspace, userId) {
    if (!workspace || !userId) return null;
    const userIdStr = (userId._id || userId).toString();

    // Check workspace owner first
    const ownerId = (workspace.owner?._id || workspace.owner)?.toString();
    if (ownerId && ownerId === userIdStr) {
      return "owner";
    }

    // Check workspace members
    if (Array.isArray(workspace.members)) {
      const memberInfo = workspace.members.find((m) => {
        const memberUserId = m.user?._id || m.user;
        return memberUserId && memberUserId.toString() === userIdStr;
      });
      if (memberInfo) {
        return memberInfo.role || "member";
      }
    }

    return null;
  }

  /**
   * Evaluates if requester can modify/manage tasks in a workspace project.
   * Owners, admins, and members have task collaboration access (create, edit, subtasks, comments).
   * Viewers have read-only access and cannot modify tasks.
   *
   * @param {string} requesterRole
   * @param {string} [creatorRole="member"]
   * @returns {boolean}
   */
  canManageTask(requesterRole, creatorRole = "member") {
    if (!requesterRole || requesterRole === "viewer") {
      return false;
    }
    if (
      requesterRole === "owner" ||
      requesterRole === "admin" ||
      requesterRole === "member"
    ) {
      return true;
    }
    return false;
  }

  /**
   * Enforces that a user has at least the minimum role in a workspace.
   *
   * @param {Object} workspace
   * @param {string|ObjectId} userId
   * @param {"viewer" | "member" | "admin" | "owner"} minRole
   * @throws {ForbiddenError} if role requirements are not met
   */
  assertMinRole(workspace, userId, minRole = "member") {
    const role = this.resolveUserRole(workspace, userId);
    if (!role) {
      throw new ForbiddenError("You are not a member of this workspace");
    }

    const currentLevel = ROLE_HIERARCHY[role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

    if (currentLevel < requiredLevel) {
      throw new ForbiddenError(
        `You need at least '${minRole}' role to perform this action`
      );
    }

    return role;
  }

  /**
   * Validates task modification permission given workspace, requesterId, and project/creatorId.
   */
  assertTaskManagementPermission(workspace, requesterId, projectCreatorId) {
    const requesterRole = this.resolveUserRole(workspace, requesterId);
    if (!requesterRole) {
      throw new ForbiddenError("You are not a member of this workspace");
    }
    if (requesterRole === "viewer") {
      throw new ForbiddenError("Viewers cannot modify tasks");
    }

    const creatorRole = projectCreatorId
      ? this.resolveUserRole(workspace, projectCreatorId) || "member"
      : "member";

    if (!this.canManageTask(requesterRole, creatorRole)) {
      throw new ForbiddenError(
        "You do not have permission to modify tasks in this project."
      );
    }

    return { requesterRole, creatorRole };
  }
}

export default new PermissionService();
