import { describe, it, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import taskService from "../src/services/task.service.js";
import taskRepository from "../src/repositories/task.repository.js";
import projectRepository from "../src/repositories/project.repository.js";
import workspaceRepository from "../src/repositories/workspace.repository.js";
import commentRepository from "../src/repositories/comment.repository.js";
import activityRepository from "../src/repositories/activity.repository.js";
import { ForbiddenError, NotFoundError } from "../src/utils/errors.js";

describe("Task & Activity Access Control - Project Privacy Enforcement", () => {
  const workspaceId = "507f1f77bcf86cd799439001";
  const projectId = "507f1f77bcf86cd799439002";
  const taskId = "507f1f77bcf86cd799439003";
  const subTaskId = "507f1f77bcf86cd799439004";

  const ownerId = "507f1f77bcf86cd799439011";
  const adminId = "507f1f77bcf86cd799439012";
  const creatorId = "507f1f77bcf86cd799439013";
  const directMemberId = "507f1f77bcf86cd799439014";
  const directViewerId = "507f1f77bcf86cd799439015";
  const outsiderMemberId = "507f1f77bcf86cd799439016";
  const outsiderViewerId = "507f1f77bcf86cd799439017";
  const nonWorkspaceUserId = "507f1f77bcf86cd799439099";

  const mockWorkspace = {
    _id: workspaceId,
    name: "Engineering Org",
    owner: ownerId,
    members: [
      { user: ownerId, role: "owner" },
      { user: adminId, role: "admin" },
      { user: creatorId, role: "member" },
      { user: directMemberId, role: "member" },
      { user: directViewerId, role: "viewer" },
      { user: outsiderMemberId, role: "member" },
      { user: outsiderViewerId, role: "viewer" },
    ],
  };

  const mockProject = {
    _id: projectId,
    title: "Secret Project",
    workspace: workspaceId,
    createdBy: creatorId,
    members: [{ _id: creatorId }, { _id: directMemberId }, { _id: directViewerId }],
  };

  const mockTask = {
    _id: taskId,
    title: "Secret Task",
    description: "Task description",
    project: projectId,
    createdBy: creatorId,
    status: "To Do",
    priority: "Medium",
    assignees: [directMemberId],
    watchers: [],
    subtasks: [
      {
        _id: subTaskId,
        title: "Subtask 1",
        completed: false,
      },
    ],
    save: async () => mockTask,
  };

  beforeEach(() => {
    mock.restoreAll();
    mock.method(activityRepository, "create", async () => ({}));
    mock.method(taskRepository, "create", async () => mockTask);
  });

  describe("Member / Viewer OUTSIDE project.members", () => {
    it("Member outside project.members -> 403 on task details, comments, and activity", async () => {
      mock.method(taskRepository, "findById", async () => mockTask);
      mock.method(projectRepository, "findById", async () => mockProject);
      mock.method(workspaceRepository, "findById", async () => mockWorkspace);

      // Task details
      await assert.rejects(
        async () => taskService.getTaskById(taskId, outsiderMemberId),
        (err) => err instanceof ForbiddenError
      );

      // Comments
      await assert.rejects(
        async () => taskService.getCommentsByTaskId(taskId, outsiderMemberId),
        (err) => err instanceof ForbiddenError
      );

      // Activity
      await assert.rejects(
        async () => taskService.getActivityByResourceId(taskId, outsiderMemberId),
        (err) => err instanceof ForbiddenError
      );
    });

    it("Viewer outside project.members -> 403 on task details, comments, and activity", async () => {
      mock.method(taskRepository, "findById", async () => mockTask);
      mock.method(projectRepository, "findById", async () => mockProject);
      mock.method(workspaceRepository, "findById", async () => mockWorkspace);

      await assert.rejects(
        async () => taskService.getTaskById(taskId, outsiderViewerId),
        (err) => err instanceof ForbiddenError
      );

      await assert.rejects(
        async () => taskService.getCommentsByTaskId(taskId, outsiderViewerId),
        (err) => err instanceof ForbiddenError
      );

      await assert.rejects(
        async () => taskService.getActivityByResourceId(taskId, outsiderViewerId),
        (err) => err instanceof ForbiddenError
      );
    });

    it("Member/Viewer outside project.members -> 403 on every task mutation", async () => {
      mock.method(taskRepository, "findById", async () => mockTask);
      mock.method(projectRepository, "findById", async () => mockProject);
      mock.method(workspaceRepository, "findById", async () => mockWorkspace);

      for (const targetUserId of [outsiderMemberId, outsiderViewerId]) {
        // Create task
        await assert.rejects(
          async () =>
            taskService.createTask(projectId, targetUserId, {
              title: "New Task",
            }),
          (err) => err instanceof ForbiddenError
        );

        // Edit title
        await assert.rejects(
          async () => taskService.updateTaskTitle(taskId, targetUserId, "New Title"),
          (err) => err instanceof ForbiddenError
        );

        // Edit description
        await assert.rejects(
          async () => taskService.updateTaskDescription(taskId, targetUserId, "New Desc"),
          (err) => err instanceof ForbiddenError
        );

        // Edit status
        await assert.rejects(
          async () => taskService.updateTaskStatus(taskId, targetUserId, "In Progress"),
          (err) => err instanceof ForbiddenError
        );

        // Edit priority
        await assert.rejects(
          async () => taskService.updateTaskPriority(taskId, targetUserId, "High"),
          (err) => err instanceof ForbiddenError
        );

        // Edit assignees
        await assert.rejects(
          async () => taskService.updateTaskAssignees(taskId, targetUserId, [directMemberId]),
          (err) => err instanceof ForbiddenError
        );

        // Add subtask
        await assert.rejects(
          async () => taskService.addSubTask(taskId, targetUserId, "Subtask 2"),
          (err) => err instanceof ForbiddenError
        );

        // Toggle subtask
        await assert.rejects(
          async () => taskService.updateSubTask(taskId, subTaskId, targetUserId, true),
          (err) => err instanceof ForbiddenError
        );

        // Add comment
        await assert.rejects(
          async () => taskService.addComment(taskId, targetUserId, "New Comment"),
          (err) => err instanceof ForbiddenError
        );

        // Watch task
        await assert.rejects(
          async () => taskService.watchTask(taskId, targetUserId),
          (err) => err instanceof ForbiddenError
        );

        // Archive task
        await assert.rejects(
          async () => taskService.achievedTask(taskId, targetUserId),
          (err) => err instanceof ForbiddenError
        );

        // Delete task
        await assert.rejects(
          async () => taskService.deleteTask(taskId, targetUserId),
          (err) => err instanceof ForbiddenError
        );
      }
    });
  });

  describe("Member INSIDE project.members", () => {
    it("Member inside project.members -> can read and mutate tasks", async () => {
      mock.method(taskRepository, "findById", async () => mockTask);
      mock.method(projectRepository, "findById", async () => mockProject);
      mock.method(workspaceRepository, "findById", async () => mockWorkspace);
      mock.method(commentRepository, "findByTaskId", async () => ({
        comments: [],
        total: 0,
      }));
      mock.method(activityRepository, "findByResourceId", async () => ({
        logs: [],
        total: 0,
      }));
      mock.method(taskRepository, "updateById", async (id, data) => ({
        ...mockTask,
        ...data,
      }));

      // Can read task details
      const details = await taskService.getTaskById(taskId, directMemberId);
      assert.strictEqual(details.task._id, taskId);

      // Can read comments
      const comments = await taskService.getCommentsByTaskId(taskId, directMemberId);
      assert.strictEqual(comments.pagination.total, 0);

      // Can read activity
      const activity = await taskService.getActivityByResourceId(taskId, directMemberId);
      assert.strictEqual(activity.pagination.total, 0);

      // Can update status
      const updated = await taskService.updateTaskStatus(taskId, directMemberId, "Done");
      assert.strictEqual(updated.status, "Done");
    });
  });

  describe("Viewer INSIDE project.members", () => {
    it("Viewer inside project.members -> read only, mutations stay blocked (403)", async () => {
      mock.method(taskRepository, "findById", async () => mockTask);
      mock.method(projectRepository, "findById", async () => mockProject);
      mock.method(workspaceRepository, "findById", async () => mockWorkspace);
      mock.method(commentRepository, "findByTaskId", async () => ({
        comments: [],
        total: 0,
      }));
      mock.method(activityRepository, "findByResourceId", async () => ({
        logs: [],
        total: 0,
      }));

      // Can read details
      const details = await taskService.getTaskById(taskId, directViewerId);
      assert.strictEqual(details.task._id, taskId);

      // Can read comments
      const comments = await taskService.getCommentsByTaskId(taskId, directViewerId);
      assert.strictEqual(comments.pagination.total, 0);

      // Can read activity
      const activity = await taskService.getActivityByResourceId(taskId, directViewerId);
      assert.strictEqual(activity.pagination.total, 0);

      // Mutation is blocked
      await assert.rejects(
        async () => taskService.updateTaskTitle(taskId, directViewerId, "Viewer Hacked Title"),
        (err) => err instanceof ForbiddenError
      );

      // Subtask toggle is blocked
      await assert.rejects(
        async () => taskService.updateSubTask(taskId, subTaskId, directViewerId, true),
        (err) => err instanceof ForbiddenError
      );

      // Comment is blocked
      await assert.rejects(
        async () => taskService.addComment(taskId, directViewerId, "Viewer comment"),
        (err) => err instanceof ForbiddenError
      );
    });
  });

  describe("Owner / Admin OUTSIDE project.members", () => {
    it("Owner/Admin outside project.members -> still allowed for everything", async () => {
      mock.method(taskRepository, "findById", async () => mockTask);
      mock.method(projectRepository, "findById", async () => mockProject);
      mock.method(workspaceRepository, "findById", async () => mockWorkspace);
      mock.method(commentRepository, "findByTaskId", async () => ({
        comments: [],
        total: 0,
      }));
      mock.method(activityRepository, "findByResourceId", async () => ({
        logs: [],
        total: 0,
      }));
      mock.method(taskRepository, "updateById", async (id, data) => ({
        ...mockTask,
        ...data,
      }));

      for (const privilegedId of [ownerId, adminId]) {
        // Can read details
        const details = await taskService.getTaskById(taskId, privilegedId);
        assert.strictEqual(details.task._id, taskId);

        // Can read comments
        const comments = await taskService.getCommentsByTaskId(taskId, privilegedId);
        assert.strictEqual(comments.pagination.total, 0);

        // Can read activity
        const activity = await taskService.getActivityByResourceId(taskId, privilegedId);
        assert.strictEqual(activity.pagination.total, 0);

        // Can mutate
        const updated = await taskService.updateTaskTitle(taskId, privilegedId, "Owner Title");
        assert.strictEqual(updated.title, "Owner Title");
      }
    });
  });

  describe("User NOT in workspace", () => {
    it("User not in workspace -> 403 on task details, comments, activity and mutations", async () => {
      mock.method(taskRepository, "findById", async () => mockTask);
      mock.method(projectRepository, "findById", async () => mockProject);
      mock.method(workspaceRepository, "findById", async () => mockWorkspace);

      // Read
      await assert.rejects(
        async () => taskService.getTaskById(taskId, nonWorkspaceUserId),
        (err) => err instanceof ForbiddenError
      );

      await assert.rejects(
        async () => taskService.getCommentsByTaskId(taskId, nonWorkspaceUserId),
        (err) => err instanceof ForbiddenError
      );

      await assert.rejects(
        async () => taskService.getActivityByResourceId(taskId, nonWorkspaceUserId),
        (err) => err instanceof ForbiddenError
      );

      // Mutation
      await assert.rejects(
        async () => taskService.updateTaskTitle(taskId, nonWorkspaceUserId, "Fail"),
        (err) => err instanceof ForbiddenError
      );
    });
  });

  describe("Nonexistent resources", () => {
    it("nonexistent task -> 404 NotFoundError", async () => {
      mock.method(taskRepository, "findById", async () => null);

      await assert.rejects(
        async () => taskService.getTaskById("missing-task-id", ownerId),
        (err) => err instanceof NotFoundError
      );
    });

    it("nonexistent project -> 404 NotFoundError", async () => {
      mock.method(taskRepository, "findById", async () => mockTask);
      mock.method(projectRepository, "findById", async () => null);

      await assert.rejects(
        async () => taskService.getTaskById(taskId, ownerId),
        (err) => err instanceof NotFoundError
      );
    });

    it("nonexistent resource for activity -> 404 NotFoundError", async () => {
      mock.method(taskRepository, "findById", async () => null);
      mock.method(projectRepository, "findById", async () => null);
      mock.method(workspaceRepository, "findById", async () => null);

      await assert.rejects(
        async () => taskService.getActivityByResourceId("nonexistent-resource", ownerId),
        (err) => err instanceof NotFoundError
      );
    });
  });
});
