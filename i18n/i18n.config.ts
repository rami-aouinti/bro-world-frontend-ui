import ar from "./locales/ar.json";
import de from "./locales/de.json";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import it from "./locales/it.json";
import ru from "./locales/ru.json";
import zhCN from "./locales/zh-cn.json";

export default defineI18nConfig(() => ({
  legacy: false,
  globalInjection: true,
  locale: "en",
  fallbackLocale: "en",
  availableLocales: ["en", "fr", "de", "es", "it", "ru", "ar", "zh-cn"],
  messages: {
    en,
    fr,
    de,
    es,
    it,
    ru,
    ar,
    "zh-cn": zhCN,
  },
}));
