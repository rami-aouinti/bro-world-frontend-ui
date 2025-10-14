import type { FetchError, FetchOptions, FetchResponse } from "ofetch";
import { ofetch } from "ofetch";
import { useAuthSession } from "~/stores/auth-session";

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
    const baseURL = runtimeConfig.public?.apiBase ?? "/api";
    const auth = useAuthSession();
    const { $i18n } = nuxtApp as unknown as { $i18n?: { t: (key: string) => string } };

    const api = ofetch.create({
      baseURL,
      credentials: "include",
      async onRequest({ options }) {
        const context = (options.context ?? {}) as Record<string, unknown>;

        if (context.skipAuthHeader) {
          return;
        }

        const token = auth.sessionToken.value?.trim();

        if (!token) {
          return;
        }

        const resolvedToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
        const headers = new Headers((options.headers ?? {}) as HeadersInit);

        if (!headers.has("Authorization")) {
          headers.set("Authorization", resolvedToken);
        }

        options.headers = headers;
      },
      async onResponseError({
        response,
        error,
        options,
      }: {
        response?: FetchResponse<ErrorPayload>;
        error: FetchError<ErrorPayload>;
        options: FetchOptions;
      }) {
        const status = response?.status;
        const payload = (response?._data ?? {}) as ErrorPayload;
        const message =
          payload.message || payload.error || error.message || "Unexpected network error";
        const title = payload.title || (status ? `HTTP ${status}` : undefined);

        const context = (options.context ?? {}) as Record<string, unknown>;
        const skipUnauthorizedHandler = Boolean(context.skipUnauthorizedHandler);

        if ((status === 401 || status === 403) && !skipUnauthorizedHandler) {
          const translator = $i18n?.t ?? ((key: string) => key);
          const sessionMessage = translator("auth.sessionExpired");

          await auth.handleUnauthorized(sessionMessage);

          return;
        }

        const suppressNotification = Boolean(context.suppressErrorNotification);

        if (suppressNotification) {
          return;
        }

        nuxtApp.$notify({
          type: "error",
          title,
          message,
          timeout: null,
        });
      },
    });

    return {
      provide: {
        api,
      },
    };
  },
});
