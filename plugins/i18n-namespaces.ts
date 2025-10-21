import type { Ref } from "vue";

import { loadLocaleNamespaces } from "~/i18n/i18n.config";

function resolveLocaleValue(locale: string | Ref<string>): string {
  if (typeof locale === "string") {
    return locale;
  }

  return locale.value;
}

async function ensureCommonNamespace(locale: string) {
  if (!locale) {
    return;
  }

  await loadLocaleNamespaces(locale, ["common"]);
}

export default defineNuxtPlugin(async (nuxtApp) => {
  const { $i18n } = nuxtApp;
  const currentLocale = resolveLocaleValue($i18n.locale as string | Ref<string>);

  await ensureCommonNamespace(currentLocale);

  nuxtApp.hook("i18n:beforeLocaleSwitch", async (context) => {
    const nextLocale = context?.newLocale;

    if (typeof nextLocale === "string") {
      await ensureCommonNamespace(nextLocale);
    }
  });

  nuxtApp.hook("i18n:localeSwitched", async (context) => {
    const nextLocale = context?.newLocale;

    if (typeof nextLocale === "string") {
      await ensureCommonNamespace(nextLocale);
    }
  });
});
