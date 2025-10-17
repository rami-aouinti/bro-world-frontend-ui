import { createError, deleteCookie, getCookie, getHeader, setCookie } from "h3";
import type { H3Event } from "h3";
import type { AuthUser } from "~/types/auth";
import { shouldUseSecureCookies, withSecureCookieOptions } from "~/lib/cookies";
import { isHeadersSentError } from "../http/errors";
import { deleteCachedProfile } from "../cache/profile";
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
const SESSION_TOKEN_CONTEXT_KEY = "__broSessionToken" as const;

type SessionEventContext = {
  [SESSION_COOKIE_SYNC_SKIP_FLAG]?: boolean;
  [SESSION_TOKEN_CONTEXT_KEY]?: string | null;
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

function resolveSessionCookieCandidates(name: string): string[] {
  const trimmed = name?.trim();

  if (!trimmed) {
    return [];
  }

  const candidates = [trimmed];
  const suffixes: readonly string[] = ["_token", "-token"];

  for (const suffix of suffixes) {
    if (trimmed.endsWith(suffix)) {
      const alternative = trimmed.slice(0, -suffix.length);

      if (alternative && !candidates.includes(alternative)) {
        candidates.push(alternative);
      }
    }
  }

  return candidates;
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

function readSessionTokenFromContext(event: H3Event): string | null {
  const context = event.context as SessionEventContext;
  const raw = context[SESSION_TOKEN_CONTEXT_KEY];

  return sanitizeTokenValue(raw);
}

function writeSessionTokenToContext(event: H3Event, token: string | null | undefined) {
  const context = event.context as SessionEventContext;
  const sanitized = sanitizeTokenValue(token);

  if (sanitized) {
    context[SESSION_TOKEN_CONTEXT_KEY] = sanitized;
    return;
  }

  delete context[SESSION_TOKEN_CONTEXT_KEY];
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
  const contextToken = readSessionTokenFromContext(event);

  if (contextToken) {
    return contextToken;
  }

  const { tokenCookieName, sessionTokenCookieName, tokenPresenceCookieName, maxAge } =
    resolveCookiesConfig(event);
  const token = sanitizeTokenValue(getCookie(event, tokenCookieName));

  if (token) {
    writeSessionTokenToContext(event, token);
    return token;
  }

  const sessionCookieCandidates = resolveSessionCookieCandidates(sessionTokenCookieName);
  let fallbackToken: string | null = null;
  let fallbackSource: string | null = null;

  for (const candidate of sessionCookieCandidates) {
    const value = sanitizeTokenValue(getCookie(event, candidate));

    if (value) {
      fallbackToken = value;
      fallbackSource = candidate;
      break;
    }
  }

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

      if (fallbackSource !== sessionTokenCookieName) {
        safeSetCookie(
          event,
          sessionTokenCookieName,
          fallbackToken,
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
    }

    writeSessionTokenToContext(event, fallbackToken);
    return fallbackToken;
  }

  const headerToken = extractBearerToken(getHeader(event, "authorization"));

  writeSessionTokenToContext(event, headerToken);

  return headerToken;
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
  const normalizedToken = sanitizeTokenValue(token) ?? token;

  writeSessionTokenToContext(event, normalizedToken);

  safeSetCookie(
    event,
    tokenCookieName,
    normalizedToken,
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
    normalizedToken,
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

  void writeCachedSessionUser(event, normalizedToken, sanitizedUser);
}

export function clearAuthSession(event: H3Event) {
  const context = event.context as SessionEventContext;
  const previousSkip = context[SESSION_COOKIE_SYNC_SKIP_FLAG];
  context[SESSION_COOKIE_SYNC_SKIP_FLAG] = true;
  const sessionToken = getSessionToken(event);

  writeSessionTokenToContext(event, null);

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
    void deleteCachedProfile(event, sessionToken);
    void deleteCachedSessionUser(event, sessionToken);
  }
}

interface AuthHeaderOptions {
  includeCookies?: boolean;
}

function hasHeader(headers: Record<string, string>, name: string): boolean {
  const target = name.toLowerCase();

  return Object.keys(headers).some((key) => key.toLowerCase() === target);
}

export function getAuthCookieNames(event: H3Event) {
  const { tokenCookieName, sessionTokenCookieName } = resolveCookiesConfig(event);

  return {
    tokenCookieName,
    sessionTokenCookieName,
  };
}

export function withAuthHeaders(
  event: H3Event,
  headers: Record<string, string> = {},
  options: AuthHeaderOptions = {},
) {
  const result = { ...headers };
  const token = getSessionToken(event);

  if (token && !hasHeader(result, "authorization")) {
    result.Authorization = `Bearer ${token}`;
  }

  if (options.includeCookies && !hasHeader(result, "cookie")) {
    const forwardedCookies = getHeader(event, "cookie");

    if (forwardedCookies) {
      result.Cookie = forwardedCookies;
    }
  }

  return result;
}

interface RequireSessionTokenOptions {
  statusCode?: number;
  statusMessage?: string;
  message?: string;
}

interface WaitForSessionTokenOptions {
  timeout?: number;
  interval?: number;
}

export async function waitForSessionToken(
  event: H3Event,
  options: WaitForSessionTokenOptions = {},
) {
  const { timeout = 1_000, interval = 50 } = options;
  const deadline = Date.now() + Math.max(timeout, 0);
  let token = getSessionToken(event);

  if (token || timeout <= 0) {
    return token;
  }

  const delay = Math.max(0, interval);

  while (!token && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    token = getSessionToken(event);
  }

  return token;
}

export function requireSessionToken(event: H3Event, options: RequireSessionTokenOptions = {}) {
  const token = getSessionToken(event);

  if (token) {
    return token;
  }

  const {
    statusCode = 401,
    statusMessage: rawStatusMessage = "Authentication required",
    message,
  } = options;
  const resolvedStatusMessage =
    typeof rawStatusMessage === "string" && rawStatusMessage.trim()
      ? rawStatusMessage.trim()
      : "Authentication required";
  const resolvedMessage =
    typeof message === "string" && message.trim() ? message.trim() : resolvedStatusMessage;
  const data = resolvedMessage ? { message: resolvedMessage } : undefined;

  throw createError({
    statusCode,
    statusMessage: resolvedStatusMessage,
    message: resolvedMessage,
    data,
  });
}
