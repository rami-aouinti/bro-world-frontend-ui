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
  };
}
