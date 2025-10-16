export const CACHE_NAMESPACE_PUBLIC = "cache:public" as const;
export const CACHE_NAMESPACE_USER = "cache:user" as const;
export const CACHE_NAMESPACE_ADMIN = "cache:admin" as const;
export const CACHE_NAMESPACE_BLOG = "cache:blog" as const;

export const CACHE_NAMESPACES = {
  public: CACHE_NAMESPACE_PUBLIC,
  user: CACHE_NAMESPACE_USER,
  admin: CACHE_NAMESPACE_ADMIN,
  blog: CACHE_NAMESPACE_BLOG,
} as const;

export type CacheNamespace = (typeof CACHE_NAMESPACES)[keyof typeof CACHE_NAMESPACES];

export type CacheKeyPart = string | number | boolean | null | undefined;

function normalizePart(part: CacheKeyPart): string | null {
  if (part === null || part === undefined) {
    return null;
  }

  if (typeof part === "number") {
    if (!Number.isFinite(part)) {
      return null;
    }

    return String(part);
  }

  if (typeof part === "boolean") {
    return part ? "1" : "0";
  }

  const trimmed = String(part).trim();
  return trimmed ? trimmed : null;
}

function buildKeySegments(namespace: CacheNamespace, parts: CacheKeyPart[]): string[] {
  const segments = [namespace];

  for (const part of parts) {
    const normalized = normalizePart(part);

    if (normalized) {
      segments.push(normalized);
    }
  }

  return segments;
}

export function createCacheKey(namespace: CacheNamespace, ...parts: CacheKeyPart[]): string {
  return buildKeySegments(namespace, parts).join(":");
}

export function createPrefixedCacheKey(
  prefix: string | null | undefined,
  namespace: CacheNamespace,
  ...parts: CacheKeyPart[]
): string {
  const trimmedPrefix = normalizePart(prefix);
  const segments = buildKeySegments(namespace, parts);

  if (trimmedPrefix) {
    return [trimmedPrefix, ...segments].join(":");
  }

  return segments.join(":");
}
