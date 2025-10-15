import en from "./locales/en.json";

const DEFAULT_LOCALE = "en";
const SUPPORTED_LOCALES = ["en", "fr", "de", "es", "it", "ru", "ar"] as const;

export default defineI18nConfig(() => ({
  legacy: false,
  globalInjection: true,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  availableLocales: [...SUPPORTED_LOCALES],
  messages: {
    [DEFAULT_LOCALE]: en,
  },
}));
