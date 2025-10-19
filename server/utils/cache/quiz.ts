import Redis from "ioredis";
import { useRuntimeConfig } from "#imports";

import { CACHE_NAMESPACE_PUBLIC, createPrefixedCacheKey } from "~/lib/cache/namespaces";
import type { QuizLandingData } from "../quiz";

interface QuizCacheConfig {
  url: string;
  tls: boolean;
  keyPrefix: string;
  ttl: number;
}

interface MemoryCacheEntry {
  value: QuizLandingData;
  expiresAt: number;
}

const DEFAULT_QUIZ_TTL_SECONDS = 300;

const globalScope = globalThis as typeof globalThis & {
  __broQuizRedisClient?: Redis | null;
  __broQuizRedisClientPromise?: Promise<Redis | null> | null;
  __broQuizMemoryCache?: MemoryCacheEntry | null;
};

function getQuizCacheConfig(): QuizCacheConfig {
  const runtime = useRuntimeConfig();
  const redis = (runtime.redis ?? {}) as Partial<QuizCacheConfig & { quizTtl?: number }>;
  const ttlCandidate = Number(redis.quizTtl);

  return {
    url: typeof redis.url === "string" ? redis.url : "",
    tls: Boolean(redis.tls),
    keyPrefix:
      typeof redis.keyPrefix === "string" && redis.keyPrefix ? redis.keyPrefix : "bro-world",
    ttl:
      Number.isFinite(ttlCandidate) && ttlCandidate > 0
        ? Number(ttlCandidate)
        : DEFAULT_QUIZ_TTL_SECONDS,
  } satisfies QuizCacheConfig;
}

function sanitizeQuizLandingDataCandidate(candidate: unknown): QuizLandingData | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const record = candidate as Partial<QuizLandingData>;

  if (!record.hero || typeof record.hero !== "object" || !record.cta || typeof record.cta !== "object") {
    return null;
  }

  function ensureArray<T>(value: unknown): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
  }

  return {
    hero: record.hero as QuizLandingData["hero"],
    overview: ensureArray<QuizLandingData["overview"][number]>(record.overview),
    features: ensureArray<QuizLandingData["features"][number]>(record.features),
    process: ensureArray<QuizLandingData["process"][number]>(record.process),
    questionBanks: ensureArray<QuizLandingData["questionBanks"][number]>(record.questionBanks),
    leaderboard: ensureArray<QuizLandingData["leaderboard"][number]>(record.leaderboard),
    cta: record.cta as QuizLandingData["cta"],
  } satisfies QuizLandingData;
}

function getCacheKey(config: QuizCacheConfig): string {
  return createPrefixedCacheKey(config.keyPrefix, CACHE_NAMESPACE_PUBLIC, "quiz", "landing");
}

async function getRedisClient(): Promise<Redis | null> {
  const config = getQuizCacheConfig();

  if (!config.url) {
    globalScope.__broQuizRedisClient = null;
    globalScope.__broQuizRedisClientPromise = null;
    return null;
  }

  if (globalScope.__broQuizRedisClient) {
    return globalScope.__broQuizRedisClient;
  }

  if (!globalScope.__broQuizRedisClientPromise) {
    globalScope.__broQuizRedisClientPromise = (async () => {
      try {
        const client = new Redis(config.url, {
          lazyConnect: true,
          enableAutoPipelining: true,
          maxRetriesPerRequest: 2,
          tls: config.tls ? {} : undefined,
        });

        client.on("error", (error) => {
          console.error("[quiz-cache] Redis client error", error);
        });

        await client.connect();
        globalScope.__broQuizRedisClient = client;
        return client;
      } catch (error) {
        console.error("[quiz-cache] Redis connection failed", error);
        return null;
      } finally {
        if (!globalScope.__broQuizRedisClient) {
          globalScope.__broQuizRedisClientPromise = null;
        }
      }
    })();
  }

  const client = await globalScope.__broQuizRedisClientPromise;

  if (!client) {
    globalScope.__broQuizRedisClientPromise = null;
  }

  return client ?? null;
}

function readFromMemory(): QuizLandingData | null {
  const entry = globalScope.__broQuizMemoryCache;

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    globalScope.__broQuizMemoryCache = null;
    return null;
  }

  return structuredClone(entry.value);
}

function writeToMemory(data: QuizLandingData, ttlSeconds: number): void {
  const ttlMs = Math.max(ttlSeconds, 1) * 1000;

  globalScope.__broQuizMemoryCache = {
    value: structuredClone(data),
    expiresAt: Date.now() + ttlMs,
  } satisfies MemoryCacheEntry;
}

function clearMemory(): void {
  globalScope.__broQuizMemoryCache = null;
}

export async function readQuizLandingCache(): Promise<QuizLandingData | null> {
  const memoryHit = readFromMemory();

  if (memoryHit) {
    return memoryHit;
  }

  const client = await getRedisClient();

  if (!client) {
    return null;
  }

  const config = getQuizCacheConfig();

  try {
    const raw = await client.get(getCacheKey(config));

    if (!raw) {
      return null;
    }

    const parsed = sanitizeQuizLandingDataCandidate(JSON.parse(raw));

    if (!parsed) {
      return null;
    }

    writeToMemory(parsed, config.ttl);
    return structuredClone(parsed);
  } catch (error) {
    console.error("[quiz-cache] Failed to read quiz cache", error);
    return null;
  }
}

export async function writeQuizLandingCache(data: QuizLandingData): Promise<void> {
  const config = getQuizCacheConfig();

  const sanitized = sanitizeQuizLandingDataCandidate(data);

  if (!sanitized) {
    return;
  }

  writeToMemory(sanitized, config.ttl);

  const client = await getRedisClient();

  if (!client) {
    return;
  }

  try {
    await client.set(getCacheKey(config), JSON.stringify(sanitized), "EX", config.ttl);
  } catch (error) {
    console.error("[quiz-cache] Failed to write quiz cache", error);
  }
}

export async function invalidateQuizLandingCache(): Promise<void> {
  clearMemory();

  const client = await getRedisClient();

  if (!client) {
    return;
  }

  const config = getQuizCacheConfig();

  try {
    await client.del(getCacheKey(config));
  } catch (error) {
    console.error("[quiz-cache] Failed to invalidate quiz cache", error);
  }
}

