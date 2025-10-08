import { useStorage } from "nitropack/runtime";

type Resolver<T> = () => Promise<T>;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  cachedAt: number;
}

function resolveStorageKey(key: string) {
  return `cache:${key}`;
}

export async function useCachedFetch<T>(
  key: string,
  resolver: Resolver<T>,
  ttlSeconds = 300,
): Promise<T> {
  const storage = useStorage();
  const storageKey = resolveStorageKey(key);
  const now = Date.now();

  const cached = await storage.getItem<CacheEntry<T> | null>(storageKey);

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const value = await resolver();
  const entry: CacheEntry<T> = {
    value,
    cachedAt: now,
    expiresAt: now + ttlSeconds * 1000,
  };

  await storage.setItem(storageKey, entry);

  return value;
}
