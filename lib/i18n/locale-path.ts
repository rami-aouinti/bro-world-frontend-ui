const SUPPORTED_LOCALES = new Set(["en", "de", "fr", "ar", "it", "es", "ru", "zh-cn"]);

const DEFAULT_LOCALE = "en";

function normalizePath(path: string): string {
  if (!path) {
    return "/";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

export function resolveLocaleFromPath(path: string): string {
  const normalizedPath = normalizePath(path);
  const [firstSegment = ""] = normalizedPath.split("/").filter(Boolean);
  const normalizedSegment = firstSegment.toLowerCase();

  if (SUPPORTED_LOCALES.has(normalizedSegment)) {
    return normalizedSegment;
  }

  return DEFAULT_LOCALE;
}

export function buildLocalizedPath(path: string, locale?: string): string {
  const normalizedPath = normalizePath(path);
  const localeCode = locale?.toLowerCase();

  if (!localeCode || localeCode === DEFAULT_LOCALE) {
    return normalizedPath;
  }

  if (normalizedPath === "/") {
    return `/${localeCode}`;
  }

  return `/${localeCode}${normalizedPath}`;
}
