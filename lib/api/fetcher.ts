import axios from "axios";
import type { AxiosInstance } from "axios";
import { useNuxtApp, useRequestHeaders, useRequestURL, useRuntimeConfig } from "#imports";
import { createApiFetcher, type ApiFetcher, type ApiRequestContext } from "~/lib/api/http-client";
import { useAuthSession } from "~/stores/auth-session";
import { shouldSendCredentials } from "~/lib/api/credentials";

type ForwardedHeaders = Partial<Record<"cookie" | "authorization", string>> | null;

let clientFallback: ApiFetcher | null = null;

function attachAuthInterceptor(
  client: AxiosInstance,
  auth: ReturnType<typeof useAuthSession>,
  forwardedHeaders: ForwardedHeaders,
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
        const token = auth.sessionToken.value?.trim();

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

    attachAuthInterceptor(client, auth, forwardedHeaders);

    const fetcher = createApiFetcher(client);
    appWithFetcher._apiFetcher = fetcher;

    return fetcher;
  }

  if (!clientFallback) {
    const auth = useAuthSession();
    const client = axios.create({
      baseURL,
      withCredentials: shouldSendCredentials(baseURL),
    });

    attachAuthInterceptor(client, auth, null);

    clientFallback = createApiFetcher(client);
  }

  return clientFallback;
}
