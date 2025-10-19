import { computed, reactive, shallowRef } from "vue";
import { defineStore } from "~/lib/pinia-shim";
import { useRuntimeConfig, useState } from "#imports";
import type { BlogCommentWithReplies, BlogPost, ReactionAction } from "~/lib/mock/blog";
import { useAuthStore } from "~/composables/useAuthStore";
import { resolveApiFetcher } from "~/lib/api/fetcher";

function sanitizeErrorMessage(message: string): string {
  const trimmed = message.trim();

  if (!trimmed) {
    return "";
  }

  const lowerCased = trimmed.toLowerCase();
  const looksLikeHtml =
    lowerCased.startsWith("<!doctype html") ||
    lowerCased.startsWith("<html") ||
    lowerCased.includes("<body");

  return looksLikeHtml ? "" : trimmed;
}

interface PostsListResponse {
  data: BlogPost[];
  page: number;
  limit: number;
  count: number;
  cachedAt: number | null;
  revalidatedAt: number | null;
  fromCache: boolean;
}

interface PostResponse {
  data: BlogPost;
  cachedAt: number | null;
  fromCache: boolean;
}

interface FetchOptions {
  force?: boolean;
  params?: Record<string, unknown>;
}

interface PostsStorePost extends BlogPost {
  __optimistic?: boolean;
  __signature?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseFloat(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function toTimestamp(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return undefined;
    }

    const numeric = Number(trimmed);

    if (Number.isFinite(numeric)) {
      return numeric;
    }

    const parsed = Date.parse(trimmed);

    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function toBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) {
      return true;
    }

    if (value === 0) {
      return false;
    }
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (!normalized) {
      return undefined;
    }

    if (["true", "1", "yes"].includes(normalized)) {
      return true;
    }

    if (["false", "0", "no"].includes(normalized)) {
      return false;
    }
  }

  return undefined;
}

function pickFirstValue<T>(
  sources: Array<Record<string, unknown> | undefined>,
  keys: string[],
  resolver: (value: unknown) => T | undefined,
): T | undefined {
  for (const source of sources) {
    if (!source) {
      continue;
    }

    for (const key of keys) {
      if (!(key in source)) {
        continue;
      }

      const resolved = resolver(source[key]);

      if (typeof resolved !== "undefined") {
        return resolved;
      }
    }
  }

  return undefined;
}

function tryResolvePosts(
  value: unknown,
  visited: Set<unknown> = new Set(),
): { posts: BlogPost[]; source: Record<string, unknown> | undefined } | null {
  if (visited.has(value)) {
    return null;
  }

  visited.add(value);

  if (Array.isArray(value)) {
    return { posts: value as BlogPost[], source: undefined };
  }

  if (!isRecord(value)) {
    return null;
  }

  const recordValues = Object.values(value);

  if (
    recordValues.length > 0 &&
    recordValues.every((entry) => isRecord(entry) && typeof entry.id === "string")
  ) {
    return { posts: recordValues as BlogPost[], source: value };
  }

  const candidates = [
    "data",
    "items",
    "results",
    "posts",
    "content",
    "entries",
    "list",
    "rows",
    "hydra:member",
  ] as const;

  for (const key of candidates) {
    if (!(key in value)) {
      continue;
    }

    const candidate = value[key];

    if (Array.isArray(candidate)) {
      return { posts: candidate as BlogPost[], source: value };
    }

    if (candidate && typeof candidate === "object" && candidate !== value) {
      const resolved = tryResolvePosts(candidate, visited);

      if (resolved) {
        const sourceRecord =
          resolved.source ??
          (isRecord(candidate) ? (candidate as Record<string, unknown>) : undefined);

        return { posts: resolved.posts, source: sourceRecord };
      }
    }
  }

  for (const [key, candidate] of Object.entries(value)) {
    if (candidates.includes(key as (typeof candidates)[number])) {
      continue;
    }

    if (Array.isArray(candidate)) {
      return { posts: candidate as BlogPost[], source: value };
    }

    if (candidate && typeof candidate === "object" && candidate !== value) {
      const resolved = tryResolvePosts(candidate, visited);

      if (resolved) {
        const sourceRecord =
          resolved.source ??
          (isRecord(candidate) ? (candidate as Record<string, unknown>) : undefined);

        return { posts: resolved.posts, source: sourceRecord };
      }
    }
  }

  return null;
}

function parseQueryMeta(link: unknown): Record<string, unknown> | null {
  if (typeof link !== "string" || !link.includes("?")) {
    return null;
  }

  try {
    const url = new URL(link, "https://blog.bro-world.org");
    const params = url.searchParams;
    const meta: Record<string, unknown> = {};

    const pageParam =
      params.get("page") ??
      params.get("page[number]") ??
      params.get("page_index") ??
      params.get("pageNumber");

    if (pageParam) {
      meta.page = pageParam;
    }

    const limitParam =
      params.get("limit") ??
      params.get("pageSize") ??
      params.get("page[size]") ??
      params.get("perPage") ??
      params.get("per_page") ??
      params.get("itemsPerPage") ??
      params.get("items_per_page");

    if (limitParam) {
      meta.limit = limitParam;
    }

    const countParam =
      params.get("count") ??
      params.get("total") ??
      params.get("totalItems") ??
      params.get("total_items");

    if (countParam) {
      meta.count = countParam;
    }

    return Object.keys(meta).length > 0 ? meta : null;
  } catch {
    return null;
  }
}

function collectHydraMeta(source: Record<string, unknown> | undefined) {
  const meta: Record<string, unknown>[] = [];

  if (!source) {
    return meta;
  }

  const baseMeta: Record<string, unknown> = {};

  if ("hydra:totalItems" in source) {
    baseMeta.count = source["hydra:totalItems"];
  }

  if ("hydra:itemsPerPage" in source) {
    baseMeta.limit = source["hydra:itemsPerPage"];
  }

  if (Object.keys(baseMeta).length > 0) {
    meta.push(baseMeta);
  }

  const potentialLinks: unknown[] = [];

  if ("@id" in source) {
    potentialLinks.push(source["@id"]);
  }

  if ("hydra:view" in source) {
    const view = source["hydra:view"];

    function enqueueViewLinks(input: unknown): void {
      if (!input) {
        return;
      }

      if (typeof input === "string") {
        potentialLinks.push(input);
        return;
      }

      if (Array.isArray(input)) {
        input.forEach((item) => enqueueViewLinks(item));
        return;
      }

      if (isRecord(input)) {
        const record = input as Record<string, unknown>;
        const viewLinks = [
          record["@id"],
          record["hydra:first"],
          record["hydra:last"],
          record["hydra:next"],
          record["hydra:previous"],
          record["hydra:prev"],
        ];

        viewLinks.forEach((link) => {
          if (link) {
            potentialLinks.push(link);
          }
        });
      }
    }

    enqueueViewLinks(view);
  }

  for (const link of potentialLinks) {
    const parsed = parseQueryMeta(link);

    if (parsed) {
      meta.push(parsed);
    }
  }

  return meta;
}

const errorMessageKeys = [
  "message",
  "error",
  "error_message",
  "errorMessage",
  "error_description",
  "errorDescription",
  "detail",
  "description",
  "hydra:description",
  "hydra:title",
] as const;

function extractErrorMessage(value: unknown, visited: Set<unknown> = new Set()): string | null {
  if (value === null || typeof value === "undefined") {
    return null;
  }

  if (visited.has(value)) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = extractErrorMessage(item, visited);

      if (message) {
        return message;
      }
    }

    return null;
  }

  if (!isRecord(value)) {
    return null;
  }

  visited.add(value);

  for (const key of errorMessageKeys) {
    if (!(key in value)) {
      continue;
    }

    const resolved = extractErrorMessage(value[key], visited);

    if (resolved) {
      return resolved;
    }
  }

  if ("errors" in value) {
    const errorsValue = value.errors;

    if (typeof errorsValue === "string") {
      const trimmed = errorsValue.trim();

      if (trimmed) {
        return trimmed;
      }
    }

    if (Array.isArray(errorsValue)) {
      const parts = errorsValue
        .map((item) => extractErrorMessage(item, visited))
        .filter((part): part is string => Boolean(part?.trim()));

      if (parts.length > 0) {
        return parts.join("\n");
      }
    }

    if (isRecord(errorsValue)) {
      const parts = Object.values(errorsValue)
        .map((item) => extractErrorMessage(item, visited))
        .filter((part): part is string => Boolean(part?.trim()));

      if (parts.length > 0) {
        return parts.join("\n");
      }
    }
  }

  return null;
}

function normalizePostsListResponse(raw: unknown): PostsListResponse {
  let normalizedInput = raw;

  if (typeof normalizedInput === "string") {
    try {
      normalizedInput = JSON.parse(normalizedInput) as unknown;
    } catch {
      const trimmed = normalizedInput.trim();

      if (trimmed) {
        throw new Error(trimmed);
      }
    }
  }

  const extractedError = extractErrorMessage(normalizedInput);

  if (extractedError) {
    throw new Error(extractedError);
  }

  const resolution = tryResolvePosts(normalizedInput);

  if (!resolution) {
    throw new Error("Invalid posts response format.");
  }

  const { posts, source } = resolution;
  const normalizedPosts = posts.filter((post): post is BlogPost => Boolean(post?.id));
  const rootSource = isRecord(normalizedInput)
    ? (normalizedInput as Record<string, unknown>)
    : undefined;
  const metaSources: Array<Record<string, unknown> | undefined> = [rootSource, source];

  metaSources.push(...collectHydraMeta(rootSource));

  if (source && source !== rootSource) {
    metaSources.push(...collectHydraMeta(source));
  }

  if (rootSource) {
    if (isRecord(rootSource.meta)) {
      metaSources.push(rootSource.meta);
    }

    if (isRecord(rootSource.pagination)) {
      metaSources.push(rootSource.pagination);
    }
  }

  if (source && source !== rootSource) {
    if (isRecord(source.meta)) {
      metaSources.push(source.meta);
    }

    if (isRecord(source.pagination)) {
      metaSources.push(source.pagination);
    }
  }

  const resolvedPage = pickFirstValue(
    metaSources,
    ["page", "currentPage", "current_page"],
    toFiniteNumber,
  );
  const resolvedLimit = pickFirstValue(
    metaSources,
    ["limit", "perPage", "per_page", "pageSize", "page_size"],
    toFiniteNumber,
  );
  const resolvedCount = pickFirstValue(
    metaSources,
    ["count", "total", "totalCount", "total_count", "totalItems", "total_items"],
    toFiniteNumber,
  );
  const resolvedCachedAt = pickFirstValue(
    metaSources,
    ["cachedAt", "cached_at", "cached_at_ms", "cached"],
    toTimestamp,
  );
  const resolvedRevalidatedAt = pickFirstValue(
    metaSources,
    ["revalidatedAt", "revalidated_at", "validatedAt", "validated_at"],
    toTimestamp,
  );
  const resolvedFromCache = pickFirstValue(
    metaSources,
    ["fromCache", "from_cache", "cached", "isCached", "is_cached"],
    toBoolean,
  );

  const fallbackCount = normalizedPosts.length;
  const limit =
    typeof resolvedLimit === "number" && resolvedLimit > 0
      ? Math.floor(resolvedLimit)
      : fallbackCount;
  const count =
    typeof resolvedCount === "number" && resolvedCount >= 0
      ? Math.floor(resolvedCount)
      : fallbackCount;

  return {
    data: normalizedPosts,
    page: typeof resolvedPage === "number" && resolvedPage > 0 ? Math.floor(resolvedPage) : 1,
    limit,
    count,
    cachedAt:
      typeof resolvedCachedAt === "number" && Number.isFinite(resolvedCachedAt)
        ? resolvedCachedAt
        : null,
    revalidatedAt:
      typeof resolvedRevalidatedAt === "number" && Number.isFinite(resolvedRevalidatedAt)
        ? resolvedRevalidatedAt
        : null,
    fromCache: Boolean(resolvedFromCache),
  } satisfies PostsListResponse;
}

function clonePost(post: PostsStorePost) {
  try {
    return structuredClone(post) as PostsStorePost;
  } catch {
    return JSON.parse(JSON.stringify(post)) as PostsStorePost;
  }
}

function createOptimisticPost(
  id: string,
  content: string,
  overrides?: Partial<BlogPost>,
): PostsStorePost {
  const timestamp = new Date().toISOString();

  const optimisticPost: PostsStorePost = {
    id,
    title: overrides?.title ?? "",
    summary: overrides?.summary ?? "",
    content,
    url: overrides?.url ?? null,
    slug: overrides?.slug ?? id,
    medias: Array.isArray(overrides?.medias) ? overrides!.medias : [],
    isReacted: overrides?.isReacted ?? null,
    publishedAt: overrides?.publishedAt ?? timestamp,
    sharedFrom: overrides?.sharedFrom ?? null,
    reactions_count: overrides?.reactions_count ?? 0,
    totalComments: overrides?.totalComments ?? 0,
    user:
      overrides?.user ??
      reactive({
        id: "optimistic-user",
        firstName: "You",
        lastName: "",
        username: "you",
        email: "",
        enabled: true,
        photo: null,
      }),
    reactions_preview: overrides?.reactions_preview ? [...overrides.reactions_preview] : [],
    comments_preview: overrides?.comments_preview ? [...overrides.comments_preview] : [],
    __optimistic: true,
  };

  return applyPostSignature(optimisticPost);
}

function sanitizeTextInput(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function normalizeForStableSerialization(value: unknown, seen = new WeakSet<object>()): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeForStableSerialization(entry, seen));
  }

  if (isPlainObject(value)) {
    if (seen.has(value)) {
      return {};
    }

    seen.add(value);

    const normalized: Record<string, unknown> = {};
    const keys = Object.keys(value).sort();

    for (const key of keys) {
      normalized[key] = normalizeForStableSerialization(value[key], seen);
    }

    seen.delete(value);
    return normalized;
  }

  return value;
}

function stableStringify(value: unknown) {
  try {
    return JSON.stringify(normalizeForStableSerialization(value));
  } catch {
    return JSON.stringify(value);
  }
}

function computePostSignature(post: PostsStorePost): string {
  const candidate = (post as PostsStorePost & { updatedAt?: string | number | null }).updatedAt;

  if (typeof candidate === "string" || typeof candidate === "number") {
    return String(candidate);
  }

  const user = post.user as
    | (BlogPost["user"] & { updatedAt?: string | number | null })
    | undefined;
  const userKey = user
    ? [
        user.id ?? "",
        user.username ?? "",
        user.firstName ?? "",
        user.lastName ?? "",
        user.email ?? "",
        user.photo ?? "",
        typeof user.updatedAt === "string" || typeof user.updatedAt === "number"
          ? String(user.updatedAt)
          : "",
      ].join("|")
    : "";

  const sharedFromKey =
    post.sharedFrom && typeof post.sharedFrom === "object"
      ? stableStringify(post.sharedFrom)
      : String(post.sharedFrom ?? "");

  const mediasKey = Array.isArray(post.medias)
    ? post.medias
        .map((media) =>
          media && typeof media === "object" ? stableStringify(media) : String(media ?? ""),
        )
        .join("|")
    : "";

  const reactionsKey = Array.isArray(post.reactions_preview)
    ? post.reactions_preview
        .map(
          (reaction) =>
            `${reaction.id}|${reaction.type}|${reaction.user?.id ?? ""}|${reaction.user?.username ?? ""}`,
        )
        .join("|")
    : "";

  const commentsKey = Array.isArray(post.comments_preview)
    ? post.comments_preview
        .map(
          (comment) =>
            `${comment.id}|${comment.content}|${comment.reactions_count}|${comment.totalComments}|${comment.publishedAt}`,
        )
        .join("|")
    : "";

  return [
    post.title,
    post.summary,
    post.content,
    post.url ?? "",
    post.slug,
    post.publishedAt ?? "",
    sharedFromKey,
    mediasKey,
    post.isReacted === null ? "null" : post.isReacted ? "1" : "0",
    String(post.reactions_count ?? 0),
    String(post.totalComments ?? 0),
    userKey,
    reactionsKey,
    commentsKey,
  ].join("::");
}

function applyPostSignature(post: PostsStorePost): PostsStorePost {
  post.__signature = computePostSignature(post);
  return post;
}

function getPostSignature(post: PostsStorePost | undefined): string {
  if (!post) {
    return "";
  }

  if (typeof post.__signature === "string") {
    return post.__signature;
  }

  return applyPostSignature(post).__signature ?? "";
}

function postsAreEquivalent(current: PostsStorePost, incoming: PostsStorePost): boolean {
  if (current.__optimistic !== incoming.__optimistic) {
    return false;
  }

  return getPostSignature(current) === getPostSignature(incoming);
}

export const usePostsStore = defineStore("posts", () => {
  const authStore = useAuthStore();
  const runtimeConfig = useRuntimeConfig();
  const redisRuntimeConfig = import.meta.client
    ? runtimeConfig.public?.redis
    : (runtimeConfig.redis ?? runtimeConfig.public?.redis);
  const listTtlMs = Math.max(Number(redisRuntimeConfig?.listTtl ?? 60), 1) * 1000;
  const itemTtlMs = Math.max(Number(redisRuntimeConfig?.itemTtl ?? 300), 1) * 1000;

  const items = useState<Record<string, PostsStorePost>>("posts-items", () => ({}));
  const listIds = useState<string[]>("posts-list-ids", () => []);
  const itemTimestamps = useState<Record<string, number>>("posts-item-timestamps", () => ({}));
  const commentsCache = useState<Record<string, BlogCommentWithReplies[]>>("posts-comments-cache", () => ({}));
  const commentTimestamps = useState<Record<string, number>>("posts-comments-timestamps", () => ({}));
  const cachedAt = useState<number | null>("posts-cached-at", () => null);
  const lastFetched = useState<number | null>("posts-last-fetched", () => null);
  const pending = useState<boolean>("posts-pending", () => false);
  const error = useState<string | null>("posts-error", () => null);
  const loadingMore = useState<boolean>("posts-loading-more", () => false);
  const creating = useState<boolean>("posts-creating", () => false);
  const createError = useState<string | null>("posts-create-error", () => null);
  const updating = useState<Record<string, boolean>>("posts-updating", () => ({}));
  const deleting = useState<Record<string, boolean>>("posts-deleting", () => ({}));
  const isRevalidating = useState<boolean>("posts-is-revalidating", () => false);
  const currentPage = useState<number>("posts-current-page", () => 0);
  const pageSize = useState<number>("posts-page-size", () => 0);
  const totalCount = useState<number>("posts-total-count", () => 0);
  const pageMap = useState<Record<number, string[]>>("posts-page-map", () => ({}));
  const pageTimestamps = useState<Record<number, number>>("posts-page-timestamps", () => ({}));
  const backgroundPromise = shallowRef<Promise<void> | null>(null);

  const posts = computed(() =>
    listIds.value
      .map((id) => items.value[id])
      .filter((post): post is PostsStorePost => Boolean(post)),
  );

  const resolvedPostCount = computed(() => posts.value.filter((post) => !post.__optimistic).length);

  const hasMore = computed(() => {
    if (!Number.isFinite(totalCount.value) || totalCount.value <= 0) {
      return false;
    }

    return resolvedPostCount.value < totalCount.value;
  });

  function setCommentsCache(postId: string, comments: BlogCommentWithReplies[]) {
    if (!postId) {
      return;
    }

    commentsCache.value[postId] = comments.slice();
    commentTimestamps.value[postId] = Date.now();
  }

  function invalidateCommentsCache(postId: string) {
    if (!postId) {
      return;
    }

    if (postId in commentsCache.value) {
      delete commentsCache.value[postId];
    }

    if (postId in commentTimestamps.value) {
      delete commentTimestamps.value[postId];
    }
  }

  function markItemTimestamp(id: string, timestamp: number) {
    itemTimestamps.value[id] = timestamp;
  }

  function replaceOptimisticId(oldId: string, newPost: PostsStorePost) {
    const index = listIds.value.indexOf(oldId);

    if (index !== -1) {
      listIds.value.splice(index, 1, newPost.id);
    } else {
      listIds.value.unshift(newPost.id);
    }

    const removed = items.value[oldId];

    if (removed) {
      delete items.value[oldId];
    }

    const prepared = applyPostSignature(newPost);
    items.value[newPost.id] = prepared;

    if (oldId in itemTimestamps.value) {
      delete itemTimestamps.value[oldId];
    }

    itemTimestamps.value[newPost.id] = Date.now();

    return removed;
  }

  function setPostsFromResponse(response: PostsListResponse) {
    const now = typeof response.cachedAt === "number" ? response.cachedAt : Date.now();
    const normalizedPage =
      Number.isFinite(response.page) && response.page > 0 ? Math.floor(response.page) : 1;
    const normalizedLimit =
      Number.isFinite(response.limit) && response.limit > 0
        ? Math.floor(response.limit)
        : (response.data?.length ?? 0);
    const normalizedCount =
      Number.isFinite(response.count) && response.count >= 0
        ? Math.floor(response.count)
        : (response.data?.length ?? 0);

    const incomingPosts = (response.data ?? []).filter((post): post is BlogPost =>
      Boolean(post?.id),
    );
    const incomingIds = incomingPosts.map((post) => post.id);

    const existingPageIds = pageMap.value[normalizedPage] ?? [];
    const removalSet = new Set(existingPageIds);
    const retainedIds = listIds.value.filter((id) => !removalSet.has(id));

    const orderedIds =
      normalizedPage === 1 ? [...incomingIds, ...retainedIds] : [...retainedIds, ...incomingIds];
    const finalIds: string[] = [];
    const seenIds = new Set<string>();

    for (const id of orderedIds) {
      if (seenIds.has(id)) {
        continue;
      }

      seenIds.add(id);
      finalIds.push(id);
    }

    const activeIds = new Set(finalIds);

    const pageTimestamp = pageTimestamps.value[normalizedPage];
    const pageIdsMatch =
      existingPageIds.length === incomingIds.length &&
      existingPageIds.every((id, index) => id === incomingIds[index]);
    const listOrderMatch =
      finalIds.length === listIds.value.length &&
      finalIds.every((id, index) => id === listIds.value[index]);
    const timestampsMatch =
      typeof pageTimestamp === "number" &&
      pageTimestamp === now &&
      incomingIds.every((id) => itemTimestamps.value[id] === now);
    const hasOptimisticEntries = incomingIds.some((id) => items.value[id]?.__optimistic);

    if (pageIdsMatch && listOrderMatch && timestampsMatch && !hasOptimisticEntries) {
      if (pageSize.value !== normalizedLimit) {
        pageSize.value = normalizedLimit;
      }

      if (totalCount.value !== normalizedCount) {
        totalCount.value = normalizedCount;
      }

      if (normalizedPage === 1 && cachedAt.value !== now) {
        cachedAt.value = now;
      }

      if (currentPage.value < normalizedPage) {
        currentPage.value = normalizedPage;
      }

      lastFetched.value = Date.now();
      return;
    }

    for (const id of Object.keys(items.value)) {
      if (!activeIds.has(id)) {
        delete items.value[id];

        if (id in itemTimestamps.value) {
          delete itemTimestamps.value[id];
        }
      }
    }

    for (const post of incomingPosts) {
      const normalizedPost = applyPostSignature({ ...post, __optimistic: false });
      const currentItem = items.value[post.id];

      if (!currentItem) {
        items.value[post.id] = normalizedPost;
      } else {
        getPostSignature(currentItem);

        if (currentItem.__optimistic || !postsAreEquivalent(currentItem, normalizedPost)) {
          items.value[post.id] = normalizedPost;
        }
      }

      if (itemTimestamps.value[post.id] !== now) {
        itemTimestamps.value[post.id] = now;
      }
    }

    if (!listOrderMatch) {
      listIds.value.splice(0, listIds.value.length, ...finalIds);
    }

    if (!pageIdsMatch) {
      pageMap.value[normalizedPage] = incomingIds;
    }

    if (pageTimestamp !== now) {
      pageTimestamps.value[normalizedPage] = now;
    }

    if (pageSize.value !== normalizedLimit) {
      pageSize.value = normalizedLimit;
    }

    if (totalCount.value !== normalizedCount) {
      totalCount.value = normalizedCount;
    }

    if (normalizedPage === 1 && cachedAt.value !== now) {
      cachedAt.value = now;
    }

    if (currentPage.value < normalizedPage) {
      currentPage.value = normalizedPage;
    }

    lastFetched.value = Date.now();
  }

  function upsertPost(post: PostsStorePost, position?: number) {
    const existingIndex = listIds.value.indexOf(post.id);

    if (existingIndex !== -1) {
      listIds.value.splice(existingIndex, 1);
    }

    if (typeof position === "number") {
      listIds.value.splice(position, 0, post.id);
    } else {
      listIds.value.unshift(post.id);
    }

    items.value[post.id] = applyPostSignature(post);

    markItemTimestamp(post.id, Date.now());
  }

  function removePostFromState(postId: string) {
    const index = listIds.value.indexOf(postId);

    if (index !== -1) {
      listIds.value.splice(index, 1);
    }

    if (items.value[postId]) {
      delete items.value[postId];
    }

    if (itemTimestamps.value[postId]) {
      delete itemTimestamps.value[postId];
    }

    return index;
  }

  interface ActiveFetchState {
    promise: Promise<BlogPost[]>;
    hasBackground: boolean;
    hasForeground: boolean;
    hasLoadMore: boolean;
  }

  const activeFetches = new Map<string, ActiveFetchState>();

  function createFetchKey(options: FetchOptions & { background?: boolean } = {}) {
    const payload = {
      params: options.params ?? {},
      force: Boolean(options.force),
    };

    return stableStringify(payload);
  }

  async function fetchPostsFromServer(
    page: number,
    options: FetchOptions & { background?: boolean; loadMore?: boolean } = {},
  ) {
    const { loadMore, background } = options;
    const params = { ...(options.params ?? {}), page };
    const fetchKey = createFetchKey({ params, force: options.force, background });
    const existingRequest = activeFetches.get(fetchKey);

    if (existingRequest) {
      if (background) {
        existingRequest.hasBackground = true;
      } else if (loadMore) {
        existingRequest.hasLoadMore = true;
        loadingMore.value = true;
      } else {
        pending.value = true;
        error.value = null;
        existingRequest.hasForeground = true;
      }

      return existingRequest.promise;
    }

    const fetcher = resolveApiFetcher();

    if (!background) {
      if (loadMore) {
        loadingMore.value = true;
      } else {
        pending.value = true;
        error.value = null;
      }
    }

    const fetchState: ActiveFetchState = {
      promise: Promise.resolve([] as BlogPost[]),
      hasBackground: Boolean(background),
      hasForeground: !background && !loadMore,
      hasLoadMore: Boolean(loadMore),
    };

    const requestPromise = (async () => {
      const queryParams: Record<string, unknown> = { ...params };

      if (!("limit" in queryParams) && "pageSize" in queryParams) {
        queryParams.limit = queryParams.pageSize;
      }

      const fetchTargets = new Set<string>();

      function tryResolveUrl(target: string, relativeBase?: string) {
        try {
          return new URL(target).toString();
        } catch {
          if (relativeBase) {
            try {
              return new URL(target, relativeBase).toString();
            } catch {
              const normalizedBase = relativeBase.replace(/\/+$/, "");
              const normalizedTarget = target.replace(/^\/+/, "");
              return `${normalizedBase}/${normalizedTarget}`;
            }
          }

          return target;
        }
      }

      function addFetchTarget(target: string | null | undefined, relativeBase?: string) {
        if (!target) {
          return;
        }

        const trimmed = target.trim();

        if (!trimmed) {
          return;
        }

        const resolved = tryResolveUrl(trimmed, relativeBase);

        if (!fetchTargets.has(resolved)) {
          fetchTargets.add(resolved);
        }
      }

      const defaultPublicEndpoint = "/public/post";
      const defaultPrivateEndpoint = "/v1/platform/post";

      addFetchTarget("/v1/posts");

      const baseURL =
        typeof fetcher.client?.defaults?.baseURL === "string"
          ? fetcher.client.defaults.baseURL
          : undefined;
      const fallbackBase =
        typeof runtimeConfig.public?.postsApiBase === "string"
          ? runtimeConfig.public.postsApiBase.trim()
          : "";

      let fallbackTarget: string | null = null;

      const isAuthenticated = authStore.isAuthenticated.value;
      const fallbackPath = isAuthenticated ? defaultPrivateEndpoint : defaultPublicEndpoint;

      if (fallbackBase) {
        fallbackTarget = tryResolveUrl(fallbackPath, fallbackBase);
        const primaryTarget =
          baseURL && baseURL.trim() ? tryResolveUrl("/api/v1/posts", baseURL) : null;

        if (primaryTarget && primaryTarget === fallbackTarget) {
          fallbackTarget = null;
        }
      }

      const privateBlogEndpoint = isAuthenticated
        ? (runtimeConfig.public?.blogPrivateApiEndpoint as string | undefined)
        : undefined;
      const publicBlogEndpoint = runtimeConfig.public?.blogApiEndpoint as string | undefined;

      if (privateBlogEndpoint) {
        addFetchTarget(privateBlogEndpoint);
      }

      if (fallbackTarget) {
        addFetchTarget(fallbackTarget);
      }

      if (publicBlogEndpoint) {
        addFetchTarget(publicBlogEndpoint);
      }

      let lastError: unknown = null;

      try {
        const targets = Array.from(fetchTargets);

        if (targets.length === 0) {
          throw new Error("No posts endpoints available.");
        }

        const requestPromises = targets.map((target) =>
          Promise.resolve(
            fetcher<unknown>(target, {
              method: "GET",
              query: queryParams,
            }),
          ).then((rawResponse) => ({ target, normalized: normalizePostsListResponse(rawResponse) })),
        );

        let winner: { target: string; normalized: PostsListResponse };

        try {
          winner = await Promise.any(requestPromises);
        } catch (aggregateError) {
          if (aggregateError instanceof AggregateError && aggregateError.errors.length > 0) {
            lastError = aggregateError.errors[aggregateError.errors.length - 1];
          } else {
            lastError = aggregateError;
          }

          const fallbackError =
            lastError instanceof Error ? lastError : new Error(String(lastError ?? ""));
          throw fallbackError;
        } finally {
          for (const pendingRequest of requestPromises) {
            void pendingRequest.catch(() => {});
          }
        }

        setPostsFromResponse(winner.normalized);
        return winner.normalized.data;
      } catch (error_) {
        lastError = error_;

        const finalError =
          lastError instanceof Error ? lastError : new Error(String(lastError ?? ""));
        const rawMessage = finalError.message ?? String(lastError ?? "");
        const message = sanitizeErrorMessage(rawMessage);

        if (fetchState.hasForeground) {
          error.value = message || "Unable to fetch posts.";
        }

        throw new Error(message || "Unable to fetch posts.");
      } finally {
        activeFetches.delete(fetchKey);

        if (fetchState.hasBackground) {
          isRevalidating.value = false;
        }

        if (fetchState.hasLoadMore) {
          loadingMore.value = false;
        }

        if (fetchState.hasForeground) {
          pending.value = false;
        }
      }
    })();

    fetchState.promise = requestPromise;
    activeFetches.set(fetchKey, fetchState);

    return requestPromise;
  }

  async function fetchPosts(pageOrOptions?: number | FetchOptions, maybeOptions?: FetchOptions) {
    let requestedPage = 1;
    let options: FetchOptions = {};

    if (typeof pageOrOptions === "number") {
      requestedPage =
        Number.isFinite(pageOrOptions) && pageOrOptions > 0 ? Math.floor(pageOrOptions) : 1;
      options = maybeOptions ?? {};
    } else if (pageOrOptions && typeof pageOrOptions === "object") {
      options = pageOrOptions;
    }

    const page = requestedPage;
    const params = { ...(options.params ?? {}), page };
    const now = Date.now();

    if (!options.force) {
      if (page === 1 && posts.value.length > 0) {
        const isFresh = typeof cachedAt.value === "number" && now - cachedAt.value < listTtlMs;

        if (isFresh) {
          return posts.value;
        }

        if (!isRevalidating.value && !backgroundPromise.value) {
          isRevalidating.value = true;
          backgroundPromise.value = fetchPostsFromServer(page, {
            ...options,
            params,
            force: true,
            background: true,
          })
            .catch((revalidationError) => {
              console.error("Posts revalidation failed", revalidationError);
            })
            .finally(() => {
              backgroundPromise.value = null;
            });
        }

        return posts.value;
      }

      if (page !== 1) {
        const pageTimestamp = pageTimestamps.value[page];
        const hasPage = Array.isArray(pageMap.value[page]);
        const isFresh = typeof pageTimestamp === "number" && now - pageTimestamp < listTtlMs;

        if (hasPage && isFresh) {
          return posts.value;
        }
      }
    }

    return fetchPostsFromServer(page, { ...options, params, loadMore: page > 1 && !options.force });
  }

  async function fetchMorePosts(options: FetchOptions = {}) {
    if (loadingMore.value) {
      return posts.value;
    }

    const nextPage = currentPage.value > 0 ? currentPage.value + 1 : 2;

    if (!hasMore.value) {
      return posts.value;
    }

    try {
      return await fetchPosts(nextPage, options);
    } catch (error_) {
      loadingMore.value = false;
      throw error_;
    }
  }

  async function getPost(postId: string, options: FetchOptions = {}) {
    const trimmedId = sanitizeTextInput(postId);

    if (!trimmedId) {
      throw new Error("Post identifier is required.");
    }

    const existing = items.value[trimmedId];
    const now = Date.now();
    const cachedTimestamp = itemTimestamps.value[trimmedId];

    if (!options.force && existing && cachedTimestamp && now - cachedTimestamp < itemTtlMs) {
      getPostSignature(existing);
      return existing;
    }

    const fetcher = resolveApiFetcher();

    try {
      const response = await fetcher<PostResponse>(`/v1/posts/${encodeURIComponent(trimmedId)}`, {
        method: "GET",
      });

      if (!response?.data || typeof response.data.id !== "string") {
        throw new Error("Invalid post response format.");
      }

      const post = applyPostSignature({ ...response.data, __optimistic: false });

      items.value[post.id] = post;

      if (!listIds.value.includes(post.id)) {
        listIds.value.push(post.id);
      }

      markItemTimestamp(
        post.id,
        typeof response.cachedAt === "number" ? response.cachedAt : Date.now(),
      );

      return post;
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : String(caughtError ?? "");
      throw new Error(message || "Unable to retrieve the post.");
    }
  }

  async function createPost(payload: { content: string; title?: string; summary?: string }) {
    const trimmedContent = sanitizeTextInput(payload.content);

    if (!trimmedContent) {
      const message = "Post content is required.";
      createError.value = message;
      throw new Error(message);
    }

    if (!authStore.isAuthenticated.value) {
      const message = "You must be logged in to create a post.";
      createError.value = message;
      throw new Error(message);
    }

    if (creating.value) {
      return posts.value;
    }

    creating.value = true;
    createError.value = null;

    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticPost = createOptimisticPost(optimisticId, trimmedContent, {
      title: payload.title,
      summary: payload.summary,
    });

    upsertPost(optimisticPost);

    const fetcher = resolveApiFetcher();

    try {
      const response = await fetcher<PostResponse>("/v1/posts", {
        method: "POST",
        body: {
          title: sanitizeTextInput(payload.title),
          summary: sanitizeTextInput(payload.summary),
          content: trimmedContent,
        },
      });

      if (!response?.data || typeof response.data.id !== "string") {
        throw new Error("Invalid create post response.");
      }

      const createdPost = applyPostSignature({ ...response.data, __optimistic: false });
      replaceOptimisticId(optimisticId, createdPost);
      markItemTimestamp(
        createdPost.id,
        typeof response.cachedAt === "number" ? response.cachedAt : Date.now(),
      );

      return posts.value;
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : String(caughtError ?? "");
      createError.value = message || "Unable to create the post.";
      removePostFromState(optimisticId);
      throw new Error(createError.value);
    } finally {
      creating.value = false;
    }
  }

  async function updatePost(
    postId: string,
    payload: Partial<Pick<BlogPost, "title" | "summary" | "content">>,
  ) {
    const trimmedId = sanitizeTextInput(postId);

    if (!trimmedId) {
      throw new Error("Post identifier is required.");
    }

    const existing = items.value[trimmedId];

    if (!existing) {
      await getPost(trimmedId, { force: true });
      return;
    }

    const updates: Record<string, string> = {};

    if (payload.title !== undefined) {
      updates.title = sanitizeTextInput(payload.title);
    }

    if (payload.summary !== undefined) {
      updates.summary = sanitizeTextInput(payload.summary);
    }

    if (payload.content !== undefined) {
      const content = sanitizeTextInput(payload.content);

      if (content) {
        updates.content = content;
      }
    }

    if (Object.keys(updates).length === 0) {
      return existing;
    }

    getPostSignature(existing);
    const snapshot = clonePost(existing);
    const optimisticPost = applyPostSignature({ ...existing, ...updates, __optimistic: true });
    items.value[trimmedId] = optimisticPost;

    updating.value[trimmedId] = true;

    const fetcher = resolveApiFetcher();

    try {
      const response = await fetcher<PostResponse>(`/v1/posts/${encodeURIComponent(trimmedId)}`, {
        method: "PATCH",
        body: updates,
      });

      const updatedPost = applyPostSignature({ ...response.data, __optimistic: false });

      items.value[trimmedId] = updatedPost;

      markItemTimestamp(
        trimmedId,
        typeof response.cachedAt === "number" ? response.cachedAt : Date.now(),
      );

      return updatedPost;
    } catch (caughtError) {
      items.value[trimmedId] = snapshot;

      const message =
        caughtError instanceof Error ? caughtError.message : String(caughtError ?? "");
      throw new Error(message || "Unable to update the post.");
    } finally {
      updating.value[trimmedId] = false;
    }
  }

  async function deletePost(postId: string) {
    const trimmedId = sanitizeTextInput(postId);

    if (!trimmedId) {
      throw new Error("Post identifier is required.");
    }

    const existing = items.value[trimmedId];

    if (!existing) {
      return;
    }

    getPostSignature(existing);
    const snapshot = clonePost(existing);
    const previousIndex = removePostFromState(trimmedId);

    deleting.value[trimmedId] = true;

    const fetcher = resolveApiFetcher();

    try {
      await fetcher(`/v1/posts/${encodeURIComponent(trimmedId)}`, {
        method: "DELETE",
      });
    } catch (caughtError) {
      if (previousIndex !== -1) {
        listIds.value.splice(previousIndex, 0, trimmedId);
      } else {
        listIds.value.unshift(trimmedId);
      }

      items.value[trimmedId] = snapshot;

      markItemTimestamp(trimmedId, Date.now());

      const message =
        caughtError instanceof Error ? caughtError.message : String(caughtError ?? "");
      throw new Error(message || "Unable to delete the post.");
    } finally {
      deleting.value[trimmedId] = false;
    }
  }

  async function reactToPost(postId: string, reactionType: ReactionAction) {
    const trimmedId = sanitizeTextInput(postId);
    const payload = sanitizeTextInput(reactionType);

    if (!trimmedId) {
      throw new Error("Post identifier is required.");
    }

    if (!payload || (payload !== "like" && payload !== "dislike")) {
      throw new Error("Reaction type is required.");
    }

    if (!authStore.isAuthenticated.value) {
      throw new Error("You must be logged in to react to posts.");
    }

    const fetcher = resolveApiFetcher();

    try {
      await fetcher(`/v1/posts/${encodeURIComponent(trimmedId)}/reactions`, {
        method: "POST",
        body: { reactionType: payload },
      });

      await getPost(trimmedId, { force: true });
      await fetchPosts({ force: true });
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : String(caughtError ?? "");
      throw new Error(message || "Unable to react to the post.");
    }
  }

  async function getComments(postId: string): Promise<BlogCommentWithReplies[]> {
    const trimmedId = sanitizeTextInput(postId);

    if (!trimmedId) {
      throw new Error("Post identifier is required.");
    }

    const cachedComments = commentsCache.value[trimmedId];
    const cachedTimestamp = commentTimestamps.value[trimmedId];
    const now = Date.now();
    const hasCached = Array.isArray(cachedComments);
    const isFresh =
      hasCached && typeof cachedTimestamp === "number" && now - cachedTimestamp < itemTtlMs;

    if (hasCached && isFresh) {
      return cachedComments;
    }

    const fetchAndStore = async () => {
      const fetcher = resolveApiFetcher();
      const response = await fetcher<BlogCommentWithReplies[] | unknown>(
        `/v1/posts/${encodeURIComponent(trimmedId)}/comments`,
        {
          method: "GET",
        },
      );

      if (!Array.isArray(response)) {
        throw new Error("Invalid comments response.");
      }

      setCommentsCache(trimmedId, response);

      return response;
    };

    if (hasCached) {
      fetchAndStore().catch((error_) => {
        console.error("Comments revalidation failed", error_);
      });

      return cachedComments;
    }

    try {
      return await fetchAndStore();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : String(caughtError ?? "");
      throw new Error(message || "Unable to load comments.");
    }
  }

  async function addComment(postId: string, content: string, parentCommentId?: string | null) {
    const trimmedId = sanitizeTextInput(postId);
    const trimmedContent = sanitizeTextInput(content);

    if (!trimmedId) {
      throw new Error("Post identifier is required.");
    }

    if (!trimmedContent) {
      throw new Error("Comment content is required.");
    }

    if (!authStore.isAuthenticated.value) {
      throw new Error("You must be logged in to add comments.");
    }

    const fetcher = resolveApiFetcher();

    try {
      await fetcher(`/v1/posts/${encodeURIComponent(trimmedId)}/comments`, {
        method: "POST",
        body: {
          content: trimmedContent,
          parentCommentId: sanitizeTextInput(parentCommentId) || null,
        },
      });

      invalidateCommentsCache(trimmedId);

      await getPost(trimmedId, { force: true });
      await fetchPosts({ force: true });
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : String(caughtError ?? "");
      throw new Error(message || "Unable to add the comment.");
    }
  }

  async function reactToComment(postId: string, commentId: string, reactionType: ReactionAction) {
    const trimmedId = sanitizeTextInput(postId);
    const trimmedCommentId = sanitizeTextInput(commentId);
    const trimmedReaction = sanitizeTextInput(reactionType);

    if (!trimmedId || !trimmedCommentId) {
      throw new Error("Post and comment identifiers are required.");
    }

    if (!trimmedReaction || (trimmedReaction !== "like" && trimmedReaction !== "dislike")) {
      throw new Error("Reaction type is required.");
    }

    if (!authStore.isAuthenticated.value) {
      throw new Error("You must be logged in to react to comments.");
    }

    const fetcher = resolveApiFetcher();

    try {
      await fetcher(
        `/v1/posts/${encodeURIComponent(trimmedId)}/comments/${encodeURIComponent(trimmedCommentId)}/reactions`,
        {
          method: "POST",
          body: { reactionType: trimmedReaction },
        },
      );

      invalidateCommentsCache(trimmedId);

      await getPost(trimmedId, { force: true });
      await fetchPosts({ force: true });
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : String(caughtError ?? "");
      throw new Error(message || "Unable to react to the comment.");
    }
  }

  return {
    posts,
    pending: computed(() => pending.value),
    loadingMore: computed(() => loadingMore.value),
    error: computed(() => error.value),
    cachedAt: computed(() => cachedAt.value),
    lastFetched: computed(() => lastFetched.value),
    isRevalidating: computed(() => isRevalidating.value),
    creating: computed(() => creating.value),
    createError: computed(() => createError.value),
    updating: computed(() => updating.value),
    deleting: computed(() => deleting.value),
    hasMore,
    currentPage: computed(() => currentPage.value),
    pageSize: computed(() => pageSize.value),
    totalCount: computed(() => totalCount.value),
    fetchPosts,
    fetchMorePosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    reactToPost,
    getComments,
    addComment,
    reactToComment,
  };
});
