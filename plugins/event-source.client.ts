import type { MercureConnectionOptions, MercureQueryValue } from "~/types/mercure";

type EventSourceConstructor = new (
  url: string,
  eventSourceInitDict?: EventSourceInit & Record<string, unknown>,
) => EventSource;

type PolyfillInit = EventSourceInit & {
  headers?: HeadersInit;
};

let polyfilledEventSource: EventSourceConstructor | undefined;

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

function createMercureEventSource(
  input: string,
  options: MercureConnectionOptions = {},
): EventSource {
  const { token, params, init } = options;
  const url = new URL(input, window.location.href);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      appendQueryValue(url.searchParams, key, value);
    });
  }

  const initOptions = { ...(init ?? {}) } as PolyfillInit;
  const { headers: initialHeaders, ...restInit } = initOptions;

  const headers = new Headers(initialHeaders ?? {});

  if (token) {
    headers.set("Authorization", token.startsWith("Bearer ") ? token : `Bearer ${token}`);
  }

  const eventSourceImplementation = (polyfilledEventSource ?? window.EventSource) as
    | EventSourceConstructor
    | undefined;

  if (!eventSourceImplementation) {
    throw new Error("EventSource is not available in this environment.");
  }

  if (polyfilledEventSource) {
    return new eventSourceImplementation(url.toString(), {
      ...restInit,
      headers,
    });
  }

  const nativeInit = Object.keys(restInit).length > 0 ? restInit : undefined;

  return new eventSourceImplementation(url.toString(), nativeInit as EventSourceInit | undefined);
}

export default defineNuxtPlugin(async () => {
  if (!window.EventSource) {
    const { EventSourcePolyfill } = await import("event-source-polyfill");
    polyfilledEventSource = EventSourcePolyfill as unknown as EventSourceConstructor;
    window.EventSource = polyfilledEventSource as unknown as typeof window.EventSource;
  }

  return {
    provide: {
      mercure: createMercureEventSource,
    },
  };
});
