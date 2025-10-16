import { computed, ref, type Ref } from "vue";
import { tryUseNuxtApp, useState } from "#imports";
import { defineStore } from "~/lib/pinia-shim";
import type { FriendEntry, FriendStory, ProfileUser } from "~/types/pages/profile";
import type { Story } from "~/types/stories";

const DEFAULT_AVATAR = "/images/avatars/avatar-default.svg";
const CACHE_TTL_MS = 60_000;

function useStoreState<T>(key: string, init: () => T): Ref<T> {
  const nuxtApp = tryUseNuxtApp();

  if (nuxtApp) {
    try {
      return useState<T>(key, init);
    } catch (error) {
      if (import.meta.dev) {
        console.warn(
          `[profile-store] Falling back to local state for "${key}".`,
          error,
        );
      }
    }
  }

  return ref(init()) as Ref<T>;
}

type ProfileResponseEnvelope = {
  data?: ProfileUser | null;
  profile?: ProfileUser | null;
  user?: ProfileUser | null;
};

type ProfileResponse = ProfileUser | ProfileResponseEnvelope | null | undefined;

function isProfileUser(value: unknown): value is ProfileUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" ||
    typeof candidate.username === "string" ||
    typeof candidate.email === "string"
  );
}

function resolveProfileResponse(response: ProfileResponse): ProfileUser | null {
  const stack: ProfileResponse[] = [response];
  const visited = new WeakSet<Record<string, unknown>>();

  while (stack.length > 0) {
    const candidate = stack.pop();

    if (!candidate) {
      continue;
    }

    if (isProfileUser(candidate)) {
      return candidate;
    }

    if (typeof candidate !== "object") {
      continue;
    }

    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        if (item) {
          stack.push(item as ProfileResponse);
        }
      }

      continue;
    }

    const record = candidate as Record<string, unknown>;

    if (visited.has(record)) {
      continue;
    }

    visited.add(record);

    const envelope = record as ProfileResponseEnvelope;
    const nested = [envelope.data, envelope.profile, envelope.user];

    for (const item of nested) {
      if (item) {
        stack.push(item);
      }
    }
  }

  return null;
}

type FetchProfileOptions = {
  force?: boolean;
  background?: boolean;
};

function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeFriendEntries(
  raw: ProfileUser["friends"],
): FriendEntry[] {
  if (!raw) {
    return [];
  }

  if (Array.isArray(raw)) {
    return raw.filter(Boolean) as FriendEntry[];
  }

  return Object.values(raw).filter(Boolean) as FriendEntry[];
}

function normalizeStories(raw: unknown): FriendStory[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.filter((story): story is FriendStory => Boolean(story));
}

function resolveName(
  user: Pick<
    ProfileUser,
    "firstName" | "lastName" | "username" | "email"
  > | null | undefined,
): string | null {
  if (!user) {
    return null;
  }

  const first = asString(user.firstName);
  const last = asString(user.lastName);
  const parts = [first, last].filter(Boolean) as string[];

  if (parts.length > 0) {
    return parts.join(" ");
  }

  const username = asString(user.username);

  if (username) {
    return username;
  }

  const email = asString(user.email);

  if (email) {
    return email;
  }

  return null;
}

function resolveAvatar(user: { profile?: { photo?: string | null } } | null | undefined): string | null {
  if (!user) {
    return null;
  }

  const profilePhoto = asString(user.profile?.photo);

  if (profilePhoto) {
    return profilePhoto;
  }

  const directPhoto = asString((user as { photo?: string | null }).photo);

  if (directPhoto) {
    return directPhoto;
  }

  return null;
}

function formatStoryDuration(expiresAt: string | null | undefined): string | undefined {
  const expires = typeof expiresAt === "string" ? Date.parse(expiresAt) : NaN;

  if (!Number.isFinite(expires)) {
    return undefined;
  }

  const remainingMs = expires - Date.now();

  if (remainingMs <= 0) {
    return undefined;
  }

  const minutes = Math.floor(remainingMs / 60_000);

  if (minutes < 1) {
    return "<1m";
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export const useProfileStore = defineStore("profile", () => {
  const profileState = useStoreState<ProfileUser | null>("profile-data", () => null);
  const pendingState = useStoreState<boolean>("profile-pending", () => false);
  const errorState = useStoreState<string | null>("profile-error", () => null);
  const lastFetchedState = useStoreState<number | null>(
    "profile-last-fetched",
    () => null,
  );

  let activeRequest: Promise<ProfileUser | null> | null = null;

  const profile = computed(() => profileState.value);
  const isLoading = computed(() => pendingState.value);
  const error = computed(() => errorState.value);

  const friendEntries = computed<FriendEntry[]>(() => normalizeFriendEntries(profileState.value?.friends));
  const ownStories = computed<FriendStory[]>(() => normalizeStories(profileState.value?.stories));

  const preferredName = computed(() => resolveName(profileState.value));
  const avatarUrl = computed(
    () => resolveAvatar(profileState.value) ?? DEFAULT_AVATAR,
  );

  const storyItems = computed<Story[]>(() => {
    const items: Story[] = [];
    const selfName = preferredName.value ?? undefined;
    const selfAvatar = avatarUrl.value || DEFAULT_AVATAR;

    ownStories.value.forEach((story, index) => {
      const id = story?.id ?? `self-${index}`;
      const image = asString(story?.mediaPath) ?? undefined;

      if (!image) {
        return;
      }

      items.push({
        id,
        image,
        name: selfName,
        avatar: selfAvatar,
        state: "new",
        duration: formatStoryDuration(story?.expiresAt ?? undefined),
      });
    });

    friendEntries.value.forEach((entry, friendIndex) => {
      if (!entry?.user) {
        return;
      }

      const friend = entry.user;
      const friendStories = normalizeStories(entry.stories);

      if (friendStories.length === 0) {
        return;
      }

      const friendName = resolveName(friend) ?? undefined;
      const friendAvatar = resolveAvatar(friend) ?? DEFAULT_AVATAR;

      friendStories.forEach((story, storyIndex) => {
        const id = story?.id ?? `friend-${friendIndex}-${storyIndex}`;
        const image = asString(story?.mediaPath) ?? undefined;

        if (!image) {
          return;
        }

        items.push({
          id,
          image,
          name: friendName,
          avatar: friendAvatar,
          state: "new",
          duration: formatStoryDuration(story?.expiresAt ?? undefined),
        });
      });
    });

    return items;
  });

  function setProfile(data: ProfileUser | null) {
    profileState.value = data;

    if (!data) {
      lastFetchedState.value = null;
      errorState.value = null;
    }
  }

  function clearProfile() {
    profileState.value = null;
    pendingState.value = false;
    errorState.value = null;
    lastFetchedState.value = null;
    activeRequest = null;
  }

  async function fetchProfile(options: FetchProfileOptions = {}) {
    const { force = false } = options;
    const now = Date.now();

    if (
      !force &&
      profileState.value &&
      lastFetchedState.value &&
      now - lastFetchedState.value < CACHE_TTL_MS
    ) {
      return profileState.value;
    }

    if (pendingState.value && activeRequest) {
      return activeRequest;
    }

    pendingState.value = true;
    errorState.value = null;

    const request = Promise.resolve()
      .then(() => {
        const profile = resolveProfileResponse(profileState.value);

        if (!profile) {
          profileState.value = null;
          errorState.value = null;
          lastFetchedState.value = null;

          return profileState.value;
        }

        if (profile !== profileState.value) {
          profileState.value = profile;
        }

        lastFetchedState.value = Date.now();
        errorState.value = null;

        return profile;
      })
      .finally(() => {
        pendingState.value = false;
        activeRequest = null;
      });

    activeRequest = request;

    return request;
  }

  return {
    profile,
    isLoading,
    error,
    friendEntries,
    ownStories,
    preferredName,
    avatarUrl,
    storyItems,
    setProfile,
    clearProfile,
    fetchProfile,
  };
});
