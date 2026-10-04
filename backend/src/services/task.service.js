import taskRepository from "../repositories/task.repository.js";
import projectRepository from "../repositories/project.repository.js";
import workspaceRepository from "../repositories/workspace.repository.js";
import commentRepository from "../repositories/comment.repository.js";
import activityRepository from "../repositories/activity.repository.js";
import permissionService from "./permission.service.js";
import { recordActivity } from "../utils/activity.js";
import { withTransaction } from "../utils/transaction.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../utils/errors.js";

class TaskService {
  async _resolveTaskContext(taskId, userId) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }

    const project = await projectRepository.findById(task.project);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    const workspace = await workspaceRepository.findById(project.workspace);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    // Enforce project-level privacy
    await permissionService.assertProjectAccess(project, userId, workspace);

    permissionService.assertTaskManagementPermission(
      workspace,
      userId,
      project.createdBy
    );

    return { task, project, workspace };
  }

  _assertAssigneesAreWorkspaceMembers(workspace, assignees = []) {
    if (!assignees || assignees.length === 0) return;
    const memberIdSet = new Set(
      (workspace.members || []).map((m) => (m.user?._id || m.user).toString())
    );
    if (workspace.owner) {
      memberIdSet.add((workspace.owner._id || workspace.owner).toString());
    }

    for (const assignee of assignees) {
      const assigneeId = (assignee?._id || assignee).toString();
      if (!memberIdSet.has(assigneeId)) {
        throw new BadRequestError(
          `Cannot assign task to user ${assigneeId} who is not a member of this workspace`
        );
      }
    }
  }

  async createTask(projectId, userId, taskData) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    const workspace = await workspaceRepository.findById(project.workspace);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    // Enforce project-level privacy
    await permissionService.assertProjectAccess(project, userId, workspace);

    permissionService.assertTaskManagementPermission(
      workspace,
      userId,
      project.createdBy
    );

    const { title, description, status, priority, dueDate, assignees } =
      taskData;

    // Edge case: Assigning task to a non-member
    this._assertAssigneesAreWorkspaceMembers(workspace, assignees);

    // Edge case: Date sanity
    if (dueDate && isNaN(new Date(dueDate).getTime())) {
      throw new BadRequestError("Invalid due date format");
    }

    return await withTransaction(async (session) => {
      const task = await taskRepository.create(
        {
          title,
          description:
            typeof description === "string" ? description.trim() : "",
          status: status || "To Do",
          priority: priority || "Medium",
          dueDate,
          assignees: assignees || [],
          project: projectId,
          createdBy: userId,
        },
        session
      );

      await recordActivity(
        userId,
        "created_task",
        "Task",
        task._id,
        {
          description: `Created task "${title}"`,
        },
        session
      );

      return task;
    });
  }

  async getTaskById(taskId, userId = null) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }
    const project = await projectRepository.findById(task.project);
    if (!project) {
      throw new NotFoundError("Associated project not found");
    }
    if (userId) {
      await permissionService.assertProjectAccess(project, userId);
    }
    return { task, project };
  }

  async updateTaskTitle(taskId, userId, title) {
    await this._resolveTaskContext(taskId, userId);
    const updated = await taskRepository.updateById(taskId, {
      title: title.trim(),
    });

    await recordActivity(userId, "updated_task", "Task", taskId, {
      description: `updated task title to "${title}"`,
    });

    return updated;
  }

  async updateTaskDescription(taskId, userId, description) {
    const { task } = await this._resolveTaskContext(taskId, userId);
    const cleanDescription =
      typeof description === "string" ? description.trim() : "";
    const oldDescText = task.description || "";

    const oldSnippet =
      oldDescText.length > 0
        ? oldDescText.substring(0, 50) + (oldDescText.length > 50 ? "..." : "")
        : "(empty)";
    const newSnippet =
      cleanDescription.length > 0
        ? cleanDescription.substring(0, 50) +
          (cleanDescription.length > 50 ? "..." : "")
        : "(empty)";

    const updated = await taskRepository.updateById(taskId, {
      description: cleanDescription,
    });

    await recordActivity(userId, "updated_task", "Task", taskId, {
      description: `updated task description from "${oldSnippet}" to "${newSnippet}"`,
    });

    return updated;
  }

  async updateTaskStatus(taskId, userId, status) {
    await this._resolveTaskContext(taskId, userId);
    const updateData = { status };
    if (status === "Done") {
      updateData.completedAt = new Date();
    }

    const updated = await taskRepository.updateById(taskId, updateData);

    await recordActivity(userId, "updated_task", "Task", taskId, {
      description: `updated task status to "${status}"`,
    });

    return updated;
  }

  async updateTaskPriority(taskId, userId, priority) {
    await this._resolveTaskContext(taskId, userId);
    const updated = await taskRepository.updateById(taskId, { priority });

    await recordActivity(userId, "updated_task", "Task", taskId, {
      description: `updated task priority to "${priority}"`,
    });

    return updated;
  }

  async updateTaskAssignees(taskId, userId, assignees) {
    const { workspace } = await this._resolveTaskContext(taskId, userId);

    // Edge case: Assigning task to a non-member
    this._assertAssigneesAreWorkspaceMembers(workspace, assignees);

    const updated = await taskRepository.updateById(taskId, { assignees });

    await recordActivity(userId, "updated_task", "Task", taskId, {
      description: `updated task assignees`,
    });

    return updated;
  }

  async addSubTask(taskId, userId, title) {
    const { task } = await this._resolveTaskContext(taskId, userId);
    const newSubTask = {
      title: title.trim(),
      completed: false,
      createdAt: new Date(),
    };

    if (!Array.isArray(task.subtasks)) {
      task.subtasks = [];
    }
    task.subtasks.push(newSubTask);
    await task.save();

    await recordActivity(userId, "created_subtask", "Task", taskId, {
      description: `created subtask ${title}`,
    });

    return await taskRepository.findById(taskId);
  }

  async updateSubTask(taskId, subTaskId, userId, completed) {
    const { task } = await this._resolveTaskContext(taskId, userId);

    if (!Array.isArray(task.subtasks)) {
      task.subtasks = [];
    }
    const subTask = task.subtasks.find((st) => st._id.toString() === subTaskId);
    if (!subTask) {
      throw new NotFoundError("Subtask not found");
    }

    subTask.completed = completed;
    await task.save();

    await recordActivity(userId, "updated_subtask", "Task", taskId, {
      description: `updated subtask ${subTask.title}`,
    });

    return await taskRepository.findById(taskId);
  }

  async addComment(taskId, userId, text) {
    await this._resolveTaskContext(taskId, userId);

    return await withTransaction(async (session) => {
      const comment = await commentRepository.create(
        {
          text: text.trim(),
          task: taskId,
          author: userId,
        },
        session
      );

      const snippet = text.substring(0, 50) + (text.length > 50 ? "..." : "");
      await recordActivity(
        userId,
        "added_comment",
        "Task",
        taskId,
        {
          description: `added comment ${snippet}`,
        },
        session
      );

      return comment;
    });
  }

  async watchTask(taskId, userId) {
    const { task } = await this._resolveTaskContext(taskId, userId);
    const userIdStr = userId.toString();
    const isWatching = task.watchers.some(
      (w) => (w._id || w).toString() === userIdStr
    );

    if (!isWatching) {
      task.watchers.push(userId);
    } else {
      task.watchers = task.watchers.filter(
        (w) => (w._id || w).toString() !== userIdStr
      );
    }
    await task.save();

    await recordActivity(userId, "updated_task", "Task", taskId, {
      description: `${isWatching ? "stopped watching" : "started watching"} task ${task.title}`,
    });

    return task;
  }

  async achievedTask(taskId, userId) {
    const { task } = await this._resolveTaskContext(taskId, userId);
    const isAchieved = task.isArchived;

    task.isArchived = !isAchieved;
    await task.save();

    await recordActivity(userId, "updated_task", "Task", taskId, {
      description: `${isAchieved ? "unachieved" : "achieved"} task ${task.title}`,
    });

    return task;
  }

  async getMyTasks(userId, query = {}) {
    const {
      page = 1,
      limit = 50,
      search,
      status,
      priority,
      sortBy,
      sortOrder,
    } = query;
    const { tasks, total } = await taskRepository.findMyTasks(userId, {
      page: Number(page) || 1,
      limit: Number(limit) || 50,
      search,
      status,
      priority,
      sortBy,
      sortOrder,
    });

    return {
      tasks,
      pagination: {
        total,
        page: Number(page) || 1,
        limit: Number(limit) || 50,
        totalPages: Math.ceil(total / (Number(limit) || 50)),
      },
    };
  }

  async getArchivedTasks(userId, query = {}) {
    const {
      page = 1,
      limit = 50,
      search,
      status,
      priority,
      sortBy,
      sortOrder,
    } = query;
    const { tasks, total } = await taskRepository.findArchivedTasks(userId, {
      page: Number(page) || 1,
      limit: Number(limit) || 50,
      search,
      status,
      priority,
      sortBy,
      sortOrder,
    });

    return {
      tasks,
      pagination: {
        total,
        page: Number(page) || 1,
        limit: Number(limit) || 50,
        totalPages: Math.ceil(total / (Number(limit) || 50)),
      },
    };
  }

  async getActivityByResourceId(resourceId, userId = null, query = {}) {
    let currentUserId = userId;
    let currentQuery = query;
    if (
      typeof userId === "object" &&
      userId !== null &&
      !userId._id &&
      (userId.page || userId.limit)
    ) {
      currentQuery = userId;
      currentUserId = null;
    }

    // Resolve resource (task, project, or workspace) from ID and apply matching access check
    let resourceFound = false;

    // 1. Try finding as Task
    const task = await taskRepository.findById(resourceId);
    if (task) {
      resourceFound = true;
      const project = await projectRepository.findById(task.project);
      if (!project) {
        throw new NotFoundError("Associated project not found");
      }
      if (currentUserId) {
        await permissionService.assertProjectAccess(project, currentUserId);
      }
    }

    // 2. Try finding as Project
    if (!resourceFound) {
      const project = await projectRepository.findById(resourceId);
      if (project) {
        resourceFound = true;
        if (currentUserId) {
          await permissionService.assertProjectAccess(project, currentUserId);
        }
      }
    }

    // 3. Try finding as Workspace
    if (!resourceFound) {
      const workspace = await workspaceRepository.findById(resourceId);
      if (workspace) {
        resourceFound = true;
        if (currentUserId) {
          const role = permissionService.resolveUserRole(
            workspace,
            currentUserId
          );
          if (!role) {
            throw new ForbiddenError("You are not a member of this workspace");
          }
        }
      }
    }

    if (!resourceFound) {
      throw new NotFoundError("Resource not found");
    }

    const { page = 1, limit = 20 } = currentQuery;
    const { logs, total } = await activityRepository.findByResourceId(
      resourceId,
      {
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      }
    );

    return {
      logs,
      pagination: {
        total,
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        totalPages: Math.ceil(total / (Number(limit) || 20)),
      },
    };
  }

  async getCommentsByTaskId(taskId, userId = null, query = {}) {
    let currentUserId = userId;
    let currentQuery = query;
    if (
      typeof userId === "object" &&
      userId !== null &&
      !userId._id &&
      (userId.page || userId.limit)
    ) {
      currentQuery = userId;
      currentUserId = null;
    }

    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }
    const project = await projectRepository.findById(task.project);
    if (!project) {
      throw new NotFoundError("Associated project not found");
    }
    if (currentUserId) {
      await permissionService.assertProjectAccess(project, currentUserId);
    }

    const { page = 1, limit = 50 } = currentQuery;
    const { comments, total } = await commentRepository.findByTaskId(taskId, {
      page: Number(page) || 1,
      limit: Number(limit) || 50,
    });

    return {
      comments,
      pagination: {
        total,
        page: Number(page) || 1,
        limit: Number(limit) || 50,
        totalPages: Math.ceil(total / (Number(limit) || 50)),
      },
    };
  }

  async deleteTask(taskId, userId) {
    const { project } = await this._resolveTaskContext(taskId, userId);

    return await withTransaction(async (session) => {
      // Cascade delete comments and activity logs for this task
      await commentRepository.deleteManyByTask(taskId, session);
      await activityRepository.deleteManyByResourceIds([taskId], session);
      await taskRepository.deleteById(taskId, session);

      return {
        message: "Task deleted successfully",
        projectId: project._id,
      };
    });
  }
}

export default new TaskService();
