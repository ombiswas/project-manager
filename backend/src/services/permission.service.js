import { ForbiddenError } from "../utils/errors.js";

export const ROLE_HIERARCHY = {
  viewer: 1,
  member: 2,
  admin: 3,
  owner: 4,
};

class PermissionService {
  /**
   * Resolves the user's role in a given workspace document.
   *
   * @param {Object} workspace - Workspace document or object
   * @param {string|ObjectId} userId - Requesting user ID
   * @returns {"owner" | "admin" | "member" | "viewer" | null}
   */
  resolveUserRole(workspace, userId) {
    if (!workspace || !userId) return null;
    const userIdStr = userId.toString();

    // Check workspace owner first
    if (workspace.owner && workspace.owner.toString() === userIdStr) {
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
   * Evaluates if requester can modify/manage tasks based on workspace hierarchy.
   * Owners and admins have full access.
   * Viewers cannot modify.
   * Members can modify unless the creator is an admin or owner.
   *
   * @param {string} requesterRole
   * @param {string} creatorRole
   * @returns {boolean}
   */
  canManageTask(requesterRole, creatorRole = "member") {
    if (!requesterRole || requesterRole === "viewer") {
      return false;
    }
    if (requesterRole === "owner" || requesterRole === "admin") {
      return true;
    }
    if (requesterRole === "member") {
      if (creatorRole === "admin" || creatorRole === "owner") {
        return false;
      }
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
