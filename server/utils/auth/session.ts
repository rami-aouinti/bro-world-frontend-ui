import { createError, deleteCookie, getCookie, getHeader, setCookie } from "h3";
import type { H3Event } from "h3";
import type { AuthUser } from "~/types/auth";
import { shouldUseSecureCookies, withSecureCookieOptions } from "~/lib/cookies";
import { isHeadersSentError } from "../http/errors";
import { deleteCachedMercureToken } from "../mercure/cache";
import { deleteCachedSessionUser, writeCachedSessionUser } from "./user-cache";
import { normalizeSessionUser, sanitizeSessionUser } from "./user";
import { serializeAuthUserCookie } from "~/lib/auth/user-cookie";

interface SessionCookiesConfig {
  tokenCookieName: string;
  sessionTokenCookieName: string;
  userCookieName: string;
  tokenPresenceCookieName: string;
  maxAge: number;
}

export const SESSION_COOKIE_SYNC_SKIP_FLAG = "__broSkipSessionCookieSync" as const;

type SessionEventContext = {
  [SESSION_COOKIE_SYNC_SKIP_FLAG]?: boolean;
};

function isResponseWritable(event: H3Event): boolean {
  const response = event.node?.res;

  if (!response) {
    return false;
  }

  return !response.headersSent && !response.writableEnded && !response.writableFinished;
}

function shouldSyncSessionCookies(event: H3Event): boolean {
  const context = event.context as SessionEventContext;

  if (context[SESSION_COOKIE_SYNC_SKIP_FLAG]) {
    return false;
  }

  return isResponseWritable(event);
}

function resolveCookiesConfig(event: H3Event): SessionCookiesConfig {
  const runtimeConfig = useRuntimeConfig(event);
  const authConfig = runtimeConfig.auth ?? {};

  const maxAgeEnv = Number.parseInt(authConfig.sessionMaxAge ?? "", 10);
  const fallbackMaxAge = 60 * 60 * 24 * 7; // 7 days
  const maxAge = Number.isFinite(maxAgeEnv) && maxAgeEnv > 0 ? maxAgeEnv : fallbackMaxAge;

  return {
    tokenCookieName: authConfig.tokenCookieName ?? "auth_token",
    sessionTokenCookieName: authConfig.sessionTokenCookieName ?? "auth_session_token",
    userCookieName: authConfig.userCookieName ?? "auth_user",
    tokenPresenceCookieName: authConfig.tokenPresenceCookieName ?? "auth_token_present",
    maxAge,
  };
}

function safeDeleteCookie(
  event: H3Event,
  name: string,
  options?: Parameters<typeof deleteCookie>[2],
) {
  const response = event.node?.res;

  if (!response || response.headersSent || response.writableEnded || response.writableFinished) {
    return;
  }

  try {
    deleteCookie(event, name, options);
  } catch (error) {
    if (isHeadersSentError(error)) {
      return;
    }

    throw error;
  }
}

function safeSetCookie(
  event: H3Event,
  name: string,
  value: string,
  options?: Parameters<typeof setCookie>[3],
) {
  const response = event.node?.res;

  if (!response || response.headersSent || response.writableEnded || response.writableFinished) {
    return;
  }

  try {
    setCookie(event, name, value, options);
  } catch (error) {
    if (isHeadersSentError(error)) {
      return;
    }

    throw error;
  }
}

function sanitizeTokenValue(raw: string | null | undefined): string | null {
  if (!raw) {
    return null;
  }

  const trimmed = raw.trim();

  if (!trimmed) {
    return null;
  }

  const bearerMatch = trimmed.match(/^[Bb]earer\s+(.+)$/);

  if (bearerMatch?.[1]) {
    const bearerToken = bearerMatch[1].trim();

    return bearerToken || null;
  }

  return trimmed;
}

function extractBearerToken(raw: string | null | undefined): string | null {
  if (!raw) {
    return null;
  }

  const match = raw.match(/^[Bb]earer\s+(.+)$/);

  if (!match?.[1]) {
    return null;
  }

  const token = match[1].trim();

  return token || null;
}

export function getSessionToken(event: H3Event): string | null {
  const { tokenCookieName, sessionTokenCookieName, tokenPresenceCookieName, maxAge } =
    resolveCookiesConfig(event);
  const token = sanitizeTokenValue(getCookie(event, tokenCookieName));

  if (token) {
    return token;
  }

  const fallbackToken = sanitizeTokenValue(getCookie(event, sessionTokenCookieName));

  if (fallbackToken) {
    const secure = shouldUseSecureCookies(event);

    if (shouldSyncSessionCookies(event)) {
      safeSetCookie(
        event,
        tokenCookieName,
        fallbackToken,
        withSecureCookieOptions(
          {
            httpOnly: true,
            sameSite: "lax",
            maxAge,
          },
          event,
        ),
      );

      safeSetCookie(
        event,
        tokenPresenceCookieName,
        "1",
        withSecureCookieOptions(
          {
            httpOnly: false,
            sameSite: "strict",
            maxAge,
            secure,
          },
          event,
        ),
      );
    }

    return fallbackToken;
  }

  return extractBearerToken(getHeader(event, "authorization"));
}

export function getSessionUser(event: H3Event): AuthUser | null {
  const { userCookieName } = resolveCookiesConfig(event);
  const raw = getCookie(event, userCookieName);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return normalizeSessionUser(parsed);
  } catch (error) {
    console.warn("Unable to parse auth user cookie", error);
    return null;
  }
}

export function setSession(event: H3Event, token: string, user: AuthUser) {
  const {
    tokenCookieName,
    sessionTokenCookieName,
    userCookieName,
    tokenPresenceCookieName,
    maxAge,
  } = resolveCookiesConfig(event);
  const secure = shouldUseSecureCookies(event);
  const sanitizedUser = sanitizeSessionUser(user);
  const serializedUserCookie = serializeAuthUserCookie(sanitizedUser);

  safeSetCookie(
    event,
    tokenCookieName,
    token,
    withSecureCookieOptions(
      {
        httpOnly: true,
        sameSite: "lax",
        maxAge,
      },
      event,
    ),
  );

  safeSetCookie(
    event,
    sessionTokenCookieName,
    token,
    withSecureCookieOptions(
      {
        httpOnly: false,
        sameSite: "strict",
        maxAge,
        secure,
      },
      event,
    ),
  );

  if (serializedUserCookie) {
    safeSetCookie(
      event,
      userCookieName,
      serializedUserCookie,
      withSecureCookieOptions(
        {
          httpOnly: false,
          sameSite: "lax",
          maxAge,
          secure,
        },
        event,
      ),
    );
  }

  safeSetCookie(
    event,
    tokenPresenceCookieName,
    "1",
    withSecureCookieOptions(
      {
        httpOnly: false,
        sameSite: "strict",
        maxAge,
        secure,
      },
      event,
    ),
  );

  void writeCachedSessionUser(event, token, sanitizedUser);
}

export function clearAuthSession(event: H3Event) {
  const context = event.context as SessionEventContext;
  const previousSkip = context[SESSION_COOKIE_SYNC_SKIP_FLAG];
  context[SESSION_COOKIE_SYNC_SKIP_FLAG] = true;
  const sessionToken = getSessionToken(event);

  if (typeof previousSkip === "undefined") {
    delete context[SESSION_COOKIE_SYNC_SKIP_FLAG];
  } else {
    context[SESSION_COOKIE_SYNC_SKIP_FLAG] = previousSkip;
  }

  const { tokenCookieName, sessionTokenCookieName, userCookieName, tokenPresenceCookieName } =
    resolveCookiesConfig(event);

  safeDeleteCookie(event, tokenCookieName, { path: "/" });
  safeDeleteCookie(event, sessionTokenCookieName, { path: "/" });
  safeDeleteCookie(event, userCookieName, { path: "/" });
  safeDeleteCookie(event, tokenPresenceCookieName, { path: "/" });

  if (sessionToken) {
    void deleteCachedMercureToken(event, sessionToken);
    void deleteCachedSessionUser(event, sessionToken);
  }
}

export function withAuthHeaders(event: H3Event, headers: Record<string, string> = {}) {
  const token = getSessionToken(event);

  if (!token) {
    return headers;
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}

interface RequireSessionTokenOptions {
  statusCode?: number;
  statusMessage?: string;
  message?: string;
}

export function requireSessionToken(event: H3Event, options: RequireSessionTokenOptions = {}) {
  const token = getSessionToken(event);

  if (token) {
    return token;
  }

  const { statusCode = 401, statusMessage = "Authentication required", message } = options;
  const data = message ? { message } : undefined;

  throw createError({
    statusCode,
    statusMessage,
    data,
  });
}
