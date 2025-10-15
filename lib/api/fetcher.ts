import { useNuxtApp, useRequestHeaders, useRuntimeConfig } from "#imports";
import { createApiFetcher, type ApiFetcher, type ApiRequestContext } from "~/lib/api/http-client";
import { createAxios, type AxiosInstance } from "~/lib/vendor/axios";
import { useAuthSession } from "~/stores/auth-session";

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
  const baseURL = (runtimeConfig.public?.apiBase as string | undefined) ?? "/api";

  if (import.meta.server) {
    const appWithFetcher = nuxtApp as typeof nuxtApp & { _apiFetcher?: ApiFetcher };

    if (appWithFetcher._apiFetcher) {
      return appWithFetcher._apiFetcher;
    }

    const auth = useAuthSession();
    const forwardedHeaders = useRequestHeaders(["cookie", "authorization"]);
    const client = createAxios({
      baseURL,
      withCredentials: true,
    });

    attachAuthInterceptor(client, auth, forwardedHeaders);

    const fetcher = createApiFetcher(client);
    appWithFetcher._apiFetcher = fetcher;

    return fetcher;
  }

  if (!clientFallback) {
    const auth = useAuthSession();
    const client = createAxios({
      baseURL,
      withCredentials: true,
    });

    attachAuthInterceptor(client, auth, null);

    clientFallback = createApiFetcher(client);
  }

  return clientFallback;
}
