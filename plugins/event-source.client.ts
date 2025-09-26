import { EventSourcePolyfill } from "event-source-polyfill";
import type { MercureConnectionOptions, MercureQueryValue } from "~/types/mercure";

function appendQueryValue(params: URLSearchParams, key: string, value: MercureQueryValue) {
  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (item === null || item === undefined) {
        return;
      }

      params.append(key, String(item));
    });

    return;
  }

  if (value === null || value === undefined) {
    return;
  }

  params.append(key, String(value));
}

function createMercureEventSource(input: string, options: MercureConnectionOptions = {}): EventSource {
  const { token, params, init } = options;
  const url = new URL(input, window.location.href);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      appendQueryValue(url.searchParams, key, value);
    });
  }

  const headers = new Headers(init?.headers ?? {});

  if (token) {
    headers.set("Authorization", token.startsWith("Bearer ") ? token : `Bearer ${token}`);
  }

  return new EventSourcePolyfill(url.toString(), {
    ...(init ?? {}),
    headers,
  });
}

export default defineNuxtPlugin(() => {
  window.EventSource = EventSourcePolyfill as unknown as typeof window.EventSource;

  return {
    provide: {
      mercure: createMercureEventSource,
    },
  };
});
