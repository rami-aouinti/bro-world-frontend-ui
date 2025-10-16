import type { H3Event } from "h3";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getCookieMock = vi.hoisted(() => vi.fn<[H3Event, string], string | null | undefined>());
const setCookieMock = vi.hoisted(() => vi.fn());
const getHeaderMock = vi.hoisted(() => vi.fn<[H3Event, string], string | null | undefined>());

vi.mock("h3", () => ({
  getCookie: getCookieMock,
  setCookie: setCookieMock,
  getHeader: getHeaderMock,
  deleteCookie: vi.fn(),
  createError: vi.fn(),
}));

const useRuntimeConfigMock = vi.hoisted(() => vi.fn(() => ({ auth: {} })));

vi.mock("#imports", () => ({
  useRuntimeConfig: useRuntimeConfigMock,
}));

const shouldUseSecureCookiesMock = vi.hoisted(() => vi.fn(() => false));
const withSecureCookieOptionsMock = vi.hoisted(
  () =>
    vi.fn((options: Record<string, unknown> = {}) => ({
      path: "/",
      secure: typeof options.secure === "boolean" ? options.secure : false,
      ...options,
    })),
);

vi.mock("~/lib/cookies", () => ({
  shouldUseSecureCookies: shouldUseSecureCookiesMock,
  withSecureCookieOptions: withSecureCookieOptionsMock,
}));

import { getSessionToken } from "~/server/utils/auth/session";

function createEvent(): H3Event {
  return {
    context: {},
    node: {
      req: {
        headers: {},
      },
      res: {
        headersSent: false,
        writableEnded: false,
        writableFinished: false,
      },
    },
  } as unknown as H3Event;
}

describe("getSessionToken", () => {
  beforeEach(() => {
    getCookieMock.mockReset();
    setCookieMock.mockReset();
    getHeaderMock.mockReset();
    useRuntimeConfigMock.mockReset();
    shouldUseSecureCookiesMock.mockReset();
    withSecureCookieOptionsMock.mockReset();

    useRuntimeConfigMock.mockReturnValue({ auth: {} });
    shouldUseSecureCookiesMock.mockReturnValue(false);
    withSecureCookieOptionsMock.mockImplementation((options: Record<string, unknown> = {}) => ({
      path: "/",
      secure: typeof options.secure === "boolean" ? options.secure : false,
      ...options,
    }));
    getHeaderMock.mockReturnValue(null);
    vi.stubGlobal("useRuntimeConfig", useRuntimeConfigMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses alternative session cookie names when syncing tokens", () => {
    const event = createEvent();

    getCookieMock.mockImplementation((_, name) => {
      if (name === "auth_token") {
        return null;
      }

      if (name === "auth_session_token") {
        return null;
      }

      if (name === "auth_session") {
        return " session-token ";
      }

      return null;
    });

    const token = getSessionToken(event);

    expect(token).toBe("session-token");

    const cookieNames = setCookieMock.mock.calls.map(([, name]) => name);
    expect(cookieNames).toEqual([
      "auth_token",
      "auth_token_present",
      "auth_session_token",
    ]);

    const sessionCookieCall = setCookieMock.mock.calls.find(([, name]) => name === "auth_session_token");
    expect(sessionCookieCall).toBeDefined();
    expect(sessionCookieCall?.[2]).toBe("session-token");
    expect(sessionCookieCall?.[3]).toMatchObject({
      sameSite: "strict",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
      secure: false,
      path: "/",
    });
  });
});
