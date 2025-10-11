import { useNuxtApp } from "#app";
import { en, fr, de, ar, it, es, ru } from "vuetify/locale";

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
      loading:
        typeof messageLoading === "string"
          ? messageLoading
          : typeof existingVuetify.loading === "string"
            ? (existingVuetify.loading as string)
            : "Loading…",
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
