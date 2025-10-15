import { computed, reactive, shallowRef } from "vue";
import { defineStore } from "~/lib/pinia-shim";
import { useRuntimeConfig, useState } from "#imports";
import type { BlogCommentWithReplies, BlogPost, ReactionAction } from "~/lib/mock/blog";
import { useAuthStore } from "~/composables/useAuthStore";
import { resolveApiFetcher } from "~/lib/api/fetcher";

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

  return {
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

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }

    for (let index = 0; index < a.length; index += 1) {
      if (!deepEqual(a[index], b[index])) {
        return false;
      }
    }

    return true;
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) {
        return false;
      }

      if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
        return false;
      }
    }

    return true;
  }

  return Object.is(a, b);
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

  function markItemTimestamp(id: string, timestamp: number) {
    itemTimestamps.value = {
      ...itemTimestamps.value,
      [id]: timestamp,
    };
  }

  function replaceOptimisticId(oldId: string, newPost: PostsStorePost) {
    const index = listIds.value.indexOf(oldId);

    if (index !== -1) {
      listIds.value.splice(index, 1, newPost.id);
    } else {
      listIds.value.unshift(newPost.id);
    }

    const { [oldId]: removed, ...rest } = items.value;
    items.value = {
      ...rest,
      [newPost.id]: newPost,
    };

    const { [oldId]: _, ...timestamps } = itemTimestamps.value;
    itemTimestamps.value = {
      ...timestamps,
      [newPost.id]: Date.now(),
    };

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

    let nextItems: Record<string, PostsStorePost> | null = null;
    let nextTimestamps: Record<string, number> | null = null;

    const ensureItems = () => {
      if (!nextItems) {
        nextItems = { ...items.value };
      }

      return nextItems;
    };

    const ensureTimestamps = () => {
      if (!nextTimestamps) {
        nextTimestamps = { ...itemTimestamps.value };
      }

      return nextTimestamps;
    };

    for (const id of Object.keys(items.value)) {
      if (!activeIds.has(id)) {
        const itemsTarget = ensureItems();
        const timestampsTarget = ensureTimestamps();

        delete itemsTarget[id];
        delete timestampsTarget[id];
      }
    }

    for (const post of incomingPosts) {
      const normalizedPost: PostsStorePost = { ...post, __optimistic: false };
      const currentItem = (nextItems ?? items.value)[post.id];

      if (!currentItem || currentItem.__optimistic || !deepEqual(currentItem, normalizedPost)) {
        const itemsTarget = ensureItems();
        itemsTarget[post.id] = normalizedPost;
      }

      const currentTimestamp = (nextTimestamps ?? itemTimestamps.value)[post.id];

      if (currentTimestamp !== now) {
        const timestampsTarget = ensureTimestamps();
        timestampsTarget[post.id] = now;
      }
    }

    if (nextItems) {
      items.value = nextItems;
    }

    if (!listOrderMatch) {
      listIds.value = finalIds;
    }

    if (nextTimestamps) {
      itemTimestamps.value = nextTimestamps;
    }

    if (!pageIdsMatch) {
      pageMap.value = {
        ...pageMap.value,
        [normalizedPage]: incomingIds,
      };
    }

    if (pageTimestamp !== now) {
      pageTimestamps.value = {
        ...pageTimestamps.value,
        [normalizedPage]: now,
      };
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

    items.value = {
      ...items.value,
      [post.id]: post,
    };

    markItemTimestamp(post.id, Date.now());
  }

  function removePostFromState(postId: string) {
    const index = listIds.value.indexOf(postId);

    if (index !== -1) {
      listIds.value.splice(index, 1);
    }

    if (items.value[postId]) {
      const { [postId]: _, ...rest } = items.value;
      items.value = rest;
    }

    if (itemTimestamps.value[postId]) {
      const { [postId]: __, ...restTimestamps } = itemTimestamps.value;
      itemTimestamps.value = restTimestamps;
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
    const { loadMore, ...restOptions } = options;
    const params = { ...(options.params ?? {}), page };
    const fetchKey = createFetchKey({ ...restOptions, params });
    const existingRequest = activeFetches.get(fetchKey);

    if (existingRequest) {
      if (options.background) {
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

    if (!options.background) {
      if (loadMore) {
        loadingMore.value = true;
      } else {
        pending.value = true;
        error.value = null;
      }
    }

    const fetchState: ActiveFetchState = {
      promise: Promise.resolve([] as BlogPost[]),
      hasBackground: Boolean(options.background),
      hasForeground: !options.background && !loadMore,
      hasLoadMore: Boolean(loadMore),
    };

    const requestPromise = (async () => {
      try {
        const response = await fetcher<PostsListResponse>("/api/v1/posts", {
          method: "GET",
          query: params,
        });

        if (!response || !Array.isArray(response.data)) {
          throw new Error("Invalid posts response format.");
        }

        setPostsFromResponse(response);
        return response.data;
      } catch (caughtError) {
        const message =
          caughtError instanceof Error ? caughtError.message : String(caughtError ?? "");

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
      return existing;
    }

    const fetcher = resolveApiFetcher();

    try {
      const response = await fetcher<PostResponse>(
        `/api/v1/posts/${encodeURIComponent(trimmedId)}`,
        {
          method: "GET",
        },
      );

      if (!response?.data || typeof response.data.id !== "string") {
        throw new Error("Invalid post response format.");
      }

      const post: PostsStorePost = { ...response.data, __optimistic: false };

      items.value = {
        ...items.value,
        [post.id]: post,
      };

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
      const response = await fetcher<PostResponse>("/api/v1/posts", {
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

      const createdPost: PostsStorePost = { ...response.data, __optimistic: false };
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

    const snapshot = clonePost(existing);
    items.value = {
      ...items.value,
      [trimmedId]: { ...existing, ...updates, __optimistic: true },
    };

    updating.value = {
      ...updating.value,
      [trimmedId]: true,
    };

    const fetcher = resolveApiFetcher();

    try {
      const response = await fetcher<PostResponse>(
        `/api/v1/posts/${encodeURIComponent(trimmedId)}`,
        {
          method: "PATCH",
          body: updates,
        },
      );

      const updatedPost: PostsStorePost = { ...response.data, __optimistic: false };

      items.value = {
        ...items.value,
        [trimmedId]: updatedPost,
      };

      markItemTimestamp(
        trimmedId,
        typeof response.cachedAt === "number" ? response.cachedAt : Date.now(),
      );

      return updatedPost;
    } catch (caughtError) {
      items.value = {
        ...items.value,
        [trimmedId]: snapshot,
      };

      const message =
        caughtError instanceof Error ? caughtError.message : String(caughtError ?? "");
      throw new Error(message || "Unable to update the post.");
    } finally {
      updating.value = {
        ...updating.value,
        [trimmedId]: false,
      };
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

    const snapshot = clonePost(existing);
    const previousIndex = removePostFromState(trimmedId);

    deleting.value = {
      ...deleting.value,
      [trimmedId]: true,
    };

    const fetcher = resolveApiFetcher();

    try {
      await fetcher(`/api/v1/posts/${encodeURIComponent(trimmedId)}`, {
        method: "DELETE",
      });
    } catch (caughtError) {
      if (previousIndex !== -1) {
        listIds.value.splice(previousIndex, 0, trimmedId);
      } else {
        listIds.value.unshift(trimmedId);
      }

      items.value = {
        ...items.value,
        [trimmedId]: snapshot,
      };

      markItemTimestamp(trimmedId, Date.now());

      const message =
        caughtError instanceof Error ? caughtError.message : String(caughtError ?? "");
      throw new Error(message || "Unable to delete the post.");
    } finally {
      deleting.value = {
        ...deleting.value,
        [trimmedId]: false,
      };
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
      await fetcher(`/api/v1/posts/${encodeURIComponent(trimmedId)}/reactions`, {
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

    const fetcher = resolveApiFetcher();

    try {
      const response = await fetcher<BlogCommentWithReplies[] | unknown>(
        `/api/v1/posts/${encodeURIComponent(trimmedId)}/comments`,
        {
          method: "GET",
        },
      );

      if (!Array.isArray(response)) {
        throw new Error("Invalid comments response.");
      }

      return response;
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
      await fetcher(`/api/v1/posts/${encodeURIComponent(trimmedId)}/comments`, {
        method: "POST",
        body: {
          content: trimmedContent,
          parentCommentId: sanitizeTextInput(parentCommentId) || null,
        },
      });

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
        `/api/v1/posts/${encodeURIComponent(trimmedId)}/comments/${encodeURIComponent(trimmedCommentId)}/reactions`,
        {
          method: "POST",
          body: { reactionType: trimmedReaction },
        },
      );

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
