import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import { ref } from "vue";

import BlogPostCard from "~/components/blog/BlogPostCard.vue";
import en from "~/i18n/locales/en.json";

const visibilityRef = ref(false);
const getCommentsMock = vi.fn<(postId: string) => Promise<unknown[]>>();

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

vi.mock("~/composables/useAuthStore", () => ({
  useAuthStore: () => ({
    currentUser: ref(null),
    isAuthenticated: ref(false),
    following: ref({}),
    followPending: ref({}),
    followAuthor: vi.fn(),
    resetFollowError: vi.fn(),
  }),
}));

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $notify: vi.fn(),
  }),
}));

vi.mock("#imports", async () => {
  const vueI18n = await import("vue-i18n");

  return {
    useI18n: vueI18n.useI18n,
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

const notifyMock = vi.fn();

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

function mountComponent() {
  return mount(BlogPostCard, {
    props: {
      post: defaultPost,
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
        teleport: true,
      },
    },
  });
}

describe("BlogPostCard", () => {
  beforeEach(() => {
    visibilityRef.value = false;
    getCommentsMock.mockReset();
    getCommentsMock.mockResolvedValue([]);
    notifyMock.mockReset();
  });

  it("loads comments when the section becomes visible", async () => {
    const wrapper = mountComponent();

    expect(getCommentsMock).not.toHaveBeenCalled();

    visibilityRef.value = true;
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(getCommentsMock).toHaveBeenCalledTimes(1);
    expect(getCommentsMock).toHaveBeenCalledWith(defaultPost.id);
  });

  it("allows manual loading via the fallback control", async () => {
    const wrapper = mountComponent();

    const loadButton = wrapper.find("[data-test='load-comments-button']");
    expect(loadButton.exists()).toBe(true);

    await loadButton.trigger("click");
    await flushPromises();

    expect(getCommentsMock).toHaveBeenCalledTimes(1);
    expect(getCommentsMock).toHaveBeenCalledWith(defaultPost.id);
  });
});

