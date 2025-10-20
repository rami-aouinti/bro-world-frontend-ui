const GTM_ID = "GTM-N632XHTD";
const GTM_SCRIPT_ID = "gtm-script";
const GTM_NOSCRIPT_ID = "gtm-noscript";

interface LoadGtmOptions {
  /**
   * Optional callback that resolves once consent has been granted.
   * Return false to prevent GTM from loading.
   */
  awaitConsent?: () => boolean | Promise<boolean>;
  /**
   * Whether the loader should wait for the first user interaction or idle time
   * before inserting the GTM script. Defaults to true.
   */
  requireInteraction?: boolean;
}

let loadPromise: Promise<void> | null = null;

function appendNoscript(): void {
  if (document.getElementById(GTM_NOSCRIPT_ID)) {
    return;
  }

  const noscript = document.createElement("noscript");
  noscript.id = GTM_NOSCRIPT_ID;
  noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;

  if (document.body) {
    document.body.appendChild(noscript);
    return;
  }

  window.addEventListener(
    "DOMContentLoaded",
    () => {
      if (!document.getElementById(GTM_NOSCRIPT_ID) && document.body) {
        document.body.appendChild(noscript);
      }
    },
    { once: true },
  );
}

function waitForInteraction(): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const events = ["click", "keydown", "pointerdown", "scroll", "touchstart"];

    const idleWindow = window as typeof window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof window.setTimeout> | null = null;

    function cleanup() {
      if (settled) {
        return;
      }
      settled = true;
      events.forEach((eventName) => window.removeEventListener(eventName, onInteraction));
      if (idleId !== null) {
        idleWindow.cancelIdleCallback?.(idleId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      resolve();
    }

    function onInteraction() {
      cleanup();
    }

    events.forEach((eventName) => {
      window.addEventListener(eventName, onInteraction, { once: true, passive: true });
    });

    if (typeof idleWindow.requestIdleCallback === "function") {
      idleId = idleWindow.requestIdleCallback(() => cleanup());
    }

    timeoutId = window.setTimeout(() => cleanup(), 1500);
  });
}

function ensureDataLayer(): void {
  const globalWindow = window as typeof window & { dataLayer?: unknown[] };
  globalWindow.dataLayer = globalWindow.dataLayer || [];
  globalWindow.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
}

async function injectGtm(): Promise<void> {
  if (document.getElementById(GTM_SCRIPT_ID)) {
    appendNoscript();
    return;
  }

  ensureDataLayer();

  const script = document.createElement("script");
  script.id = GTM_SCRIPT_ID;
  script.async = true;
  script.defer = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  script.addEventListener("load", () => {
    appendNoscript();
  });
  script.addEventListener("error", () => {
    loadPromise = null;
  });
  document.head.appendChild(script);
  appendNoscript();
}

async function loadGtm(options: LoadGtmOptions = {}): Promise<void> {
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    if (options.awaitConsent) {
      const consentResult = await options.awaitConsent();
      if (!consentResult) {
        loadPromise = null;
        return;
      }
    }

    if (options.requireInteraction !== false) {
      await waitForInteraction();
    }

    await injectGtm();
  })();

  return loadPromise;
}

export default defineNuxtPlugin(() => {
  if (!import.meta.client || import.meta.dev) {
    return {
      provide: {
        gtm: {
          load: async (_options?: LoadGtmOptions) => {},
        },
      },
    };
  }

  return {
    provide: {
      gtm: {
        load: (options?: LoadGtmOptions) => loadGtm(options),
      },
    },
  };
});

export function useGtmLoader() {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$gtm.load as (options?: LoadGtmOptions) => Promise<void>;
}

export type { LoadGtmOptions };
