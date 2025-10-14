import { createError, getHeader, readBody } from "h3";
import type { FetchError } from "ofetch";
import { joinURL } from "ufo";
import type { AuthLoginResponse, AuthUser } from "~/types/auth";
import { clearAuthSession, setSession } from "../../utils/auth/session";
import {
  type CredentialPayload,
  normalizeCredentialPayload,
  resolveCredentialIdentifier,
  resolveCredentialPassword,
} from "../../utils/auth/credentials";

function sanitizeBaseEndpoint(raw: string): string {
  return raw.replace(/\/$/, "");
}

export default defineEventHandler(async (event) => {
  const rawBody = await readBody<unknown>(event);
  const body = normalizeCredentialPayload(rawBody);
  const username = resolveCredentialIdentifier(body);
  const password = resolveCredentialPassword(body);

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Unable to sign in",
      data: {
        message: "Please provide both your email or username and password.",
      },
    });
  }

  const runtimeConfig = useRuntimeConfig(event);
  const serviceToken = runtimeConfig.auth?.apiToken?.trim();
  const forwardedAuthorization = getHeader(event, "authorization");
  const baseEndpoint = sanitizeBaseEndpoint(
    runtimeConfig.auth?.apiBase ?? "https://bro-world.org/api",
  );
  const endpoint = joinURL(baseEndpoint, "/v1/auth/login");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (forwardedAuthorization?.trim()) {
    headers.Authorization = forwardedAuthorization;
  } else if (serviceToken) {
    headers.Authorization = `Bearer ${serviceToken}`;
  }

  try {
    const payload = buildLoginPayload(body, username, password);

    const response = await $fetch<AuthLoginResponse>(endpoint, {
      method: "POST",
      body: payload,
      headers,
    });

    if (!response?.token || !response?.profile) {
      throw createError({
        statusCode: 502,
        statusMessage: "Invalid authentication response.",
      });
    }

    const profile = response.profile as AuthUser;

    setSession(event, response.token, profile);

    return {
      user: profile,
      token: response.token,
    };
  } catch (error) {
    if (isFetchError(error)) {
      const status = resolveFetchErrorStatus(error) ?? 500;
      const message = resolveLoginErrorMessage(status, error.data);

      if (status === 401 || status === 400 || status === 429) {
        throw createError({
          statusCode: status,
          statusMessage: "Unable to sign in",
          data: { message },
        });
      }

      if (status >= 400 && status < 500) {
        throw createError({
          statusCode: status,
          statusMessage: "Unable to sign in",
          data: { message },
        });
      }

      clearAuthSession(event);

      throw createError({
        statusCode: 502,
        statusMessage: "Authentication service unavailable",
        data: {
          message,
        },
      });
    }

    clearAuthSession(event);

    throw createError({
      statusCode: 500,
      statusMessage: "Unexpected authentication error",
      data: {
        message: error instanceof Error ? error.message : "Unexpected error while signing in.",
      },
    });
  }
});

function isFetchError(error: unknown): error is FetchError<unknown> {
  return Boolean(error && typeof error === "object" && "response" in error);
}

function normalizeField(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

function buildLoginPayload(
  body: CredentialPayload | undefined,
  username: string,
  password: string,
): Record<string, string> {
  const payload: Record<string, string> = {
    password,
  };

  const identifierFromBody = normalizeField(body?.identifier);
  const usernameFromBody = normalizeField(body?.username);
  const emailFromBody = normalizeField(body?.email);

  if (identifierFromBody) {
    payload.identifier = identifierFromBody;
  }

  if (usernameFromBody) {
    payload.username = usernameFromBody;
  }

  if (emailFromBody) {
    payload.email = emailFromBody;
  }

  if (!payload.identifier) {
    payload.identifier = username;
  }

  if (!payload.username) {
    payload.username = username;
  }

  if (!payload.email && username.includes("@")) {
    payload.email = username;
  }

  return payload;
}

function resolveLoginErrorMessage(status: number, payload: unknown): string {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  if (status === 429) {
    return "Too many login attempts. Please try again later.";
  }

  if (status === 400 || status === 401) {
    return "We could not verify those credentials. Please try again.";
  }

  return "Unable to sign in at this time. Please try again later.";
}

function resolveFetchErrorStatus(error: FetchError<unknown>): number | null {
  const statusFromResponse = error.response?.status;

  if (typeof statusFromResponse === "number" && Number.isInteger(statusFromResponse)) {
    return statusFromResponse;
  }

  const statusFromError = getStatusFromError(error);

  if (statusFromError !== null) {
    return statusFromError;
  }

  const statusFromPayload = resolveStatusFromPayload(error.data);

  if (statusFromPayload !== null) {
    return statusFromPayload;
  }

  const statusFromMessage = extractStatusCode(error.message);

  if (statusFromMessage !== null) {
    return statusFromMessage;
  }

  return null;
}

function getStatusFromError(error: FetchError<unknown>): number | null {
  for (const key of ["status", "statusCode"] as const) {
    const value = (error as Record<(typeof key) | string, unknown>)[key];

    if (typeof value === "number" && Number.isInteger(value)) {
      return value;
    }
  }

  return null;
}

function resolveStatusFromPayload(payload: unknown): number | null {
  if (typeof payload === "number" && Number.isInteger(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    if (typeof payload === "string") {
      return extractStatusCode(payload);
    }

    return null;
  }

  for (const key of ["statusCode", "status", "code"] as const) {
    const value = (payload as Record<(typeof key) | string, unknown>)[key];

    if (typeof value === "number" && Number.isInteger(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number.parseInt(value, 10);

      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  const maybeMessage = (payload as { message?: unknown }).message;

  if (typeof maybeMessage === "string") {
    return extractStatusCode(maybeMessage);
  }

  return null;
}

function extractStatusCode(message: string | null | undefined): number | null {
  if (!message) {
    return null;
  }

  const match = message.match(/\b([1-5][0-9]{2})\b/);

  if (!match) {
    return null;
  }

  const code = Number.parseInt(match[1] ?? "", 10);

  if (Number.isNaN(code)) {
    return null;
  }

  if (code >= 400 && code < 600) {
    return code;
  }

  return null;
}

export { resolveFetchErrorStatus, resolveLoginErrorMessage };
