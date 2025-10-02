import { computed } from "vue";
import { useCookie, useRuntimeConfig, useState } from "#imports";
import type { BlogUser } from "~/lib/mock/blog";
import { useAuthSession } from "~/stores/auth-session";
import type { AuthUser } from "~/types/auth";
import { withSecureCookieOptions } from "~/lib/cookies";

interface FollowState {
  [authorId: string]: boolean;
}

interface FollowPendingState {
  [authorId: string]: boolean;
}

export function useAuthStore() {
  const authSession = useAuthSession();
  const currentUserState = useState<BlogUser | null>("auth-follow-current-user", () => null);
  const followingState = useState<FollowState>("auth-following", () => ({}));
  const followPendingState = useState<FollowPendingState>("auth-following-pending", () => ({}));
  const followErrorState = useState<string | null>("auth-following-error", () => null);
  const runtimeConfig = useRuntimeConfig();
  const sessionTokenCookieName =
    runtimeConfig.auth?.sessionTokenCookieName ??
    runtimeConfig.public?.auth?.sessionTokenCookieName ??
    "auth_session_token";
  const sessionTokenCookie = useCookie<string | null>(
    sessionTokenCookieName,
    withSecureCookieOptions({
      sameSite: "strict",
    }),
  );

  const currentUser = computed(
    () => (authSession.currentUser.value as BlogUser | null) ?? currentUserState.value,
  );
  const isAuthenticated = computed(() => Boolean(sessionTokenCookie.value));
  const following = computed(() => followingState.value);
  const followPending = computed(() => followPendingState.value);
  const followError = computed(() => followErrorState.value);

  function setCurrentUser(user: BlogUser | null) {
    currentUserState.value = user;
    authSession.setCurrentUser(user as AuthUser | null);

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
