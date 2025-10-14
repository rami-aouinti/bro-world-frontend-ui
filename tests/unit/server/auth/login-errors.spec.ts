import type { FetchError } from "ofetch";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

let resolveFetchErrorStatus: (
  error: FetchError<unknown>,
) => number | null;
let resolveLoginErrorMessage: (status: number, payload: unknown) => string;

beforeAll(async () => {
  vi.stubGlobal("defineEventHandler", <T>(handler: T) => handler);

  const module = await import("~/server/api/auth/login.post");

  resolveFetchErrorStatus = module.resolveFetchErrorStatus;
  resolveLoginErrorMessage = module.resolveLoginErrorMessage;
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("resolveFetchErrorStatus", () => {
  it("returns the status from the fetch response when available", () => {
    const error = {
      response: { status: 401 },
    } as unknown as FetchError<unknown>;

    expect(resolveFetchErrorStatus(error)).toBe(401);
  });

  it("extracts status code from payload message when response is missing", () => {
    const error = {
      data: {
        message:
          'HTTP/1.1 400 Bad Request returned for "https://bro-world.org/api/v1/auth/get_token".',
      },
      message: "Request failed",
    } as unknown as FetchError<unknown>;

    expect(resolveFetchErrorStatus(error)).toBe(400);
  });

  it("extracts status code from the error message as a last resort", () => {
    const error = {
      message: "HTTP/1.1 429 Too Many Requests",
    } as unknown as FetchError<unknown>;

    expect(resolveFetchErrorStatus(error)).toBe(429);
  });
});

describe("resolveLoginErrorMessage", () => {
  it("prefers the payload message when present", () => {
    const payload = { message: "Custom error" };

    expect(resolveLoginErrorMessage(500, payload)).toBe("Custom error");
  });

  it("returns credential guidance for 400 and 401 statuses", () => {
    expect(resolveLoginErrorMessage(400, null)).toBe(
      "We could not verify those credentials. Please try again.",
    );
    expect(resolveLoginErrorMessage(401, {})).toBe(
      "We could not verify those credentials. Please try again.",
    );
  });

  it("returns rate limiting guidance for 429 status", () => {
    expect(resolveLoginErrorMessage(429, null)).toBe(
      "Too many login attempts. Please try again later.",
    );
  });

  it("falls back to a generic message for other statuses", () => {
    expect(resolveLoginErrorMessage(503, null)).toBe(
      "Unable to sign in at this time. Please try again later.",
    );
  });
});
