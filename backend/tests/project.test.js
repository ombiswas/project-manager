import { describe, it, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import projectService from "../src/services/project.service.js";
import projectRepository from "../src/repositories/project.repository.js";
import workspaceRepository from "../src/repositories/workspace.repository.js";
import taskRepository from "../src/repositories/task.repository.js";
import activityRepository from "../src/repositories/activity.repository.js";
import { ForbiddenError, NotFoundError } from "../src/utils/errors.js";

describe("Project Service - Authorization & Access Control", () => {
  const workspaceId = "507f1f77bcf86cd799439001";
  const projectId = "507f1f77bcf86cd799439002";
  const ownerId = "507f1f77bcf86cd799439011";
  const adminId = "507f1f77bcf86cd799439012";
  const creatorId = "507f1f77bcf86cd799439013";
  const directMemberId = "507f1f77bcf86cd799439014";
  const regularWorkspaceMemberId = "507f1f77bcf86cd799439015";
  const workspaceViewerId = "507f1f77bcf86cd799439016";
  const outsiderId = "507f1f77bcf86cd799439099";

  const mockWorkspace = {
    _id: workspaceId,
    name: "Engineering Org",
    owner: ownerId,
    members: [
      { user: ownerId, role: "owner" },
      { user: adminId, role: "admin" },
      { user: creatorId, role: "member" },
      { user: directMemberId, role: "member" },
      { user: regularWorkspaceMemberId, role: "member" },
      { user: workspaceViewerId, role: "viewer" },
    ],
  };

  const mockProject = {
    _id: projectId,
    title: "Confidential Project",
    workspace: workspaceId,
    createdBy: creatorId,
    members: [{ _id: creatorId }, { _id: directMemberId }],
  };

  beforeEach(() => {
    mock.restoreAll();
    mock.method(activityRepository, "create", async () => ({}));
  });

  describe("Read Access (getProjectDetails & getProjectTasks)", () => {
    it("workspace Owner not in project.members -> can read project and its tasks", async () => {
      mock.method(projectRepository, "findById", async () => mockProject);
      mock.method(workspaceRepository, "findById", async () => mockWorkspace);
      mock.method(taskRepository, "findByProject", async () => ({
        tasks: [],
        total: 0,
      }));

      const details = await projectService.getProjectDetails(projectId, ownerId);
      assert.strictEqual(details._id, projectId);

      const tasks = await projectService.getProjectTasks(projectId, ownerId);
      assert.strictEqual(tasks.project._id, projectId);
    });

    it("workspace Admin not in project.members -> can read project and its tasks", async () => {
      mock.method(projectRepository, "findById", async () => mockProject);
      mock.method(workspaceRepository, "findById", async () => mockWorkspace);
      mock.method(taskRepository, "findByProject", async () => ({
        tasks: [],
        total: 0,
      }));

      const details = await projectService.getProjectDetails(projectId, adminId);
      assert.strictEqual(details._id, projectId);

      const tasks = await projectService.getProjectTasks(projectId, adminId);
      assert.strictEqual(tasks.project._id, projectId);
    });

    it("workspace Member not in project.members and not creator -> 403 Forbidden", async () => {
      mock.method(projectRepository, "findById", async () => mockProject);
      mock.method(workspaceRepository, "findById", async () => mockWorkspace);

      await assert.rejects(
        async () => projectService.getProjectDetails(projectId, regularWorkspaceMemberId),
        (err) => err instanceof ForbiddenError
      );

      await assert.rejects(
        async () => projectService.getProjectTasks(projectId, regularWorkspaceMemberId),
        (err) => err instanceof ForbiddenError
      );
    });

    it("workspace Viewer not in project.members and not creator -> 403 Forbidden", async () => {
      mock.method(projectRepository, "findById", async () => mockProject);
      mock.method(workspaceRepository, "findById", async () => mockWorkspace);

      await assert.rejects(
        async () => projectService.getProjectDetails(projectId, workspaceViewerId),
        (err) => err instanceof ForbiddenError
      );

      await assert.rejects(
        async () => projectService.getProjectTasks(projectId, workspaceViewerId),
        (err) => err instanceof ForbiddenError
      );
    });

    it("non-workspace-member -> 403 Forbidden", async () => {
      mock.method(projectRepository, "findById", async () => mockProject);
      mock.method(workspaceRepository, "findById", async () => mockWorkspace);

      await assert.rejects(
        async () => projectService.getProjectDetails(projectId, outsiderId),
        (err) => err instanceof ForbiddenError
      );

      await assert.rejects(
        async () => projectService.getProjectTasks(projectId, outsiderId),
        (err) => err instanceof ForbiddenError
      );
    });

    it("creator and direct members -> still allowed", async () => {
      mock.method(projectRepository, "findById", async () => mockProject);
      mock.method(workspaceRepository, "findById", async () => mockWorkspace);
      mock.method(taskRepository, "findByProject", async () => ({
        tasks: [],
        total: 0,
      }));

      // Creator
      const creatorDetails = await projectService.getProjectDetails(projectId, creatorId);
      assert.strictEqual(creatorDetails._id, projectId);

      // Direct Member
      const memberDetails = await projectService.getProjectDetails(projectId, directMemberId);
      assert.strictEqual(memberDetails._id, projectId);
    });

    it("nonexistent project -> 404 NotFoundError, no crash", async () => {
      mock.method(projectRepository, "findById", async () => null);

      await assert.rejects(
        async () => projectService.getProjectDetails("nonexistent-id", ownerId),
        (err) => err instanceof NotFoundError
      );
    });

    it("nonexistent workspace -> 404 NotFoundError, no crash", async () => {
      mock.method(projectRepository, "findById", async () => ({
        ...mockProject,
        members: [], // neither creator nor direct member
      }));
      mock.method(workspaceRepository, "findById", async () => null);

      await assert.rejects(
        async () => projectService.getProjectDetails(projectId, ownerId),
        (err) => err instanceof NotFoundError
      );
    });
  });

  describe("Write Access (updateProject & deleteProject)", () => {
    it("workspace Member who IS in project.members -> can read, cannot update or delete", async () => {
      mock.method(projectRepository, "findById", async () => mockProject);
      mock.method(workspaceRepository, "findById", async () => mockWorkspace);

      // Can read details
      const details = await projectService.getProjectDetails(projectId, directMemberId);
      assert.strictEqual(details._id, projectId);

      // Cannot update
      await assert.rejects(
        async () =>
          projectService.updateProject(projectId, directMemberId, {
            title: "Hacked Title",
          }),
        (err) => err instanceof ForbiddenError
      );

      // Cannot delete
      await assert.rejects(
        async () => projectService.deleteProject(projectId, directMemberId),
        (err) => err instanceof ForbiddenError
      );
    });

    it("workspace Owner can update and delete project", async () => {
      mock.method(projectRepository, "findById", async () => mockProject);
      mock.method(workspaceRepository, "findById", async () => mockWorkspace);
      mock.method(projectRepository, "updateById", async (id, data) => ({
        ...mockProject,
        ...data,
      }));
      mock.method(taskRepository, "findTaskIdsByProject", async () => []);
      mock.method(activityRepository, "deleteManyByResourceIds", async () => ({}));
      mock.method(projectRepository, "deleteById", async () => ({}));

      const updated = await projectService.updateProject(projectId, ownerId, {
        title: "Updated by Owner",
      });
      assert.strictEqual(updated.title, "Updated by Owner");

      const deleteRes = await projectService.deleteProject(projectId, ownerId);
      assert.strictEqual(deleteRes.message, "Project deleted successfully");
    });

    it("workspace Admin can update and delete project", async () => {
      mock.method(projectRepository, "findById", async () => mockProject);
      mock.method(workspaceRepository, "findById", async () => mockWorkspace);
      mock.method(projectRepository, "updateById", async (id, data) => ({
        ...mockProject,
        ...data,
      }));
      mock.method(taskRepository, "findTaskIdsByProject", async () => []);
      mock.method(activityRepository, "deleteManyByResourceIds", async () => ({}));
      mock.method(projectRepository, "deleteById", async () => ({}));

      const updated = await projectService.updateProject(projectId, adminId, {
        title: "Updated by Admin",
      });
      assert.strictEqual(updated.title, "Updated by Admin");

      const deleteRes = await projectService.deleteProject(projectId, adminId);
      assert.strictEqual(deleteRes.message, "Project deleted successfully");
    });
  });
});
