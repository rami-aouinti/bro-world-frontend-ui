import { createHash } from "node:crypto";
import Redis from "ioredis";
import type { H3Event } from "h3";
import { useRuntimeConfig } from "#imports";
import type { ProfileUser, FriendEntry, FriendStory } from "~/types/pages/profile";
import { CACHE_NAMESPACE_USER, createPrefixedCacheKey } from "~/lib/cache/namespaces";

interface ProfileCacheConfig {
  url: string;
  tls: boolean;
  keyPrefix: string;
  ttl: number;
}

const DEFAULT_PROFILE_TTL_SECONDS = 300;

const globalScope = globalThis as typeof globalThis & {
  __broProfileRedisClient?: Redis | null;
  __broProfileRedisClientPromise?: Promise<Redis | null> | null;
};

function getRedisConfig(event: H3Event): ProfileCacheConfig {
  const runtimeConfig = useRuntimeConfig(event);
  const redis = (runtimeConfig.redis ?? {}) as Partial<
    ProfileCacheConfig & { profileTtl?: number }
  >;
  const ttlCandidate = Number(redis.profileTtl);

  return {
    url: typeof redis.url === "string" ? redis.url : "",
    tls: Boolean(redis.tls),
    keyPrefix:
      typeof redis.keyPrefix === "string" && redis.keyPrefix ? redis.keyPrefix : "bro-world",
    ttl:
      Number.isFinite(ttlCandidate) && ttlCandidate > 0
        ? Number(ttlCandidate)
        : DEFAULT_PROFILE_TTL_SECONDS,
  } satisfies ProfileCacheConfig;
}

async function getRedisClient(event: H3Event): Promise<Redis | null> {
  const config = getRedisConfig(event);

  if (!config.url) {
    return null;
  }

  if (globalScope.__broProfileRedisClient) {
    return globalScope.__broProfileRedisClient;
  }

  if (!globalScope.__broProfileRedisClientPromise) {
    globalScope.__broProfileRedisClientPromise = (async () => {
      try {
        const client = new Redis(config.url, {
          lazyConnect: true,
          enableAutoPipelining: true,
          maxRetriesPerRequest: 2,
          tls: config.tls ? {} : undefined,
        });

        client.on("error", (error) => {
          console.error("[profile-cache] Redis client error", error);
        });

        await client.connect();
        globalScope.__broProfileRedisClient = client;
        return client;
      } catch (error) {
        console.error("[profile-cache] Redis connection failed", error);
        return null;
      } finally {
        if (!globalScope.__broProfileRedisClient) {
          globalScope.__broProfileRedisClientPromise = null;
        }
      }
    })();
  }

  const client = await globalScope.__broProfileRedisClientPromise;

  if (!client) {
    globalScope.__broProfileRedisClientPromise = null;
  }

  return client ?? null;
}

function buildCacheKey(config: ProfileCacheConfig, sessionToken: string): string {
  const normalized = sessionToken.trim();

  if (!normalized) {
    return "";
  }

  const digest = createHash("sha256").update(normalized).digest("hex");

  return createPrefixedCacheKey(config.keyPrefix, CACHE_NAMESPACE_USER, "profile", digest);
}

function normalizeFriendStories(raw: unknown): FriendStory[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.filter((story): story is FriendStory => Boolean(story));
}

function normalizeFriendEntries(raw: ProfileUser["friends"]): FriendEntry[] {
  if (!raw) {
    return [];
  }

  const entries = Array.isArray(raw) ? raw : Object.values(raw);

  return entries
    .map((entry) => (entry && typeof entry === "object" ? (entry as FriendEntry) : null))
    .filter((entry): entry is FriendEntry => Boolean(entry));
}

function sanitizeProfileCandidate(candidate: unknown): ProfileUser | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const record = candidate as Record<string, unknown>;

  const hasIdentifier =
    typeof record.id === "string" ||
    typeof record.username === "string" ||
    typeof record.email === "string";

  if (!hasIdentifier) {
    return null;
  }

  const profile = candidate as ProfileUser;

  return {
    ...profile,
    friends: normalizeFriendEntries(profile.friends),
    stories: normalizeFriendStories(profile.stories),
  } satisfies ProfileUser;
}

export async function readCachedProfile(
  event: H3Event,
  sessionToken: string,
): Promise<ProfileUser | null> {
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
    return sanitizeProfileCandidate(parsed);
  } catch (error) {
    console.error("[profile-cache] Failed to read cached profile", error);
    return null;
  }
}

export async function writeCachedProfile(
  event: H3Event,
  sessionToken: string,
  profile: ProfileUser,
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
    const sanitized = sanitizeProfileCandidate(profile);

    if (!sanitized) {
      return;
    }

    const serialized = JSON.stringify(sanitized);
    const ttlSeconds = Math.max(0, Math.round(config.ttl));

    if (ttlSeconds > 0) {
      await client.set(cacheKey, serialized, "EX", ttlSeconds);
    } else {
      await client.set(cacheKey, serialized);
    }
  } catch (error) {
    console.error("[profile-cache] Failed to persist profile", error);
  }
}

export async function deleteCachedProfile(event: H3Event, sessionToken: string): Promise<void> {
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
    console.error("[profile-cache] Failed to delete cached profile", error);
  }
}
