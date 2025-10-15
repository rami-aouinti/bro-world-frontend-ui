import { useNuxtApp, useRequestHeaders, useRuntimeConfig } from "#imports";
import { createApiFetcher, type ApiFetcher, type ApiRequestContext } from "~/lib/api/http-client";
import { createAxios } from "~/lib/vendor/axios";
import { useAuthSession } from "~/stores/auth-session";

let fallbackFetcher: ApiFetcher | null = null;

export function resolveApiFetcher(): ApiFetcher {
  const nuxtApp = useNuxtApp();
  const providedFetcher = nuxtApp.$api as ApiFetcher | undefined;

  if (providedFetcher) {
    return providedFetcher;
  }

  if (!fallbackFetcher) {
    const runtimeConfig = useRuntimeConfig();
    const baseURL = (runtimeConfig.public?.apiBase as string | undefined) ?? "/api";
    const auth = useAuthSession();
    const forwardedHeaders = import.meta.server ? useRequestHeaders(["cookie", "authorization"]) : null;
    const client = createAxios({
      baseURL,
      withCredentials: true,
    });

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

    fallbackFetcher = createApiFetcher(client);
  }

  return fallbackFetcher;
}
