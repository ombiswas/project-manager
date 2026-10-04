import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  notFoundHandler,
  errorHandler,
} from "../src/middleware/error-middleware.js";
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from "../src/utils/errors.js";
import { env } from "../src/config/env.js";

function createMockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

const mockReq = {
  method: "POST",
  originalUrl: "/api/test-endpoint",
};

describe("Error Middleware", () => {
  describe("notFoundHandler", () => {
    it("should pass a NotFoundError to next()", () => {
      let caughtError = null;
      const next = (err) => {
        caughtError = err;
      };

      notFoundHandler(
        { method: "GET", originalUrl: "/api/nonexistent" },
        {},
        next
      );

      assert.ok(caughtError instanceof NotFoundError);
      assert.strictEqual(caughtError.statusCode, 404);
      assert.strictEqual(
        caughtError.message,
        "Cannot find GET /api/nonexistent on this server"
      );
    });
  });

  describe("errorHandler", () => {
    it("should handle custom AppErrors (BadRequest, Unauthorized, Forbidden, NotFound, Conflict)", () => {
      const cases = [
        {
          err: new BadRequestError("Invalid payload"),
          expectedCode: 400,
          expectedStatus: "fail",
        },
        {
          err: new UnauthorizedError("Please log in"),
          expectedCode: 401,
          expectedStatus: "fail",
        },
        {
          err: new ForbiddenError("Not allowed"),
          expectedCode: 403,
          expectedStatus: "fail",
        },
        {
          err: new NotFoundError("Resource missing"),
          expectedCode: 404,
          expectedStatus: "fail",
        },
        {
          err: new ConflictError("Resource exists"),
          expectedCode: 409,
          expectedStatus: "fail",
        },
      ];

      for (const { err, expectedCode, expectedStatus } of cases) {
        const res = createMockRes();
        errorHandler(err, mockReq, res, () => {});

        assert.strictEqual(res.statusCode, expectedCode);
        assert.strictEqual(res.body.status, expectedStatus);
        assert.strictEqual(res.body.message, err.message);
      }
    });

    it("should handle Mongoose CastError with 400 status", () => {
      const castError = {
        name: "CastError",
        path: "_id",
        value: "invalid-object-id",
      };
      const res = createMockRes();

      errorHandler(castError, mockReq, res, () => {});

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.status, "fail");
      assert.strictEqual(res.body.message, "Invalid _id: invalid-object-id");
    });

    it("should handle Mongoose ValidationError with 400 and formatted details", () => {
      const validationError = {
        name: "ValidationError",
        errors: {
          title: { message: "Title is required" },
          status: { message: "Invalid status value" },
        },
      };
      const res = createMockRes();

      errorHandler(validationError, mockReq, res, () => {});

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.status, "fail");
      assert.ok(res.body.message.includes("Validation failed:"));
      assert.deepStrictEqual(res.body.details, {
        title: "Title is required",
        status: "Invalid status value",
      });
    });

    it("should handle MongoDB duplicate key error code 11000 with 409 status", () => {
      const dupError = {
        code: 11000,
        keyValue: { email: "duplicate@example.com" },
      };
      const res = createMockRes();

      errorHandler(dupError, mockReq, res, () => {});

      assert.strictEqual(res.statusCode, 409);
      assert.strictEqual(res.body.status, "fail");
      assert.strictEqual(
        res.body.message,
        "Duplicate value for field(s): email. Please use a unique value."
      );
      assert.deepStrictEqual(res.body.details, {
        email: "duplicate@example.com",
      });
    });

    it("should handle JsonWebTokenError with 401 status", () => {
      const jwtError = { name: "JsonWebTokenError" };
      const res = createMockRes();

      errorHandler(jwtError, mockReq, res, () => {});

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.status, "fail");
      assert.strictEqual(
        res.body.message,
        "Invalid token. Please authenticate again."
      );
    });

    it("should handle TokenExpiredError with 401 status", () => {
      const expiredError = { name: "TokenExpiredError" };
      const res = createMockRes();

      errorHandler(expiredError, mockReq, res, () => {});

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.status, "fail");
      assert.strictEqual(
        res.body.message,
        "Your token has expired. Please authenticate again."
      );
    });

    it("should handle ZodError with 400 status and path details", () => {
      const zodError = {
        name: "ZodError",
        errors: [
          { path: ["body", "email"], message: "Invalid email" },
          { path: ["body", "password"], message: "Too short" },
        ],
      };
      const res = createMockRes();

      errorHandler(zodError, mockReq, res, () => {});

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.status, "fail");
      assert.strictEqual(res.body.message, "Invalid input data");
      assert.deepStrictEqual(res.body.details, [
        { path: "body.email", message: "Invalid email" },
        { path: "body.password", message: "Too short" },
      ]);
    });

    it("should handle malformed JSON payload SyntaxError with 400 status", () => {
      const syntaxError = new SyntaxError("Unexpected token } in JSON");
      syntaxError.status = 400;
      syntaxError.body = "{ invalid json }";
      const res = createMockRes();

      errorHandler(syntaxError, mockReq, res, () => {});

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.status, "fail");
      assert.strictEqual(
        res.body.message,
        "Malformed JSON payload in request body"
      );
    });

    it("should sanitize 500 error messages and remove details in production", () => {
      const originalEnv = env.NODE_ENV;
      env.NODE_ENV = "production";

      try {
        const unexpectedError = new Error("Database password leaked in error");
        const res = createMockRes();

        errorHandler(unexpectedError, mockReq, res, () => {});

        assert.strictEqual(res.statusCode, 500);
        assert.strictEqual(res.body.status, "error");
        assert.strictEqual(res.body.message, "Internal server error");
        assert.strictEqual(res.body.stack, undefined);
        assert.strictEqual(res.body.details, undefined);
      } finally {
        env.NODE_ENV = originalEnv;
      }
    });
  });
});
