import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createError, type H3Event } from "h3";
import {
  fetchCurrentProfileFromSource,
  fetchProfileEventsFromSource,
  fetchUsersListFromSource,
} from "~/server/utils/users/api";
import { profileEventsSample } from "~/lib/mock/profile";
import { usersListSample } from "~/lib/mock/users";

const getSessionTokenMock = vi.hoisted(() => vi.fn<[H3Event], string | null>());
const getSessionUserMock = vi.hoisted(() =>
  vi.fn<[H3Event], Record<string, unknown> | null>(),
);
const requireSessionTokenMock = vi.hoisted(() =>
  vi.fn(
    (
      event: H3Event,
      options: { statusCode?: number; statusMessage?: string; message?: string } = {},
    ) => {
      const token = getSessionTokenMock(event);

      if (token) {
        return token;
      }

      const statusCode = options.statusCode ?? 401;
      const statusMessage = options.statusMessage ?? "Authentication required";
      const message = options.message;

      throw createError({
        statusCode,
        statusMessage,
        data: message ? { message } : undefined,
      });
    },
  ),
);
const readCachedProfileMock = vi.hoisted(() =>
  vi.fn<[H3Event, string], Promise<Record<string, unknown> | null>>(),
);
const writeCachedProfileMock = vi.hoisted(() =>
  vi.fn<[H3Event, string, Record<string, unknown>], Promise<void>>(),
);
const deleteCachedProfileMock = vi.hoisted(() =>
  vi.fn<[H3Event, string], Promise<void>>(),
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
  requireSessionToken: requireSessionTokenMock,
  withAuthHeaders: withAuthHeadersMock,
}));

vi.mock("~/server/utils/cache/profile", () => ({
  readCachedProfile: readCachedProfileMock,
  writeCachedProfile: writeCachedProfileMock,
  deleteCachedProfile: deleteCachedProfileMock,
}));

vi.mock("#imports", () => ({
  useRuntimeConfig: useRuntimeConfigMock,
}));

const globalScope = globalThis as Record<string, unknown>;
const hadOriginalFetch = Object.prototype.hasOwnProperty.call(globalScope, "$fetch");
const originalFetch = globalScope.$fetch;
const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

beforeEach(() => {
  getSessionTokenMock.mockReset();
  getSessionUserMock.mockReset();
  requireSessionTokenMock.mockClear();
  readCachedProfileMock.mockReset();
  writeCachedProfileMock.mockReset();
  deleteCachedProfileMock.mockReset();
  withAuthHeadersMock.mockReset();
  useRuntimeConfigMock.mockReset();
  consoleWarnSpy.mockClear();
});

afterEach(() => {
  if (hadOriginalFetch) {
    globalScope.$fetch = originalFetch;
  } else {
    delete globalScope.$fetch;
  }
});

afterAll(() => {
  consoleWarnSpy.mockRestore();
});

describe("fetchProfileEventsFromSource", () => {
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
      expect.stringContaining("[mock] Falling back to mock profile events."),
    );
  });
});

describe("fetchUsersListFromSource", () => {
  it("falls back to mock users when the API request is unauthorized", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValue(createError({ statusCode: 401, statusMessage: "Unauthorized" }));

    globalScope.$fetch = fetchMock;
    useRuntimeConfigMock.mockReturnValue({ auth: {}, users: {} });
    getSessionTokenMock.mockReturnValue(null);
    getSessionUserMock.mockReturnValue(null);

    const event = { node: { req: { headers: {} } } } as unknown as H3Event;

    const result = await fetchUsersListFromSource(event);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ data: usersListSample, count: usersListSample.length });
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[mock] Falling back to mock users list."),
    );
  });
});

describe("fetchCurrentProfileFromSource", () => {
  it("returns the cached profile when available", async () => {
    const event = { node: { req: { headers: {} } } } as unknown as H3Event;
    const cachedProfile = {
      id: "cached-id",
      username: "cached-user",
      email: "cached@example.com",
      friends: [],
      stories: [],
    };

    useRuntimeConfigMock.mockReturnValue({ auth: {}, users: {} });
    getSessionTokenMock.mockReturnValue("session-token");
    readCachedProfileMock.mockResolvedValue(cachedProfile);

    const result = await fetchCurrentProfileFromSource(event);

    expect(result).toEqual(cachedProfile);
    expect(readCachedProfileMock).toHaveBeenCalledWith(event, "session-token");
    expect(writeCachedProfileMock).not.toHaveBeenCalled();
  });

  it("fetches the profile from the API and caches it when no cache is present", async () => {
    const event = { node: { req: { headers: {} } } } as unknown as H3Event;
    const apiProfile = {
      data: {
        id: "123",
        username: "demo",
        email: "demo@example.com",
        friends: { one: { user: { id: "friend-1", username: "friend" }, stories: [] } },
        stories: [{ id: "story-1" }],
      },
    };

    useRuntimeConfigMock.mockReturnValue({ auth: {}, users: {} });
    getSessionTokenMock.mockReturnValue("session-token");
    readCachedProfileMock.mockResolvedValue(null);

    const fetchMock = vi.fn().mockResolvedValue(apiProfile);
    globalScope.$fetch = fetchMock;

    const result = await fetchCurrentProfileFromSource(event);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint] = fetchMock.mock.calls[0];
    expect(endpoint).toBe("https://bro-world.org/api/v1/profile");
    expect(writeCachedProfileMock).toHaveBeenCalledWith(
      event,
      "session-token",
      expect.objectContaining({ id: "123", username: "demo" }),
    );
    expect(result).toMatchObject({ id: "123", username: "demo", email: "demo@example.com" });
    expect(result.friends).toEqual([
      {
        user: { id: "friend-1", username: "friend" },
        stories: [],
      },
    ]);
    expect(result.stories).toEqual([{ id: "story-1" }]);
  });

  it("falls back to the session user when the API request fails", async () => {
    const event = { node: { req: { headers: {} } } } as unknown as H3Event;
    const sessionUser = {
      id: "fallback-id",
      username: "fallback",
      email: "fallback@example.com",
      friends: { bob: { user: { id: "bob", username: "bob" }, stories: [{ id: "story-bob" }] } },
      stories: [{ id: "own-story" }],
    };

    useRuntimeConfigMock.mockReturnValue({ auth: {}, users: {} });
    getSessionTokenMock.mockReturnValue("session-token");
    readCachedProfileMock.mockResolvedValue(null);
    getSessionUserMock.mockReturnValue(sessionUser);

    const fetchMock = vi
      .fn()
      .mockRejectedValue(createError({ statusCode: 502, statusMessage: "Bad Gateway" }));
    globalScope.$fetch = fetchMock;

    const result = await fetchCurrentProfileFromSource(event);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(writeCachedProfileMock).toHaveBeenCalledWith(
      event,
      "session-token",
      expect.objectContaining({ id: "fallback-id" }),
    );
    expect(result).toMatchObject({ id: "fallback-id", username: "fallback" });
    expect(result.stories).toEqual([{ id: "own-story" }]);
    expect(result.friends).toEqual([
      {
        user: { id: "bob", username: "bob" },
        stories: [{ id: "story-bob" }],
      },
    ]);
  });

  it("clears cached entries and propagates authorization errors", async () => {
    const event = { node: { req: { headers: {} } } } as unknown as H3Event;

    useRuntimeConfigMock.mockReturnValue({ auth: {}, users: {} });
    getSessionTokenMock.mockReturnValue("session-token");
    readCachedProfileMock.mockResolvedValue(null);
    getSessionUserMock.mockReturnValue(null);

    const fetchMock = vi
      .fn()
      .mockRejectedValue(createError({ statusCode: 401, statusMessage: "Unauthorized" }));
    globalScope.$fetch = fetchMock;

    await expect(fetchCurrentProfileFromSource(event)).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: "Authentication is required to access this resource.",
    });

    expect(deleteCachedProfileMock).toHaveBeenCalledWith(event, "session-token");
  });

  it("throws an authentication error when no session token is available", async () => {
    const event = { node: { req: { headers: {} } } } as unknown as H3Event;

    useRuntimeConfigMock.mockReturnValue({ auth: {}, users: {} });
    getSessionTokenMock.mockReturnValue(null);

    await expect(fetchCurrentProfileFromSource(event)).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: "Authentication is required to access this resource.",
      data: { message: "Authentication is required to access this resource." },
    });
  });

  it("allows forwarded authorization headers to bypass the session token requirement", async () => {
    const event = {
      node: {
        req: {
          headers: {
            authorization: "Basic ZGVtbzpwYXNz",
          },
        },
      },
    } as unknown as H3Event;
    const apiProfile = {
      id: "header-user",
      username: "header",
      email: "header@example.com",
      friends: [],
      stories: [],
    };

    useRuntimeConfigMock.mockReturnValue({ auth: {}, users: {} });
    getSessionTokenMock.mockReturnValue(null);
    readCachedProfileMock.mockResolvedValue(null);

    const fetchMock = vi.fn().mockResolvedValue(apiProfile);
    globalScope.$fetch = fetchMock;

    const result = await fetchCurrentProfileFromSource(event);

    expect(requireSessionTokenMock).not.toHaveBeenCalled();
    expect(readCachedProfileMock).not.toHaveBeenCalled();
    expect(writeCachedProfileMock).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual(apiProfile);
  });

  it("ignores the session cache when a forwarded authorization header is present", async () => {
    const event = {
      node: {
        req: {
          headers: {
            authorization: "Bearer external-token",
          },
        },
      },
    } as unknown as H3Event;
    const apiProfile = {
      id: "header-user",
      username: "header",
      email: "header@example.com",
      friends: [],
      stories: [],
    };

    useRuntimeConfigMock.mockReturnValue({ auth: {}, users: {} });
    getSessionTokenMock.mockReturnValue("session-token");

    const fetchMock = vi.fn().mockResolvedValue(apiProfile);
    globalScope.$fetch = fetchMock;

    const result = await fetchCurrentProfileFromSource(event);

    expect(readCachedProfileMock).not.toHaveBeenCalled();
    expect(writeCachedProfileMock).not.toHaveBeenCalled();
    expect(getSessionUserMock).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual(apiProfile);
  });

  it("skips the session token requirement when a service token is configured", async () => {
    const event = { node: { req: { headers: {} } } } as unknown as H3Event;
    const apiProfile = {
      id: "service-user",
      username: "service",
      email: "service@example.com",
      friends: [],
      stories: [],
    };

    useRuntimeConfigMock.mockReturnValue({ auth: { apiToken: "service-token" }, users: {} });
    getSessionTokenMock.mockReturnValue(null);
    readCachedProfileMock.mockResolvedValue(null);

    const fetchMock = vi.fn().mockResolvedValue(apiProfile);
    globalScope.$fetch = fetchMock;

    const result = await fetchCurrentProfileFromSource(event);

    expect(requireSessionTokenMock).not.toHaveBeenCalled();
    expect(readCachedProfileMock).not.toHaveBeenCalled();
    expect(writeCachedProfileMock).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual(apiProfile);
  });

  it("ignores the session cache when a service token is configured", async () => {
    const event = { node: { req: { headers: {} } } } as unknown as H3Event;
    const apiProfile = {
      id: "service-user",
      username: "service",
      email: "service@example.com",
      friends: [],
      stories: [],
    };

    useRuntimeConfigMock.mockReturnValue({ auth: { apiToken: "service-token" }, users: {} });
    getSessionTokenMock.mockReturnValue("session-token");

    const fetchMock = vi.fn().mockResolvedValue(apiProfile);
    globalScope.$fetch = fetchMock;

    const result = await fetchCurrentProfileFromSource(event);

    expect(readCachedProfileMock).not.toHaveBeenCalled();
    expect(writeCachedProfileMock).not.toHaveBeenCalled();
    expect(getSessionUserMock).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual(apiProfile);
  });
});
