import jwt from "jsonwebtoken";

import workspaceRepository from "../repositories/workspace.repository.js";
import projectRepository from "../repositories/project.repository.js";
import taskRepository from "../repositories/task.repository.js";
import userRepository from "../repositories/user.repository.js";
import commentRepository from "../repositories/comment.repository.js";
import activityRepository from "../repositories/activity.repository.js";
import permissionService from "./permission.service.js";
import { recordActivity } from "../utils/activity.js";
import { withTransaction } from "../utils/transaction.js";
import { sendEmail } from "../libs/send-email.js";
import { env } from "../config/env.js";
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  AppError,
} from "../utils/errors.js";

class WorkspaceService {
  async createWorkspace({ name, description, color }, userId) {
    return await withTransaction(async (session) => {
      const workspace = await workspaceRepository.create(
        {
          name,
          description,
          color,
          owner: userId,
          members: [
            {
              user: userId,
              role: "owner",
              joinedAt: new Date(),
            },
          ],
        },
        session
      );

      await recordActivity(
        userId,
        "created_workspace",
        "Workspace",
        workspace._id,
        { description: `Created workspace ${name}` },
        session
      );

      return workspace;
    });
  }

  async getWorkspaces(userId, query = {}) {
    const { page = 1, limit = 50, search, sortBy, sortOrder } = query;
    const { workspaces, total } = await workspaceRepository.findWorkspacesByUser(userId, {
      page: Number(page) || 1,
      limit: Number(limit) || 50,
      search,
      sortBy,
      sortOrder,
    });

    return {
      workspaces,
      pagination: {
        total,
        page: Number(page) || 1,
        limit: Number(limit) || 50,
        totalPages: Math.ceil(total / (Number(limit) || 50)),
      },
    };
  }

  async getWorkspaceDetails(workspaceId) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }
    return workspace;
  }

  async getWorkspaceProjects(workspaceId, userId, query = {}) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    const requesterRole = permissionService.resolveUserRole(workspace, userId);
    if (!requesterRole) {
      throw new ForbiddenError("You are not a member of this workspace");
    }

    const { page = 1, limit = 50, search, status, sortBy, sortOrder } = query;
    const { projects, total } = await projectRepository.findByWorkspace(workspaceId, {
      page: Number(page) || 1,
      limit: Number(limit) || 50,
      search,
      status,
      sortBy,
      sortOrder,
    });

    // Owners and Admins can see all projects in the workspace
    // Members and Viewers can only see projects they created or are added to
    let visibleProjects = projects;
    if (requesterRole !== "owner" && requesterRole !== "admin") {
      const userIdStr = userId.toString();
      visibleProjects = projects.filter((p) => {
        const isCreator = (p.createdBy?._id || p.createdBy)?.toString() === userIdStr;
        const isMember = p.members?.some((m) => (m._id || m)?.toString() === userIdStr);
        return isCreator || isMember;
      });
    }

    return {
      projects: visibleProjects,
      workspace,
      pagination: {
        total,
        page: Number(page) || 1,
        limit: Number(limit) || 50,
        totalPages: Math.ceil(total / (Number(limit) || 50)),
      },
    };
  }

  async getWorkspaceStats(workspaceId, userId) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    const requesterRole = permissionService.resolveUserRole(workspace, userId);
    if (!requesterRole) {
      throw new ForbiddenError("You are not a member of this workspace");
    }

    const { projects } = await projectRepository.findByWorkspace(workspaceId, { limit: 500 });
    const visibleProjects = this._filterVisibleProjects(projects, requesterRole, userId);
    // BATCH QUERY: Eliminates N+1 database round-trips
    const tasks = await this._fetchTasksForProjects(visibleProjects);

    const stats = this._computeOverviewStats(visibleProjects, tasks);
    const taskTrendsData = this._computeTaskTrends(tasks);
    const projectStatusData = this._computeProjectStatusData(visibleProjects);
    const taskPriorityData = this._computeTaskPriorityData(tasks);
    const workspaceProductivityData = this._computeProductivityData(visibleProjects, tasks);
    const upcomingTasks = this._filterUpcomingTasks(tasks);

    return {
      stats,
      taskTrendsData,
      projectStatusData,
      taskPriorityData,
      workspaceProductivityData,
      upcomingTasks,
      recentProjects: visibleProjects.slice(0, 5),
    };
  }

  _filterVisibleProjects(projects, requesterRole, userId) {
    if (requesterRole === "owner" || requesterRole === "admin") {
      return projects;
    }
    const userIdStr = userId.toString();
    return projects.filter((p) => {
      const isCreator = (p.createdBy?._id || p.createdBy)?.toString() === userIdStr;
      const isMember = p.members?.some((m) => (m._id || m)?.toString() === userIdStr);
      return isCreator || isMember;
    });
  }

  async _fetchTasksForProjects(projects) {
    const projectIds = projects.map((p) => p._id);
    if (projectIds.length === 0) return [];
    // Single indexed batch query across all projects in the workspace
    return await taskRepository.findTasksByProjects(projectIds, { isArchived: false });
  }

  _computeOverviewStats(projects, tasks) {
    const totalProjects = projects.length;
    const totalTasks = tasks.length;
    const totalProjectInProgress = projects.filter((p) => p.status === "In Progress").length;
    const totalTaskCompleted = tasks.filter((t) => t.status === "Done").length;
    const totalTaskToDo = tasks.filter((t) => t.status === "To Do").length;
    const totalTaskInProgress = tasks.filter((t) => t.status === "In Progress").length;

    return {
      totalProjects,
      totalTasks,
      totalProjectInProgress,
      totalTaskCompleted,
      totalTaskToDo,
      totalTaskInProgress,
    };
  }

  _computeTaskTrends(tasks) {
    const taskTrendsData = [
      { name: "Sun", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Mon", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Tue", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Wed", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Thu", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Fri", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Sat", completed: 0, inProgress: 0, toDo: 0 },
    ];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    }).reverse();

    for (const task of tasks) {
      const taskDate = new Date(task.updatedAt || task.createdAt);
      const dayIndex = last7Days.findIndex(
        (date) =>
          date.getDate() === taskDate.getDate() &&
          date.getMonth() === taskDate.getMonth() &&
          date.getFullYear() === taskDate.getFullYear()
      );

      if (dayIndex !== -1) {
        const dayName = last7Days[dayIndex].toLocaleDateString("en-US", { weekday: "short" });
        const dayData = taskTrendsData.find((day) => day.name === dayName);
        if (dayData) {
          if (task.status === "Done") dayData.completed++;
          else if (task.status === "In Progress") dayData.inProgress++;
          else if (task.status === "To Do") dayData.toDo++;
        }
      }
    }
    return taskTrendsData;
  }

  _computeProjectStatusData(projects) {
    const data = [
      { name: "Completed", value: 0, color: "#10b981" },
      { name: "In Progress", value: 0, color: "#3b82f6" },
      { name: "Planning", value: 0, color: "#f59e0b" },
    ];
    for (const p of projects) {
      if (p.status === "Completed") data[0].value++;
      else if (p.status === "In Progress") data[1].value++;
      else if (p.status === "Planning") data[2].value++;
    }
    return data;
  }

  _computeTaskPriorityData(tasks) {
    const data = [
      { name: "High", value: 0, color: "#ef4444" },
      { name: "Medium", value: 0, color: "#f59e0b" },
      { name: "Low", value: 0, color: "#6b7280" },
    ];
    for (const t of tasks) {
      if (t.priority === "High") data[0].value++;
      else if (t.priority === "Medium") data[1].value++;
      else if (t.priority === "Low") data[2].value++;
    }
    return data;
  }

  _computeProductivityData(projects, tasks) {
    return projects.map((project) => {
      const pTasks = tasks.filter((t) => t.project?.toString() === project._id.toString());
      const completed = pTasks.filter((t) => t.status === "Done" && !t.isArchived).length;
      return {
        name: project.title,
        completed,
        total: pTasks.length,
      };
    });
  }

  _filterUpcomingTasks(tasks) {
    const today = new Date();
    const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const d = new Date(task.dueDate);
      return d > today && d <= next7Days;
    });
  }

  async updateWorkspace(workspaceId, userId, { name, description, color }) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    permissionService.assertMinRole(workspace, userId, "admin");

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (color !== undefined) updateFields.color = color;

    const updated = await workspaceRepository.updateById(workspaceId, updateFields);
    await recordActivity(userId, "updated_workspace", "Workspace", workspaceId, {
      description: `Updated workspace details`,
    });

    return updated;
  }

  async deleteWorkspace(workspaceId, userId) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    if (workspace.owner.toString() !== userId.toString()) {
      throw new ForbiddenError("Only the workspace owner can delete this workspace");
    }

    return await withTransaction(async (session) => {
      const projectIds = await projectRepository.findProjectIdsByWorkspace(workspaceId);

      // Cascading deletion ordered from children to parent to prevent orphaned records
      if (projectIds.length > 0) {
        const taskIds = await taskRepository.findTaskIdsByProjects(projectIds);
        if (taskIds.length > 0) {
          await commentRepository.deleteManyByTasks(taskIds, session);
          await activityRepository.deleteManyByResourceIds(taskIds, session);
          await taskRepository.deleteManyByProjects(projectIds, session);
        }
        await activityRepository.deleteManyByResourceIds(projectIds, session);
        await projectRepository.deleteManyByWorkspace(workspaceId, session);
      }

      await activityRepository.deleteManyByResourceIds([workspaceId], session);
      await workspaceRepository.deleteManyInvites({ workspaceId }, session);
      await workspaceRepository.deleteById(workspaceId, session);

      return { message: "Workspace deleted successfully" };
    });
  }

  async inviteUserToWorkspace(workspaceId, inviterId, { email, role }) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    permissionService.assertMinRole(workspace, inviterId, "admin");

    const existingUser = await userRepository.findByEmail(email);
    if (!existingUser) {
      throw new BadRequestError("User not found");
    }

    const isMember = workspace.members.some(
      (m) => (m.user?._id || m.user).toString() === existingUser._id.toString()
    );
    if (isMember) {
      throw new ConflictError("User is already a member of this workspace");
    }

    const isInvited = await workspaceRepository.findInvite({
      user: existingUser._id,
      workspaceId,
    });

    if (isInvited && isInvited.expiresAt > new Date()) {
      throw new ConflictError("An active invitation has already been sent to this user");
    }

    if (isInvited && isInvited.expiresAt < new Date()) {
      await workspaceRepository.deleteInvite({ _id: isInvited._id });
    }

    const inviteToken = jwt.sign(
      {
        user: existingUser._id,
        email: existingUser.email,
        workspaceId,
        role: role || "member",
      },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await workspaceRepository.createInvite({
      user: existingUser._id,
      workspaceId,
      token: inviteToken,
      role: role || "member",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const invitationLink = `${env.FRONTEND_URL}/workspace-invite/${workspace._id}?tk=${inviteToken}`;
    const emailContent = `
      <p>You have been invited to join ${workspace.name} workspace</p>
      <p>Click here to join: <a href="${invitationLink}">${invitationLink}</a></p>
    `;

    const emailSent = await sendEmail(email, "You have been invited to join a workspace", emailContent);
    if (!emailSent) {
      throw new AppError("Failed to send invitation email. Please check email configuration.", 500);
    }

    return { message: "Invitation sent successfully" };
  }

  async acceptGenerateInvite(workspaceId, userId) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    const isMember = workspace.members.some(
      (m) => (m.user?._id || m.user).toString() === userId.toString()
    );
    if (isMember) {
      throw new ConflictError("You are already a member of this workspace");
    }

    await workspaceRepository.addMember(workspaceId, { user: userId, role: "member" });
    await recordActivity(userId, "joined_workspace", "Workspace", workspaceId, {
      description: `Joined ${workspace.name} workspace`,
    });

    return { message: "Invitation accepted successfully" };
  }

  async acceptInviteByToken(token, authUser) {
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === "TokenExpiredError") {
        throw new BadRequestError("Invitation token has expired");
      }
      throw new UnauthorizedError("Invalid invitation token");
    }

    const { user, email: inviteEmail, workspaceId, role } = decoded;

    const isTargetUser =
      (user && authUser._id.toString() === user.toString()) ||
      (inviteEmail && authUser.email.toLowerCase() === inviteEmail.toLowerCase());

    if (!isTargetUser) {
      throw new ForbiddenError("This invitation was not issued to your account");
    }

    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    const isMember = workspace.members.some(
      (m) => (m.user?._id || m.user).toString() === authUser._id.toString()
    );
    if (isMember) {
      throw new ConflictError("You are already a member of this workspace");
    }

    const inviteInfo = await workspaceRepository.findInvite({
      $or: [{ token }, { user: authUser._id, workspaceId }],
    });

    if (!inviteInfo) {
      throw new NotFoundError("Invitation not found or has already been used");
    }

    if (inviteInfo.expiresAt < new Date()) {
      await workspaceRepository.deleteInvite({ _id: inviteInfo._id });
      throw new BadRequestError("Invitation has expired");
    }

    return await withTransaction(async (session) => {
      await workspaceRepository.addMember(
        workspaceId,
        { user: authUser._id, role: role || inviteInfo.role || "member" },
        session
      );

      await workspaceRepository.deleteManyInvites({ user: authUser._id, workspaceId }, session);
      await recordActivity(authUser._id, "joined_workspace", "Workspace", workspaceId, {
        description: `Joined ${workspace.name} workspace`,
      }, session);

      return { message: "Invitation accepted successfully" };
    });
  }

  async removeMember(workspaceId, requesterId, memberId) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    const isSelfRemoval = memberId.toString() === requesterId.toString();

    const targetMember = workspace.members.find(
      (m) => (m.user?._id || m.user).toString() === memberId.toString()
    );
    if (!targetMember) {
      throw new NotFoundError("Member not found in workspace");
    }

    // Edge case: Sole owner leaving
    const isOwner = targetMember.role === "owner" || workspace.owner.toString() === memberId.toString();
    if (isSelfRemoval) {
      if (isOwner) {
        const ownerCount = workspace.members.filter(m => m.role === "owner").length;
        if (ownerCount <= 1) {
          throw new ForbiddenError("Cannot leave workspace as the sole owner. Please transfer ownership or delete the workspace.");
        }
      }
    } else {
      // Admin/Owner removing another member
      permissionService.assertMinRole(workspace, requesterId, "admin");

      if (isOwner) {
        throw new ForbiddenError("Cannot remove the workspace owner");
      }
    }

    await workspaceRepository.removeMember(workspaceId, targetMember._id);
    await recordActivity(requesterId, "removed_member", "Workspace", workspaceId, {
      description: isSelfRemoval ? `Left workspace` : `Removed member from workspace`,
    });

    return { message: isSelfRemoval ? "Left workspace successfully" : "Member removed successfully" };
  }

  async changeMemberRole(workspaceId, requesterId, memberId, role) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    permissionService.assertMinRole(workspace, requesterId, "admin");

    const targetMember = workspace.members.find(
      (m) => (m.user?._id || m.user).toString() === memberId.toString()
    );
    if (!targetMember) {
      throw new NotFoundError("Member not found in workspace");
    }

    if (targetMember.role === "owner" || workspace.owner.toString() === memberId.toString()) {
      throw new ForbiddenError("Cannot change the workspace owner's role");
    }

    await workspaceRepository.updateMemberRole(workspaceId, targetMember._id, role);
    return { message: "Member role updated successfully" };
  }

  async transferOwnership(workspaceId, currentOwnerId, newOwnerId) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    if (workspace.owner.toString() !== currentOwnerId.toString()) {
      throw new ForbiddenError("Only the owner can transfer ownership");
    }

    const newOwnerMember = workspace.members.find(
      (m) => (m.user?._id || m.user).toString() === newOwnerId.toString()
    );
    if (!newOwnerMember) {
      throw new BadRequestError("New owner must be a member of the workspace");
    }

    return await withTransaction(async (session) => {
      const currentOwnerMember = workspace.members.find(m => (m.user?._id || m.user).toString() === currentOwnerId.toString());
      if (currentOwnerMember) {
        await workspaceRepository.updateMemberRole(workspaceId, currentOwnerMember._id, "admin", session);
      }
      await workspaceRepository.updateMemberRole(workspaceId, newOwnerMember._id, "owner", session);
      await workspaceRepository.transferOwnership(workspaceId, newOwnerId, session);

      await recordActivity(currentOwnerId, "transferred_workspace_ownership", "Workspace", workspaceId, {
        description: `Transferred ownership of workspace`,
      }, session);

      return { message: "Ownership transferred successfully" };
    });
  }
}

export default new WorkspaceService();
