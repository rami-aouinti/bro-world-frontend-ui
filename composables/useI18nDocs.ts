import { computed } from "vue";
import type { NavItem } from "@ztl-uwu/nuxt-content";
import type { SearchResult } from "minisearch";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";

/**
 * Wrapper around useI18n that gracefully handles the documentation navigation
 * when multilingual content is missing for a locale.
 */
export function useI18nDocs() {
  const i18n = useI18n();

  const { navigation, next, prev } = useContent();
  const { locale, locales } = i18n;

  const defaultLocaleRaw = "defaultLocale" in i18n ? i18n.defaultLocale : undefined;
  const availableLocalesRaw = i18n.availableLocales;

  const defaultLocale =
    typeof defaultLocaleRaw === "string"
      ? defaultLocaleRaw
      : (defaultLocaleRaw?.value ??
        (Array.isArray(availableLocalesRaw) ? availableLocalesRaw[0] : "en"));

  const availableLocales = Array.isArray(availableLocalesRaw)
    ? availableLocalesRaw
    : (availableLocalesRaw?.value ?? [defaultLocale]);

  const otherLocales = availableLocales.filter((code) => code !== defaultLocale);

  const i18nEnabled = availableLocales.length > 1;

  function isLocaleSpecificPath(path: string, localeCode: string): boolean {
    return path === `/${localeCode}` || path.startsWith(`/${localeCode}/`);
  }

  const localizedNavigation = computed(() => {
    const navItems = navigation.value ?? [];

    if (!i18nEnabled) {
      return navItems;
    }

    const filteredNav = navItems.filter((nav) => {
      if (locale.value === defaultLocale) {
        return !otherLocales.some((code) => isLocaleSpecificPath(nav._path, code));
      }

      return isLocaleSpecificPath(nav._path, locale.value);
    });

    if (locale.value === defaultLocale) {
      return filteredNav;
    }

    const localizedRoot = filteredNav.find((item): item is NavItem & { children: NavItem[] } => {
      return isLocaleSpecificPath(item._path, locale.value) && Array.isArray(item.children);
    });

    return localizedRoot?.children ?? [];
  });

  const localizedPrev = computed(() => {
    const prevItem = prev.value;

    if (!i18nEnabled) {
      return prevItem;
    }

    if (!prevItem) {
      return null;
    }

    if (locale.value === defaultLocale) {
      if (otherLocales.some((code) => isLocaleSpecificPath(prevItem._path, code))) {
        return null;
      }

      return prevItem;
    }

    return isLocaleSpecificPath(prevItem._path, locale.value) ? prevItem : null;
  });

  const localizedNext = computed(() => {
    const nextItem = next.value;

    if (!i18nEnabled) {
      return nextItem;
    }

    if (!nextItem) {
      return null;
    }

    if (locale.value === defaultLocale) {
      if (otherLocales.some((code) => isLocaleSpecificPath(nextItem._path, code))) {
        return null;
      }

      return nextItem;
    }

    return isLocaleSpecificPath(nextItem._path, locale.value) ? nextItem : null;
  });

  const resolveLocalePath = i18nEnabled ? useResolvedLocalePath() : (path: string) => path;

  const localizeSearchResult = i18nEnabled
    ? (result: SearchResult[]) =>
        result.filter((entry) => {
          if (locale.value === defaultLocale) {
            return !otherLocales.some((code) => isLocaleSpecificPath(entry.id, code));
          }

          return isLocaleSpecificPath(entry.id, locale.value);
        })
    : (result: SearchResult[]) => result;

  const switchLocalePath = useSwitchLocalePath();

  return {
    i18nEnabled,
    locale,
    locales,
    defaultLocale,
    availableLocales,
    otherLocales,
    navigation: localizedNavigation,
    prev: localizedPrev,
    next: localizedNext,
    localePath: resolveLocalePath,
    localizeSearchResult,
    switchLocalePath,
  };
}
