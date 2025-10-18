import { describe, expect, it } from "vitest";
import { sanitizeErrorPayload } from "~/server/utils/http/sanitize-error-payload";

describe("sanitizeErrorPayload", () => {
  it("removes stack strings from root objects", () => {
    const payload = {
      statusCode: 500,
      message: "Server error",
      stack: "Error: boom\n    at something.js:1:1",
    };

    const result = sanitizeErrorPayload(payload);

    expect(result).toEqual({
      statusCode: 500,
      message: "Server error",
    });
    expect("stack" in result).toBe(false);
  });

  it("removes stack arrays from nested data", () => {
    const payload = {
      error: true,
      data: {
        message: "Unauthorized",
        stack: ["line 1", "line 2"],
      },
    };

    sanitizeErrorPayload(payload);

    expect(payload).toEqual({
      error: true,
      data: {
        message: "Unauthorized",
      },
    });
  });

  it("handles arrays of error objects", () => {
    const payload = {
      errors: [
        { message: "First", stack: "trace" },
        { message: "Second", details: { stack: ["trace"] } },
      ],
    };

    sanitizeErrorPayload(payload);

    expect(payload).toEqual({
      errors: [{ message: "First" }, { message: "Second", details: {} }],
    });
  });

  it("ignores primitive values", () => {
    expect(sanitizeErrorPayload(null)).toBeNull();
    expect(sanitizeErrorPayload(undefined)).toBeUndefined();
    expect(sanitizeErrorPayload("error" as unknown as Record<string, unknown>)).toBe("error");
  });

  it("does not remove non-stack properties", () => {
    const payload = {
      message: "Example",
      cause: { reason: "timeout" },
    };

    sanitizeErrorPayload(payload);

    expect(payload).toEqual({
      message: "Example",
      cause: { reason: "timeout" },
    });
  });
});
