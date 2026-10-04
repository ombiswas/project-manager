import projectRepository from "../repositories/project.repository.js";
import workspaceRepository from "../repositories/workspace.repository.js";
import taskRepository from "../repositories/task.repository.js";
import commentRepository from "../repositories/comment.repository.js";
import activityRepository from "../repositories/activity.repository.js";
import permissionService from "./permission.service.js";
import { recordActivity } from "../utils/activity.js";
import { withTransaction } from "../utils/transaction.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../utils/errors.js";

class ProjectService {
  _validateProjectDates(startDate, dueDate) {
    if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
      throw new BadRequestError("Due date cannot be earlier than start date");
    }
  }

  async createProject(
    workspaceId,
    userId,
    { title, description, status, startDate, dueDate, tags, members }
  ) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    const requesterRole = permissionService.resolveUserRole(workspace, userId);
    if (!requesterRole) {
      throw new ForbiddenError("You are not a member of this workspace");
    }

    if (requesterRole !== "owner" && requesterRole !== "admin") {
      throw new ForbiddenError(
        "Only Workspace Owners and Admins can create projects"
      );
    }

    this._validateProjectDates(startDate, dueDate);

    const tagArray = Array.isArray(tags)
      ? tags
      : tags
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t !== "")
        : [];

    if (members && members.length === 0) {
      throw new BadRequestError(
        "At least one member is required for the project"
      );
    }

    const finalMembers = members ? [...members] : [];
    const userIdStr = userId.toString();
    if (!finalMembers.some((m) => (m._id || m).toString() === userIdStr)) {
      finalMembers.push(userId);
    }

    return await withTransaction(async (session) => {
      const newProject = await projectRepository.create(
        {
          title,
          description,
          status,
          startDate,
          dueDate,
          tags: tagArray,
          workspace: workspaceId,
          members: finalMembers,
          createdBy: userId,
        },
        session
      );

      await recordActivity(
        userId,
        "created_project",
        "Project",
        newProject._id,
        { description: `Created project ${title}` },
        session
      );

      return newProject;
    });
  }

  async getProjectDetails(projectId, userId) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    this._assertProjectAccess(project, userId);
    return project;
  }

  async getProjectTasks(projectId, userId, query = {}) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    this._assertProjectAccess(project, userId);

    const {
      page = 1,
      limit = 50,
      search,
      status,
      priority,
      sortBy,
      sortOrder,
    } = query;
    const { tasks, total } = await taskRepository.findByProject(projectId, {
      page: Number(page) || 1,
      limit: Number(limit) || 50,
      search,
      status,
      priority,
      sortBy,
      sortOrder,
    });

    return {
      project,
      tasks,
      pagination: {
        total,
        page: Number(page) || 1,
        limit: Number(limit) || 50,
        totalPages: Math.ceil(total / (Number(limit) || 50)),
      },
    };
  }

  async updateProject(projectId, userId, updateData) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    const workspace = await workspaceRepository.findById(project.workspace);
    if (!workspace) {
      throw new NotFoundError("Workspace associated with project not found");
    }

    const requesterRole = permissionService.resolveUserRole(workspace, userId);
    if (requesterRole !== "owner" && requesterRole !== "admin") {
      throw new ForbiddenError(
        "You do not have permission to update this project."
      );
    }

    const { title, description, status, startDate, dueDate, tags, members } =
      updateData;

    const effectiveStart =
      startDate !== undefined ? startDate : project.startDate;
    const effectiveDue = dueDate !== undefined ? dueDate : project.dueDate;
    this._validateProjectDates(effectiveStart, effectiveDue);

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (status !== undefined) updateFields.status = status;
    if (startDate !== undefined) updateFields.startDate = startDate;
    if (dueDate !== undefined) updateFields.dueDate = dueDate;

    if (tags !== undefined) {
      updateFields.tags = Array.isArray(tags)
        ? tags
        : tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t !== "");
    }

    if (members !== undefined) {
      if (members.length === 0) {
        throw new BadRequestError(
          "At least one member is required for the project"
        );
      }
      updateFields.members = members;
    }

    const updated = await projectRepository.updateById(projectId, updateFields);
    await recordActivity(userId, "updated_project", "Project", projectId, {
      description: `Updated project ${updated.title}`,
    });

    return updated;
  }

  async deleteProject(projectId, userId) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    const workspace = await workspaceRepository.findById(project.workspace);
    if (!workspace) {
      throw new NotFoundError("Workspace associated with project not found");
    }

    const requesterRole = permissionService.resolveUserRole(workspace, userId);
    if (requesterRole !== "owner" && requesterRole !== "admin") {
      throw new ForbiddenError(
        "You do not have permission to delete this project."
      );
    }

    return await withTransaction(async (session) => {
      // Find all tasks in the project to cascade delete comments & activity logs
      const taskIds = await taskRepository.findTaskIdsByProject(projectId);
      if (taskIds.length > 0) {
        await commentRepository.deleteManyByTasks(taskIds, session);
        await activityRepository.deleteManyByResourceIds(taskIds, session);
        await taskRepository.deleteManyByProject(projectId, session);
      }

      await activityRepository.deleteManyByResourceIds([projectId], session);
      await projectRepository.deleteById(projectId, session);

      return { message: "Project deleted successfully" };
    });
  }

  _assertProjectAccess(project, userId) {
    const userIdStr = userId.toString();
    const isCreator =
      (project.createdBy?._id || project.createdBy)?.toString() === userIdStr;
    const isMember = project.members?.some(
      (m) => (m._id || m)?.toString() === userIdStr
    );

    if (!isCreator && !isMember) {
      throw new ForbiddenError("You are not a member of this project");
    }
  }
}

export default new ProjectService();
