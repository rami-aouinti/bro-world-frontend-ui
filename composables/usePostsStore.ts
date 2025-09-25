import { computed } from "vue";
import type { BlogApiResponse, BlogPost, ReactionType } from "~/lib/mock/blog";

interface CreatePostPayload {
  content: string;
  title?: string;
  summary?: string;
}

interface FetchOptions {
  force?: boolean;
}

export function usePostsStore() {
  const postsState = useState<BlogPost[]>("posts", () => []);
  const pendingState = useState<boolean>("posts-pending", () => false);
  const errorState = useState<string | null>("posts-error", () => null);
  const lastFetchedState = useState<number | null>("posts-last-fetched", () => null);
  const creatingState = useState<boolean>("posts-creating", () => false);
  const createErrorState = useState<string | null>("posts-create-error", () => null);

  async function fetchPosts(options: FetchOptions = {}) {
    if (pendingState.value) {
      return postsState.value;
    }

    if (!options.force && postsState.value.length > 0) {
      return postsState.value;
    }

    pendingState.value = true;
    errorState.value = null;

    try {
      const response = await $fetch<BlogApiResponse>("/api/posts", {
        method: "GET",
      });

      if (response && Array.isArray(response.data)) {
        postsState.value = response.data;
      } else {
        throw new Error("Format de réponse inattendu");
      }
    } catch (error) {
      errorState.value = error instanceof Error ? error.message : String(error ?? "");
      postsState.value = [];
    } finally {
      pendingState.value = false;
      lastFetchedState.value = Date.now();
    }

    return postsState.value;
  }

  async function createPost(payload: CreatePostPayload) {
    if (creatingState.value) {
      return postsState.value;
    }

    const trimmedContent = payload.content?.trim();

    if (!trimmedContent) {
      const validationMessage = "Post content is required.";
      createErrorState.value = validationMessage;
      throw new Error(validationMessage);
    }

    creatingState.value = true;
    createErrorState.value = null;

    try {
      await $fetch("/api/posts", {
        method: "POST",
        body: {
          ...payload,
          content: trimmedContent,
        },
      });

      await fetchPosts({ force: true });

      return postsState.value;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error ?? "");
      createErrorState.value = message;
      throw new Error(message);
    } finally {
      creatingState.value = false;
    }
  }

  const updatePendingState = useState<Record<string, boolean>>("posts-update-pending", () => ({}));
  const updateErrorState = useState<Record<string, string | null>>("posts-update-error", () => ({}));
  const deletePendingState = useState<Record<string, boolean>>("posts-delete-pending", () => ({}));
  const deleteErrorState = useState<Record<string, string | null>>("posts-delete-error", () => ({}));

  async function reactToPost(postId: string, reactionType: ReactionType) {
    const trimmedPostId = postId?.trim();

    if (!trimmedPostId) {
      throw new Error("Post identifier is required.");
    }

    try {
      await $fetch(`/api/posts/${trimmedPostId}/reactions`, {
        method: "POST",
        body: { reactionType },
      });

      await fetchPosts({ force: true });

      return postsState.value;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error ?? "");
      throw new Error(message || "Unable to react to the post.");
    }
  }

  async function addComment(postId: string, content: string, parentCommentId?: string | null) {
    const trimmedPostId = postId?.trim();
    const trimmedContent = content?.trim();

    if (!trimmedPostId) {
      throw new Error("Post identifier is required.");
    }

    if (!trimmedContent) {
      throw new Error("Comment content is required.");
    }

    try {
      await $fetch(`/api/posts/${trimmedPostId}/comments`, {
        method: "POST",
        body: {
          content: trimmedContent,
          parentCommentId: parentCommentId?.trim() || null,
        },
      });

      await fetchPosts({ force: true });

      return postsState.value;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error ?? "");
      throw new Error(message || "Unable to add the comment.");
    }
  }

  async function reactToComment(postId: string, commentId: string, reactionType: ReactionType) {
    const trimmedPostId = postId?.trim();
    const trimmedCommentId = commentId?.trim();

    if (!trimmedPostId || !trimmedCommentId) {
      throw new Error("Post and comment identifiers are required.");
    }

    try {
      await $fetch(`/api/posts/${trimmedPostId}/comments/${trimmedCommentId}/reactions`, {
        method: "POST",
        body: { reactionType },
      });

      await fetchPosts({ force: true });

      return postsState.value;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error ?? "");
      throw new Error(message || "Unable to react to the comment.");
    }
  }

  async function updatePost(postId: string, payload: Partial<CreatePostPayload>) {
    const trimmedPostId = postId?.trim();

    if (!trimmedPostId) {
      throw new Error("Post identifier is required.");
    }

    const sanitizedPayload: Partial<CreatePostPayload> = {};

    if (typeof payload.content === "string") {
      sanitizedPayload.content = payload.content.trim();
    }

    if (typeof payload.title === "string") {
      sanitizedPayload.title = payload.title.trim();
    }

    if (typeof payload.summary === "string") {
      sanitizedPayload.summary = payload.summary.trim();
    }

    if (!sanitizedPayload.content && !sanitizedPayload.title && !sanitizedPayload.summary) {
      throw new Error("At least one field is required to update the post.");
    }

    updatePendingState.value = {
      ...updatePendingState.value,
      [trimmedPostId]: true,
    };
    updateErrorState.value = {
      ...updateErrorState.value,
      [trimmedPostId]: null,
    };

    try {
      await $fetch(`/api/posts/${encodeURIComponent(trimmedPostId)}`, {
        method: "PUT",
        body: sanitizedPayload,
      });

      postsState.value = postsState.value.map((post) => {
        if (post.id !== trimmedPostId) {
          return post;
        }

        return {
          ...post,
          ...("title" in sanitizedPayload ? { title: sanitizedPayload.title ?? post.title } : {}),
          ...("summary" in sanitizedPayload ? { summary: sanitizedPayload.summary ?? post.summary } : {}),
          ...("content" in sanitizedPayload ? { content: sanitizedPayload.content ?? post.content } : {}),
        };
      });

      return postsState.value.find((post) => post.id === trimmedPostId) ?? null;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error ?? "");

      updateErrorState.value = {
        ...updateErrorState.value,
        [trimmedPostId]: message,
      };

      throw new Error(message || "Unable to update the post.");
    } finally {
      const { [trimmedPostId]: _, ...restPending } = updatePendingState.value;
      updatePendingState.value = restPending;
    }
  }

  async function deletePost(postId: string) {
    const trimmedPostId = postId?.trim();

    if (!trimmedPostId) {
      throw new Error("Post identifier is required.");
    }

    deletePendingState.value = {
      ...deletePendingState.value,
      [trimmedPostId]: true,
    };
    deleteErrorState.value = {
      ...deleteErrorState.value,
      [trimmedPostId]: null,
    };

    try {
      await $fetch(`/api/posts/${encodeURIComponent(trimmedPostId)}`, {
        method: "DELETE",
      });

      postsState.value = postsState.value.filter((post) => post.id !== trimmedPostId);

      return postsState.value;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error ?? "");

      deleteErrorState.value = {
        ...deleteErrorState.value,
        [trimmedPostId]: message,
      };

      throw new Error(message || "Unable to delete the post.");
    } finally {
      const { [trimmedPostId]: _, ...restPending } = deletePendingState.value;
      deletePendingState.value = restPending;
    }
  }

  return {
    posts: computed(() => postsState.value),
    pending: computed(() => pendingState.value),
    error: computed(() => errorState.value),
    lastFetched: computed(() => lastFetchedState.value),
    fetchPosts,
    createPost,
    creating: computed(() => creatingState.value),
    createError: computed(() => createErrorState.value),
    reactToPost,
    addComment,
    reactToComment,
    updatePost,
    deletePost,
    updatePending: computed(() => updatePendingState.value),
    updateError: computed(() => updateErrorState.value),
    deletePending: computed(() => deletePendingState.value),
    deleteError: computed(() => deleteErrorState.value),
  };
}
