import ar from "./locales/ar.json";
import de from "./locales/de.json";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

export default defineI18nConfig(() => ({
  legacy: false,
  globalInjection: true,
  locale: "en",
  fallbackLocale: "en",
  availableLocales: ["en", "fr", "de", "ar"],
  messages: {
    en,
    fr,
    de,
    ar,
  },
}));
