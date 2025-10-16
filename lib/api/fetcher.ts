import axios from "axios";
import type { AxiosInstance } from "axios";
import {
  useCookie,
  useNuxtApp,
  useRequestHeaders,
  useRequestURL,
  useRuntimeConfig,
} from "#imports";
import { createApiFetcher, type ApiFetcher, type ApiRequestContext } from "~/lib/api/http-client";
import { useAuthSession } from "~/stores/auth-session";
import { shouldSendCredentials } from "~/lib/api/credentials";
import type { Ref } from "vue";

type ForwardedHeaders = Partial<Record<"cookie" | "authorization", string>> | null;

let clientFallback: ApiFetcher | null = null;

function sanitizeToken(rawToken: string | null | undefined): string | null {
  if (typeof rawToken !== "string") {
    return null;
  }

  const trimmed = rawToken.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function attachAuthInterceptor(
  client: AxiosInstance,
  auth: ReturnType<typeof useAuthSession>,
  forwardedHeaders: ForwardedHeaders,
  sessionCookie: Ref<string | null> | null,
) {
  client.interceptors.request.use((config) => {
    const context = (config.context ?? {}) as ApiRequestContext;
    const headers = { ...(config.headers ?? {}) };

    if (import.meta.server && forwardedHeaders) {
      if (forwardedHeaders.cookie && !headers.Cookie) {
        headers.Cookie = forwardedHeaders.cookie;
      }

      if (forwardedHeaders.authorization && !headers.Authorization) {
        headers.Authorization = forwardedHeaders.authorization;
      }
    }

    if (!context.skipAuthHeader) {
      const shouldAttachToken = context.isPrivate !== false;

      if (shouldAttachToken) {
        let token = sanitizeToken(auth.sessionToken.value);

        if (!token && sessionCookie?.value) {
          token = sanitizeToken(sessionCookie.value);
        }

        if (token) {
          const resolvedToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

          if (!headers.Authorization || headers.Authorization === forwardedHeaders?.authorization) {
            headers.Authorization = resolvedToken;
          }
        }
      }
    }

    config.headers = headers;

    return config;
  });
}

export function resolveApiFetcher(): ApiFetcher {
  const nuxtApp = useNuxtApp();
  const providedFetcher = nuxtApp.$api as ApiFetcher | undefined;

  if (providedFetcher) {
    return providedFetcher;
  }

  const runtimeConfig = useRuntimeConfig();
  const rawBaseURL = (runtimeConfig.public?.apiBase as string | undefined) ?? "/api";
  const baseURL = import.meta.server
    ? new URL(rawBaseURL, useRequestURL().origin).toString()
    : rawBaseURL;

  if (import.meta.server) {
    const appWithFetcher = nuxtApp as typeof nuxtApp & { _apiFetcher?: ApiFetcher };

    if (appWithFetcher._apiFetcher) {
      return appWithFetcher._apiFetcher;
    }

    const auth = useAuthSession();
    const forwardedHeaders = useRequestHeaders(["cookie", "authorization"]);
    const client = axios.create({
      baseURL,
      withCredentials: false,
    });

    attachAuthInterceptor(client, auth, forwardedHeaders, null);

    const fetcher = createApiFetcher(client);
    appWithFetcher._apiFetcher = fetcher;

    return fetcher;
  }

  if (!clientFallback) {
    const auth = useAuthSession();
    const sessionCookieName =
      (runtimeConfig.public?.auth?.sessionTokenCookieName as string | undefined) ??
      "auth_session_token";
    const sessionCookie = import.meta.client
      ? useCookie<string | null>(sessionCookieName, { watch: false })
      : null;
    const client = axios.create({
      baseURL,
      withCredentials: shouldSendCredentials(baseURL),
    });

    attachAuthInterceptor(client, auth, null, sessionCookie);

    clientFallback = createApiFetcher(client);
  }

  return clientFallback;
}
