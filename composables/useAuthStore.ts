import { computed } from "vue";
import type { BlogUser } from "~/lib/mock/blog";

interface FollowState {
  [authorId: string]: boolean;
}

interface FollowPendingState {
  [authorId: string]: boolean;
}

export function useAuthStore() {
  const currentUserState = useState<BlogUser | null>("auth-current-user", () => null);
  const followingState = useState<FollowState>("auth-following", () => ({}));
  const followPendingState = useState<FollowPendingState>("auth-following-pending", () => ({}));
  const followErrorState = useState<string | null>("auth-following-error", () => null);

  const currentUser = computed(() => currentUserState.value);
  const isAuthenticated = computed(() => currentUser.value !== null);
  const following = computed(() => followingState.value);
  const followPending = computed(() => followPendingState.value);
  const followError = computed(() => followErrorState.value);

  function setCurrentUser(user: BlogUser | null) {
    currentUserState.value = user;

    if (!user) {
      followingState.value = {};
      followPendingState.value = {};
    }
  }

  async function followAuthor(authorId: string) {
    const trimmedAuthorId = authorId?.trim();

    if (!trimmedAuthorId) {
      throw new Error("Author identifier is required.");
    }

    if (!isAuthenticated.value) {
      throw new Error("You must be logged in to follow authors.");
    }

    if (followingState.value[trimmedAuthorId]) {
      return true;
    }

    followPendingState.value = {
      ...followPendingState.value,
      [trimmedAuthorId]: true,
    };
    followErrorState.value = null;

    try {
      await $fetch(`/api/follow/${encodeURIComponent(trimmedAuthorId)}`, {
        method: "POST",
      });

      followingState.value = {
        ...followingState.value,
        [trimmedAuthorId]: true,
      };

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error ?? "");

      followErrorState.value = message;
      throw new Error(message || "Unable to follow the author.");
    } finally {
      const { [trimmedAuthorId]: _, ...rest } = followPendingState.value;
      followPendingState.value = rest;
    }
  }

  function resetFollowError() {
    followErrorState.value = null;
  }

  return {
    currentUser,
    isAuthenticated,
    following,
    followPending,
    followError,
    setCurrentUser,
    followAuthor,
    resetFollowError,
  };
}
