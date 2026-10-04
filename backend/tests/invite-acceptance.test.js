import { describe, it, mock, beforeEach } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import workspaceService from "../src/services/workspace.service.js";
import workspaceRepository from "../src/repositories/workspace.repository.js";
import activityRepository from "../src/repositories/activity.repository.js";
import { env } from "../src/config/env.js";
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from "../src/utils/errors.js";

describe("Invite Acceptance Logic", () => {
  const authUser = {
    _id: "507f1f77bcf86cd799439001",
    email: "dev@example.com",
    name: "Dev User",
  };

  const otherUser = {
    _id: "507f1f77bcf86cd799439002",
    email: "other@example.com",
  };

  const workspaceId = "507f1f77bcf86cd799439010";

  beforeEach(() => {
    mock.restoreAll();
  });

  it("should throw BadRequestError when token is expired according to JWT", async () => {
    const expiredToken = jwt.sign(
      { workspaceId, email: authUser.email },
      env.JWT_SECRET,
      { expiresIn: "-1s" }
    );

    await assert.rejects(
      async () => {
        await workspaceService.acceptInviteByToken(expiredToken, authUser);
      },
      (err) => {
        assert.ok(err instanceof BadRequestError);
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, "Invitation token has expired");
        return true;
      }
    );
  });

  it("should throw UnauthorizedError when token is invalid or corrupted", async () => {
    await assert.rejects(
      async () => {
        await workspaceService.acceptInviteByToken(
          "invalid.jwt.token",
          authUser
        );
      },
      (err) => {
        assert.ok(err instanceof UnauthorizedError);
        assert.strictEqual(err.statusCode, 401);
        assert.strictEqual(err.message, "Invalid invitation token");
        return true;
      }
    );
  });

  it("should throw ForbiddenError when invite was issued to a different user/email", async () => {
    const token = jwt.sign(
      { workspaceId, email: otherUser.email, user: otherUser._id },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await assert.rejects(
      async () => {
        await workspaceService.acceptInviteByToken(token, authUser);
      },
      (err) => {
        assert.ok(err instanceof ForbiddenError);
        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(
          err.message,
          "This invitation was not issued to your account"
        );
        return true;
      }
    );
  });

  it("should throw NotFoundError when workspace does not exist", async () => {
    const token = jwt.sign(
      { workspaceId, email: authUser.email },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    mock.method(workspaceRepository, "findById", async () => null);

    await assert.rejects(
      async () => {
        await workspaceService.acceptInviteByToken(token, authUser);
      },
      (err) => {
        assert.ok(err instanceof NotFoundError);
        assert.strictEqual(err.statusCode, 404);
        assert.strictEqual(err.message, "Workspace not found");
        return true;
      }
    );
  });

  it("should throw ConflictError when authenticated user is already a member", async () => {
    const token = jwt.sign(
      { workspaceId, email: authUser.email },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    mock.method(workspaceRepository, "findById", async () => ({
      _id: workspaceId,
      name: "Existing Team",
      members: [{ user: authUser._id, role: "member" }],
    }));

    await assert.rejects(
      async () => {
        await workspaceService.acceptInviteByToken(token, authUser);
      },
      (err) => {
        assert.ok(err instanceof ConflictError);
        assert.strictEqual(err.statusCode, 409);
        assert.strictEqual(
          err.message,
          "You are already a member of this workspace"
        );
        return true;
      }
    );
  });

  it("should throw NotFoundError when invite record is not found in database (already used)", async () => {
    const token = jwt.sign(
      { workspaceId, email: authUser.email },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    mock.method(workspaceRepository, "findById", async () => ({
      _id: workspaceId,
      name: "Acme Corp",
      members: [],
    }));

    mock.method(workspaceRepository, "findInvite", async () => null);

    await assert.rejects(
      async () => {
        await workspaceService.acceptInviteByToken(token, authUser);
      },
      (err) => {
        assert.ok(err instanceof NotFoundError);
        assert.strictEqual(err.statusCode, 404);
        assert.strictEqual(
          err.message,
          "Invitation not found or has already been used"
        );
        return true;
      }
    );
  });

  it("should throw BadRequestError and delete invite when DB record has expired", async () => {
    const token = jwt.sign(
      { workspaceId, email: authUser.email },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    mock.method(workspaceRepository, "findById", async () => ({
      _id: workspaceId,
      name: "Acme Corp",
      members: [],
    }));

    let deletedInviteId = null;
    mock.method(workspaceRepository, "findInvite", async () => ({
      _id: "invite-record-id",
      token,
      expiresAt: new Date(Date.now() - 60000), // 1 minute in the past
    }));

    mock.method(workspaceRepository, "deleteInvite", async ({ _id }) => {
      deletedInviteId = _id;
      return true;
    });

    await assert.rejects(
      async () => {
        await workspaceService.acceptInviteByToken(token, authUser);
      },
      (err) => {
        assert.ok(err instanceof BadRequestError);
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, "Invitation has expired");
        return true;
      }
    );

    assert.strictEqual(deletedInviteId, "invite-record-id");
  });

  it("should successfully accept valid invite, add member, delete invite, and log activity", async () => {
    const token = jwt.sign(
      { workspaceId, email: authUser.email, role: "member" },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const workspaceDoc = {
      _id: workspaceId,
      name: "Acme Corp",
      members: [],
    };

    let addedMember = null;
    let deletedInvitesQuery = null;
    let loggedActivity = null;

    mock.method(workspaceRepository, "findById", async () => workspaceDoc);
    mock.method(workspaceRepository, "findInvite", async () => ({
      _id: "invite-record-id",
      token,
      role: "member",
      expiresAt: new Date(Date.now() + 3600000),
    }));

    mock.method(workspaceRepository, "addMember", async (wsId, memberData) => {
      addedMember = { wsId, memberData };
      return true;
    });

    mock.method(workspaceRepository, "deleteManyInvites", async (query) => {
      deletedInvitesQuery = query;
      return true;
    });

    mock.method(activityRepository, "create", async (activityData) => {
      loggedActivity = activityData;
      return activityData;
    });

    const result = await workspaceService.acceptInviteByToken(token, authUser);

    assert.deepStrictEqual(result, {
      message: "Invitation accepted successfully",
    });
    assert.strictEqual(addedMember.wsId, workspaceId);
    assert.strictEqual(addedMember.memberData.user, authUser._id);
    assert.strictEqual(addedMember.memberData.role, "member");
    const deletedUser =
      deletedInvitesQuery.user || deletedInvitesQuery.$or?.[0]?.user;
    assert.strictEqual(deletedUser, authUser._id);
    assert.strictEqual(deletedInvitesQuery.workspaceId, workspaceId);
    assert.strictEqual(loggedActivity.action, "joined_workspace");
  });
});
