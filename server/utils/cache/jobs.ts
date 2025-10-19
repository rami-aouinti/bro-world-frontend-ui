import Redis from "ioredis";
import { useRuntimeConfig } from "#imports";
import { CACHE_NAMESPACE_PUBLIC, createPrefixedCacheKey } from "~/lib/cache/namespaces";
import type { JobData } from "../job";

interface JobsCacheConfig {
  url: string;
  tls: boolean;
  keyPrefix: string;
  ttl: number;
}

interface MemoryEntry<T> {
  value: T;
  expiresAt: number;
  tags: string[];
}

const DEFAULT_JOBS_TTL_SECONDS = 300;
const MEMORY_TAG_ALL = "jobs:all";

const globalScope = globalThis as typeof globalThis & {
  __broJobsRedisClient?: Redis | null;
  __broJobsRedisClientPromise?: Promise<Redis | null> | null;
  __broJobsCache?: Map<string, MemoryEntry<JobData>>;
  __broJobsTags?: Map<string, Set<string>>;
};

function getRedisConfig(): JobsCacheConfig {
  const runtimeConfig = useRuntimeConfig();
  const redis = (runtimeConfig.redis ?? {}) as Partial<JobsCacheConfig & { jobTtl?: number }>;
  const ttlCandidate = Number(redis.jobTtl);

  return {
    url: typeof redis.url === "string" ? redis.url : "",
    tls: Boolean(redis.tls),
    keyPrefix:
      typeof redis.keyPrefix === "string" && redis.keyPrefix ? redis.keyPrefix : "bro-world",
    ttl:
      Number.isFinite(ttlCandidate) && ttlCandidate > 0
        ? Number(ttlCandidate)
        : DEFAULT_JOBS_TTL_SECONDS,
  } satisfies JobsCacheConfig;
}

async function getRedisClient(): Promise<Redis | null> {
  const config = getRedisConfig();

  if (!config.url) {
    return null;
  }

  if (globalScope.__broJobsRedisClient) {
    return globalScope.__broJobsRedisClient;
  }

  if (!globalScope.__broJobsRedisClientPromise) {
    globalScope.__broJobsRedisClientPromise = (async () => {
      try {
        const client = new Redis(config.url, {
          lazyConnect: true,
          enableAutoPipelining: true,
          maxRetriesPerRequest: 2,
          tls: config.tls ? {} : undefined,
        });

        client.on("error", (error) => {
          console.error("[jobs-cache] Redis client error", error);
        });

        await client.connect();
        globalScope.__broJobsRedisClient = client;
        return client;
      } catch (error) {
        console.error("[jobs-cache] Redis connection failed", error);
        return null;
      } finally {
        if (!globalScope.__broJobsRedisClient) {
          globalScope.__broJobsRedisClientPromise = null;
        }
      }
    })();
  }

  const client = await globalScope.__broJobsRedisClientPromise;

  if (!client) {
    globalScope.__broJobsRedisClientPromise = null;
  }

  return client ?? null;
}

function getMemoryStores() {
  if (!globalScope.__broJobsCache) {
    globalScope.__broJobsCache = new Map();
  }

  if (!globalScope.__broJobsTags) {
    globalScope.__broJobsTags = new Map();
  }

  return {
    cache: globalScope.__broJobsCache!,
    tags: globalScope.__broJobsTags!,
  };
}

function buildCacheKey(config: JobsCacheConfig): string {
  return createPrefixedCacheKey(config.keyPrefix, CACHE_NAMESPACE_PUBLIC, "jobs", "all");
}

function memoryDelete(key: string) {
  const { cache, tags } = getMemoryStores();
  const entry = cache.get(key);

  if (!entry) {
    return;
  }

  cache.delete(key);

  for (const tag of entry.tags) {
    const set = tags.get(tag);

    if (!set) {
      continue;
    }

    set.delete(key);

    if (set.size === 0) {
      tags.delete(tag);
    }
  }
}

function rememberInMemory(key: string, value: JobData, ttlSeconds: number) {
  const ttl = Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : DEFAULT_JOBS_TTL_SECONDS;
  const expiresAt = Date.now() + ttl * 1000;
  const entry: MemoryEntry<JobData> = {
    value,
    expiresAt,
    tags: [MEMORY_TAG_ALL],
  };

  const { cache, tags } = getMemoryStores();
  cache.set(key, entry);

  if (!tags.has(MEMORY_TAG_ALL)) {
    tags.set(MEMORY_TAG_ALL, new Set());
  }

  tags.get(MEMORY_TAG_ALL)!.add(key);
}

function readFromMemory(key: string): JobData | null {
  const { cache } = getMemoryStores();
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    memoryDelete(key);
    return null;
  }

  return entry.value;
}

export async function readCachedJobs(): Promise<JobData | null> {
  const config = getRedisConfig();
  const cacheKey = buildCacheKey(config);
  const memoryEntry = readFromMemory(cacheKey);

  if (memoryEntry) {
    return memoryEntry;
  }

  const client = await getRedisClient();

  if (!client) {
    return null;
  }

  try {
    const raw = await client.get(cacheKey);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as JobData;
    rememberInMemory(cacheKey, parsed, config.ttl);
    return parsed;
  } catch (error) {
    console.error("[jobs-cache] Failed to read cached jobs", error);
    return null;
  }
}

export async function writeCachedJobs(data: JobData): Promise<void> {
  const config = getRedisConfig();
  const cacheKey = buildCacheKey(config);

  rememberInMemory(cacheKey, data, config.ttl);

  const client = await getRedisClient();

  if (!client) {
    return;
  }

  try {
    await client.set(cacheKey, JSON.stringify(data), "EX", config.ttl);
  } catch (error) {
    console.error("[jobs-cache] Failed to write cached jobs", error);
  }
}

export async function invalidateCachedJobs(): Promise<void> {
  const config = getRedisConfig();
  const cacheKey = buildCacheKey(config);

  memoryDelete(cacheKey);

  const client = await getRedisClient();

  if (!client) {
    return;
  }

  try {
    await client.del(cacheKey);
  } catch (error) {
    console.error("[jobs-cache] Failed to delete cached jobs", error);
  }
}
