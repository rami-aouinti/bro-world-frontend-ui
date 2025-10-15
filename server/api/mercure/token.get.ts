import { createError } from "h3";
import type { FetchError } from "ofetch";
import { joinURL } from "ufo";
import type { MercureTokenEnvelope } from "../../../types/mercure";
import { getSessionToken, withAuthHeaders } from "../../utils/auth/session";
import {
  readCachedMercureToken,
  writeCachedMercureToken,
} from "../../utils/mercure/cache";

function sanitizeBaseEndpoint(raw: string): string {
  return raw.replace(/\/$/, "");
}

function isFetchError(error: unknown): error is FetchError<unknown> {
  return Boolean(error && typeof error === "object" && "response" in error);
}

function resolveErrorMessage(payload: unknown): string | undefined {
  if (payload && typeof payload === "object") {
    const maybeMessage = (payload as { message?: unknown }).message;

    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage;
    }
  }

  return undefined;
}

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event);
  const configuredToken =
    runtimeConfig.mercure?.token ?? runtimeConfig.public?.mercure?.token ?? null;
  const sessionToken = getSessionToken(event);

  if (configuredToken) {
    const response = {
      token: configuredToken,
      expiresAt: null,
      expiresIn: null,
    } satisfies MercureTokenEnvelope;

    if (sessionToken) {
      await writeCachedMercureToken(event, sessionToken, response);
    }

    return response;
  }

  if (!sessionToken) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized Mercure token request",
      data: { message: "Authentication required." },
    });
  }

  const cached = await readCachedMercureToken(event, sessionToken);

  if (cached?.token) {
    return cached;
  }

  const baseEndpoint = sanitizeBaseEndpoint(
    runtimeConfig.auth?.apiBase ?? "https://bro-world.org/api",
  );
  const endpoint = joinURL(baseEndpoint, "/v1/mercure/token");

  try {
    const response = await $fetch<MercureTokenEnvelope>(endpoint, {
      method: "GET",
      headers: withAuthHeaders(event),
    });

    if (!response?.token) {
      throw createError({
        statusCode: 502,
        statusMessage: "Invalid Mercure token response.",
      });
    }

    await writeCachedMercureToken(event, sessionToken, response);

    return response;
  } catch (error) {
    if (isFetchError(error)) {
      const status = error.response?.status ?? 502;
      const message = resolveErrorMessage(error.data) ?? "Unable to mint Mercure token.";

      if (status === 401 || status === 403) {
        throw createError({
          statusCode: status,
          statusMessage: "Unauthorized Mercure token request",
          data: { message },
        });
      }

      throw createError({
        statusCode: 502,
        statusMessage: "Mercure token service unavailable",
        data: { message },
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Unexpected Mercure token error",
      data: {
        message: error instanceof Error ? error.message : "Unable to mint Mercure token.",
      },
    });
  }
});
