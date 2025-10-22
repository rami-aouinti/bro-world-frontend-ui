import { createHash } from "node:crypto";
import Redis from "ioredis";
import type { H3Event } from "h3";
import type { BlogApiResponse, BlogCommentWithReplies, BlogPost } from "~/lib/mock/blog";
import { CACHE_NAMESPACE_BLOG, createPrefixedCacheKey } from "~/lib/cache/namespaces";
import type { NormalizedPostsListQuery } from "../posts/types";

type PostsVisibility = "public" | "private";

const DEFAULT_LIST_TTL_SECONDS = 60;
const DEFAULT_ITEM_TTL_SECONDS = 300;

interface CachedEntry<T> {
  data: T;
  cachedAt: number;
}

interface MemoryEntry {
  value: CachedEntry<unknown>;
  expiresAt: number;
  tags: string[];
}

const globalScope = globalThis as typeof globalThis & {
  __broRedisClient?: Redis | null;
  __broRedisClientPromise?: Promise<Redis | null> | null;
  __broPostsCache?: Map<string, MemoryEntry>;
  __broPostsTags?: Map<string, Set<string>>;
  __broPostsRevalidate?: Map<string, Promise<void>>;
};

function getRuntimeRedisConfig(event: H3Event) {
  const config = useRuntimeConfig(event);
  const runtimeRedis = config.redis ?? {};

  const listTtl = Number.isFinite(runtimeRedis.listTtl) ? Number(runtimeRedis.listTtl) : NaN;
  const itemTtl = Number.isFinite(runtimeRedis.itemTtl) ? Number(runtimeRedis.itemTtl) : NaN;

  return {
    url: typeof runtimeRedis.url === "string" && runtimeRedis.url ? runtimeRedis.url : "",
    tls: Boolean(runtimeRedis.tls),
    keyPrefix:
      typeof runtimeRedis.keyPrefix === "string" && runtimeRedis.keyPrefix
        ? runtimeRedis.keyPrefix
        : "bro-world",
    listTtl: Number.isFinite(listTtl) && listTtl > 0 ? listTtl : DEFAULT_LIST_TTL_SECONDS,
    itemTtl: Number.isFinite(itemTtl) && itemTtl > 0 ? itemTtl : DEFAULT_ITEM_TTL_SECONDS,
  };
}

async function getRedisClient(event: H3Event): Promise<Redis | null> {
  const runtimeRedis = getRuntimeRedisConfig(event);

  if (!runtimeRedis.url) {
    return null;
  }

  if (globalScope.__broRedisClient) {
    return globalScope.__broRedisClient;
  }

  if (!globalScope.__broRedisClientPromise) {
    globalScope.__broRedisClientPromise = (async () => {
      try {
        const client = new Redis(runtimeRedis.url, {
          lazyConnect: true,
          enableAutoPipelining: true,
          maxRetriesPerRequest: 2,
          tls: runtimeRedis.tls ? {} : undefined,
        });

        client.on("error", (error) => {
          console.error("[posts-cache] Redis client error", error);
        });

        await client.connect();
        globalScope.__broRedisClient = client;
        return client;
      } catch (error) {
        console.error("[posts-cache] Redis connection failed", error);
        return null;
      } finally {
        if (!globalScope.__broRedisClient) {
          globalScope.__broRedisClientPromise = null;
        }
      }
    })();
  }

  const client = await globalScope.__broRedisClientPromise;

  if (!client) {
    globalScope.__broRedisClientPromise = null;
  }

  return client;
}

function getMemoryStores() {
  if (!globalScope.__broPostsCache) {
    globalScope.__broPostsCache = new Map();
  }

  if (!globalScope.__broPostsTags) {
    globalScope.__broPostsTags = new Map();
  }

  return {
    cache: globalScope.__broPostsCache!,
    tags: globalScope.__broPostsTags!,
  };
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

function stableSerialize(value: unknown): string {
  if (value == null) {
    return "";
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(",")}]`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, val]) => [String(key), val] as const)
      .sort(([left], [right]) => left.localeCompare(right));

    return `{${entries.map(([key, val]) => `${key}:${stableSerialize(val)}`).join(",")}}`;
  }

  return JSON.stringify(value);
}

function buildHash(input: string) {
  return createHash("sha1").update(input).digest("hex");
}

function getCachePrefix(event: H3Event) {
  return getRuntimeRedisConfig(event).keyPrefix;
}

function getListTtl(event: H3Event) {
  return getRuntimeRedisConfig(event).listTtl;
}

function getItemTtl(event: H3Event) {
  return getRuntimeRedisConfig(event).itemTtl;
}

export function normalizeListQuery(
  input: Record<string, string | string[] | undefined>,
): NormalizedPostsListQuery {
  function unwrap(value: string | string[] | undefined) {
    return Array.isArray(value) ? value.find((item) => item != null) : value;
  }

  function parsePositiveNumber(value: string | undefined, fallback: number) {
    if (!value) {
      return fallback;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  const page = parsePositiveNumber(unwrap(input.page), 1);
  const pageSize = parsePositiveNumber(unwrap(input.pageSize ?? input.limit), 10);
  const sort = unwrap(input.sort)?.trim() || "publishedAt:desc";

  const filter: Record<string, unknown> = {};
  const rawFilter = unwrap(input.filter)?.trim();

  if (rawFilter) {
    try {
      const parsed = JSON.parse(rawFilter);

      if (parsed && typeof parsed === "object") {
        Object.assign(filter, parsed as Record<string, unknown>);
      }
    } catch {
      filter.query = rawFilter;
    }
  }

  const authorId = unwrap(input.authorId)?.trim();
  const worldId = unwrap(input.worldId)?.trim() || null;

  if (authorId) {
    filter.authorId = authorId;
  }

  return {
    page,
    pageSize,
    sort,
    filter,
    worldId,
  };
}

function getListTag(prefix: string) {
  return createPrefixedCacheKey(prefix, CACHE_NAMESPACE_BLOG, "posts", "tag", "all");
}

function getItemTag(prefix: string, postId: string) {
  return createPrefixedCacheKey(prefix, CACHE_NAMESPACE_BLOG, "posts", "tag", "item", postId);
}

function getCommentsTag(prefix: string, postId: string) {
  return createPrefixedCacheKey(prefix, CACHE_NAMESPACE_BLOG, "posts", "tag", "comments", postId);
}

function getAuthorTag(prefix: string, authorId: string) {
  return createPrefixedCacheKey(prefix, CACHE_NAMESPACE_BLOG, "posts", "tag", "author", authorId);
}

export function getPostsListCacheKey(
  event: H3Event,
  params: NormalizedPostsListQuery,
  visibility: PostsVisibility = "public",
) {
  const prefix = getCachePrefix(event);
  const sortHash = buildHash(params.sort || "default");
  const filterHash = buildHash(stableSerialize(params.filter));

  return createPrefixedCacheKey(
    prefix,
    CACHE_NAMESPACE_BLOG,
    "posts",
    "list",
    params.page,
    params.pageSize,
    sortHash,
    filterHash,
    params.worldId ?? "global",
    visibility,
  );
}

export function getPostItemCacheKey(event: H3Event, postId: string) {
  const prefix = getCachePrefix(event);
  return createPrefixedCacheKey(prefix, CACHE_NAMESPACE_BLOG, "posts", "item", postId);
}

export function getPostCommentsCacheKey(event: H3Event, postId: string) {
  const prefix = getCachePrefix(event);
  return createPrefixedCacheKey(prefix, CACHE_NAMESPACE_BLOG, "posts", "comments", postId);
}

async function readCache<T>(event: H3Event, key: string): Promise<CachedEntry<T> | null> {
  const redis = await getRedisClient(event);

  if (redis) {
    const raw = await redis.get(key);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as CachedEntry<T>;
    } catch (error) {
      console.error(`[posts-cache] Failed to parse cached payload for key ${key}`, error);
      return null;
    }
  }

  const { cache } = getMemoryStores();
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    memoryDelete(key);
    return null;
  }

  return entry.value as CachedEntry<T>;
}

async function writeCache<T>(
  event: H3Event,
  key: string,
  payload: CachedEntry<T>,
  ttlSeconds: number,
  tags: string[],
) {
  const redis = await getRedisClient(event);
  const normalizedTags = Array.from(new Set(tags)).filter(Boolean);
  const ttl = Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? Math.ceil(ttlSeconds) : 1;

  if (redis) {
    const serialized = JSON.stringify(payload);
    const pipeline = redis.multi();

    pipeline.set(key, serialized, "EX", ttl);

    for (const tag of normalizedTags) {
      pipeline.sadd(tag, key);
      pipeline.expire(tag, ttl);
    }

    await pipeline.exec();
    return;
  }

  const { cache, tags: memoryTags } = getMemoryStores();
  const expiresAt = Date.now() + ttl * 1000;
  const entry: MemoryEntry = {
    value: payload,
    expiresAt,
    tags: normalizedTags,
  };

  memoryDelete(key);
  cache.set(key, entry);

  for (const tag of normalizedTags) {
    if (!memoryTags.has(tag)) {
      memoryTags.set(tag, new Set());
    }

    memoryTags.get(tag)!.add(key);
  }
}

async function invalidateTags(event: H3Event, tags: string[]) {
  const redis = await getRedisClient(event);
  const normalizedTags = Array.from(new Set(tags)).filter(Boolean);

  if (normalizedTags.length === 0) {
    return;
  }

  if (redis) {
    const keysToDelete = new Set<string>();

    for (const tag of normalizedTags) {
      try {
        const members = await redis.smembers(tag);
        members.forEach((member) => keysToDelete.add(member));
      } catch (error) {
        console.error(`[posts-cache] Failed to read tag ${tag}`, error);
      }
    }

    if (keysToDelete.size > 0) {
      await redis.del(...keysToDelete);
    }

    await redis.del(...normalizedTags);
    return;
  }

  const { tags: memoryTags } = getMemoryStores();

  for (const tag of normalizedTags) {
    const members = memoryTags.get(tag);

    if (!members) {
      continue;
    }

    for (const key of Array.from(members)) {
      memoryDelete(key);
    }

    memoryTags.delete(tag);
  }
}

export async function getCachedPostsList(
  event: H3Event,
  params: NormalizedPostsListQuery,
  visibility: PostsVisibility = "public",
): Promise<CachedEntry<BlogApiResponse> | null> {
  const key = getPostsListCacheKey(event, params, visibility);
  return readCache<BlogApiResponse>(event, key);
}

export async function getCachedPostById(
  event: H3Event,
  postId: string,
): Promise<CachedEntry<BlogPost> | null> {
  const key = getPostItemCacheKey(event, postId);
  return readCache<BlogPost>(event, key);
}

export async function getCachedPostComments(
  event: H3Event,
  postId: string,
): Promise<CachedEntry<BlogCommentWithReplies[]> | null> {
  const key = getPostCommentsCacheKey(event, postId);
  return readCache<BlogCommentWithReplies[]>(event, key);
}

export async function cachePostsList(
  event: H3Event,
  params: NormalizedPostsListQuery,
  payload: BlogApiResponse,
  visibility: PostsVisibility = "public",
): Promise<void> {
  const key = getPostsListCacheKey(event, params, visibility);
  const entry: CachedEntry<BlogApiResponse> = {
    data: payload,
    cachedAt: Date.now(),
  };

  const tags = new Set<string>([getListTag(getCachePrefix(event))]);

  for (const post of payload.data ?? []) {
    if (post?.user?.id) {
      tags.add(getAuthorTag(getCachePrefix(event), post.user.id));
    }
  }

  await writeCache(event, key, entry, getListTtl(event), Array.from(tags));
}

export async function cachePostById(event: H3Event, post: BlogPost): Promise<void> {
  const key = getPostItemCacheKey(event, post.id);
  const entry: CachedEntry<BlogPost> = {
    data: post,
    cachedAt: Date.now(),
  };

  const tags = [getItemTag(getCachePrefix(event), post.id)];

  if (post?.user?.id) {
    tags.push(getAuthorTag(getCachePrefix(event), post.user.id));
  }

  await writeCache(event, key, entry, getItemTtl(event), tags);
}

export async function cachePostComments(
  event: H3Event,
  postId: string,
  comments: BlogCommentWithReplies[],
): Promise<void> {
  const key = getPostCommentsCacheKey(event, postId);
  const entry: CachedEntry<BlogCommentWithReplies[]> = {
    data: comments,
    cachedAt: Date.now(),
  };

  const tags = [getCommentsTag(getCachePrefix(event), postId)];

  await writeCache(event, key, entry, getItemTtl(event), tags);
}

export async function invalidatePostsList(event: H3Event): Promise<void> {
  await invalidateTags(event, [getListTag(getCachePrefix(event))]);
}

export async function invalidatePostCache(event: H3Event, postId: string): Promise<void> {
  await invalidateTags(event, [getItemTag(getCachePrefix(event), postId)]);
}

export async function invalidatePostComments(event: H3Event, postId: string): Promise<void> {
  await invalidateTags(event, [getCommentsTag(getCachePrefix(event), postId)]);
}

export async function invalidatePostAndLists(event: H3Event, postId: string): Promise<void> {
  await invalidateTags(event, [
    getItemTag(getCachePrefix(event), postId),
    getListTag(getCachePrefix(event)),
  ]);
}

export function queueRevalidation(key: string, task: () => Promise<void>) {
  if (!globalScope.__broPostsRevalidate) {
    globalScope.__broPostsRevalidate = new Map();
  }

  const map = globalScope.__broPostsRevalidate;

  if (map.has(key)) {
    return map.get(key)!;
  }

  const promise = task()
    .catch((error) => {
      console.error(`[posts-cache] Revalidation for key ${key} failed`, error);
    })
    .finally(() => {
      map.delete(key);
    });

  map.set(key, promise);
  return promise;
}
