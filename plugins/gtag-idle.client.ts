import { withQuery } from "ufo";

type GtagTag = string | { id?: string | null } | null | undefined;

type PublicGtagConfig = {
  enabled?: boolean;
  initMode?: string | null;
  id?: string | null;
  tags?: GtagTag[];
  url?: string | null;
};

type IdleScheduler = (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;

type WindowWithIdle = Window & { requestIdleCallback?: IdleScheduler };

export default defineNuxtPlugin(() => {
  if (!import.meta.client) {
    return;
  }

  const runtimeConfig = useRuntimeConfig();
  const gtag = runtimeConfig.public?.gtag as PublicGtagConfig | undefined;

  if (!gtag || gtag.enabled === false || gtag.initMode !== "manual") {
    return;
  }

  const candidateIds: string[] = [];

  const primaryId = typeof gtag.id === "string" ? gtag.id.trim() : "";

  if (primaryId) {
    candidateIds.push(primaryId);
  }

  if (Array.isArray(gtag.tags)) {
    for (const tag of gtag.tags) {
      if (!tag) {
        continue;
      }

      if (typeof tag === "string") {
        const value = tag.trim();

        if (value) {
          candidateIds.push(value);
        }

        continue;
      }

      const value = typeof tag.id === "string" ? tag.id.trim() : "";

      if (value) {
        candidateIds.push(value);
      }
    }
  }

  const activeId = candidateIds[0];

  if (!activeId) {
    return;
  }

  const source = withQuery(gtag.url ?? "https://www.googletagmanager.com/gtag/js", {
    id: activeId,
  });
  let hasScheduled = false;
  let hasLoaded = false;

  const loadAnalytics = () => {
    if (hasLoaded) {
      return;
    }

    hasLoaded = true;

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src^="https://www.googletagmanager.com/gtag/js"]',
    );

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.src = source;
    script.async = true;
    script.dataset.lazyGtag = "true";
    document.head.appendChild(script);
  };

  const scheduleLoad = () => {
    if (hasScheduled) {
      return;
    }

    hasScheduled = true;

    const { requestIdleCallback } = window as WindowWithIdle;

    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(() => loadAnalytics(), { timeout: 5000 });
      return;
    }

    window.addEventListener("load", () => loadAnalytics(), { once: true });
    window.setTimeout(() => loadAnalytics(), 4000);
  };

  if (document.readyState === "complete") {
    scheduleLoad();
    return;
  }

  scheduleLoad();
});
