import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createError, type H3Event } from "h3";
import {
  fetchCurrentProfileFromSource,
  fetchProfileEventsFromSource,
} from "~/server/utils/users/api";
import { profileEventsSample } from "~/lib/mock/profile";

const getSessionTokenMock = vi.hoisted(() => vi.fn<[H3Event], string | null>());
const getSessionUserMock = vi.hoisted(() =>
  vi.fn<[H3Event], Record<string, unknown> | null>(),
);
const withAuthHeadersMock = vi.hoisted(() =>
  vi.fn((event: H3Event, headers: Record<string, string> = {}) => {
    const token = getSessionTokenMock(event);

    if (!token) {
      return headers;
    }

    return {
      ...headers,
      Authorization: `Bearer ${token}`,
    };
  }),
);
const useRuntimeConfigMock = vi.hoisted(() =>
  vi.fn(() => ({
    auth: {},
    users: {},
  })),
);

vi.mock("~/server/utils/auth/session", () => ({
  getSessionToken: getSessionTokenMock,
  getSessionUser: getSessionUserMock,
  withAuthHeaders: withAuthHeadersMock,
}));

vi.mock("#imports", () => ({
  useRuntimeConfig: useRuntimeConfigMock,
}));

const globalScope = globalThis as Record<string, unknown>;
const hadOriginalFetch = Object.prototype.hasOwnProperty.call(globalScope, "$fetch");
const originalFetch = globalScope.$fetch;

beforeEach(() => {
  getSessionTokenMock.mockReset();
  getSessionUserMock.mockReset();
  withAuthHeadersMock.mockReset();
  useRuntimeConfigMock.mockReset();
});

afterEach(() => {
  if (hadOriginalFetch) {
    globalScope.$fetch = originalFetch;
  } else {
    delete globalScope.$fetch;
  }
});

describe("fetchProfileEventsFromSource", () => {
  const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

  it("uses the users API base when requesting profile events", async () => {
    const fetchMock = vi.fn().mockResolvedValue([]);
    globalScope.$fetch = fetchMock;
    useRuntimeConfigMock.mockReturnValue({ auth: {}, users: {} });
    getSessionTokenMock.mockReturnValue(null);
    getSessionUserMock.mockReturnValue(null);

    const event = { node: { req: { headers: {} } } } as unknown as H3Event;
    const query = { limit: "5" };

    await fetchProfileEventsFromSource(event, query);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [endpoint, options] = fetchMock.mock.calls[0];

    expect(endpoint).toBe("https://bro-world.org/api/v1/profile/events");
    expect(options?.query).toEqual(query);
    expect(useRuntimeConfigMock).toHaveBeenCalled();
  });

  it("prefers the session token over a forwarded authorization header", async () => {
    const fetchMock = vi.fn().mockResolvedValue([]);

    globalScope.$fetch = fetchMock;
    useRuntimeConfigMock.mockReturnValue({ auth: {}, users: {} });
    getSessionTokenMock.mockReturnValue("new-session-token");
    getSessionUserMock.mockReturnValue(null);

    const event = {
      node: {
        req: {
          headers: {
            authorization: "Bearer old-session-token",
          },
        },
      },
    } as unknown as H3Event;

    await fetchProfileEventsFromSource(event);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, options] = fetchMock.mock.calls[0];

    expect(options?.headers?.authorization).toBe("Bearer new-session-token");
  });

  it("uses the service token when no session token is available", async () => {
    const fetchMock = vi.fn().mockResolvedValue([]);

    globalScope.$fetch = fetchMock;
    useRuntimeConfigMock.mockReturnValue({ auth: {}, users: { apiToken: "bro" } });
    getSessionTokenMock.mockReturnValue(null);
    getSessionUserMock.mockReturnValue(null);

    const event = {
      node: {
        req: {
          headers: {
            authorization: "Bearer forwarded-token",
          },
        },
      },
    } as unknown as H3Event;

    await fetchProfileEventsFromSource(event);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0];
    expect(options?.headers?.authorization).toBe("Bearer bro");
  });

  it("falls back to the forwarded authorization header when no tokens are available", async () => {
    const fetchMock = vi.fn().mockResolvedValue([]);

    globalScope.$fetch = fetchMock;
    useRuntimeConfigMock.mockReturnValue({ auth: {}, users: {} });
    getSessionTokenMock.mockReturnValue(null);
    getSessionUserMock.mockReturnValue(null);

    const event = {
      node: {
        req: {
          headers: {
            authorization: "Bearer forwarded-token",
          },
        },
      },
    } as unknown as H3Event;

    await fetchProfileEventsFromSource(event);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0];
    expect(options?.headers?.authorization).toBe("Bearer forwarded-token");
  });

  it("normalizes ISO timestamps returned by the API", async () => {
    const fetchMock = vi.fn().mockResolvedValue([
      {
        id: "iso-event",
        title: "ISO Event",
        start: "2025-02-03T15:00:00.000Z",
        end: "2025-02-03T16:30:00.000Z",
        location: "HQ",
      },
    ]);

    globalScope.$fetch = fetchMock;
    useRuntimeConfigMock.mockReturnValue({ auth: {}, users: {} });
    getSessionTokenMock.mockReturnValue(null);
    getSessionUserMock.mockReturnValue(null);

    const event = { node: { req: { headers: {} } } } as unknown as H3Event;

    const result = await fetchProfileEventsFromSource(event);

    expect(result).toEqual([
      {
        id: "iso-event",
        title: "ISO Event",
        start: "2025-02-03 15:00",
        end: "2025-02-03 16:30",
        location: "HQ",
      },
    ]);
  });

  it("returns mock events when the users API request is unauthorized", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValue(createError({ statusCode: 401, statusMessage: "Unauthorized" }));

    globalScope.$fetch = fetchMock;
    useRuntimeConfigMock.mockReturnValue({ auth: {}, users: {} });
    getSessionTokenMock.mockReturnValue(null);
    getSessionUserMock.mockReturnValue(null);

    const event = { node: { req: { headers: {} } } } as unknown as H3Event;

    const result = await fetchProfileEventsFromSource(event);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual(profileEventsSample);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Falling back to mock profile events",
      expect.anything(),
    );
  });
});

describe("fetchCurrentProfileFromSource", () => {
  it("returns the normalized profile from the authenticated session user", async () => {
    const event = { node: { req: { headers: {} } } } as unknown as H3Event;
    const sessionUser = {
      id: "123",
      username: "demo",
      email: "demo@example.com",
      firstName: "Demo",
      friends: {
        alice: {
          user: { id: "alice-id", username: "alice" },
          stories: [{ id: "story-1" }, null],
          status: 2,
        },
      },
      stories: [{ id: "own-story" }, null],
      profile: { id: "profile-1", title: "Admin" },
    };

    getSessionUserMock.mockReturnValue(sessionUser);

    const result = await fetchCurrentProfileFromSource(event);

    expect(result).toMatchObject({
      id: "123",
      username: "demo",
      email: "demo@example.com",
      firstName: "Demo",
      profile: { id: "profile-1", title: "Admin" },
    });
    expect(result.stories).toEqual([{ id: "own-story" }]);
    expect(result.friends).toEqual([
      {
        user: { id: "alice-id", username: "alice" },
        stories: [{ id: "story-1" }],
        status: 2,
      },
    ]);
  });

  it("throws an authentication error when no session user is available", async () => {
    const event = { node: { req: { headers: {} } } } as unknown as H3Event;

    getSessionUserMock.mockReturnValue(null);

    await expect(fetchCurrentProfileFromSource(event)).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: "Authentication is required to access this resource.",
      data: { message: "Authentication is required to access this resource." },
    });
  });
});
