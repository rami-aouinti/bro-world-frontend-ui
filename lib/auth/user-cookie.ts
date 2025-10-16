import type { AuthUser } from "~/types/auth";

export const AUTH_USER_COOKIE_MAX_VALUE_LENGTH = 3800;

export type AuthUserCookie = Pick<AuthUser, "id" | "username" | "email"> &
  Partial<Pick<AuthUser, "firstName" | "lastName" | "photo" | "roles" | "enabled">>;

const OPTIONAL_FIELDS_PRIORITY: Array<keyof AuthUserCookie> = [
  "photo",
  "roles",
  "lastName",
  "firstName",
  "enabled",
];

export function buildAuthUserCookie(user: AuthUser | null): AuthUserCookie | null {
  if (!user) {
    return null;
  }

  const payload: AuthUserCookie = {
    id: user.id,
    username: user.username,
    email: user.email,
  };

  if ("firstName" in user && typeof user.firstName !== "undefined") {
    payload.firstName = user.firstName ?? null;
  }

  if ("lastName" in user && typeof user.lastName !== "undefined") {
    payload.lastName = user.lastName ?? null;
  }

  if ("photo" in user && typeof user.photo !== "undefined") {
    payload.photo = user.photo ?? null;
  }

  if (Array.isArray(user.roles)) {
    payload.roles = user.roles;
  }

  if ("enabled" in user && typeof user.enabled !== "undefined") {
    payload.enabled = user.enabled;
  }

  return trimAuthUserCookie(payload);
}

export function trimAuthUserCookie(payload: AuthUserCookie): AuthUserCookie {
  const result: AuthUserCookie = { ...payload };
  let serialized = JSON.stringify(result);

  for (const key of OPTIONAL_FIELDS_PRIORITY) {
    if (serialized.length <= AUTH_USER_COOKIE_MAX_VALUE_LENGTH) {
      break;
    }

    if (key in result) {
      delete (result as Record<string, unknown>)[key];
      serialized = JSON.stringify(result);
    }
  }

  if (serialized.length > AUTH_USER_COOKIE_MAX_VALUE_LENGTH) {
    return {
      id: result.id,
      username: result.username,
      email: result.email,
    };
  }

  return result;
}

export function serializeAuthUserCookie(user: AuthUser | null): string | null {
  const payload = buildAuthUserCookie(user);

  if (!payload) {
    return null;
  }

  return JSON.stringify(payload);
}
