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

  let hasScheduledLoad = false;

  const loadClarity = () => {
    if (hasScheduledLoad) {
      return;
    }

    hasScheduledLoad = true;

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
  };

  const idleCallback = globalObject.requestIdleCallback;

  if (typeof idleCallback === "function") {
    idleCallback(loadClarity, { timeout: 4000 });
    return;
  }

  globalObject.setTimeout(loadClarity, 2000);
});
