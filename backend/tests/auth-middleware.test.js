import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import authMiddleware from "../src/middleware/auth-middleware.js";
import userRepository from "../src/repositories/user.repository.js";
import { env } from "../src/config/env.js";
import { UnauthorizedError } from "../src/utils/errors.js";

describe("Auth Middleware", () => {
  it("should call next with UnauthorizedError when authorization header is missing", async () => {
    const req = { headers: {} };
    const res = {};
    let caughtError = null;
    const next = (err) => {
      caughtError = err;
    };

    await authMiddleware(req, res, next);

    assert.ok(caughtError instanceof UnauthorizedError);
    assert.strictEqual(caughtError.statusCode, 401);
    assert.strictEqual(caughtError.message, "Authorization header missing");
  });

  it("should call next with UnauthorizedError when authorization format is malformed", async () => {
    const malformedHeaders = [
      "Basic 12345",
      "Bearer",
      "Bearer  ",
      "Token abcdef",
      "Bearer token extra_part",
    ];

    for (const authHeader of malformedHeaders) {
      const req = { headers: { authorization: authHeader } };
      let caughtError = null;
      const next = (err) => {
        caughtError = err;
      };

      await authMiddleware(req, {}, next);

      assert.ok(
        caughtError instanceof UnauthorizedError,
        `Expected error for header: "${authHeader}"`
      );
      assert.strictEqual(caughtError.statusCode, 401);
      assert.strictEqual(
        caughtError.message,
        "Invalid authorization format. Expected 'Bearer <token>'"
      );
    }
  });

  it("should call next with 401 when token is expired", async () => {
    const expiredToken = jwt.sign({ userId: "user-123" }, env.JWT_SECRET, {
      expiresIn: "-1s",
    });
    const req = {
      headers: { authorization: `Bearer ${expiredToken}` },
    };
    let caughtError = null;
    const next = (err) => {
      caughtError = err;
    };

    await authMiddleware(req, {}, next);

    assert.ok(caughtError instanceof UnauthorizedError);
    assert.strictEqual(caughtError.statusCode, 401);
    assert.strictEqual(
      caughtError.message,
      "Token expired. Please log in again."
    );
  });

  it("should call next with 401 when token signature is invalid", async () => {
    const req = {
      headers: { authorization: "Bearer invalid.token.payload" },
    };
    let caughtError = null;
    const next = (err) => {
      caughtError = err;
    };

    await authMiddleware(req, {}, next);

    assert.ok(caughtError instanceof UnauthorizedError);
    assert.strictEqual(caughtError.statusCode, 401);
    assert.strictEqual(
      caughtError.message,
      "Invalid token. Please authenticate again."
    );
  });

  it("should call next with 401 when token payload is missing userId", async () => {
    const tokenWithoutUser = jwt.sign(
      { someOtherField: "value" },
      env.JWT_SECRET
    );
    const req = {
      headers: { authorization: `Bearer ${tokenWithoutUser}` },
    };
    let caughtError = null;
    const next = (err) => {
      caughtError = err;
    };

    await authMiddleware(req, {}, next);

    assert.ok(caughtError instanceof UnauthorizedError);
    assert.strictEqual(caughtError.statusCode, 401);
    assert.strictEqual(caughtError.message, "Invalid token payload");
  });

  it("should call next with 401 when user is deleted or does not exist", async () => {
    const token = jwt.sign({ userId: "deleted-user-id" }, env.JWT_SECRET);
    const req = {
      headers: { authorization: `Bearer ${token}` },
    };
    let caughtError = null;
    const next = (err) => {
      caughtError = err;
    };

    mock.method(userRepository, "findById", async () => null);

    await authMiddleware(req, {}, next);

    assert.ok(caughtError instanceof UnauthorizedError);
    assert.strictEqual(caughtError.statusCode, 401);
    assert.strictEqual(caughtError.message, "User account no longer exists");
  });

  it("should attach user to req and call next without error on valid token", async () => {
    const fakeUser = {
      _id: "valid-user-id",
      name: "Test User",
      email: "test@example.com",
    };
    const token = jwt.sign({ userId: fakeUser._id }, env.JWT_SECRET);
    const req = {
      headers: { authorization: `Bearer ${token}` },
    };
    let nextCalled = false;
    let caughtError = null;
    const next = (err) => {
      nextCalled = true;
      caughtError = err;
    };

    mock.method(userRepository, "findById", async (id) => {
      if (id === fakeUser._id) return fakeUser;
      return null;
    });

    await authMiddleware(req, {}, next);

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(caughtError, undefined);
    assert.deepStrictEqual(req.user, fakeUser);
  });
});
