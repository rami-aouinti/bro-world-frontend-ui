import type { HookOptions } from "hookable";
import { isHeadersSentError } from "~/server/utils/http/errors";

export default defineNuxtPlugin((nuxtApp) => {
  const hooks = nuxtApp.hooks as typeof nuxtApp.hooks & {
    _broCookieGuardPatched?: boolean;
  };

  if (hooks._broCookieGuardPatched) {
    return;
  }

  const originalHookOnce = hooks.hookOnce.bind(hooks);

  function createGuardedHandler(handler: (...params: unknown[]) => unknown) {
    return function guardedHandler(...args: unknown[]) {
      try {
        return handler(...args);
      } catch (error) {
        if (isHeadersSentError(error)) {
          if (import.meta.dev) {
            console.warn(
              "[cookies] Skipped writing cookie after response was already sent.",
            );
          }

          return;
        }

        throw error;
      }
    };
  }

  hooks.hookOnce = ((name: string, handler: unknown, options?: HookOptions) => {
    if (name === "app:rendered" && typeof handler === "function") {
      const wrappedHandler = createGuardedHandler(handler as (...params: unknown[]) => unknown);

      return originalHookOnce(name, wrappedHandler, options);
    }

    return originalHookOnce(name, handler as (...params: unknown[]) => unknown, options);
  }) as typeof hooks.hookOnce;

  hooks._broCookieGuardPatched = true;
});
