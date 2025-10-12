import type { SiteLanguageDefinition } from "~/types/settings";

export interface SupportedLanguageMeta {
  code: string;
  label: string;
  endonym: string;
}

const languageList: SupportedLanguageMeta[] = [
  { code: "en", label: "English", endonym: "English" },
  { code: "fr", label: "French", endonym: "Français" },
  { code: "de", label: "German", endonym: "Deutsch" },
  { code: "es", label: "Spanish", endonym: "Español" },
  { code: "it", label: "Italian", endonym: "Italiano" },
  { code: "ru", label: "Russian", endonym: "Русский" },
  { code: "ar", label: "Arabic", endonym: "العربية" },
] as const satisfies readonly SupportedLanguageMeta[];

export const supportedLanguages: readonly SupportedLanguageMeta[] = languageList;

export const supportedLanguageCodes = supportedLanguages.map((language) => language.code);

export const supportedLanguageOrder = new Map(
  supportedLanguages.map((language, index) => [language.code, index] as const),
);

export const defaultLanguageCode = "en";

export function getSupportedLanguage(code: string): SupportedLanguageMeta | undefined {
  return supportedLanguages.find((language) => language.code === code);
}

export function toSiteLanguageDefinition(
  meta: SupportedLanguageMeta,
  overrides: Partial<Pick<SiteLanguageDefinition, "label" | "endonym" | "enabled">> = {},
): SiteLanguageDefinition {
  return {
    code: meta.code,
    label: (overrides.label ?? meta.label).trim(),
    endonym: (overrides.endonym ?? meta.endonym).trim(),
    enabled: overrides.enabled ?? true,
  } satisfies SiteLanguageDefinition;
}
