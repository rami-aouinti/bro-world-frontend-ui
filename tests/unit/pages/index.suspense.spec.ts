import { flushPromises, mount } from "@vue/test-utils";
import { Suspense, defineComponent, h, nextTick, ref, type Component } from "vue";
import { describe, expect, beforeEach, afterEach, it, vi } from "vitest";

import IndexPage from "~/pages/index.vue";

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

const createMockComponent = vi.hoisted(
  () => (name: string, slot?: string) =>
    defineComponent({
      name,
      setup(_, { slots }) {
        return () =>
          h(
            "div",
            {
              "data-test": name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(),
            },
            slot ? slot : slots.default?.(),
          );
      },
    }),
);

const asyncComponentDeferreds = vi.hoisted(() => ({
  stories: { current: createDeferred<{ __esModule: true; default: Component }>() },
  storyViewer: { current: createDeferred<{ __esModule: true; default: Component }>() },
  blogPost: { current: createDeferred<{ __esModule: true; default: Component }>() },
}));

const storiesStripDeferredRef = asyncComponentDeferreds.stories;
const storyViewerDeferredRef = asyncComponentDeferreds.storyViewer;
const blogPostDeferredRef = asyncComponentDeferreds.blogPost;

vi.mock("@vueuse/core", () => ({
  useIntersectionObserver: vi.fn(() => ({ stop: vi.fn() })),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("~/components/layout/SidebarCard.vue", () => ({
  __esModule: true,
  default: createMockComponent("SidebarCard"),
}));

vi.mock("~/components/blog/NewPost.vue", () => ({
  __esModule: true,
  default: createMockComponent("NewPost"),
}));

vi.mock("~/components/blog/NewPostSkeleton.vue", () => ({
  __esModule: true,
  default: createMockComponent("NewPostSkeleton", "new-post-skeleton"),
}));

vi.mock("~/components/stories/StoriesStripSkeleton.vue", () => ({
  __esModule: true,
  default: createMockComponent("StoriesStripSkeleton", "stories-strip-skeleton"),
}));

vi.mock("~/components/blog/PostCardSkeleton.vue", () => ({
  __esModule: true,
  default: createMockComponent("PostCardSkeleton", "post-card-skeleton"),
}));

vi.mock("~/components/stories/StoriesStrip.vue", () => storiesStripDeferredRef.current.promise);

vi.mock("~/components/stories/StoryViewerModal.vue", () => storyViewerDeferredRef.current.promise);

vi.mock("~/components/blog/BlogPostCard.vue", () => blogPostDeferredRef.current.promise);
vi.mock("~/lib/prefetch/blog-post-card", () => {
  const loader = vi.fn(() => blogPostDeferredRef.current.promise);

  return {
    blogPostCardLoader: loader,
    prefetchBlogPostCard: vi.fn(() => loader()),
  };
});

const isReady = ref(true);
const isAuthenticated = ref(true);
const currentUser = ref<{ firstName?: string; lastName?: string } | null>({
  firstName: "Test",
  lastName: "User",
});

vi.mock("~/stores/auth-session", () => ({
  useAuthSession: () => ({
    isReady,
    isAuthenticated,
    currentUser,
  }),
}));

const storyItems = ref([]);
const preferredName = ref<string | null>(null);
const avatarUrl = ref("/images/avatar.svg");

vi.mock("~/stores/profile", () => ({
  useProfileStore: () => ({
    storyItems,
    preferredName,
    avatarUrl,
  }),
}));

const posts = ref<Array<Record<string, unknown>>>([]);
const pending = ref(false);
const loadingMore = ref(false);
const hasMore = ref(false);
const error = ref<string | null>(null);
const pageSize = ref(6);
const fetchPosts = vi.fn(async () => {});
const fetchMorePosts = vi.fn(async () => {});
const createPost = vi.fn();

vi.mock("~/composables/usePostsStore", () => ({
  usePostsStore: () => ({
    posts,
    pending,
    loadingMore,
    hasMore,
    error,
    fetchPosts,
    fetchMorePosts,
    createPost,
    pageSize,
  }),
}));

const schedule = vi.fn((task: () => void | Promise<void>) => {
  const result = task();

  if (result instanceof Promise) {
    return result;
  }

  return undefined;
});

vi.mock("~/composables/useNonBlockingTask", () => ({
  useNonBlockingTask: () => ({
    schedule,
  }),
}));

const SuspenseHarness = defineComponent({
  name: "SuspenseHarness",
  setup() {
    return () =>
      h(
        Suspense,
        {},
        {
          default: () => h(IndexPage),
          fallback: () => h("div", { "data-test": "outer-suspense-fallback" }),
        },
      );
  },
});

describe("pages/index Suspense fallbacks", () => {
  beforeEach(() => {
    storiesStripDeferredRef.current = createDeferred<{ __esModule: true; default: Component }>();
    storyViewerDeferredRef.current = createDeferred<{ __esModule: true; default: Component }>();
    blogPostDeferredRef.current = createDeferred<{ __esModule: true; default: Component }>();

    posts.value = [];

    pending.value = false;
    loadingMore.value = false;
    hasMore.value = false;
    error.value = null;

    fetchPosts.mockClear();
    fetchMorePosts.mockClear();
    createPost.mockClear();

    schedule.mockClear();

    (
      globalThis as {
        useNuxtApp?: () => { isHydrating: boolean; $i18n: { t: (key: string) => string } };
      }
    ).useNuxtApp = () => ({
      isHydrating: false,
      $i18n: { t: (key: string) => key },
    });
  });

  afterEach(() => {
    delete (globalThis as { useNuxtApp?: () => unknown }).useNuxtApp;
  });

  it("renders Suspense fallbacks while async components load", async () => {
    const wrapper = mount(SuspenseHarness, {
      global: {
        components: {
          NewPost: createMockComponent("NewPost"),
          SidebarCard: createMockComponent("SidebarCard"),
          PostCardSkeleton: createMockComponent("PostCardSkeleton", "post-card-skeleton"),
        },
      },
    });

    await flushPromises();
    await nextTick();

    const page = wrapper.getComponent(IndexPage);

    posts.value = [
      {
        id: "1",
        title: "First post",
      },
    ];

    await flushPromises();
    await nextTick();

    expect(page.find('[data-test="stories-strip-skeleton"]').exists()).toBe(true);
    expect(page.find('[data-test="post-card-skeleton"]').exists()).toBe(true);

    storiesStripDeferredRef.current.resolve({
      __esModule: true,
      default: defineComponent({
        name: "StoriesStrip",
        setup: () => () => h("div", { "data-test": "stories-strip" }, "stories"),
      }),
    });

    blogPostDeferredRef.current.resolve({
      __esModule: true,
      default: defineComponent({
        name: "BlogPostCard",
        setup: () => () => h("div", { "data-test": "blog-post-card" }, "blog-post"),
      }),
    });

    await flushPromises();
    await nextTick();

    await flushPromises();
    await nextTick();
    await flushPromises();
    await nextTick();

    expect(page.find('[data-test="stories-strip-skeleton"]').exists()).toBe(false);
    expect(page.find('[data-test="stories-strip"]').exists()).toBe(true);

    expect(page.find('[data-test="post-card-skeleton"]').exists()).toBe(false);
    expect(page.find('[data-test="blog-post-card"]').exists()).toBe(true);
  });
});
