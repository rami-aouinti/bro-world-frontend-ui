const FALLBACK_LOADING_MESSAGES = {
  en: "Loading…",
  fr: "Chargement…",
  de: "Wird geladen…",
  ar: "جارٍ التحميل…",
  it: "Caricamento…",
  es: "Cargando…",
  ru: "Загрузка…",
} as const;

export type VuetifyLocaleCode = keyof typeof FALLBACK_LOADING_MESSAGES;

export function getVuetifyLoadingFallback(locale: string): string {
  return (
    FALLBACK_LOADING_MESSAGES[locale as VuetifyLocaleCode] ?? FALLBACK_LOADING_MESSAGES.en
  );
}

export function ensureVuetifyLoading(
  locale: string,
  ...candidates: Array<unknown>
): string {
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return getVuetifyLoadingFallback(locale);
}
