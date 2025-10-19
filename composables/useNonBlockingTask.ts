const DEFAULT_IDLE_TIMEOUT = 750;

function logTaskError(error: unknown) {
  if (import.meta.dev) {
    console.error("[useNonBlockingTask] Failed to execute task", error);
  }
}

export function useNonBlockingTask(options: { timeout?: number } = {}) {
  const { timeout = DEFAULT_IDLE_TIMEOUT } = options;

  function schedule(task: () => void | Promise<void>) {
    if (!import.meta.client) {
      if (typeof queueMicrotask === "function") {
        queueMicrotask(() => {});
      } else {
        void Promise.resolve().then(() => {});
      }

      return;
    }

    const idleWindow = window as typeof window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
    };

    const scheduleCallback =
      typeof idleWindow.requestIdleCallback === "function"
        ? (callback: () => void) =>
            idleWindow.requestIdleCallback(
              () => callback(),
              typeof timeout === "number" ? { timeout } : undefined,
            )
        : (callback: () => void) => window.setTimeout(callback, 0);

    scheduleCallback(() => {
      try {
        const maybePromise = task();

        if (maybePromise instanceof Promise) {
          void maybePromise.catch(logTaskError);
        }
      } catch (error) {
        logTaskError(error);
      }
    });
  }

  return { schedule };
}
