import type { CookieOptions } from "nuxt/app";
import type { H3Event } from "h3";
import { getContext } from "unctx";

const contextOptions: Parameters<typeof getContext>[1] = {
  asyncContext: import.meta.server,
};

type NodeRequireFn = (moduleId: string) => unknown;

function resolveNodeRequire(): NodeRequireFn | undefined {
  const globalRequire = (globalThis as Record<string, unknown> | undefined)?.require;

  if (typeof globalRequire === "function") {
    return globalRequire as NodeRequireFn;
  }

  try {
    return Function("return require")() as NodeRequireFn;
  } catch {
    return undefined;
  }
}

if (import.meta.server) {
  try {
    const nodeRequire = resolveNodeRequire();

    if (nodeRequire) {
      const { AsyncLocalStorage } = nodeRequire("node:async_hooks") as typeof import("node:async_hooks");
      contextOptions.AsyncLocalStorage = AsyncLocalStorage;
    } else {
      const { AsyncLocalStorage } = await import("node:async_hooks");
      contextOptions.AsyncLocalStorage = AsyncLocalStorage;
    }
  } catch {
    // ignore resolution errors and fall back to default context behaviour
  }
}

type MaybeEvent = H3Event | null | undefined;

type NuxtAppContext = {
  ssrContext?: {
    event?: MaybeEvent;
  };
};

const nuxtAppContext = getContext<NuxtAppContext>(
  "nuxt-app",
  contextOptions,
);

function resolveActiveRequestEvent(): MaybeEvent {
  if (!import.meta.server) {
    return null;
  }

  try {
    return nuxtAppContext.tryUse()?.ssrContext?.event ?? null;
  } catch {
    return null;
  }
}

type MaybeEncryptedSocket = { encrypted?: boolean };

function isEventSecure(event: H3Event): boolean {
  const forwardedProto = event.node.req.headers["x-forwarded-proto"];

  if (typeof forwardedProto === "string" && forwardedProto.trim()) {
    const [first] = forwardedProto.split(",");

    if (first) {
      return first.trim().toLowerCase() === "https";
    }
  }

  const schemeHeader = event.node.req.headers[":scheme"];

  if (typeof schemeHeader === "string" && schemeHeader.trim()) {
    return schemeHeader.trim().toLowerCase() === "https";
  }

  const socket = event.node.req.socket as MaybeEncryptedSocket | undefined;
  const connection = event.node.req.connection as MaybeEncryptedSocket | undefined;

  if (socket && typeof socket.encrypted === "boolean") {
    return socket.encrypted;
  }

  if (connection && typeof connection.encrypted === "boolean") {
    return connection.encrypted;
  }

  return false;
}

export function shouldUseSecureCookies(event?: MaybeEvent): boolean {
  const targetEvent = event ?? resolveActiveRequestEvent();

  if (targetEvent) {
    return isEventSecure(targetEvent);
  }

  if (import.meta.client && typeof window !== "undefined" && window.location) {
    return window.location.protocol === "https:";
  }

  return false;
}

export function withSecureCookieOptions<T>(
  options?: CookieOptions<T>,
  event?: MaybeEvent,
): CookieOptions<T> {
  const resolved: CookieOptions<T> = {
    ...(options ?? {}),
  };

  if (typeof resolved.secure !== "boolean") {
    resolved.secure = shouldUseSecureCookies(event);
  }

  if (!resolved.path) {
    resolved.path = "/";
  }

  return resolved;
}
