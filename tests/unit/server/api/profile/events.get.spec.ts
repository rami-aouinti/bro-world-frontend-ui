import { beforeEach, describe, expect, it, vi } from "vitest";
import { createError, type H3Event } from "h3";
import handler from "~/server/api/profile/events.get";
import { fetchProfileEventsFromSource } from "~/server/utils/users/api";

import { createError, type H3Event } from "h3";
import handler from "~/server/api/profile/events.get";
import { fetchProfileEventsFromSource } from "~/server/utils/users/api";

const defineEventHandlerMock = vi.hoisted(() => {
  const mock = vi.fn(<T extends (...args: unknown[]) => unknown>(handler: T) => handler);
  (globalThis as Record<string, unknown>).defineEventHandler = mock;
  return mock;
});

vi.mock("~/server/utils/users/api", () => ({
  fetchProfileEventsFromSource: vi.fn(),
}));

const mockedFetcher = fetchProfileEventsFromSource as unknown as ReturnType<typeof vi.fn>;

describe("GET /api/profile/events", () => {
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  function createEvent(): H3Event {
    return {
      node: { req: { headers: {} } },
    } as unknown as H3Event;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns events from the users API", async () => {
    const events = [{ id: "1", title: "Event", start: "2024-01-01" }];
    mockedFetcher.mockResolvedValue(events);

    const result = await handler(createEvent());

    expect(result).toEqual(events);
    expect(mockedFetcher).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("rethrows errors with the resolved message", async () => {
    const error = createError({
      statusCode: 401,
      statusMessage: "Auth required",
      data: { message: "Authentication is required to access this resource." },
    });

    mockedFetcher.mockRejectedValue(error);

    await expect(handler(createEvent())).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: "Authentication is required to access this resource.",
      message: "Authentication is required to access this resource.",
      data: {
        message: "Authentication is required to access this resource.",
      },
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to load profile events", error);
  });
});
