export interface CredentialPayload {
  identifier?: unknown;
  username?: unknown;
  email?: unknown;
  password?: unknown;
}

const CREDENTIAL_KEYS = ["identifier", "username", "email", "password"] as const;

type CredentialKey = (typeof CREDENTIAL_KEYS)[number];

function normalizeCredentialRecord(record: Record<string, unknown>):
  | CredentialPayload
  | undefined {
  let hasCredentialField = false;
  const payload: CredentialPayload = {};

  for (const key of CREDENTIAL_KEYS) {
    if (key in record) {
      payload[key] = record[key];
      hasCredentialField = true;
    }
  }

  return hasCredentialField ? payload : undefined;
}

function normalizeCredentialSearchParams(
  params: URLSearchParams,
): CredentialPayload | undefined {
  let hasCredentialField = false;
  const payload: CredentialPayload = {};

  for (const [key, value] of params.entries()) {
    if (CREDENTIAL_KEYS.includes(key as CredentialKey)) {
      payload[key as CredentialKey] = value;
      hasCredentialField = true;
    }
  }

  return hasCredentialField ? payload : undefined;
}

export function normalizeCredentialPayload(input: unknown):
  | CredentialPayload
  | undefined {
  if (input == null) {
    return undefined;
  }

  if (typeof input === "string") {
    const trimmed = input.trim();

    if (!trimmed) {
      return undefined;
    }

    try {
      const parsed = JSON.parse(trimmed) as unknown;

      if (parsed && typeof parsed === "object") {
        return normalizeCredentialPayload(parsed);
      }
    } catch {
      // Ignore JSON parsing errors and fall back to query string parsing.
    }

    try {
      const params = new URLSearchParams(trimmed);
      return normalizeCredentialSearchParams(params);
    } catch {
      return undefined;
    }
  }

  if (input instanceof URLSearchParams) {
    return normalizeCredentialSearchParams(input);
  }

  if (typeof input === "object") {
    const record = input as Record<string, unknown>;
    return normalizeCredentialRecord(record);
  }

  return undefined;
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
