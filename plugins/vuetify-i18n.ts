import { useNuxtApp } from "#app";
import { en, fr, de, ar, it, es, ru } from "vuetify/locale";
import { ensureVuetifyLoading } from "~/lib/vuetify/loading";

export default defineNuxtPlugin(() => {
  const { $i18n } = useNuxtApp();
  const availableLocales = {
    en,
    fr,
    de,
    ar,
    it,
    es,
    ru,
  };

  for (const [code, messages] of Object.entries(availableLocales)) {
    const existingMessages = $i18n.getLocaleMessage(code) as Record<string, unknown> | undefined;
    const existingVuetify = (existingMessages?.$vuetify ?? {}) as Record<string, unknown>;
    const messageLoading = (messages as { loading?: unknown }).loading;
    const normalizedMessages = {
      ...messages,
      loading: ensureVuetifyLoading(code, messageLoading, existingVuetify.loading),
    } satisfies typeof messages;

    $i18n.setLocaleMessage(code, {
      ...existingMessages,
      $vuetify: {
        ...existingVuetify,
        ...normalizedMessages,
      },
    });
  }
});
