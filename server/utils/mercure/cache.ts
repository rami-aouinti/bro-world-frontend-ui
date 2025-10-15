import { createHash } from "crypto";
import type { H3Event } from "h3";
import Redis from "ioredis";
import { useRuntimeConfig } from "#imports";
import type { MercureTokenEnvelope } from "~/types/mercure";

interface RedisMercureConfig {
  url: string;
  tls: boolean;
  keyPrefix: string;
  defaultTtl: number;
}

interface CachedMercureToken {
  token: string;
  expiresAt: number | null;
}

const globalScope = globalThis as typeof globalThis & {
  __broMercureRedisClient?: Redis | null;
  __broMercureRedisClientPromise?: Promise<Redis | null> | null;
};

function getRedisConfig(event: H3Event): RedisMercureConfig {
  const runtimeConfig = useRuntimeConfig(event);
  const redis = (runtimeConfig.redis ?? {}) as Partial<RedisMercureConfig> & {
    mercureTtl?: number;
  };

  const ttlCandidate = Number(redis.mercureTtl);
  const defaultTtl = Number.isFinite(ttlCandidate) && ttlCandidate >= 0 ? ttlCandidate : 600;

  return {
    url: typeof redis.url === "string" ? redis.url : "",
    tls: Boolean(redis.tls),
    keyPrefix:
      typeof redis.keyPrefix === "string" && redis.keyPrefix ? redis.keyPrefix : "bro-world",
    defaultTtl,
  } satisfies RedisMercureConfig;
}

async function getRedisClient(event: H3Event): Promise<Redis | null> {
  const config = getRedisConfig(event);

  if (!config.url) {
    return null;
  }

  if (globalScope.__broMercureRedisClient) {
    return globalScope.__broMercureRedisClient;
  }

  if (!globalScope.__broMercureRedisClientPromise) {
    globalScope.__broMercureRedisClientPromise = (async () => {
      try {
        const client = new Redis(config.url, {
          lazyConnect: true,
          enableAutoPipelining: true,
          maxRetriesPerRequest: 2,
          tls: config.tls ? {} : undefined,
        });

        client.on("error", (error) => {
          console.error("[mercure-cache] Redis client error", error);
        });

        await client.connect();
        globalScope.__broMercureRedisClient = client;
        return client;
      } catch (error) {
        console.error("[mercure-cache] Redis connection failed", error);
        return null;
      } finally {
        if (!globalScope.__broMercureRedisClient) {
          globalScope.__broMercureRedisClientPromise = null;
        }
      }
    })();
  }

  const client = await globalScope.__broMercureRedisClientPromise;

  if (!client) {
    globalScope.__broMercureRedisClientPromise = null;
  }

  return client ?? null;
}

function getCacheKey(config: RedisMercureConfig, sessionToken: string): string {
  const normalized = sessionToken.trim();

  if (!normalized) {
    return "";
  }

  const digest = createHash("sha256").update(normalized).digest("hex");

  return `${config.keyPrefix}:auth:session:${digest}:mercure-token`;
}

function resolveExpirationTimestamp(payload: MercureTokenEnvelope): number | null {
  if (payload.expiresAt) {
    const parsed = Date.parse(payload.expiresAt);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  if (typeof payload.expiresIn === "number" && Number.isFinite(payload.expiresIn)) {
    return Date.now() + Math.max(0, payload.expiresIn) * 1000;
  }

  return null;
}

function toCacheEntry(payload: MercureTokenEnvelope): CachedMercureToken | null {
  if (!payload.token) {
    return null;
  }

  return {
    token: payload.token,
    expiresAt: resolveExpirationTimestamp(payload),
  } satisfies CachedMercureToken;
}

function fromCacheEntry(entry: CachedMercureToken): MercureTokenEnvelope {
  const expiresAt = entry.expiresAt ?? null;

  return {
    token: entry.token,
    expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    expiresIn: expiresAt ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)) : null,
  } satisfies MercureTokenEnvelope;
}

function resolveTtlSeconds(entry: CachedMercureToken, config: RedisMercureConfig): number {
  if (entry.expiresAt) {
    return Math.max(0, Math.ceil((entry.expiresAt - Date.now()) / 1000));
  }

  return Math.max(0, Math.round(config.defaultTtl));
}

function isExpired(entry: CachedMercureToken): boolean {
  if (!entry.expiresAt) {
    return false;
  }

  return entry.expiresAt <= Date.now();
}

export async function readCachedMercureToken(
  event: H3Event,
  sessionToken: string,
): Promise<MercureTokenEnvelope | null> {
  const client = await getRedisClient(event);

  if (!client) {
    return null;
  }

  const config = getRedisConfig(event);
  const cacheKey = getCacheKey(config, sessionToken);

  if (!cacheKey) {
    return null;
  }

  try {
    const raw = await client.get(cacheKey);

    if (!raw) {
      return null;
    }

    const entry = JSON.parse(raw) as CachedMercureToken;

    if (!entry?.token) {
      return null;
    }

    if (isExpired(entry)) {
      await client.del(cacheKey);
      return null;
    }

    return fromCacheEntry(entry);
  } catch (error) {
    console.error("[mercure-cache] Failed to read cached Mercure token", error);
    return null;
  }
}

export async function writeCachedMercureToken(
  event: H3Event,
  sessionToken: string,
  payload: MercureTokenEnvelope,
): Promise<void> {
  const client = await getRedisClient(event);

  if (!client) {
    return;
  }

  const entry = toCacheEntry(payload);

  if (!entry) {
    return;
  }

  if (isExpired(entry)) {
    return;
  }

  const config = getRedisConfig(event);
  const cacheKey = getCacheKey(config, sessionToken);

  if (!cacheKey) {
    return;
  }

  try {
    const ttl = resolveTtlSeconds(entry, config);
    const serialized = JSON.stringify(entry);

    if (ttl > 0) {
      await client.set(cacheKey, serialized, "EX", ttl);
    } else {
      await client.set(cacheKey, serialized);
    }
  } catch (error) {
    console.error("[mercure-cache] Failed to persist Mercure token", error);
  }
}

export async function deleteCachedMercureToken(
  event: H3Event,
  sessionToken: string,
): Promise<void> {
  const client = await getRedisClient(event);

  if (!client) {
    return;
  }

  const config = getRedisConfig(event);
  const cacheKey = getCacheKey(config, sessionToken);

  if (!cacheKey) {
    return;
  }

  try {
    await client.del(cacheKey);
  } catch (error) {
    console.error("[mercure-cache] Failed to delete cached Mercure token", error);
  }
}
