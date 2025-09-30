import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { computed, nextTick, ref } from "vue";
import { createI18n } from "vue-i18n";
import type { BlogPost } from "~/lib/mock/blog";
import type IndexPageComponent from "~/pages/index.vue";
import en from "~/i18n/locales/en.json";

vi.mock("#imports", async () => {
  const vueI18n = await import("vue-i18n");

  return {
    useI18n: vueI18n.useI18n,
    callOnce: (fn: () => unknown) => fn(),
    definePageMeta: () => {},
  };
});

vi.mock("~/composables/useAuthStore", () => ({
  useAuthStore: () => ({
    isAuthenticated: computed(() => false),
  }),
}));

const INITIAL_PAGE_SIZE = 6;

const postsRef = ref<BlogPost[]>([]);
const pendingRef = ref(false);
const loadingMoreRef = ref(false);
const hasMoreRef = ref(true);
const pageSizeRef = ref(INITIAL_PAGE_SIZE);
const fetchPostsMock = vi.fn<() => Promise<BlogPost[]>>();
const fetchMorePostsMock =
  vi.fn<(options?: { params: { pageSize: number } }) => Promise<BlogPost[]>>();
let resolveLoadMore: (() => void) | null = null;

(
  globalThis as typeof globalThis & { definePageMeta?: (...args: unknown[]) => void }
).definePageMeta = () => {};
(globalThis as typeof globalThis & { useI18n?: () => { t: (key: string) => string } }).useI18n =
  () => ({
    t: (key: string) => key,
  });

let IndexPage: typeof IndexPageComponent;

interface MockIntersectionObserverInstance {
  trigger: (isIntersecting?: boolean) => void;
}

class MockIntersectionObserver implements MockIntersectionObserverInstance {
  public static instances: MockIntersectionObserver[] = [];

  private readonly callback: IntersectionObserverCallback;
  private readonly elements: Element[] = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe(element: Element) {
    this.elements.push(element);
  }

  unobserve(element: Element) {
    const index = this.elements.indexOf(element);

    if (index !== -1) {
      this.elements.splice(index, 1);
    }
  }

  disconnect() {
    this.elements.length = 0;
  }

  trigger(isIntersecting = true) {
    const entries = this.elements.map((element) => ({
      isIntersecting,
      target: element,
      time: 0,
      intersectionRatio: isIntersecting ? 1 : 0,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
    })) as IntersectionObserverEntry[];

    this.callback(entries, this as unknown as IntersectionObserver);
  }
}

Object.defineProperty(globalThis, "IntersectionObserver", {
  configurable: true,
  writable: true,
  value: MockIntersectionObserver,
});

const BlogPostCardStub = {
  name: "BlogPostCard",
  props: {
    post: {
      type: Object,
      required: true,
    },
  },
  template: '<article :data-id="post.id" data-test="blog-post-card">{{ post.title }}</article>',
};

const PostCardSkeletonStub = {
  name: "PostCardSkeleton",
  template: '<div role="status" data-test="post-card-skeleton">Loading…</div>',
};

vi.mock("~/composables/usePostsStore", () => ({
  usePostsStore: () => ({
    posts: computed(() => postsRef.value),
    pending: computed(() => pendingRef.value),
    loadingMore: computed(() => loadingMoreRef.value),
    hasMore: computed(() => hasMoreRef.value),
    pageSize: computed(() => pageSizeRef.value),
    fetchPosts: fetchPostsMock,
    fetchMorePosts: fetchMorePostsMock,
    createPost: vi.fn(),
  }),
}));

describe("Home page infinite post loading", () => {
  const initialPosts: BlogPost[] = Array.from({ length: INITIAL_PAGE_SIZE }).map((_, index) => ({
    id: `post-${index + 1}`,
    title: `Post ${index + 1}`,
    summary: "",
    content: "",
    url: null,
    slug: `post-${index + 1}`,
    medias: [],
    isReacted: null,
    publishedAt: new Date().toISOString(),
    sharedFrom: null,
    reactions_count: 0,
    totalComments: 0,
    user: {
      id: `author-${index + 1}`,
      firstName: "Author",
      lastName: `${index + 1}`,
      username: `author-${index + 1}`,
      email: `author-${index + 1}@example.com`,
      enabled: true,
      photo: null,
    },
    reactions_preview: [],
    comments_preview: [],
  }));

  const additionalPosts: BlogPost[] = Array.from({ length: 2 }).map((_, index) => ({
    id: `post-${INITIAL_PAGE_SIZE + index + 1}`,
    title: `Post ${INITIAL_PAGE_SIZE + index + 1}`,
    summary: "",
    content: "",
    url: null,
    slug: `post-${INITIAL_PAGE_SIZE + index + 1}`,
    medias: [],
    isReacted: null,
    publishedAt: new Date().toISOString(),
    sharedFrom: null,
    reactions_count: 0,
    totalComments: 0,
    user: {
      id: `author-${INITIAL_PAGE_SIZE + index + 1}`,
      firstName: "Author",
      lastName: `${INITIAL_PAGE_SIZE + index + 1}`,
      username: `author-${INITIAL_PAGE_SIZE + index + 1}`,
      email: `author-${INITIAL_PAGE_SIZE + index + 1}@example.com`,
      enabled: true,
      photo: null,
    },
    reactions_preview: [],
    comments_preview: [],
  }));

  const i18n = createI18n({
    legacy: false,
    locale: "en",
    messages: { en },
  });

  beforeEach(async () => {
    MockIntersectionObserver.instances.length = 0;
    postsRef.value = initialPosts.slice();
    pendingRef.value = false;
    loadingMoreRef.value = false;
    hasMoreRef.value = true;
    pageSizeRef.value = INITIAL_PAGE_SIZE;
    resolveLoadMore = null;
    fetchPostsMock.mockReset();
    fetchMorePostsMock.mockReset();

    fetchPostsMock.mockImplementation(async () => postsRef.value);

    fetchMorePostsMock.mockImplementation(() => {
      loadingMoreRef.value = true;

      return new Promise<BlogPost[]>((resolve) => {
        resolveLoadMore = () => {
          postsRef.value = [...postsRef.value, ...additionalPosts];
          hasMoreRef.value = false;
          loadingMoreRef.value = false;
          resolve(postsRef.value);
        };
      });
    });

    IndexPage = (await import("~/pages/index.vue")).default;
  });

  it("loads more posts on scroll without shifting existing cards", async () => {
    const wrapper = mount(
      {
        components: { IndexPage },
        template: "<Suspense><IndexPage /></Suspense>",
      },
      {
        global: {
          plugins: [i18n],
          stubs: {
            NewPost: { template: "<div />" },
            BlogPostCard: BlogPostCardStub,
            PostCardSkeleton: PostCardSkeletonStub,
          },
        },
      },
    );

    await flushPromises();
    await nextTick();

    const pageWrapper = wrapper.getComponent(IndexPage);

    const initialCards = pageWrapper.findAll('[data-test="blog-post-card"]');
    expect(initialCards).toHaveLength(initialPosts.length);

    const initialFirstCardId = initialCards[0].attributes("data-id");
    expect(initialFirstCardId).toBe(initialPosts[0].id);

    expect(MockIntersectionObserver.instances.length).toBeGreaterThan(0);
    const observer = MockIntersectionObserver.instances[0];
    observer.trigger(true);

    await flushPromises();

    expect(fetchMorePostsMock).toHaveBeenCalledWith(
      expect.objectContaining({ params: { pageSize: INITIAL_PAGE_SIZE } }),
    );

    const loadingPlaceholder = pageWrapper.find('[data-test="posts-loading-more"]');
    expect(loadingPlaceholder.exists()).toBe(true);

    const firstCardDuringLoad = pageWrapper.find('[data-test="blog-post-card"]');
    expect(firstCardDuringLoad.attributes("data-id")).toBe(initialFirstCardId);

    expect(resolveLoadMore).toBeTypeOf("function");
    resolveLoadMore?.();

    await flushPromises();
    await nextTick();

    const allCards = pageWrapper.findAll('[data-test="blog-post-card"]');
    expect(allCards).toHaveLength(initialPosts.length + additionalPosts.length);
    expect(allCards[0].attributes("data-id")).toBe(initialFirstCardId);
    expect(pageWrapper.find('[data-test="posts-loading-more"]').exists()).toBe(false);
    expect(hasMoreRef.value).toBe(false);
  });
});
