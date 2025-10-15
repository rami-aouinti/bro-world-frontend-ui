import type { RouteLocationRaw } from "vue-router";
import { useLocalePath } from "#i18n";
import { stripLocaleFromPath } from "~/lib/i18n/locale-path";

function searchParamsToObject(
  params: URLSearchParams,
): Record<string, string | string[]> | undefined {
  const record: Record<string, string | string[]> = {};

  for (const key of params.keys()) {
    const values = params.getAll(key);

    if (!values.length) {
      continue;
    }

    record[key] = values.length === 1 ? values[0] : values;
  }

  return Object.keys(record).length ? record : undefined;
}

export function useResolvedLocalePath() {
  const resolveLocalePath = useLocalePath();

  return (target?: string | RouteLocationRaw) => {
    if (!target) {
      return resolveLocalePath("/");
    }

    if (typeof target === "string") {
      const trimmedTarget = target.trim();

      if (!trimmedTarget) {
        return resolveLocalePath("/");
      }

      const hasScheme = /^[a-z][a-z0-9+\-.]*:/i.test(trimmedTarget);

      if (hasScheme || trimmedTarget.startsWith("//") || trimmedTarget.startsWith("#")) {
        return trimmedTarget;
      }

      let parsed: URL;

      try {
        parsed = new URL(trimmedTarget, "http://example.com");
      } catch {
        const sanitizedPath = stripLocaleFromPath(trimmedTarget);
        return resolveLocalePath(sanitizedPath);
      }

      const sanitizedPath = stripLocaleFromPath(parsed.pathname);
      const query = searchParamsToObject(parsed.searchParams);
      const routeLocation: RouteLocationRaw = { path: sanitizedPath };

      if (query) {
        routeLocation.query = query;
      }

      if (parsed.hash) {
        routeLocation.hash = parsed.hash;
      }

      return resolveLocalePath(routeLocation);
    }

    if (typeof target === "object" && "path" in target && typeof target.path === "string") {
      const sanitizedPath = stripLocaleFromPath(target.path);
      return resolveLocalePath({ ...target, path: sanitizedPath });
    }

    return resolveLocalePath(target);
  };
}
