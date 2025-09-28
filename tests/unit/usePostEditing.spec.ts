import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";

import { usePostEditing } from "~/composables/usePostEditing";
import type { BlogPost } from "~/lib/mock/blog";

const updatePostMock = vi.fn<(postId: string, payload: Record<string, unknown>) => Promise<void>>();
const deletePostMock = vi.fn<(postId: string) => Promise<void>>();
const notifyMock = vi.fn();

vi.mock("~/composables/usePostsStore", () => ({
  usePostsStore: () => ({
    updatePost: updatePostMock,
    deletePost: deletePostMock,
  }),
}));

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $notify: notifyMock,
  }),
}));

vi.mock("#imports", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe("usePostEditing", () => {
  const basePost: BlogPost = {
    id: "post-1",
    title: "Initial title",
    summary: "Initial summary",
    content: "Initial content",
    url: null,
    slug: "post-1",
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

  beforeEach(() => {
    updatePostMock.mockReset().mockResolvedValue();
    deletePostMock.mockReset().mockResolvedValue();
    notifyMock.mockReset();
  });

  it("initialises the form with the post content", async () => {
    const postRef = ref<BlogPost>({ ...basePost });

    const { editForm } = usePostEditing(postRef);

    await nextTick();

    expect(editForm.title).toBe(basePost.title);
    expect(editForm.summary).toBe(basePost.summary);
    expect(editForm.content).toBe(basePost.content);
  });

  it("saves changes and shows a success notification", async () => {
    const postRef = ref<BlogPost>({ ...basePost });
    const { editForm, handleSaveEdit } = usePostEditing(postRef);

    editForm.title = "Updated title";
    editForm.summary = "Updated summary";

    const result = await handleSaveEdit();

    expect(result).toBe(true);
    expect(updatePostMock).toHaveBeenCalledWith(basePost.id, {
      title: "Updated title",
      summary: "Updated summary",
      content: basePost.content,
    });
    expect(notifyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
          title: "blog.posts.actions.editSuccessTitle",
        }),
    );
  });

  it("reports errors when saving fails", async () => {
    const postRef = ref<BlogPost>({ ...basePost });
    updatePostMock.mockRejectedValueOnce(new Error("Save failed"));

    const { handleSaveEdit } = usePostEditing(postRef);

    const result = await handleSaveEdit();

    expect(result).toBe(false);
    expect(notifyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          title: "blog.posts.actions.editErrorTitle",
        }),
    );
  });

  it("deletes the post and notifies success", async () => {
    const postRef = ref<BlogPost>({ ...basePost });

    const { handleDeletePost } = usePostEditing(postRef);

    const result = await handleDeletePost();

    expect(result).toBe(true);
    expect(deletePostMock).toHaveBeenCalledWith(basePost.id);
    expect(notifyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
          title: "blog.posts.actions.deleteSuccessTitle",
        }),
    );
  });

  it("reports delete errors", async () => {
    const postRef = ref<BlogPost>({ ...basePost });
    deletePostMock.mockRejectedValueOnce(new Error("Delete failed"));

    const { handleDeletePost } = usePostEditing(postRef);

    const result = await handleDeletePost();

    expect(result).toBe(false);
    expect(notifyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          title: "blog.posts.actions.deleteErrorTitle",
        }),
    );
  });

  it("refreshes the form when the post changes", async () => {
    const postRef = ref<BlogPost>({ ...basePost });

    const { editForm } = usePostEditing(postRef);

    await nextTick();

    postRef.value = {
      ...basePost,
      id: "post-2",
      title: "Another title",
    };

    await nextTick();

    expect(editForm.title).toBe("Another title");
  });
});
