import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import { computed, reactive, ref } from "vue";
import PostCard from "~/components/PostCard.vue";
import en from "~/i18n/locales/en.json";
import type { BlogPost, ReactionType } from "~/lib/mock/blog";

vi.mock("#imports", async () => {
  const vueI18n = await import("vue-i18n");

  return {
    useI18n: vueI18n.useI18n,
  };
});

const toastSpy = vi.fn();

vi.mock("~/components/content/common/toast", () => ({
  toast: (...args: unknown[]) => {
    toastSpy(...args);
  },
}));

const reactionEmojis: Record<ReactionType, string> = {
  like: "👍",
  love: "❤️",
  wow: "😮",
  haha: "😂",
  sad: "😢",
  angry: "😡",
};

const reactionLabels: Record<ReactionType, string> = {
  like: "Like",
  love: "Love",
  wow: "Wow",
  haha: "Haha",
  sad: "Sad",
  angry: "Angry",
};

const basePost: BlogPost = {
  id: "post-1",
  title: "Sample title",
  summary: "Sample summary",
  content: "Sample content",
  url: null,
  slug: "sample-title",
  medias: [],
  isReacted: null,
  publishedAt: new Date().toISOString(),
  sharedFrom: null,
  reactions_count: 3,
  totalComments: 2,
  user: {
    id: "author-1",
    firstName: "Author",
    lastName: "Example",
    username: "author",
    email: "author@example.com",
    enabled: true,
    photo: null,
  },
  reactions_preview: [],
  comments_preview: [],
};

const currentUserRef = ref(basePost.user);
const followingState = reactive<Record<string, boolean>>({});
const followPendingState = reactive<Record<string, boolean>>({});
const resetFollowError = vi.fn();
const followAuthorSpy = vi.fn(async (authorId: string) => {
  followPendingState[authorId] = true;
  await Promise.resolve();
  followPendingState[authorId] = false;
  followingState[authorId] = true;
});

const updatePostSpy = vi.fn(async () => Promise.resolve());
const deletePostSpy = vi.fn(async () => Promise.resolve());
const reactToPostSpy = vi.fn(async () => Promise.resolve());
const addCommentSpy = vi.fn(async () => Promise.resolve());
const reactToCommentSpy = vi.fn(async () => Promise.resolve());

vi.mock("~/composables/useAuthStore", () => ({
  useAuthStore: () => ({
    currentUser: computed(() => currentUserRef.value),
    isAuthenticated: computed(() => currentUserRef.value !== null),
    following: computed(() => followingState),
    followPending: computed(() => followPendingState),
    followAuthor: followAuthorSpy,
    resetFollowError,
  }),
}));

vi.mock("~/composables/usePostsStore", () => ({
  usePostsStore: () => ({
    reactToPost: reactToPostSpy,
    addComment: addCommentSpy,
    reactToComment: reactToCommentSpy,
    updatePost: updatePostSpy,
    deletePost: deletePostSpy,
  }),
}));

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: { en },
});

function mountComponent(overrides: Partial<BlogPost> = {}) {
  return mount(PostCard, {
    props: {
      post: { ...basePost, ...overrides },
      defaultAvatar: "https://example.com/avatar.png",
      reactionEmojis,
      reactionLabels,
    },
    global: {
      plugins: [i18n],
    },
  });
}

function setViewerAs(authorId: string | null) {
  if (!authorId) {
    currentUserRef.value = null;
    return;
  }

  currentUserRef.value = {
    id: authorId,
    firstName: "Viewer",
    lastName: "User",
    username: "viewer",
    email: "viewer@example.com",
    enabled: true,
    photo: null,
  };
}

beforeEach(() => {
  followAuthorSpy.mockClear();
  updatePostSpy.mockClear();
  deletePostSpy.mockClear();
  reactToPostSpy.mockClear();
  addCommentSpy.mockClear();
  reactToCommentSpy.mockClear();
  resetFollowError.mockClear();
  toastSpy.mockReset();

  Object.keys(followingState).forEach((key) => {
    delete followingState[key];
  });
  Object.keys(followPendingState).forEach((key) => {
    delete followPendingState[key];
  });

  setViewerAs(basePost.user.id);
});

describe("PostCard interactions", () => {
  it("allows a viewer to follow the author", async () => {
    setViewerAs("viewer-1");

    const wrapper = mountComponent();

    const followButton = wrapper.find("[data-test='follow-button']");
    expect(followButton.exists()).toBe(true);

    await followButton.trigger("click");

    expect(followAuthorSpy).toHaveBeenCalledWith(basePost.user.id);
    expect(toastSpy).toHaveBeenCalled();
  });

  it("opens the edit modal and saves changes", async () => {
    const wrapper = mountComponent();

    const trigger = wrapper.find("[data-test='post-actions-trigger']");
    expect(trigger.exists()).toBe(true);

    await trigger.trigger("click");
    await wrapper.find("[data-test='post-action-edit']").trigger("click");

    const titleInput = wrapper.find("input");
    const textareas = wrapper.findAll("textarea");

    await titleInput.setValue("Updated title");
    await textareas[0].setValue("Updated summary");
    await textareas[1].setValue("Updated content");

    const saveButton = wrapper.findAll("button").find((button) => button.text() === en.blog.posts.actions.save);
    expect(saveButton).toBeDefined();

    await saveButton!.trigger("submit");

    expect(updatePostSpy).toHaveBeenCalledWith(basePost.id, {
      title: "Updated title",
      summary: "Updated summary",
      content: "Updated content",
    });
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: en.blog.posts.actions.editSuccessTitle }),
    );
  });

  it("confirms deletion of the post", async () => {
    const wrapper = mountComponent();

    await wrapper.find("[data-test='post-actions-trigger']").trigger("click");
    await wrapper.find("[data-test='post-action-delete']").trigger("click");

    const confirmButton = wrapper
      .findAll("button")
      .find((button) => button.text() === en.blog.posts.actions.deleteConfirm);

    expect(confirmButton).toBeDefined();

    await confirmButton!.trigger("click");

    expect(deletePostSpy).toHaveBeenCalledWith(basePost.id);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: en.blog.posts.actions.deleteSuccessTitle }),
    );
  });
});
