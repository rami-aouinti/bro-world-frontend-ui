import { beforeEach, describe, expect, it, vi } from "vitest";
import { createError, type H3Event } from "h3";
import handler from "~/server/api/v1/profile.get";
import { fetchCurrentProfileFromSource } from "~/server/utils/users/api";

import { createError, type H3Event } from "h3";
import handler from "~/server/api/v1/profile.get";
import { fetchCurrentProfileFromSource } from "~/server/utils/users/api";

const defineEventHandlerMock = vi.hoisted(() => {
  const mock = vi.fn(<T extends (...args: unknown[]) => unknown>(handler: T) => handler);
  (globalThis as Record<string, unknown>).defineEventHandler = mock;
  return mock;
});

vi.mock("~/server/utils/users/api", () => ({
  fetchCurrentProfileFromSource: vi.fn(),
}));

const mockedFetcher = fetchCurrentProfileFromSource as unknown as ReturnType<typeof vi.fn>;

describe("GET /api/v1/profile", () => {
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  function createEvent(): H3Event {
    return {
      node: { req: { headers: {} } },
    } as unknown as H3Event;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the profile from the users API", async () => {
    const profile = { id: "user-1", username: "demo" };
    mockedFetcher.mockResolvedValue(profile);

    const result = await handler(createEvent());

    expect(result).toEqual(profile);
    expect(mockedFetcher).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("sanitizes authorization errors", async () => {
    const error = createError({
      statusCode: 401,
      statusMessage: "Auth required",
      data: { message: "Authentication is required to access this resource." },
    });

    mockedFetcher.mockRejectedValue(error);

    const promise = handler(createEvent());
    const caught = await promise.catch((caughtError) => caughtError);

    expect(caught).toMatchObject({
      statusCode: 401,
      statusMessage: "Authentication is required to access this resource.",
      message: "Authentication is required to access this resource.",
      data: { message: "Authentication is required to access this resource." },
    });
    expect(caught.stack).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to proxy profile", error);
  });

  it("falls back to a generic error when the users API fails", async () => {
    const rawError = new Error("The upstream service is offline.");
    mockedFetcher.mockRejectedValue(rawError);

    const promise = handler(createEvent());
    const caught = await promise.catch((caughtError) => caughtError);

    expect(caught).toMatchObject({
      statusCode: 502,
      statusMessage: "Unable to load profile",
      message: "The upstream service is offline.",
      data: { message: "The upstream service is offline." },
    });
    expect(caught.stack).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to proxy profile", rawError);
  });
});
