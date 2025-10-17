import type { H3Event } from "h3";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getCookieMock = vi.hoisted(() => vi.fn<[H3Event, string], string | null | undefined>());
const setCookieMock = vi.hoisted(() => vi.fn());
const getHeaderMock = vi.hoisted(() => vi.fn<[H3Event, string], string | null | undefined>());
const createErrorMock = vi.hoisted(() => vi.fn());

vi.mock("h3", () => ({
  getCookie: getCookieMock,
  setCookie: setCookieMock,
  getHeader: getHeaderMock,
  deleteCookie: vi.fn(),
  createError: createErrorMock,
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

import { getSessionToken, requireSessionToken, waitForSessionToken } from "~/server/utils/auth/session";

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

beforeEach(() => {
  getCookieMock.mockReset();
  setCookieMock.mockReset();
  getHeaderMock.mockReset();
  useRuntimeConfigMock.mockReset();
  shouldUseSecureCookiesMock.mockReset();
  withSecureCookieOptionsMock.mockReset();
  createErrorMock.mockReset();

  useRuntimeConfigMock.mockReturnValue({ auth: {} });
  shouldUseSecureCookiesMock.mockReturnValue(false);
  withSecureCookieOptionsMock.mockImplementation((options: Record<string, unknown> = {}) => ({
    path: "/",
    secure: typeof options.secure === "boolean" ? options.secure : false,
    ...options,
  }));
  getCookieMock.mockImplementation(() => null);
  getHeaderMock.mockReturnValue(null);
  createErrorMock.mockImplementation((options: unknown) => options);
  vi.stubGlobal("useRuntimeConfig", useRuntimeConfigMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getSessionToken", () => {

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

describe("requireSessionToken", () => {
  it("throws an authentication error when no token is present", () => {
    const event = createEvent();
    let thrown: unknown;

    try {
      requireSessionToken(event);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toMatchObject({
      statusCode: 401,
      statusMessage: "Authentication required",
      message: "Authentication required",
      data: { message: "Authentication required" },
    });

    expect(createErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        statusMessage: "Authentication required",
        message: "Authentication required",
      }),
    );
  });

  it("respects custom status and data messages", () => {
    const event = createEvent();

    let thrown: unknown;

    try {
      requireSessionToken(event, {
        statusCode: 403,
        statusMessage: "Forbidden", // should be preserved as the HTTP status text
        message: "Custom message",
      });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toMatchObject({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "Custom message",
      data: { message: "Custom message" },
    });

    expect(createErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        statusMessage: "Forbidden",
        message: "Custom message",
        data: { message: "Custom message" },
      }),
    );
  });
});

describe("waitForSessionToken", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns immediately when a token is already available", async () => {
    const event = createEvent();

    getCookieMock.mockImplementation((_, name) => {
      if (name === "auth_token") {
        return "existing-token";
      }

      return null;
    });

    const token = await waitForSessionToken(event);

    expect(token).toBe("existing-token");
    expect(getCookieMock).toHaveBeenCalled();
  });

  it("polls until a token becomes available within the timeout", async () => {
    const event = createEvent();
    let attempts = 0;

    getCookieMock.mockImplementation((_, name) => {
      if (name === "auth_token") {
        attempts += 1;
        return attempts > 3 ? "delayed-token" : null;
      }

      return null;
    });

    vi.useFakeTimers();

    const tokenPromise = waitForSessionToken(event, { interval: 20, timeout: 200 });

    await vi.advanceTimersByTimeAsync(60);
    await vi.advanceTimersByTimeAsync(60);

    const token = await tokenPromise;

    expect(token).toBe("delayed-token");
    expect(attempts).toBeGreaterThan(3);
  });

  it("returns null when no token is available before the timeout elapses", async () => {
    const event = createEvent();

    getCookieMock.mockReturnValue(null);

    vi.useFakeTimers();

    const tokenPromise = waitForSessionToken(event, { interval: 25, timeout: 60 });

    await vi.advanceTimersByTimeAsync(100);

    const token = await tokenPromise;

    expect(token).toBeNull();
    expect(getCookieMock).toHaveBeenCalled();
  });
});
