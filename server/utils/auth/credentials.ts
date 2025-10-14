export interface CredentialPayload {
  identifier?: unknown;
  username?: unknown;
  email?: unknown;
  password?: unknown;
}

function normalizeCredentialValue(value: unknown): string {
  if (Array.isArray(value)) {
    return normalizeCredentialValue(value[0]);
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return "";
}

export function resolveCredentialIdentifier(
  payload: CredentialPayload | undefined,
): string {
  if (!payload) {
    return "";
  }

  const sources: unknown[] = [payload.identifier, payload.username, payload.email];

  for (const source of sources) {
    const normalized = normalizeCredentialValue(source);

    if (normalized) {
      return normalized;
    }
  }

  return "";
}

export function resolveCredentialPassword(
  payload: CredentialPayload | undefined,
): string {
  if (!payload) {
    return "";
  }

  return normalizeCredentialValue(payload.password);
}
