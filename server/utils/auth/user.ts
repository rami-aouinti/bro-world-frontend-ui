import type { AuthUser } from "~/types/auth";

export function sanitizeSessionUser(user: AuthUser): AuthUser {
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

export function normalizeSessionUser(payload: unknown): AuthUser | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const id = typeof record.id === "string" && record.id.trim() ? record.id.trim() : null;
  const username = typeof record.username === "string" && record.username.trim()
    ? record.username.trim()
    : null;
  const email = typeof record.email === "string" && record.email.trim()
    ? record.email.trim()
    : null;

  if (!id || !username || !email) {
    return null;
  }

  const user: AuthUser = {
    id,
    username,
    email,
  };

  if (typeof record.firstName === "string") {
    user.firstName = record.firstName;
  } else if (record.firstName === null) {
    user.firstName = null;
  }

  if (typeof record.lastName === "string") {
    user.lastName = record.lastName;
  } else if (record.lastName === null) {
    user.lastName = null;
  }

  if (typeof record.enabled === "boolean") {
    user.enabled = record.enabled;
  }

  if (typeof record.photo === "string") {
    user.photo = record.photo;
  } else if (record.photo === null) {
    user.photo = null;
  }

  if (Array.isArray(record.roles)) {
    user.roles = record.roles.map((role) => String(role ?? ""));
  }

  return sanitizeSessionUser(user);
}
