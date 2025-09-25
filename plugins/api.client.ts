import type { FetchError, FetchOptions, FetchResponse } from "ofetch";
import { ofetch } from "ofetch";
import { useAuthSession } from "~/stores/auth-session";

interface ErrorPayload {
  message?: string;
  error?: string;
  title?: string;
}

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig();
  const baseURL = runtimeConfig.public?.apiBase ?? "/api";
  const auth = useAuthSession();
  const { $i18n } = nuxtApp as unknown as { $i18n?: { t: (key: string) => string } };

  const api = ofetch.create({
    baseURL,
    credentials: "include",
    async onResponseError({
      response,
      error,
      options,
    }: {
      response?: FetchResponse<ErrorPayload>
      error: FetchError<ErrorPayload>
      options: FetchOptions
    }) {
      const status = response?.status;
      const payload = (response?._data ?? {}) as ErrorPayload;
      const message = payload.message || payload.error || error.message || "Unexpected network error";
      const title = payload.title || (status ? `HTTP ${status}` : undefined);

      if (status === 401 || status === 403) {
        const translator = $i18n?.t ?? ((key: string) => key);
        const sessionMessage = translator("auth.sessionExpired");

        await auth.handleUnauthorized(sessionMessage);

        return;
      }

      const suppressNotification = Boolean(
        options?.context && (options.context as Record<string, unknown>).suppressErrorNotification,
      );

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
});
