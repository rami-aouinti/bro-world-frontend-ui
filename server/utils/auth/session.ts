import { deleteCookie, getCookie, setCookie } from "h3";
import type { H3Event } from "h3";
import type { AuthUser } from "../../../types/auth";
import { shouldUseSecureCookies, withSecureCookieOptions } from "../../../lib/cookies";

interface SessionCookiesConfig {
  tokenCookieName: string;
  sessionTokenCookieName: string;
  userCookieName: string;
  tokenPresenceCookieName: string;
  maxAge: number;
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

export function getSessionToken(event: H3Event): string | null {
  const { tokenCookieName, sessionTokenCookieName, tokenPresenceCookieName, maxAge } =
    resolveCookiesConfig(event);
  const token = getCookie(event, tokenCookieName);

  if (token) {
    return token;
  }

  const fallbackToken = getCookie(event, sessionTokenCookieName);

  if (!fallbackToken) {
    return null;
  }

  const response = event.node?.res;
  const canSetCookies = response && !response.headersSent && !response.writableEnded;

  if (canSetCookies) {
    const secure = shouldUseSecureCookies(event);

    setCookie(
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

    setCookie(
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

export function getSessionUser(event: H3Event): AuthUser | null {
  const { userCookieName } = resolveCookiesConfig(event);
  const raw = getCookie(event, userCookieName);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch (error) {
    console.warn("Unable to parse auth user cookie", error);
    return null;
  }
}

function sanitizeSessionUser(user: AuthUser): AuthUser {
  const sanitized: AuthUser = {
    id: user.id,
    username: user.username,
    email: user.email,
  };

  if ("firstName" in user && typeof user.firstName !== "undefined") {
    sanitized.firstName = user.firstName ?? null;
  }

  if ("lastName" in user && typeof user.lastName !== "undefined") {
    sanitized.lastName = user.lastName ?? null;
  }

  if ("enabled" in user && typeof user.enabled !== "undefined") {
    sanitized.enabled = user.enabled;
  }

  if ("photo" in user && typeof user.photo !== "undefined") {
    sanitized.photo = user.photo ?? null;
  }

  if (Array.isArray(user.roles)) {
    sanitized.roles = user.roles;
  }

  return sanitized;
}

export function setSession(event: H3Event, token: string, user: AuthUser) {
  const { tokenCookieName, sessionTokenCookieName, userCookieName, tokenPresenceCookieName, maxAge } =
    resolveCookiesConfig(event);
  const secure = shouldUseSecureCookies(event);
  const sanitizedUser = sanitizeSessionUser(user);

  setCookie(
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

  setCookie(
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

  setCookie(
    event,
    userCookieName,
    JSON.stringify(sanitizedUser),
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

  setCookie(
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

export function clearAuthSession(event: H3Event) {
  const { tokenCookieName, sessionTokenCookieName, userCookieName, tokenPresenceCookieName } =
    resolveCookiesConfig(event);

  deleteCookie(event, tokenCookieName, { path: "/" });
  deleteCookie(event, sessionTokenCookieName, { path: "/" });
  deleteCookie(event, userCookieName, { path: "/" });
  deleteCookie(event, tokenPresenceCookieName, { path: "/" });
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
