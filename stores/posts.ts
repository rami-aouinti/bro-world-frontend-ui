import { computed, reactive, ref, shallowRef } from "vue";
import { defineStore } from "~/lib/pinia-shim";
import { useRequestFetch } from "#app";
import type { BlogPost, ReactionType } from "~/lib/mock/blog";

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

function createOptimisticPost(id: string, content: string, overrides?: Partial<BlogPost>): PostsStorePost {
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

function resolveFetcher() {
  if (import.meta.server) {
    return useRequestFetch();
  }

  return $fetch;
}

export const usePostsStore = defineStore("posts", () => {
  const runtimeConfig = useRuntimeConfig();
  const listTtlMs = Math.max(Number(runtimeConfig.redis?.listTtl ?? 60), 1) * 1000;
  const itemTtlMs = Math.max(Number(runtimeConfig.redis?.itemTtl ?? 300), 1) * 1000;

  const items = ref<Record<string, PostsStorePost>>({});
  const listIds = ref<string[]>([]);
  const itemTimestamps = ref<Record<string, number>>({});
  const cachedAt = ref<number | null>(null);
  const lastFetched = ref<number | null>(null);
  const pending = ref(false);
  const error = ref<string | null>(null);
  const creating = ref(false);
  const createError = ref<string | null>(null);
  const updating = ref<Record<string, boolean>>({});
  const deleting = ref<Record<string, boolean>>({});
  const isRevalidating = ref(false);
  const backgroundPromise = shallowRef<Promise<void> | null>(null);

  const posts = computed(() =>
    listIds.value
      .map((id) => items.value[id])
      .filter((post): post is PostsStorePost => Boolean(post)),
  );

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
    const nextItems: Record<string, PostsStorePost> = {};
    const nextIds: string[] = [];
    const nextTimestamps: Record<string, number> = {};

    for (const post of response.data ?? []) {
      if (!post?.id) {
        continue;
      }

      nextItems[post.id] = { ...post, __optimistic: false };
      nextIds.push(post.id);
      nextTimestamps[post.id] = now;
    }

    items.value = nextItems;
    listIds.value = nextIds;
    itemTimestamps.value = nextTimestamps;
    cachedAt.value = now;
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

  async function fetchPostsFromServer(options: FetchOptions & { background?: boolean } = {}) {
    const fetcher = resolveFetcher();

    if (!options.background) {
      pending.value = true;
      error.value = null;
    }

    try {
      const response = await fetcher<PostsListResponse>("/api/v1/posts", {
        method: "GET",
        query: options.params,
      });

      if (!response || !Array.isArray(response.data)) {
        throw new Error("Invalid posts response format.");
      }

      setPostsFromResponse(response);
      return response.data;
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : String(caughtError ?? "");

      if (!options.background) {
        error.value = message || "Unable to fetch posts.";
      }

      throw new Error(message || "Unable to fetch posts.");
    } finally {
      if (options.background) {
        isRevalidating.value = false;
      } else {
        pending.value = false;
      }
    }
  }

  async function fetchPosts(options: FetchOptions = {}) {
    const now = Date.now();

    if (!options.force && posts.value.length > 0) {
      const isFresh = typeof cachedAt.value === "number" && now - cachedAt.value < listTtlMs;

      if (isFresh) {
        return posts.value;
      }

      if (!isRevalidating.value && !backgroundPromise.value) {
        isRevalidating.value = true;
        backgroundPromise.value = fetchPostsFromServer({ ...options, force: true, background: true })
          .catch((revalidationError) => {
            console.error("Posts revalidation failed", revalidationError);
          })
          .finally(() => {
            backgroundPromise.value = null;
          });
      }

      return posts.value;
    }

    return fetchPostsFromServer(options);
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

    const fetcher = resolveFetcher();

    try {
      const response = await fetcher<PostResponse>(`/api/v1/posts/${encodeURIComponent(trimmedId)}`, {
        method: "GET",
      });

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

      markItemTimestamp(post.id, typeof response.cachedAt === "number" ? response.cachedAt : Date.now());

      return post;
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : String(caughtError ?? "");
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

    const fetcher = resolveFetcher();

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
      markItemTimestamp(createdPost.id, typeof response.cachedAt === "number" ? response.cachedAt : Date.now());

      return posts.value;
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : String(caughtError ?? "");
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

    const snapshot = structuredClone(existing) as PostsStorePost;
    items.value = {
      ...items.value,
      [trimmedId]: { ...existing, ...updates, __optimistic: true },
    };

    updating.value = {
      ...updating.value,
      [trimmedId]: true,
    };

    const fetcher = resolveFetcher();

    try {
      const response = await fetcher<PostResponse>(`/api/v1/posts/${encodeURIComponent(trimmedId)}`, {
        method: "PATCH",
        body: updates,
      });

      const updatedPost: PostsStorePost = { ...response.data, __optimistic: false };

      items.value = {
        ...items.value,
        [trimmedId]: updatedPost,
      };

      markItemTimestamp(trimmedId, typeof response.cachedAt === "number" ? response.cachedAt : Date.now());

      return updatedPost;
    } catch (caughtError) {
      items.value = {
        ...items.value,
        [trimmedId]: snapshot,
      };

      const message = caughtError instanceof Error ? caughtError.message : String(caughtError ?? "");
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

    const snapshot = structuredClone(existing) as PostsStorePost;
    const previousIndex = removePostFromState(trimmedId);

    deleting.value = {
      ...deleting.value,
      [trimmedId]: true,
    };

    const fetcher = resolveFetcher();

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

      const message = caughtError instanceof Error ? caughtError.message : String(caughtError ?? "");
      throw new Error(message || "Unable to delete the post.");
    } finally {
      deleting.value = {
        ...deleting.value,
        [trimmedId]: false,
      };
    }
  }

  async function reactToPost(postId: string, reactionType: ReactionType) {
    const trimmedId = sanitizeTextInput(postId);
    const payload = sanitizeTextInput(reactionType);

    if (!trimmedId) {
      throw new Error("Post identifier is required.");
    }

    if (!payload) {
      throw new Error("Reaction type is required.");
    }

    const fetcher = resolveFetcher();

    try {
      await fetcher(`/api/v1/posts/${encodeURIComponent(trimmedId)}/reactions`, {
        method: "POST",
        body: { reactionType: payload },
      });

      await getPost(trimmedId, { force: true });
      await fetchPosts({ force: true });
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : String(caughtError ?? "");
      throw new Error(message || "Unable to react to the post.");
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

    const fetcher = resolveFetcher();

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
      const message = caughtError instanceof Error ? caughtError.message : String(caughtError ?? "");
      throw new Error(message || "Unable to add the comment.");
    }
  }

  async function reactToComment(postId: string, commentId: string, reactionType: ReactionType) {
    const trimmedId = sanitizeTextInput(postId);
    const trimmedCommentId = sanitizeTextInput(commentId);
    const trimmedReaction = sanitizeTextInput(reactionType);

    if (!trimmedId || !trimmedCommentId) {
      throw new Error("Post and comment identifiers are required.");
    }

    if (!trimmedReaction) {
      throw new Error("Reaction type is required.");
    }

    const fetcher = resolveFetcher();

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
      const message = caughtError instanceof Error ? caughtError.message : String(caughtError ?? "");
      throw new Error(message || "Unable to react to the comment.");
    }
  }

  return {
    posts,
    pending: computed(() => pending.value),
    error: computed(() => error.value),
    cachedAt: computed(() => cachedAt.value),
    lastFetched: computed(() => lastFetched.value),
    isRevalidating: computed(() => isRevalidating.value),
    creating: computed(() => creating.value),
    createError: computed(() => createError.value),
    updating: computed(() => updating.value),
    deleting: computed(() => deleting.value),
    fetchPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    reactToPost,
    addComment,
    reactToComment,
  };
});
