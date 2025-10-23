import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import { ref, type Ref } from "vue";

import BlogPostCard from "~/components/blog/BlogPostCard.vue";
import en from "~/i18n/locales/en.json";

const visibilityRef = ref(false);
const routeMock: { name: string; path: string; params: Record<string, unknown> } = {
  name: "world-worldSlug",
  path: "/world/home",
  params: { worldSlug: "home" },
};
const getCommentsMock = vi.fn<(postId: string) => Promise<unknown[]>>();
const notifyMock = vi.fn();

vi.mock("@vueuse/core", () => ({
  useElementVisibility: () => visibilityRef,
}));

vi.mock("~/composables/usePostsStore", () => ({
  usePostsStore: () => ({
    reactToPost: vi.fn(),
    addComment: vi.fn().mockResolvedValue(undefined),
    reactToComment: vi.fn().mockResolvedValue(undefined),
    getComments: (postId: string) => getCommentsMock(postId),
    updatePost: vi.fn(),
    deletePost: vi.fn(),
  }),
}));

vi.mock("~/composables/useNonBlockingTask", () => ({
  useNonBlockingTask: () => ({
    schedule: (task: () => void | Promise<void>) => {
      const result = task();

      if (result instanceof Promise) {
        return result;
      }

      return result;
    },
  }),
}));

vi.mock("~/composables/useSiteSettingsState", () => ({
  useSiteSettingsState: () => ref({
    activeWorldId: "world-home",
    worlds: [
      { id: "world-home", slug: "home" },
    ],
  }),
}));
const authState = {
  currentUser: ref(null),
  isAuthenticated: ref(true),
  following: ref<Record<string, boolean>>({}),
  followPending: ref<Record<string, boolean>>({}),
  followAuthor: vi.fn(),
  resetFollowError: vi.fn(),
};

vi.mock("~/composables/useAuthStore", () => ({
  useAuthStore: () => authState,
}));

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $notify: notifyMock,
  }),
  onNuxtReady: () => undefined,
}));

vi.mock("#imports", async () => {
  const vueI18n = await import("vue-i18n");

  return {
    useI18n: vueI18n.useI18n,
    useLocalePath: () => (route: unknown) => {
      if (typeof route === "string") {
        return route;
      }

      if (
        route &&
        typeof route === "object" &&
        "params" in route &&
        route.params &&
        typeof route.params === "object"
      ) {
        const params = route.params as Record<string, string>;

        if ("authorSlug" in params && "slug" in params) {
          return `/world/${params.slug}/author/${params.authorSlug}`;
        if ("worldSlug" in params && "postSlug" in params) {
          return `/world/${params.worldSlug}/post/${params.postSlug}`;
        }

        if ("slug" in params) {
          return `/post/${params.slug}`;
        }
      }

      return "/";
    },
    useRoute: () => routeMock,
  };
});

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: { en },
});

const translator = i18n.global;

(globalThis as Record<string, unknown>).useI18n = () => ({
  locale: translator.locale,
  t: translator.t.bind(translator),
});

(globalThis as Record<string, unknown>).useNuxtApp = () => ({
  $notify: notifyMock,
});

const defaultPost = {
  id: "post-1",
  title: "A delightful update",
  summary: "A short summary about the latest release.",
  content: "Full content",
  url: null,
  slug: "a-delightful-update",
  medias: [],
  isReacted: false,
  publishedAt: new Date().toISOString(),
  sharedFrom: null,
  reactions_count: 0,
  totalComments: 0,
  user: {
    id: "user-1",
    firstName: "Jane",
    lastName: "Doe",
    username: "jane",
    email: "jane@example.com",
    enabled: true,
    photo: null,
  },
  reactions_preview: [],
  comments_preview: [],
};

const reactionEmojis = {
  like: "👍",
  love: "❤️",
  wow: "😮",
  haha: "😂",
  sad: "😢",
  angry: "😡",
  dislike: "👎",
};

const reactionLabels = {
  like: "Like",
  love: "Love",
  wow: "Wow",
  haha: "Haha",
  sad: "Sad",
  angry: "Angry",
  dislike: "Dislike",
};

function mountComponent(overrides: Partial<typeof defaultPost> = {}) {
  return mount(BlogPostCard, {
    props: {
      post: { ...defaultPost, ...overrides },
      defaultAvatar: "https://example.com/avatar.png",
      reactionEmojis,
      reactionLabels,
    },
    global: {
      plugins: [i18n],
      stubs: {
        BaseCard: {
          template:
            "<div><header><slot name='header' /></header><section><slot /></section><footer><slot name='footer' /></footer></div>",
        },
        SidebarCard: { template: "<div><slot /></div>" },
        RadiantText: {
          template: "<div><slot /></div>",
        },
        PostMeta: {
          template: "<div data-test='post-meta'></div>",
        },
        CommentCard: {
          template: "<div data-test='comment-card'></div>",
        },
        BlogPostEditDialog: {
          template: "<div data-test='edit-dialog-stub'></div>",
        },
        BlogPostDeleteDialog: {
          template: "<div data-test='delete-dialog-stub'></div>",
        },
        NuxtLink: {
          props: ["to"],
          template:
            "<a :href=\"typeof to === 'string' ? to : (to && to.path ? to.path : '')\"><slot /></a>",
        },
        Icon: {
          template: "<i><slot /></i>",
        },
        teleport: true,
      },
    },
  });
}

describe("BlogPostCard", () => {
  beforeEach(() => {
    routeMock.name = "world-worldSlug";
    routeMock.path = "/world/home";
    routeMock.params = { worldSlug: "home" };
    visibilityRef.value = false;
    getCommentsMock.mockReset();
    getCommentsMock.mockResolvedValue([]);
    notifyMock.mockReset();
    authState.isAuthenticated.value = true;
  });

  it("keeps post and author links inactive until hydration", async () => {
    const wrapper = mountComponent();
    const exposed = wrapper.vm.$.exposed as {
      hydrate?: () => void;
      isHydrated: Ref<boolean>;
      isPostLinkActive: Ref<boolean>;
      authorLink: Ref<string | null>;
      postLink: Ref<string | null>;
      enablePostLink: Ref<boolean>;
    };

    const postLinkElement = wrapper.find("[data-test='blog-post-link']");

    expect(postLinkElement.element.tagName).toBe("DIV");
    expect(exposed?.isPostLinkActive.value).toBe(false);
    expect(exposed?.authorLink.value).toBeNull();

    exposed?.hydrate?.();
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(exposed?.postLink.value).toContain(defaultPost.slug);
    expect(exposed?.isHydrated.value).toBe(true);
    expect(exposed?.isPostLinkActive.value).toBe(true);
    expect(exposed?.enablePostLink.value).toBe(true);
    expect(exposed?.authorLink.value).not.toBeNull();
    expect(wrapper.find("[data-test='blog-post-link']").element.tagName).toBe("A");
  });

  it("uses the post URL when no slug is available", async () => {
    const url = "https://blog.example.com/posts/a-delightful-update";
    const wrapper = mountComponent({ slug: null, url });
    const exposed = wrapper.vm.$.exposed as {
      hydrate?: () => void;
      postLink: Ref<string | null>;
    };

    exposed?.hydrate?.();
    await flushPromises();
    await wrapper.vm.$nextTick();

    const postLink = wrapper.find("[data-test='blog-post-link']");

    expect(exposed?.postLinkProps.value?.to).toBe(url);
    expect(postLink.element.tagName).toBe("A");
    expect(exposed?.postLink.value).toBe(url);
    expect(exposed?.isPostLinkActive.value).toBe(true);
  });

  it("loads comments when the section becomes visible", async () => {
    const wrapper = mountComponent();

    expect(getCommentsMock).not.toHaveBeenCalled();

    visibilityRef.value = true;
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(getCommentsMock).toHaveBeenCalled();
    expect(getCommentsMock).toHaveBeenCalledWith(defaultPost.id);
  });
});
