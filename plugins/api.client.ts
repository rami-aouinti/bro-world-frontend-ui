import type { FetchError, FetchResponse } from "ofetch";
import { ofetch } from "ofetch";

interface ErrorPayload {
  message?: string;
  error?: string;
  title?: string;
}

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig();
  const baseURL = runtimeConfig.public?.apiBase ?? "/api";

  const api = ofetch.create({
    baseURL,
    credentials: "include",
    onResponseError({ response, error }: { response?: FetchResponse<ErrorPayload>; error: FetchError<ErrorPayload> }) {
      const status = response?.status;
      const payload = (response?._data ?? {}) as ErrorPayload;
      const message = payload.message || payload.error || error.message || "Unexpected network error";
      const title = payload.title || (status ? `HTTP ${status}` : undefined);

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
