export interface CredentialPayload {
  identifier?: unknown;
  username?: unknown;
  email?: unknown;
  password?: unknown;
}

const CREDENTIAL_KEYS = ["identifier", "username", "email", "password"] as const;

type CredentialKey = (typeof CREDENTIAL_KEYS)[number];

function isArrayBufferView(input: unknown): input is ArrayBufferView {
  return typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView(input);
}

function decodeBinaryPayload(input: ArrayBuffer | ArrayBufferView): string {
  if (typeof Buffer !== "undefined") {
    if (isArrayBufferView(input)) {
      return Buffer.from(input.buffer, input.byteOffset, input.byteLength).toString("utf8");
    }

    return Buffer.from(input).toString("utf8");
  }

  const decoder = new TextDecoder();

  if (isArrayBufferView(input)) {
    return decoder.decode(input);
  }

  return decoder.decode(new Uint8Array(input));
}

function normalizeCredentialRecord(record: Record<string, unknown>): CredentialPayload | undefined {
  let hasCredentialField = false;
  const payload: CredentialPayload = {};

  for (const key of CREDENTIAL_KEYS) {
    if (key in record) {
      payload[key] = record[key];
      hasCredentialField = true;
    }
  }

  if (hasCredentialField) {
    return payload;
  }

  const nestedSources = ["body", "data"] as const;

  for (const source of nestedSources) {
    if (source in record) {
      const nested = normalizeCredentialPayload(record[source]);

      if (nested) {
        return nested;
      }
    }
  }

  return undefined;
}

function normalizeCredentialSearchParams(params: URLSearchParams): CredentialPayload | undefined {
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

export function normalizeCredentialPayload(input: unknown): CredentialPayload | undefined {
  if (input == null) {
    return undefined;
  }

  if (typeof ArrayBuffer !== "undefined") {
    if (input instanceof ArrayBuffer) {
      return normalizeCredentialPayload(decodeBinaryPayload(input));
    }

    if (isArrayBufferView(input)) {
      return normalizeCredentialPayload(decodeBinaryPayload(input));
    }
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

  if (typeof FormData !== "undefined" && input instanceof FormData) {
    const params = new URLSearchParams();

    for (const [key, value] of input.entries()) {
      params.append(key, typeof value === "string" ? value : "");
    }

    return normalizeCredentialSearchParams(params);
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

export function resolveCredentialIdentifier(payload: CredentialPayload | undefined): string {
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

export function resolveCredentialPassword(payload: CredentialPayload | undefined): string {
  if (!payload) {
    return "";
  }

  return normalizeCredentialValue(payload.password);
}
