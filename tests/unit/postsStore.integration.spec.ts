import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { createSSRApp, h } from "vue";
import { createPinia } from "~/lib/pinia-shim";

const fetchSpy = vi.fn();

vi.mock("~/lib/api/fetcher", () => ({
  resolveApiFetcher: () => fetchSpy,
}));

function buildResponse() {
  return JSON.parse(
    JSON.stringify({
      data: [
        {
          id: "dd4f2d60-74b1-11f0-803e-deeb985c6906",
          title: "Aliquam sodales odio id eleifend tristique",
          summary:
            "Est rem et aut quo possimus voluptas molestiae temporibus doloremque praesentium qui.",
          content: "Et voluptas labore voluptatem et.",
          url: null,
          slug: "aliquam-sodales-odio-id-eleifend-tristique",
          medias: [],
          isReacted: null,
          publishedAt: "2025-07-31T09:40:00+00:00",
          sharedFrom: null,
          reactions_count: 5,
          totalComments: 1,
          user: {
            id: "20000000-0000-1000-8000-000000000006",
            firstName: "Bro",
            lastName: "World",
            username: "john-root",
            email: "john.doe-root@test.com",
            enabled: false,
            stories: [],
            friends: [],
            photo: "https://bro-world.org/uploads/avatar/rami-6899f39d19c824.76369460.jpg",
          },
          reactions_preview: [],
          comments_preview: [],
        },
        {
          id: "dd4f4a98-74b1-11f0-8f00-deeb985c6906",
          title: "Urna nisl sollicitudin id varius orci quam id turpis",
          summary: "Pariatur nihil velit sed molestiae mollitia voluptas harum.",
          content: "Omnis aut placeat ipsum sit et.",
          url: null,
          slug: "urna-nisl-sollicitudin-id-varius-orci-quam-id-turpis",
          medias: [],
          isReacted: null,
          publishedAt: "2025-07-30T16:41:00+00:00",
          sharedFrom: null,
          reactions_count: 5,
          totalComments: 4,
          user: {
            id: "20000000-0000-1000-8000-000000000002",
            firstName: "Julien",
            lastName: "Doe",
            username: "john-logged",
            email: "john.doe-logged@test.com",
            enabled: false,
            stories: [],
            friends: [],
            photo: "https://bro-world-space.com/img/person.png",
          },
          reactions_preview: [],
          comments_preview: [],
        },
      ],
      page: 1,
      limit: 10,
      count: 300,
    }),
  );
}

describe("posts store integration", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    fetchSpy.mockReset();
    fetchSpy.mockResolvedValue(buildResponse());
    vi.stubGlobal("$fetch", fetchSpy);
    vi.stubGlobal("useRuntimeConfig", () => ({
      redis: { listTtl: 60, itemTtl: 300 },
      public: {
        apiBase: "/api",
        postsApiBase: "https://bro-world.org",
        redis: { listTtl: 60, itemTtl: 300 },
      },
    }));
    vi.stubGlobal("structuredClone", <T>(value: T) => JSON.parse(JSON.stringify(value)) as T);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes Bro World API responses", async () => {
    const { usePostsStore } = await import("~/stores/posts");

    const app = createSSRApp({ render: () => h("div") });
    const pinia = createPinia();
    app.use(pinia);

    let store!: ReturnType<typeof usePostsStore>;
    app.runWithContext(() => {
      store = usePostsStore();
    });

    const result = await store.fetchPosts();

    expect(result).toHaveLength(2);
    expect(store.posts.value.map((post) => post.id)).toEqual([
      "dd4f2d60-74b1-11f0-803e-deeb985c6906",
      "dd4f4a98-74b1-11f0-8f00-deeb985c6906",
    ]);
    expect(store.totalCount.value).toBe(300);
    expect(store.pageSize.value).toBe(10);
  });
});
