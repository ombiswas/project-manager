import { describe, it, beforeEach, mock } from "node:test";
import assert from "node:assert";
import userService from "../src/services/user.service.js";
import workspaceService from "../src/services/workspace.service.js";
import userRepository from "../src/repositories/user.repository.js";
import workspaceRepository from "../src/repositories/workspace.repository.js";
import projectRepository from "../src/repositories/project.repository.js";
import taskRepository from "../src/repositories/task.repository.js";
import commentRepository from "../src/repositories/comment.repository.js";
import activityRepository from "../src/repositories/activity.repository.js";
import verificationRepository from "../src/repositories/verification.repository.js";
import Project from "../src/models/project.js";
import Task from "../src/models/task.js";
import bcrypt from "bcrypt";
import { ForbiddenError, NotFoundError } from "../src/utils/errors.js";

describe("Account Deletion & Zero-Orphan Cleanup", () => {
  const userId = "507f1f77bcf86cd799439011";
  const otherUserId = "507f1f77bcf86cd799439022";

  beforeEach(() => {
    mock.restoreAll();
  });

  it("should throw NotFoundError if user to delete does not exist", async () => {
    mock.method(userRepository, "findById", async () => null);

    await assert.rejects(
      async () => userService.deleteAccount(userId, { password: "any" }),
      (err) => err instanceof NotFoundError
    );
  });

  it("should throw ForbiddenError if password is incorrect", async () => {
    mock.method(userRepository, "findById", async () => ({
      _id: userId,
      password: "hashedPassword123",
    }));
    mock.method(bcrypt, "compare", async () => false);

    await assert.rejects(
      async () => userService.deleteAccount(userId, { password: "wrong" }),
      (err) => err instanceof ForbiddenError
    );
  });

  it("should cascade delete workspace if user is the sole member", async () => {
    mock.method(userRepository, "findById", async () => ({
      _id: userId,
      email: "user@example.com",
      password: "hashedPassword123",
    }));
    mock.method(bcrypt, "compare", async () => true);

    const soloWorkspace = {
      _id: "ws-solo-1",
      owner: userId,
      members: [{ user: userId, role: "owner" }],
    };

    mock.method(workspaceRepository, "findWorkspacesByOwner", async () => [
      soloWorkspace,
    ]);

    let cascadeWorkspaceId = null;
    mock.method(workspaceService, "cascadeDeleteWorkspace", async (wsId) => {
      cascadeWorkspaceId = wsId;
      return true;
    });

    mock.method(
      workspaceRepository,
      "pullMemberFromAllWorkspaces",
      async () => true
    );
    mock.method(
      projectRepository,
      "pullMemberFromAllProjects",
      async () => true
    );
    mock.method(taskRepository, "pullUserFromAllTasks", async () => true);
    mock.method(commentRepository, "deleteManyByAuthor", async () => true);
    mock.method(activityRepository, "deleteManyByUser", async () => true);
    mock.method(
      workspaceRepository,
      "deleteManyInvitesByUser",
      async () => true
    );
    mock.method(verificationRepository, "deleteByUserId", async () => true);
    mock.method(userRepository, "deleteById", async () => true);

    mock.method(Project, "find", () => ({ session: async () => [] }));
    mock.method(Task, "find", () => ({ session: async () => [] }));
    mock.method(Task, "updateMany", async () => true);

    const result = await userService.deleteAccount(userId, {
      password: "correct",
    });

    assert.strictEqual(result.message, "Account deleted successfully");
    assert.strictEqual(cascadeWorkspaceId, "ws-solo-1");
  });

  it("should transfer workspace ownership to senior member if other members exist", async () => {
    mock.method(userRepository, "findById", async () => ({
      _id: userId,
      email: "owner@example.com",
    }));

    const multiWorkspace = {
      _id: "ws-multi-1",
      owner: userId,
      members: [
        { user: userId, role: "owner" },
        { user: otherUserId, role: "admin" },
      ],
    };

    mock.method(workspaceRepository, "findWorkspacesByOwner", async () => [
      multiWorkspace,
    ]);

    let updatedWsData = null;
    mock.method(workspaceRepository, "updateById", async (id, data) => {
      updatedWsData = { id, data };
      return true;
    });

    let updatedRoleData = null;
    mock.method(
      workspaceRepository,
      "updateMemberRoleByUser",
      async (wsId, uId, role) => {
        updatedRoleData = { wsId, uId, role };
        return true;
      }
    );

    let reassignedProjects = null;
    mock.method(projectRepository, "reassignCreator", async (oldId, newId) => {
      reassignedProjects = { oldId, newId };
      return true;
    });

    let reassignedTasks = null;
    mock.method(taskRepository, "reassignCreator", async (oldId, newId) => {
      reassignedTasks = { oldId, newId };
      return true;
    });

    mock.method(
      workspaceRepository,
      "pullMemberFromAllWorkspaces",
      async () => true
    );
    mock.method(
      projectRepository,
      "pullMemberFromAllProjects",
      async () => true
    );
    mock.method(taskRepository, "pullUserFromAllTasks", async () => true);
    mock.method(commentRepository, "deleteManyByAuthor", async () => true);
    mock.method(activityRepository, "deleteManyByUser", async () => true);
    mock.method(
      workspaceRepository,
      "deleteManyInvitesByUser",
      async () => true
    );
    mock.method(verificationRepository, "deleteByUserId", async () => true);
    mock.method(userRepository, "deleteById", async () => true);

    mock.method(Project, "find", () => ({ session: async () => [] }));
    mock.method(Task, "find", () => ({ session: async () => [] }));
    mock.method(Task, "updateMany", async () => true);

    const result = await userService.deleteAccount(userId);

    assert.strictEqual(result.message, "Account deleted successfully");
    assert.strictEqual(updatedWsData.data.owner, otherUserId);
    assert.strictEqual(updatedRoleData.uId, otherUserId);
    assert.strictEqual(updatedRoleData.role, "admin");
    assert.strictEqual(reassignedProjects.newId, otherUserId);
    assert.strictEqual(reassignedTasks.newId, otherUserId);
  });
});
