import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";

const getSessionTokenMock = vi.hoisted(() => vi.fn<[H3Event], string | null>());
const useRuntimeConfigMock = vi.hoisted(() =>
  vi.fn(() => ({
    auth: {},
    users: {},
  })),
);

vi.mock("~/server/utils/auth/session", () => ({
  getSessionToken: getSessionTokenMock,
}));

vi.mock("#imports", () => ({
  useRuntimeConfig: useRuntimeConfigMock,
}));

import {
  fetchCurrentProfileFromSource,
  fetchProfileEventsFromSource,
} from "~/server/utils/users/api";

const globalScope = globalThis as Record<string, unknown>;
const hadOriginalFetch = Object.prototype.hasOwnProperty.call(globalScope, "$fetch");
const originalFetch = globalScope.$fetch;

beforeEach(() => {
  getSessionTokenMock.mockReset();
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
  it("uses the users API base when requesting profile events", async () => {
    const fetchMock = vi.fn().mockResolvedValue([]);
    globalScope.$fetch = fetchMock;
    useRuntimeConfigMock.mockReturnValue({ auth: {}, users: {} });
    getSessionTokenMock.mockReturnValue(null);

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
    const fetchMock = vi.fn().mockResolvedValue({
      id: "123",
      username: "demo",
      email: "demo@example.com",
    });

    globalScope.$fetch = fetchMock;
    useRuntimeConfigMock.mockReturnValue({ auth: {}, users: {} });
    getSessionTokenMock.mockReturnValue("new-session-token");

    const event = {
      node: {
        req: {
          headers: {
            authorization: "Bearer old-session-token",
          },
        },
      },
    } as unknown as H3Event;

    await fetchCurrentProfileFromSource(event);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, options] = fetchMock.mock.calls[0];

    expect(options?.headers?.authorization).toBe("Bearer new-session-token");
  });

  it("falls back to the forwarded authorization header when no session token is available", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      id: "123",
      username: "demo",
      email: "demo@example.com",
    });

    globalScope.$fetch = fetchMock;
    useRuntimeConfigMock.mockReturnValue({ auth: {}, users: {} });
    getSessionTokenMock.mockReturnValue(null);

    const event = {
      node: {
        req: {
          headers: {
            authorization: "Bearer forwarded-token",
          },
        },
      },
    } as unknown as H3Event;

    await fetchCurrentProfileFromSource(event);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, options] = fetchMock.mock.calls[0];

    expect(options?.headers?.authorization).toBe("Bearer forwarded-token");
  });
});
