import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { computed, createSSRApp, h, ref } from "vue";

import { createPinia } from "~/lib/pinia-shim";
import type { BlogCommentWithReplies, BlogPost } from "~/lib/mock/blog";
import type { SiteSettings } from "~/types/settings";
import {
  __getNuxtStateRef,
  __requestFetchSpy,
  __resetNuxtStateMocks,
  __resetRequestFetchMock,
  useCookie,
} from "#imports";

const fetchSpy = __requestFetchSpy;

vi.mock("~/lib/api/fetcher", () => ({
  resolveApiFetcher: () => fetchSpy,
}));

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
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

function makePost(id: string, overrides: Partial<BlogPost> = {}): BlogPost {
  const numericId = Number.parseInt(id.replace(/[^0-9]/g, ""), 10) || 1;

  return {
    id,
    title: `Title ${id}`,
    summary: `Summary ${id}`,
    content: `Content ${id}`,
    url: null,
    slug: `slug-${id}`,
    medias: [],
    isReacted: null,
    publishedAt: new Date(2024, 0, numericId + 1).toISOString(),
    sharedFrom: null,
    reactions_count: 1,
    totalComments: 0,
    user: {
      id: `user-${id}`,
      firstName: "Jane",
      lastName: "Doe",
      username: `jane-${id}`,
      email: "jane@example.com",
      enabled: true,
      photo: null,
    },
    reactions_preview: [],
    comments_preview: [],
    ...overrides,
  };
}

function makeComment(
  id: string,
  overrides: Partial<BlogCommentWithReplies> = {},
): BlogCommentWithReplies {
  const numericId = Number.parseInt(id.replace(/[^0-9]/g, ""), 10) || 1;

  return {
    id,
    content: `Comment ${id}`,
    user: {
      id: `comment-user-${id}`,
      firstName: "Jane",
      lastName: "Doe",
      username: `jane-${id}`,
      email: "jane@example.com",
      enabled: true,
      photo: null,
    },
    isReacted: null,
    totalComments: 0,
    reactions_count: 0,
    publishedAt: new Date(2024, 0, numericId).toISOString(),
    reactions_preview: [],
    likes_count: 0,
    ...overrides,
  };
}

describe("posts store", () => {
  beforeEach(() => {
    __resetNuxtStateMocks();
    __resetRequestFetchMock();
    fetchSpy.mockReset();
    vi.stubGlobal("$fetch", fetchSpy);
    vi.stubGlobal("useRuntimeConfig", () => ({
      redis: {
        listTtl: 60,
        itemTtl: 300,
      },
      public: {
        apiBase: "/api",
        postsApiBase: "https://fallback.test/",
        redis: {
          listTtl: 60,
          itemTtl: 300,
        },
      },
    }));
    vi.stubGlobal("structuredClone", <T>(value: T) => JSON.parse(JSON.stringify(value)) as T);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes nested paginated responses from the API", async () => {
    const { usePostsStore } = await import("~/stores/posts");

    const app = createSSRApp({
      render: () => h("div"),
    });

    const pinia = createPinia();
    app.use(pinia);

    let store!: ReturnType<typeof usePostsStore>;
    app.runWithContext(() => {
      store = usePostsStore();
    });

    const posts = [makePost("post-1"), makePost("post-2")];
    const cachedAtIso = new Date().toISOString();

    fetchSpy.mockResolvedValueOnce({
      data: {
        data: posts,
        meta: {
          current_page: 1,
          per_page: 5,
          total: 20,
          cached_at: cachedAtIso,
          from_cache: "true",
        },
      },
    });

    const result = await store.fetchPosts({ params: { perPage: 5 } });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/v1/posts"),
      expect.objectContaining({
        method: "GET",
        query: expect.objectContaining({ page: 1, perPage: 5 }),
      }),
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      "https://fallback.test/public/post",
      expect.objectContaining({
        method: "GET",
        query: expect.objectContaining({ page: 1, perPage: 5 }),
      }),
    );

    expect(result.map((post) => post.id)).toEqual(posts.map((post) => post.id));
    expect(store.posts.value.map((post) => post.id)).toEqual(posts.map((post) => post.id));
    expect(store.pageSize.value).toBe(5);
    expect(store.totalCount.value).toBe(20);
    expect(store.currentPage.value).toBe(1);
    expect(store.cachedAt.value).toBe(Date.parse(cachedAtIso));
  });

  it("discovers posts arrays nested beneath arbitrary keys", async () => {
    const { usePostsStore } = await import("~/stores/posts");

    const app = createSSRApp({
      render: () => h("div"),
    });

    const pinia = createPinia();
    app.use(pinia);

    let store!: ReturnType<typeof usePostsStore>;
    app.runWithContext(() => {
      store = usePostsStore();
    });

    const posts = [makePost("post-1"), makePost("post-2")];

    fetchSpy.mockResolvedValueOnce({
      payload: {
        response: {
          bundle: {
            records: {
              nodes: posts,
              pagination: {
                currentPage: 2,
                perPage: 2,
                totalCount: 10,
                fromCache: false,
              },
            },
          },
        },
      },
    });

    const result = await store.fetchPosts(2, { params: { perPage: 2 } });

    expect(result.map((post) => post.id)).toEqual(posts.map((post) => post.id));
    expect(store.posts.value.map((post) => post.id)).toEqual(posts.map((post) => post.id));
    expect(store.pageSize.value).toBe(2);
    expect(store.totalCount.value).toBe(10);
    expect(store.currentPage.value).toBe(2);
  });

  it("parses JSON string responses returned by the HTTP client", async () => {
    const { usePostsStore } = await import("~/stores/posts");

    const app = createSSRApp({
      render: () => h("div"),
    });

    const pinia = createPinia();
    app.use(pinia);

    let store!: ReturnType<typeof usePostsStore>;
    app.runWithContext(() => {
      store = usePostsStore();
    });

    const posts = [makePost("post-1")];
    const cachedAtIso = new Date().toISOString();

    fetchSpy.mockResolvedValueOnce(
      JSON.stringify({
        data: posts,
        meta: {
          current_page: 1,
          per_page: 1,
          total: 1,
          cached_at: cachedAtIso,
        },
      }),
    );

    const result = await store.fetchPosts();

    expect(result.map((post) => post.id)).toEqual(posts.map((post) => post.id));
    expect(store.cachedAt.value).toBe(Date.parse(cachedAtIso));
  });

  it("falls back to the configured posts API base when the initial request fails", async () => {
    const { usePostsStore } = await import("~/stores/posts");

    const app = createSSRApp({
      render: () => h("div"),
    });

    const pinia = createPinia();
    app.use(pinia);

    let store!: ReturnType<typeof usePostsStore>;
    app.runWithContext(() => {
      store = usePostsStore();
    });

    const posts = [makePost("post-1")];
    const error = new Error("<html>Not Found</html>");

    fetchSpy.mockImplementationOnce(() => Promise.reject(error));
    fetchSpy.mockImplementationOnce(() =>
      Promise.resolve({
        data: posts,
        page: 1,
        limit: 10,
        count: posts.length,
      }),
    );

    const result = await store.fetchPosts();

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/v1/posts"),
      expect.objectContaining({
        method: "GET",
        query: expect.objectContaining({ page: 1 }),
      }),
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      "https://fallback.test/public/post",
      expect.objectContaining({
        method: "GET",
        query: expect.objectContaining({ page: 1 }),
      }),
    );

    expect(result.map((post) => post.id)).toEqual(["post-1"]);
    expect(store.posts.value.map((post) => post.id)).toEqual(["post-1"]);
    expect(store.error.value).toBeNull();
  });

  it("uses the fastest available posts endpoint when the primary request stalls", async () => {
    const { usePostsStore } = await import("~/stores/posts");

    const app = createSSRApp({
      render: () => h("div"),
    });

    const pinia = createPinia();
    app.use(pinia);

    let store!: ReturnType<typeof usePostsStore>;
    app.runWithContext(() => {
      store = usePostsStore();
    });

    const primaryRequest = createDeferred<PostsListResponse>();
    const fallbackPosts = [makePost("post-1"), makePost("post-2")];
    const fallbackResponse = {
      data: {
        data: fallbackPosts,
        meta: {
          current_page: 1,
          per_page: fallbackPosts.length,
          total: fallbackPosts.length,
          cached_at: new Date().toISOString(),
        },
      },
    } satisfies Record<string, unknown>;

    fetchSpy.mockImplementation((url) => {
      if (typeof url === "string" && url.includes("/v1/posts")) {
        return primaryRequest.promise;
      }

      if (typeof url === "string" && url.includes("/public/post")) {
        return Promise.resolve(fallbackResponse);
      }

      return Promise.reject(new Error(`Unexpected fetch target: ${url as string}`));
    });

    const result = await store.fetchPosts();

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(result.map((post) => post.id)).toEqual(fallbackPosts.map((post) => post.id));
    expect(store.posts.value.map((post) => post.id)).toEqual(fallbackPosts.map((post) => post.id));

    primaryRequest.resolve(fallbackResponse as unknown as PostsListResponse);
  });

  it("surfaces API error messages when the response lacks post data", async () => {
    const { usePostsStore } = await import("~/stores/posts");

    const app = createSSRApp({
      render: () => h("div"),
    });

    const pinia = createPinia();
    app.use(pinia);

    let store!: ReturnType<typeof usePostsStore>;
    app.runWithContext(() => {
      store = usePostsStore();
    });

    fetchSpy.mockImplementation(() => Promise.resolve({ message: "Unauthenticated." }));

    await expect(store.fetchPosts()).rejects.toThrow("Unauthenticated.");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(store.error.value).toBe("Unauthenticated.");
  });

  it("falls back to a generic message when the API responds with HTML", async () => {
    const { usePostsStore } = await import("~/stores/posts");

    const app = createSSRApp({
      render: () => h("div"),
    });

    const pinia = createPinia();
    app.use(pinia);

    let store!: ReturnType<typeof usePostsStore>;
    app.runWithContext(() => {
      store = usePostsStore();
    });

    const htmlPayload = "<!DOCTYPE html><html><body>Not found</body></html>";
    fetchSpy.mockImplementation(() => Promise.reject(new Error(htmlPayload)));

    await expect(store.fetchPosts()).rejects.toThrow("Unable to fetch posts.");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(store.error.value).toBe("Unable to fetch posts.");
  });

  it("restores the post when deletePost fails", async () => {
    const { usePostsStore } = await import("~/stores/posts");

    const app = createSSRApp({
      render: () => h("div"),
    });

    const pinia = createPinia();
    app.use(pinia);

    let store!: ReturnType<typeof usePostsStore>;
    app.runWithContext(() => {
      store = usePostsStore();
    });

    const itemsRef = __getNuxtStateRef<Record<string, BlogPost>>("posts-items");
    const listRef = __getNuxtStateRef<string[]>("posts-list-ids");
    const timestampsRef = __getNuxtStateRef<Record<string, number>>("posts-item-timestamps");

    expect(itemsRef).toBeDefined();
    expect(listRef).toBeDefined();
    expect(timestampsRef).toBeDefined();

    const post1 = makePost("post-1");
    const post2 = makePost("post-2");
    const post3 = makePost("post-3");

    itemsRef!.value = {
      [post2.id]: post2,
      [post1.id]: post1,
      [post3.id]: post3,
    };
    listRef!.value = [post2.id, post1.id, post3.id];
    const initialTimestamp = Date.now() - 1_000;
    timestampsRef!.value = {
      [post1.id]: initialTimestamp,
      [post2.id]: initialTimestamp,
      [post3.id]: initialTimestamp,
    };

    fetchSpy.mockRejectedValueOnce(new Error("network error"));

    await expect(store.deletePost(post1.id)).rejects.toThrow("network error");

    expect(fetchSpy).toHaveBeenCalledWith(
      `/v1/posts/${post1.id}`,
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(listRef!.value).toEqual([post2.id, post1.id, post3.id]);
    expect(itemsRef!.value[post1.id]).toMatchObject({ id: post1.id });
    expect(store.deleting.value[post1.id]).toBe(false);
    expect(store.posts.value.map((post) => post.id)).toEqual([post2.id, post1.id, post3.id]);
    expect(timestampsRef!.value[post1.id]).toBeGreaterThanOrEqual(initialTimestamp);
  });

  it("deduplicates concurrent fetches with equivalent params", async () => {
    const { usePostsStore } = await import("~/stores/posts");

    const app = createSSRApp({
      render: () => h("div"),
    });

    const pinia = createPinia();
    app.use(pinia);

    let store!: ReturnType<typeof usePostsStore>;
    app.runWithContext(() => {
      store = usePostsStore();
    });

    const deferred = createDeferred<PostsListResponse>();
    fetchSpy.mockImplementationOnce(() => deferred.promise);

    const firstFetch = store.fetchPosts({
      params: {
        pageSize: 10,
        filter: { category: "news", sort: "desc" },
      },
    });

    const secondFetch = store.fetchPosts({
      params: {
        filter: { sort: "desc", category: "news" },
        pageSize: 10,
      },
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);

    deferred.resolve({
      data: [],
      page: 1,
      limit: 10,
      count: 0,
      cachedAt: Date.now(),
      revalidatedAt: null,
      fromCache: false,
    });

    await expect(firstFetch).resolves.toEqual([]);
    await expect(secondFetch).resolves.toEqual([]);
  });

  it("returns cached comments when they are still fresh", async () => {
    const { usePostsStore } = await import("~/stores/posts");

    const app = createSSRApp({
      render: () => h("div"),
    });

    const pinia = createPinia();
    app.use(pinia);

    let store!: ReturnType<typeof usePostsStore>;
    app.runWithContext(() => {
      store = usePostsStore();
    });

    const postId = "post-1";
    const comments = [makeComment("comment-1")];

    fetchSpy.mockResolvedValueOnce(comments);

    const firstResult = await store.getComments(postId);
    expect(firstResult).toEqual(comments);

    const secondResult = await store.getComments(postId);
    expect(secondResult).toEqual(comments);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("refreshes stale cached comments in the background", async () => {
    const { usePostsStore } = await import("~/stores/posts");

    const app = createSSRApp({
      render: () => h("div"),
    });

    const pinia = createPinia();
    app.use(pinia);

    let store!: ReturnType<typeof usePostsStore>;
    app.runWithContext(() => {
      store = usePostsStore();
    });

    const postId = "post-1";
    const initialComments = [makeComment("comment-1")];
    const updatedComments = [makeComment("comment-2")];

    fetchSpy.mockResolvedValueOnce(initialComments);

    const firstResult = await store.getComments(postId);
    expect(firstResult).toEqual(initialComments);

    const timestampRef = __getNuxtStateRef<Record<string, number>>("posts-comments-timestamps");
    expect(timestampRef).toBeDefined();
    timestampRef!.value = {
      ...timestampRef!.value,
      [postId]: Date.now() - 400_000,
    };

    const deferred = createDeferred<BlogCommentWithReplies[]>();
    fetchSpy.mockImplementationOnce(() => deferred.promise);

    const secondResult = await store.getComments(postId);
    expect(secondResult).toEqual(initialComments);
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    const cacheRef =
      __getNuxtStateRef<Record<string, BlogCommentWithReplies[]>>("posts-comments-cache");
    expect(cacheRef).toBeDefined();

    deferred.resolve(updatedComments);
    await deferred.promise;
    await Promise.resolve();

    expect(cacheRef!.value[postId]).toEqual(updatedComments);
  });

  it("clears the cached comments after adding a new one", async () => {
    const { usePostsStore } = await import("~/stores/posts");

    const app = createSSRApp({
      render: () => h("div"),
    });

    const pinia = createPinia();
    app.use(pinia);

    let store!: ReturnType<typeof usePostsStore>;
    app.runWithContext(() => {
      store = usePostsStore();
    });

    const postId = "post-1";
    const cacheRef =
      __getNuxtStateRef<Record<string, BlogCommentWithReplies[]>>("posts-comments-cache");
    const timestampRef = __getNuxtStateRef<Record<string, number>>("posts-comments-timestamps");

    expect(cacheRef).toBeDefined();
    expect(timestampRef).toBeDefined();

    cacheRef!.value = {
      ...cacheRef!.value,
      [postId]: [makeComment("comment-1")],
    };
    timestampRef!.value = {
      ...timestampRef!.value,
      [postId]: Date.now(),
    };

    const postsResponse = {
      data: [],
      page: 1,
      limit: 10,
      count: 0,
      cachedAt: Date.now(),
      revalidatedAt: null,
      fromCache: false,
    };

    const postResponse = {
      data: makePost(postId),
      cachedAt: Date.now(),
      fromCache: false,
    };

    fetchSpy.mockImplementation((url: unknown, options: Record<string, unknown> = {}) => {
      const method = typeof options.method === "string" ? options.method : undefined;

      if (typeof url === "string") {
        if (url.includes(`/v1/posts/${postId}/comments`) && method === "POST") {
          return Promise.resolve({});
        }

        if (url === `/v1/posts/${postId}` && method === "GET") {
          return Promise.resolve(postResponse);
        }

        if (method === "GET") {
          return Promise.resolve(postsResponse);
        }
      }

      return Promise.resolve(postsResponse);
    });

    const sessionCookie = useCookie<string | null>("auth_session_token");
    sessionCookie.value = "token";

    await store.addComment(postId, "New comment");

    expect(cacheRef!.value[postId]).toBeUndefined();
    expect(timestampRef!.value[postId]).toBeUndefined();
  });

  it("clears the cached comments after reacting to one", async () => {
    const { usePostsStore } = await import("~/stores/posts");

    const app = createSSRApp({
      render: () => h("div"),
    });

    const pinia = createPinia();
    app.use(pinia);

    let store!: ReturnType<typeof usePostsStore>;
    app.runWithContext(() => {
      store = usePostsStore();
    });

    const postId = "post-1";
    const cacheRef =
      __getNuxtStateRef<Record<string, BlogCommentWithReplies[]>>("posts-comments-cache");
    const timestampRef = __getNuxtStateRef<Record<string, number>>("posts-comments-timestamps");

    cacheRef!.value = {
      ...cacheRef!.value,
      [postId]: [makeComment("comment-1")],
    };
    timestampRef!.value = {
      ...timestampRef!.value,
      [postId]: Date.now(),
    };

    const postsResponse = {
      data: [],
      page: 1,
      limit: 10,
      count: 0,
      cachedAt: Date.now(),
      revalidatedAt: null,
      fromCache: false,
    };

    const postResponse = {
      data: makePost(postId),
      cachedAt: Date.now(),
      fromCache: false,
    };

    fetchSpy.mockImplementation((url: unknown, options: Record<string, unknown> = {}) => {
      const method = typeof options.method === "string" ? options.method : undefined;

      if (typeof url === "string") {
        if (url.includes(`/v1/posts/${postId}/comments/comment-1/reactions`) && method === "POST") {
          return Promise.resolve({});
        }

        if (url === `/v1/posts/${postId}` && method === "GET") {
          return Promise.resolve(postResponse);
        }

        if (method === "GET") {
          return Promise.resolve(postsResponse);
        }
      }

      return Promise.resolve(postsResponse);
    });

    const sessionCookie = useCookie<string | null>("auth_session_token");
    sessionCookie.value = "token";

    await store.reactToComment(postId, "comment-1", "like");

    expect(cacheRef!.value[postId]).toBeUndefined();
    expect(timestampRef!.value[postId]).toBeUndefined();
  });

  it("includes the active world identifier when fetching posts", async () => {
    const { usePostsStore } = await import("~/stores/posts");
    const { getDefaultSiteSettings } = await import("~/lib/settings/defaults");
    const { useSiteSettingsState } = await import("~/composables/useSiteSettingsState");

    const app = createSSRApp({
      render: () => h("div"),
    });

    const pinia = createPinia();
    app.use(pinia);

    let store!: ReturnType<typeof usePostsStore>;
    let expectedWorldId: string | null = null;
    app.runWithContext(() => {
      const defaults = getDefaultSiteSettings();
      const siteSettingsState = useSiteSettingsState();
      siteSettingsState.value = {
        ...defaults,
        activeWorldId: defaults.worlds?.[0]?.id ?? "home",
      };

      expectedWorldId = siteSettingsState.value?.activeWorldId ?? null;
      store = usePostsStore();
    });

    const posts = [makePost("post-1")];
    const cachedAtIso = new Date().toISOString();

    fetchSpy.mockResolvedValueOnce({
      data: {
        data: posts,
        meta: {
          current_page: 1,
          per_page: 1,
          total: 1,
          cached_at: cachedAtIso,
          from_cache: false,
        },
      },
    });

    fetchSpy.mockResolvedValueOnce({
      data: posts,
      page: 1,
      limit: 1,
      count: 1,
      cachedAt: Date.parse(cachedAtIso),
      revalidatedAt: null,
      fromCache: false,
    });

    await store.fetchPosts({ params: { pageSize: 1 } });

    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/v1/posts"),
      expect.objectContaining({
        method: "GET",
        query: expect.objectContaining({
          page: 1,
          pageSize: 1,
          worldId: expectedWorldId ?? expect.any(String),
        }),
      }),
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("public/post"),
      expect.objectContaining({
        method: "GET",
        query: expect.objectContaining({
          page: 1,
          pageSize: 1,
          worldId: expectedWorldId ?? expect.any(String),
        }),
      }),
    );
  });

  it("resets cached posts when the active world changes", async () => {
    const { usePostsStore } = await import("~/stores/posts");
    const { getDefaultSiteSettings } = await import("~/lib/settings/defaults");
    const { useSiteSettingsState } = await import("~/composables/useSiteSettingsState");

    const app = createSSRApp({
      render: () => h("div"),
    });

    const pinia = createPinia();
    app.use(pinia);

    let store!: ReturnType<typeof usePostsStore>;
    let siteSettingsState!: ReturnType<typeof useSiteSettingsState>;
    app.runWithContext(() => {
      const defaults = getDefaultSiteSettings();
      siteSettingsState = useSiteSettingsState();
      siteSettingsState.value = {
        ...defaults,
        activeWorldId: defaults.worlds?.[0]?.id ?? null,
      };

      store = usePostsStore();
    });

    const firstWorldId = siteSettingsState.value?.activeWorldId ?? "home";
    const alternateWorld = siteSettingsState.value?.worlds?.find(
      (world) => world.id !== firstWorldId,
    );

    expect(alternateWorld).toBeDefined();

    const firstPosts = [makePost("post-home-1")];
    const timestamp = new Date().toISOString();

    fetchSpy.mockResolvedValueOnce({
      data: {
        data: firstPosts,
        meta: {
          current_page: 1,
          per_page: 1,
          total: 1,
          cached_at: timestamp,
          from_cache: false,
        },
      },
    });
    fetchSpy.mockResolvedValueOnce({
      data: firstPosts,
      page: 1,
      limit: 1,
      count: 1,
      cachedAt: Date.parse(timestamp),
      revalidatedAt: null,
      fromCache: false,
    });

    await store.fetchPosts({ params: { pageSize: 1 } });
    expect(store.posts.value.map((post) => post.id)).toEqual(["post-home-1"]);

    fetchSpy.mockReset();

    siteSettingsState.value = {
      ...siteSettingsState.value!,
      activeWorldId: alternateWorld!.id,
    };

    const secondPosts = [makePost("post-alt-1")];

    fetchSpy.mockResolvedValueOnce({
      data: {
        data: secondPosts,
        meta: {
          current_page: 1,
          per_page: 1,
          total: 1,
          cached_at: timestamp,
          from_cache: false,
        },
      },
    });
    fetchSpy.mockResolvedValueOnce({
      data: secondPosts,
      page: 1,
      limit: 1,
      count: 1,
      cachedAt: Date.parse(timestamp),
      revalidatedAt: null,
      fromCache: false,
    });

    await store.fetchPosts({ force: true, params: { pageSize: 1 } });

    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      expect.objectContaining({
        query: expect.objectContaining({ worldId: alternateWorld!.id }),
      }),
    );
    expect(store.posts.value.map((post) => post.id)).toEqual(["post-alt-1"]);
  });
});
