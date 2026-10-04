import { describe, it, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import projectRepository from "../src/repositories/project.repository.js";
import taskRepository from "../src/repositories/task.repository.js";
import verificationRepository from "../src/repositories/verification.repository.js";
import authService from "../src/services/auth.service.js";
import Project from "../src/models/project.js";
import Task from "../src/models/task.js";
import Verification from "../src/models/verification.js";
import { BadRequestError } from "../src/utils/errors.js";

describe("Repository Methods & Service Encapsulation", () => {
  const userId = "507f1f77bcf86cd799439099";

  beforeEach(() => {
    mock.restoreAll();
  });

  describe("projectRepository.findByCreator", () => {
    it("should query Project model by createdBy without session", async () => {
      const mockProjects = [{ _id: "p1", title: "Project 1", createdBy: userId }];
      let queriedFilter = null;
      let sessionUsed = false;

      mock.method(Project, "find", (filter) => {
        queriedFilter = filter;
        return {
          session(s) {
            sessionUsed = Boolean(s);
            return this;
          },
          then(resolve) {
            resolve(mockProjects);
          },
        };
      });

      const result = await projectRepository.findByCreator(userId);
      assert.deepStrictEqual(queriedFilter, { createdBy: userId });
      assert.strictEqual(sessionUsed, false);
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0]._id, "p1");
    });

    it("should chain session when session is provided", async () => {
      const fakeSession = { id: "fake-session-1" };
      let passedSession = null;

      mock.method(Project, "find", (_filter) => ({
        session(s) {
          passedSession = s;
          return this;
        },
        then(resolve) {
          resolve([]);
        },
      }));

      await projectRepository.findByCreator(userId, fakeSession);
      assert.strictEqual(passedSession, fakeSession);
    });
  });

  describe("taskRepository.findByCreator & nullifyAttachmentUploader", () => {
    it("should query Task model by createdBy without session", async () => {
      const mockTasks = [{ _id: "t1", title: "Task 1", createdBy: userId }];
      let queriedFilter = null;
      let sessionUsed = false;

      mock.method(Task, "find", (filter) => {
        queriedFilter = filter;
        return {
          session(s) {
            sessionUsed = Boolean(s);
            return this;
          },
          then(resolve) {
            resolve(mockTasks);
          },
        };
      });

      const result = await taskRepository.findByCreator(userId);
      assert.deepStrictEqual(queriedFilter, { createdBy: userId });
      assert.strictEqual(sessionUsed, false);
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0]._id, "t1");
    });

    it("should chain session on Task.find when provided", async () => {
      const fakeSession = { id: "fake-session-2" };
      let passedSession = null;

      mock.method(Task, "find", (_filter) => ({
        session(s) {
          passedSession = s;
          return this;
        },
        then(resolve) {
          resolve([]);
        },
      }));

      await taskRepository.findByCreator(userId, fakeSession);
      assert.strictEqual(passedSession, fakeSession);
    });

    it("should nullify uploader on task attachments with arrayFilters", async () => {
      let updateArgs = null;
      mock.method(Task, "updateMany", async (filter, update, opts) => {
        updateArgs = { filter, update, opts };
        return { modifiedCount: 2 };
      });

      const fakeSession = { id: "fake-session-3" };
      await taskRepository.nullifyAttachmentUploader(userId, fakeSession);

      assert.deepStrictEqual(updateArgs.filter, { "attachments.uploadedBy": userId });
      assert.deepStrictEqual(updateArgs.update, {
        $unset: { "attachments.$[elem].uploadedBy": "" },
      });
      assert.strictEqual(updateArgs.opts.session, fakeSession);
      assert.deepStrictEqual(updateArgs.opts.arrayFilters, [{ "elem.uploadedBy": userId }]);
    });
  });

  describe("verificationRepository.findByUserId", () => {
    it("should query Verification model by userId", async () => {
      let findOneFilter = null;
      mock.method(Verification, "findOne", async (filter) => {
        findOneFilter = filter;
        return { userId, token: "test-token" };
      });

      const result = await verificationRepository.findByUserId(userId);
      assert.deepStrictEqual(findOneFilter, { userId });
      assert.strictEqual(result.userId, userId);
      assert.strictEqual(result.token, "test-token");
    });
  });

  describe("authService._handleUnverifiedLogin with findByUserId", () => {
    it("should call findByUserId without MongoDB operator objects and throw if unexpired", async () => {
      let queriedUserId = null;
      mock.method(verificationRepository, "findByUserId", async (uid) => {
        queriedUserId = uid;
        return {
          userId: uid,
          token: "valid-tok",
          expiresAt: new Date(Date.now() + 60000), // unexpired
        };
      });

      await assert.rejects(
        async () => authService._handleUnverifiedLogin({ _id: userId }, "user@example.com"),
        (err) => {
          assert.ok(err instanceof BadRequestError);
          assert.match(err.message, /Email not verified/);
          return true;
        }
      );

      assert.strictEqual(queriedUserId, userId);
    });
  });
});
