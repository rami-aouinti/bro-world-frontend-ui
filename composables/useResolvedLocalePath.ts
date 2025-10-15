import type { RouteLocationRaw } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLocalePath } from "#i18n";
import { buildLocalizedHref, stripLocaleFromPath } from "~/lib/i18n/locale-path";

export function useResolvedLocalePath() {
  const { locale } = useI18n();
  const resolveLocalePath = useLocalePath();

  return (target?: string | RouteLocationRaw) => {
    if (!target) {
      return buildLocalizedHref("/", locale.value);
    }

    if (typeof target === "string") {
      return buildLocalizedHref(target, locale.value);
    }

    if (typeof target === "object" && "path" in target && typeof target.path === "string") {
      const sanitizedPath = stripLocaleFromPath(target.path);
      return resolveLocalePath({ ...target, path: sanitizedPath });
    }

    return resolveLocalePath(target);
  };
}
