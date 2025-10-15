import { ofetch } from "ofetch";
import type { FetchOptions } from "ofetch";
import { useNuxtApp, useRequestFetch, useRuntimeConfig } from "#imports";

export type ApiFetcher = <T>(request: string, options?: FetchOptions) => Promise<T>;

export function resolveApiFetcher(): ApiFetcher {
  if (import.meta.server) {
    return useRequestFetch() as ApiFetcher;
  }

  const nuxtApp = useNuxtApp();
  const api = nuxtApp.$api as ApiFetcher | undefined;

  if (api) {
    return api;
  }

  const runtimeConfig = useRuntimeConfig();
  const baseURL = (runtimeConfig.public?.apiBase as string | undefined) ?? "/api";

  return ofetch.create({
    baseURL,
    credentials: "include",
  }) as ApiFetcher;
}
