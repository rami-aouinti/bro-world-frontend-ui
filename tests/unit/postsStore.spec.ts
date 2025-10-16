import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, h } from "vue";

import { createPinia } from "~/lib/pinia-shim";
import type { BlogPost } from "~/lib/mock/blog";
import {
  __getNuxtStateRef,
  __requestFetchSpy,
  __resetNuxtStateMocks,
  __resetRequestFetchMock,
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
  return {
    id,
    title: `Title ${id}`,
    summary: `Summary ${id}`,
    content: `Content ${id}`,
    url: null,
    slug: `slug-${id}`,
    medias: [],
    isReacted: null,
    publishedAt: new Date(2024, 0, Number(id.replace("post-", "")) + 1).toISOString(),
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

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/v1/posts",
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
      `/api/v1/posts/${post1.id}`,
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

    expect(fetchSpy).toHaveBeenCalledTimes(1);

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
});
