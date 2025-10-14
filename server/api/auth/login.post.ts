import { createError, getHeader, readBody } from "h3";
import type { FetchError } from "ofetch";
import { joinURL } from "ufo";
import type { AuthLoginResponse, AuthUser } from "~/types/auth";
import { clearAuthSession, setSession } from "../../utils/auth/session";
import {
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
    const response = await $fetch<AuthLoginResponse>(endpoint, {
      method: "POST",
      body: {
        username: username,
        password: password,
      },
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
      const status = error.response?.status ?? 500;
      const message = resolveLoginErrorMessage(status, error.data);

      if (status === 401 || status === 400 || status === 429) {
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
