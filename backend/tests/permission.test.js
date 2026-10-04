import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import permissionService from "../src/services/permission.service.js";
import { authorize } from "../src/middleware/permission-middleware.js";
import workspaceRepository from "../src/repositories/workspace.repository.js";
import { ForbiddenError } from "../src/utils/errors.js";

describe("Permission Service & Middleware", () => {
  const ownerId = "507f1f77bcf86cd799439011";
  const adminId = "507f1f77bcf86cd799439012";
  const memberId = "507f1f77bcf86cd799439013";
  const viewerId = "507f1f77bcf86cd799439014";
  const nonMemberId = "507f1f77bcf86cd799439099";

  const mockWorkspace = {
    _id: "ws-123",
    name: "Engineering",
    owner: ownerId,
    members: [
      { user: adminId, role: "admin" },
      { user: { _id: memberId }, role: "member" },
      { user: viewerId, role: "viewer" },
    ],
  };

  describe("resolveUserRole", () => {
    it("should return 'owner' for workspace owner", () => {
      const role = permissionService.resolveUserRole(mockWorkspace, ownerId);
      assert.strictEqual(role, "owner");
    });

    it("should return correct role for each member", () => {
      assert.strictEqual(
        permissionService.resolveUserRole(mockWorkspace, adminId),
        "admin"
      );
      assert.strictEqual(
        permissionService.resolveUserRole(mockWorkspace, memberId),
        "member"
      );
      assert.strictEqual(
        permissionService.resolveUserRole(mockWorkspace, viewerId),
        "viewer"
      );
    });

    it("should return null for non-members or missing inputs", () => {
      assert.strictEqual(
        permissionService.resolveUserRole(mockWorkspace, nonMemberId),
        null
      );
      assert.strictEqual(
        permissionService.resolveUserRole(null, ownerId),
        null
      );
      assert.strictEqual(
        permissionService.resolveUserRole(mockWorkspace, null),
        null
      );
    });
  });

  describe("canManageTask", () => {
    it("should return false for viewer or null role", () => {
      assert.strictEqual(permissionService.canManageTask("viewer"), false);
      assert.strictEqual(permissionService.canManageTask(null), false);
    });

    it("should return true for owner and admin", () => {
      assert.strictEqual(permissionService.canManageTask("owner"), true);
      assert.strictEqual(permissionService.canManageTask("admin"), true);
    });

    it("should allow member to manage task", () => {
      assert.strictEqual(permissionService.canManageTask("member"), true);
    });
  });

  describe("assertMinRole", () => {
    it("should throw ForbiddenError when user is not a member", () => {
      assert.throws(
        () =>
          permissionService.assertMinRole(mockWorkspace, nonMemberId, "member"),
        {
          name: "ForbiddenError",
          message: "You are not a member of this workspace",
        }
      );
    });

    it("should throw ForbiddenError when user role is below minimum required role", () => {
      assert.throws(
        () => permissionService.assertMinRole(mockWorkspace, memberId, "admin"),
        {
          name: "ForbiddenError",
          message: "You need at least 'admin' role to perform this action",
        }
      );

      assert.throws(
        () =>
          permissionService.assertMinRole(mockWorkspace, viewerId, "member"),
        {
          name: "ForbiddenError",
          message: "You need at least 'member' role to perform this action",
        }
      );
    });

    it("should succeed and return role when user meets or exceeds min role", () => {
      assert.strictEqual(
        permissionService.assertMinRole(mockWorkspace, ownerId, "admin"),
        "owner"
      );
      assert.strictEqual(
        permissionService.assertMinRole(mockWorkspace, adminId, "admin"),
        "admin"
      );
      assert.strictEqual(
        permissionService.assertMinRole(mockWorkspace, memberId, "member"),
        "member"
      );
      assert.strictEqual(
        permissionService.assertMinRole(mockWorkspace, viewerId, "viewer"),
        "viewer"
      );
    });
  });

  describe("assertTaskManagementPermission", () => {
    it("should throw ForbiddenError for non-member", () => {
      assert.throws(
        () =>
          permissionService.assertTaskManagementPermission(
            mockWorkspace,
            nonMemberId
          ),
        /You are not a member of this workspace/
      );
    });

    it("should throw ForbiddenError for viewer", () => {
      assert.throws(
        () =>
          permissionService.assertTaskManagementPermission(
            mockWorkspace,
            viewerId
          ),
        /Viewers cannot modify tasks/
      );
    });

    it("should succeed when member manages task", () => {
      const result = permissionService.assertTaskManagementPermission(
        mockWorkspace,
        memberId
      );
      assert.deepStrictEqual(result, {
        requesterRole: "member",
      });
    });

    it("should succeed when admin manages task", () => {
      const result = permissionService.assertTaskManagementPermission(
        mockWorkspace,
        adminId
      );
      assert.deepStrictEqual(result, {
        requesterRole: "admin",
      });
    });
  });

  describe("authorize middleware", () => {
    it("should call next() and attach role when user has required minRole", async () => {
      const middleware = authorize("admin");
      const req = {
        workspace: mockWorkspace,
        user: { _id: adminId },
        params: {},
      };
      let nextError = null;
      let nextCalled = false;
      const next = (err) => {
        nextCalled = true;
        nextError = err;
      };

      await middleware(req, {}, next);

      assert.strictEqual(nextCalled, true);
      assert.strictEqual(nextError, undefined);
      assert.strictEqual(req.userWorkspaceRole, "admin");
    });

    it("should pass ForbiddenError to next() when user has insufficient role", async () => {
      const middleware = authorize("admin");
      const req = {
        workspace: mockWorkspace,
        user: { _id: memberId },
        params: {},
      };
      let nextError = null;
      const next = (err) => {
        nextError = err;
      };

      await middleware(req, {}, next);

      assert.ok(nextError instanceof ForbiddenError);
      assert.strictEqual(nextError.statusCode, 403);
      assert.strictEqual(
        nextError.message,
        "You need at least 'admin' role to perform this action"
      );
    });

    it("should fetch workspace from repository if not present on req but workspaceId in params", async () => {
      mock.method(workspaceRepository, "findById", async (id) => {
        if (id === mockWorkspace._id) return mockWorkspace;
        return null;
      });

      const middleware = authorize("member");
      const req = {
        params: { workspaceId: mockWorkspace._id },
        user: { _id: memberId },
      };
      let nextError = null;
      let nextCalled = false;
      const next = (err) => {
        nextCalled = true;
        nextError = err;
      };

      await middleware(req, {}, next);

      assert.strictEqual(nextCalled, true);
      assert.strictEqual(nextError, undefined);
      assert.deepStrictEqual(req.workspace, mockWorkspace);
      assert.strictEqual(req.userWorkspaceRole, "member");
    });
  });
});
