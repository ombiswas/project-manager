import taskRepository from "../repositories/task.repository.js";
import projectRepository from "../repositories/project.repository.js";
import workspaceRepository from "../repositories/workspace.repository.js";
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

    permissionService.assertTaskManagementPermission(workspace, userId, project.createdBy);

    return { task, project, workspace };
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

    permissionService.assertTaskManagementPermission(workspace, userId, project.createdBy);

    const { title, description, status, priority, dueDate, assignees } = taskData;

    return await withTransaction(async (session) => {
      const task = await taskRepository.create(
        {
          title,
          description: typeof description === "string" ? description.trim() : "",
          status: status || "To Do",
          priority: priority || "Medium",
          dueDate,
          assignees: assignees || [],
          project: projectId,
          createdBy: userId,
        },
        session
      );

      await projectRepository.addTaskToProject(projectId, task._id, session);
      await recordActivity(userId, "created_task", "Task", task._id, {
        description: `Created task "${title}"`,
      }, session);

      return task;
    });
  }

  async getTaskById(taskId) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }
    return task;
  }

  async updateTaskTitle(taskId, userId, title) {
    const { task } = await this._resolveTaskContext(taskId, userId);
    const updated = await taskRepository.updateById(taskId, { title: title.trim() });

    await recordActivity(userId, "updated_task", "Task", taskId, {
      description: `updated task title to "${title}"`,
    });

    return updated;
  }

  async updateTaskDescription(taskId, userId, description) {
    const { task } = await this._resolveTaskContext(taskId, userId);
    const cleanDescription = typeof description === "string" ? description.trim() : "";
    const oldDescText = task.description || "";

    const oldSnippet = oldDescText.length > 0
      ? oldDescText.substring(0, 50) + (oldDescText.length > 50 ? "..." : "")
      : "(empty)";
    const newSnippet = cleanDescription.length > 0
      ? cleanDescription.substring(0, 50) + (cleanDescription.length > 50 ? "..." : "")
      : "(empty)";

    const updated = await taskRepository.updateById(taskId, { description: cleanDescription });

    await recordActivity(userId, "updated_task", "Task", taskId, {
      description: `updated task description from "${oldSnippet}" to "${newSnippet}"`,
    });

    return updated;
  }

  async updateTaskStatus(taskId, userId, status) {
    const { task } = await this._resolveTaskContext(taskId, userId);
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
    const { task } = await this._resolveTaskContext(taskId, userId);
    const updated = await taskRepository.updateById(taskId, { priority });

    await recordActivity(userId, "updated_task", "Task", taskId, {
      description: `updated task priority to "${priority}"`,
    });

    return updated;
  }

  async updateTaskAssignees(taskId, userId, assignees) {
    const { task } = await this._resolveTaskContext(taskId, userId);
    const updated = await taskRepository.updateById(taskId, { assignees });

    await recordActivity(userId, "updated_task", "Task", taskId, {
      description: `updated task assignees`,
    });

    return updated;
  }

  async addSubTask(taskId, userId, title) {
    const { task } = await this._resolveTaskContext(taskId, userId);
    const newSubTask = { title: title.trim(), completed: false, createdAt: new Date() };

    task.subtasks.push(newSubTask);
    await task.save();

    await recordActivity(userId, "created_subtask", "Task", taskId, {
      description: `created subtask ${title}`,
    });

    return task;
  }

  async updateSubTask(taskId, subTaskId, userId, completed) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
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

    return task;
  }

  async addComment(taskId, userId, text) {
    const { task } = await this._resolveTaskContext(taskId, userId);

    return await withTransaction(async (session) => {
      const comment = await commentRepository.create({
        text: text.trim(),
        task: taskId,
        author: userId,
      }, session);

      task.comments.push(comment._id);
      await task.save({ session });

      const snippet = text.substring(0, 50) + (text.length > 50 ? "..." : "");
      await recordActivity(userId, "added_comment", "Task", taskId, {
        description: `added comment ${snippet}`,
      }, session);

      return comment;
    });
  }

  async watchTask(taskId, userId) {
    const { task } = await this._resolveTaskContext(taskId, userId);
    const userIdStr = userId.toString();
    const isWatching = task.watchers.some((w) => (w._id || w).toString() === userIdStr);

    if (!isWatching) {
      task.watchers.push(userId);
    } else {
      task.watchers = task.watchers.filter((w) => (w._id || w).toString() !== userIdStr);
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

  async getMyTasks(userId) {
    const { tasks } = await taskRepository.findMyTasks(userId, { limit: 100 });
    return tasks;
  }

  async getArchivedTasks(userId) {
    const { tasks } = await taskRepository.findArchivedTasks(userId, { limit: 100 });
    return tasks;
  }

  async getActivityByResourceId(resourceId, query) {
    const { logs } = await activityRepository.findByResourceId(resourceId, query);
    return logs;
  }

  async getCommentsByTaskId(taskId) {
    const { comments } = await commentRepository.findByTaskId(taskId, { limit: 100 });
    return comments;
  }

  async deleteTask(taskId, userId) {
    const { task, project } = await this._resolveTaskContext(taskId, userId);

    return await withTransaction(async (session) => {
      await projectRepository.removeTaskFromProject(project._id, taskId, session);
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
