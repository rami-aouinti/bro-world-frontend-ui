import { computed } from "vue";
import type { BlogApiResponse, BlogPost } from "~/lib/mock/blog";

interface FetchOptions {
  force?: boolean;
}

export function usePostsStore() {
  const postsState = useState<BlogPost[]>("posts", () => []);
  const pendingState = useState<boolean>("posts-pending", () => false);
  const errorState = useState<string | null>("posts-error", () => null);
  const lastFetchedState = useState<number | null>("posts-last-fetched", () => null);

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

  return {
    posts: computed(() => postsState.value),
    pending: computed(() => pendingState.value),
    error: computed(() => errorState.value),
    lastFetched: computed(() => lastFetchedState.value),
    fetchPosts,
  };
}
