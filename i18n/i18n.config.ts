import type { LocaleMessages, VueMessageType } from "vue-i18n";
import { useNuxtApp } from "#app";

import enCommon from "./locales/en/common.json";

const DEFAULT_LOCALE = "en";
const SUPPORTED_LOCALES = ["en", "fr", "de", "es", "it", "ru", "ar"] as const;
const COMMON_NAMESPACE = "common";

type LocaleNamespaceLoader = () => Promise<{ default: LocaleMessages<VueMessageType> }>;

const namespaceModules = import.meta.glob<LocaleNamespaceLoader>("./locales/*/*.json");

const loadedNamespaces = new Map<string, Set<string>>();

function markNamespaceLoaded(locale: string, namespace: string) {
  if (!loadedNamespaces.has(locale)) {
    loadedNamespaces.set(locale, new Set());
  }

  loadedNamespaces.get(locale)!.add(namespace);
}

function hasNamespace(locale: string, namespace: string) {
  return loadedNamespaces.get(locale)?.has(namespace) ?? false;
}

export async function loadLocaleNamespaces(locale: string, namespaces: string[]) {
  const uniqueNamespaces = Array.from(new Set(namespaces.filter(Boolean)));

  if (!uniqueNamespaces.length) {
    return;
  }

  const { $i18n } = useNuxtApp();

  const loaders = uniqueNamespaces
    .filter((namespace) => !hasNamespace(locale, namespace))
    .map(async (namespace) => {
      const loader = namespaceModules[`./locales/${locale}/${namespace}.json`];

      if (!loader) {
        if (import.meta.dev) {
          console.warn(`[i18n] Missing namespace "${namespace}" for locale "${locale}".`);
        }

        return;
      }

      const messages = await loader().then((mod) => mod.default ?? {});

      const existing = $i18n.getLocaleMessage(locale) as LocaleMessages<VueMessageType> | undefined;

      if (!existing || !Object.keys(existing).length) {
        $i18n.setLocaleMessage(locale, messages);
      } else {
        $i18n.mergeLocaleMessage(locale, messages);
      }

      markNamespaceLoaded(locale, namespace);
    });

  await Promise.all(loaders);
}

export default defineI18nConfig(() => ({
  legacy: false,
  globalInjection: true,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  availableLocales: [...SUPPORTED_LOCALES],
  messages: {
    [DEFAULT_LOCALE]: enCommon,
  },
}));

markNamespaceLoaded(DEFAULT_LOCALE, COMMON_NAMESPACE);
