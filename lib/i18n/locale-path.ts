const SUPPORTED_LOCALES = new Set(["en", "de", "fr", "ar", "it", "es", "ru"]);

const DEFAULT_LOCALE = "en";

function normalizePath(path: string): string {
  if (!path) {
    return "/";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

function stripLocaleFromPath(path: string): string {
  const normalizedPath = normalizePath(path);
  const segments = normalizedPath.split("/").filter(Boolean);

  if (!segments.length) {
    return "/";
  }

  const [firstSegment, ...rest] = segments;
  const normalizedSegment = firstSegment.toLowerCase();

  if (!SUPPORTED_LOCALES.has(normalizedSegment)) {
    return normalizedPath;
  }

  if (!rest.length) {
    return "/";
  }

  return `/${rest.join("/")}`;
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
  const localeCode = locale?.toLowerCase();
  const normalizedPath = stripLocaleFromPath(path);

  if (!localeCode || localeCode === DEFAULT_LOCALE) {
    return normalizedPath;
  }

  if (normalizedPath === "/") {
    return `/${localeCode}`;
  }

  return `/${localeCode}${normalizedPath}`;
}

export function buildLocalizedHref(target: string, locale?: string): string {
  const trimmedTarget = target?.trim();

  if (!trimmedTarget) {
    return buildLocalizedPath("/", locale);
  }

  const hasScheme = /^[a-z][a-z0-9+\-.]*:/i.test(trimmedTarget);

  if (hasScheme || trimmedTarget.startsWith("//") || trimmedTarget.startsWith("#")) {
    return trimmedTarget;
  }

  let parsed: URL;

  try {
    parsed = new URL(trimmedTarget, "http://example.com");
  } catch {
    return buildLocalizedPath(trimmedTarget, locale);
  }

  const localizedPath = buildLocalizedPath(parsed.pathname, locale);

  return `${localizedPath}${parsed.search}${parsed.hash}`;
}
