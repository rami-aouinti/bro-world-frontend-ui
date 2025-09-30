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
    $i18n.setLocaleMessage(code, {
      ...$i18n.getLocaleMessage(code),
      $vuetify: messages,
    });
  }
});
