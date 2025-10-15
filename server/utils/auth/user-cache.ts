import { createHash } from "node:crypto";
import Redis from "ioredis";
import type { H3Event } from "h3";
import { useRuntimeConfig } from "#imports";
import type { AuthUser } from "~/types/auth";
import { normalizeSessionUser, sanitizeSessionUser } from "./user";

interface RedisSessionUserConfig {
  url: string;
  tls: boolean;
  keyPrefix: string;
  ttl: number;
}

const globalScope = globalThis as typeof globalThis & {
  __broSessionUserRedisClient?: Redis | null;
  __broSessionUserRedisClientPromise?: Promise<Redis | null> | null;
};

function getRedisConfig(event: H3Event): RedisSessionUserConfig {
  const runtimeConfig = useRuntimeConfig(event);
  const redis = (runtimeConfig.redis ?? {}) as Partial<RedisSessionUserConfig & { sessionTtl?: number }>;
  const sessionMaxAgeCandidate = Number.parseInt(runtimeConfig.auth?.sessionMaxAge ?? "", 10);
  const defaultTtl = Number.isFinite(sessionMaxAgeCandidate) && sessionMaxAgeCandidate > 0
    ? sessionMaxAgeCandidate
    : 60 * 60 * 24 * 7;
  const configuredTtl = Number(redis.sessionTtl);

  return {
    url: typeof redis.url === "string" ? redis.url : "",
    tls: Boolean(redis.tls),
    keyPrefix:
      typeof redis.keyPrefix === "string" && redis.keyPrefix ? redis.keyPrefix : "bro-world",
    ttl: Number.isFinite(configuredTtl) && configuredTtl > 0 ? configuredTtl : defaultTtl,
  } satisfies RedisSessionUserConfig;
}

async function getRedisClient(event: H3Event): Promise<Redis | null> {
  const config = getRedisConfig(event);

  if (!config.url) {
    return null;
  }

  if (globalScope.__broSessionUserRedisClient) {
    return globalScope.__broSessionUserRedisClient;
  }

  if (!globalScope.__broSessionUserRedisClientPromise) {
    globalScope.__broSessionUserRedisClientPromise = (async () => {
      try {
        const client = new Redis(config.url, {
          lazyConnect: true,
          enableAutoPipelining: true,
          maxRetriesPerRequest: 2,
          tls: config.tls ? {} : undefined,
        });

        client.on("error", (error) => {
          console.error("[auth-user-cache] Redis client error", error);
        });

        await client.connect();
        globalScope.__broSessionUserRedisClient = client;
        return client;
      } catch (error) {
        console.error("[auth-user-cache] Redis connection failed", error);
        return null;
      } finally {
        if (!globalScope.__broSessionUserRedisClient) {
          globalScope.__broSessionUserRedisClientPromise = null;
        }
      }
    })();
  }

  const client = await globalScope.__broSessionUserRedisClientPromise;

  if (!client) {
    globalScope.__broSessionUserRedisClientPromise = null;
  }

  return client ?? null;
}

function buildCacheKey(config: RedisSessionUserConfig, sessionToken: string): string {
  const normalized = sessionToken.trim();

  if (!normalized) {
    return "";
  }

  const digest = createHash("sha256").update(normalized).digest("hex");

  return `${config.keyPrefix}:auth:session:${digest}:user`;
}

export async function readCachedSessionUser(
  event: H3Event,
  sessionToken: string,
): Promise<AuthUser | null> {
  const client = await getRedisClient(event);

  if (!client) {
    return null;
  }

  const config = getRedisConfig(event);
  const cacheKey = buildCacheKey(config, sessionToken);

  if (!cacheKey) {
    return null;
  }

  try {
    const raw = await client.get(cacheKey);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    return normalizeSessionUser(parsed);
  } catch (error) {
    console.error("[auth-user-cache] Failed to read cached session user", error);
    return null;
  }
}

export async function writeCachedSessionUser(
  event: H3Event,
  sessionToken: string,
  user: AuthUser,
): Promise<void> {
  const client = await getRedisClient(event);

  if (!client) {
    return;
  }

  const config = getRedisConfig(event);
  const cacheKey = buildCacheKey(config, sessionToken);

  if (!cacheKey) {
    return;
  }

  try {
    const sanitized = sanitizeSessionUser(user);
    const serialized = JSON.stringify(sanitized);
    const ttlSeconds = Math.max(0, Math.round(config.ttl));

    if (ttlSeconds > 0) {
      await client.set(cacheKey, serialized, "EX", ttlSeconds);
    } else {
      await client.set(cacheKey, serialized);
    }
  } catch (error) {
    console.error("[auth-user-cache] Failed to persist session user", error);
  }
}

export async function deleteCachedSessionUser(
  event: H3Event,
  sessionToken: string,
): Promise<void> {
  const client = await getRedisClient(event);

  if (!client) {
    return;
  }

  const config = getRedisConfig(event);
  const cacheKey = buildCacheKey(config, sessionToken);

  if (!cacheKey) {
    return;
  }

  try {
    await client.del(cacheKey);
  } catch (error) {
    console.error("[auth-user-cache] Failed to delete cached session user", error);
  }
}
