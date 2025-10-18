import axios, { AxiosError } from "axios";
import { createApiFetcher, type ApiRequestContext } from "~/lib/api/http-client";
import { useCookie, useRequestHeaders, useRequestURL } from "#imports";
import { useAuthSession } from "~/stores/auth-session";
import { shouldSendCredentials } from "~/lib/api/credentials";
import { resolveAuthCookieNames, sanitizeAuthToken } from "~/lib/auth/session-cookies";

interface ErrorPayload {
  message?: string;
  error?: string;
  title?: string;
}

export default defineNuxtPlugin({
  name: "api-client",
  dependsOn: ["pinia-plugin"],
  setup(nuxtApp) {
    const runtimeConfig = useRuntimeConfig();
    const rawBaseURL = (runtimeConfig.public?.apiBase as string | undefined) ?? "/api";
    const baseURL = import.meta.server
      ? new URL(rawBaseURL, useRequestURL().origin).toString()
      : rawBaseURL;
    const auth = useAuthSession();
    const forwardedHeaders = import.meta.server
      ? useRequestHeaders(["cookie", "authorization"])
      : null;
    const { $i18n } = nuxtApp as unknown as { $i18n?: { t: (key: string) => string } };
    const { session: sessionCookieName } = resolveAuthCookieNames();
    const sessionCookie = useCookie<string | null>(sessionCookieName, { watch: false });
    const client = axios.create({
      baseURL,
      withCredentials: shouldSendCredentials(baseURL),
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
          const token =
            sanitizeAuthToken(auth.sessionToken.value) ?? sanitizeAuthToken(sessionCookie.value);

          if (token) {
            const resolvedToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

            if (
              !headers.Authorization ||
              headers.Authorization === forwardedHeaders?.authorization
            ) {
              headers.Authorization = resolvedToken;
            }
          }
        }
      }

      config.headers = headers;

      return config;
    });

    client.interceptors.response.use(
      (response) => response,
      async (error: unknown) => {
        if (!(error instanceof AxiosError)) {
          throw error;
        }

        const status = error.response?.status;
        const payload = (error.response?.data ?? {}) as ErrorPayload;
        const message =
          payload.message || payload.error || error.message || "Unexpected network error";
        const title = payload.title || (status ? `HTTP ${status}` : undefined);
        const context = (error.config?.context ?? {}) as ApiRequestContext;
        const skipUnauthorizedHandler = Boolean(context?.skipUnauthorizedHandler);

        if ((status === 401 || status === 403) && !skipUnauthorizedHandler) {
          const translator = $i18n?.t ?? ((key: string) => key);
          const sessionMessage = translator("auth.sessionExpired");

          await auth.handleUnauthorized(sessionMessage);

          throw error;
        }

        const suppressNotification = Boolean(context?.suppressErrorNotification);

        if (!suppressNotification) {
          nuxtApp.$notify({
            type: "error",
            title,
            message,
            timeout: null,
          });
        }

        throw error;
      },
    );

    const api = createApiFetcher(client);

    return {
      provide: {
        api,
      },
    };
  },
});
