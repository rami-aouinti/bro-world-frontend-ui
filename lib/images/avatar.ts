const AVATAR_CACHE_LIMIT = 200;
const avatarOptimizationCache = new Map<string, string | null>();

function rememberOptimizedUrl(key: string, value: string | null) {
  if (avatarOptimizationCache.has(key)) {
    avatarOptimizationCache.delete(key);
    avatarOptimizationCache.set(key, value);
    return;
  }

  if (avatarOptimizationCache.size >= AVATAR_CACHE_LIMIT) {
    const oldestKey = avatarOptimizationCache.keys().next().value;

    if (oldestKey !== undefined) {
      avatarOptimizationCache.delete(oldestKey);
    }
  }

  avatarOptimizationCache.set(key, value);
}

export function optimizeAvatarUrl(input: string | null | undefined, size: number): string | null {
  if (!input) {
    return null;
  }

  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  const normalizedSize = Number.isFinite(size) ? Math.max(1, Math.round(size)) : 1;
  const cacheKey = `${normalizedSize}::${trimmed}`;

  if (avatarOptimizationCache.has(cacheKey)) {
    const cached = avatarOptimizationCache.get(cacheKey) ?? null;
    avatarOptimizationCache.delete(cacheKey);
    avatarOptimizationCache.set(cacheKey, cached);
    return cached;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    rememberOptimizedUrl(cacheKey, trimmed);
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase();

    if (host === "avatars.githubusercontent.com") {
      url.searchParams.set("s", String(normalizedSize));
      const optimized = url.toString();
      rememberOptimizedUrl(cacheKey, optimized);
      return optimized;
    }

    if (host.endsWith("bro-world.org") || host.endsWith("bro-world-space.com")) {
      url.searchParams.set("size", `${normalizedSize}x${normalizedSize}`);

      if (!url.searchParams.has("format")) {
        url.searchParams.set("format", "webp");
      }

      const optimized = url.toString();
      rememberOptimizedUrl(cacheKey, optimized);
      return optimized;
    }

    const optimized = url.toString();
    rememberOptimizedUrl(cacheKey, optimized);
    return optimized;
  } catch {
    rememberOptimizedUrl(cacheKey, trimmed);
    return trimmed;
  }
}
