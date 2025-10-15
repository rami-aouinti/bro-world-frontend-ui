export default defineNuxtPlugin(() => {
  if (!import.meta.client) {
    return;
  }

  const config = useRuntimeConfig();
  const clarityId = config.public.NUXT_CLARITY_ID?.trim();

  if (!clarityId) {
    return;
  }

  const globalObject = typeof window !== "undefined" ? window : null;
  const doc = typeof document !== "undefined" ? document : null;

  if (!globalObject || !doc) {
    return;
  }

  let hasStartedLoad = false;
  let hasScheduledLoad = false;

  const connection = globalObject.navigator?.connection ?? null;
  const isSaveDataEnabled = Boolean(connection?.saveData);
  const isVerySlowConnection =
    typeof connection?.effectiveType === "string"
      ? /(^|\b)(slow-)?2g($|\b)/i.test(connection.effectiveType)
      : false;

  if (isSaveDataEnabled) {
    return;
  }

  function loadClarity() {
    if (hasStartedLoad) {
      return;
    }

    hasStartedLoad = true;

    (function (c, l, a, r, i, t, y) {
      c[a] =
        c[a] ||
        function () {
          (c[a].q = c[a].q || []).push(arguments);
        };
      t = l.createElement(r);
      t.async = true;
      t.setAttribute("data-loaded-by", "nuxt-clarity-plugin");
      t.src = `https://www.clarity.ms/tag/${i}`;
      y = l.getElementsByTagName(r)[0];

      if (y?.parentNode) {
        y.parentNode.insertBefore(t, y);
        return;
      }

      const head = l.getElementsByTagName("head")[0];
      const body = l.getElementsByTagName("body")[0];

      (head ?? body ?? l.documentElement).appendChild(t);
    })(globalObject, doc, "clarity", "script", clarityId);
  }

  function scheduleWhenIdle() {
    if (hasScheduledLoad) {
      return;
    }

    hasScheduledLoad = true;

    const idleCallback = globalObject.requestIdleCallback;

    if (typeof idleCallback === "function") {
      idleCallback(() => loadClarity(), { timeout: 6000 });
      return;
    }

    globalObject.setTimeout(() => loadClarity(), 3000);
  }

  function scheduleAfterLoad() {
    if (doc.readyState === "complete") {
      scheduleWhenIdle();
      return;
    }

    function onWindowLoad() {
      globalObject.removeEventListener("load", onWindowLoad);
      scheduleWhenIdle();
    }

    globalObject.addEventListener("load", onWindowLoad, { once: true });

    const fallback = globalObject.setTimeout(() => {
      globalObject.removeEventListener("load", onWindowLoad);
      scheduleWhenIdle();
    }, 8000);

    globalObject.addEventListener(
      "load",
      () => {
        globalObject.clearTimeout(fallback);
      },
      { once: true },
    );
  }

  function scheduleOnVisibility() {
    if (!doc.hidden) {
      scheduleAfterLoad();
      return;
    }

    function handleVisibility() {
      doc.removeEventListener("visibilitychange", handleVisibility);
      scheduleAfterLoad();
    }

    doc.addEventListener("visibilitychange", handleVisibility, { once: true });
  }

  function scheduleAfterInteraction() {
    globalObject.removeEventListener("pointerdown", scheduleAfterInteraction);
    globalObject.removeEventListener("keydown", scheduleAfterInteraction);
    scheduleOnVisibility();
  }

  if (isVerySlowConnection) {
    globalObject.addEventListener("pointerdown", scheduleAfterInteraction, { once: true });
    globalObject.addEventListener("keydown", scheduleAfterInteraction, { once: true });
    globalObject.setTimeout(() => scheduleOnVisibility(), 10000);
    return;
  }

  scheduleOnVisibility();
});
