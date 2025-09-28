import type { AuthUser } from "~/types/auth";

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export interface NormalizedUserPayload extends Partial<AuthUser> {
  roles?: string[];
}

export function normalizeRolesInput(value: unknown): string[] {
  if (Array.isArray(value)) {
    return unique(
      value
        .map((role) => (typeof role === "string" ? role : String(role ?? "")))
        .map((role) => role.trim())
        .filter((role) => role.length > 0)
        .map((role) => role.toLowerCase()),
    );
  }

  if (typeof value === "string") {
    return normalizeRolesInput(
      value
        .split(",")
        .map((role) => role.trim())
        .filter((role) => role.length > 0),
    );
  }

  return [];
}

export function normalizeUserPayload(payload: Partial<AuthUser>): NormalizedUserPayload {
  const normalized: NormalizedUserPayload = {};

  if (typeof payload.id === "string" && payload.id.trim()) {
    normalized.id = payload.id.trim();
  }

  if (typeof payload.username === "string") {
    normalized.username = payload.username.trim();
  }

  if (typeof payload.email === "string") {
    normalized.email = payload.email.trim().toLowerCase();
  }

  if (typeof payload.firstName === "string") {
    normalized.firstName = payload.firstName.trim();
  }

  if (typeof payload.lastName === "string") {
    normalized.lastName = payload.lastName.trim();
  }

  if (typeof payload.enabled === "boolean") {
    normalized.enabled = payload.enabled;
  }

  if (payload.roles !== undefined) {
    normalized.roles = normalizeRolesInput(payload.roles);
  }

  return normalized;
}
