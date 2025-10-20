<template>
  <main
    class="index-page"
    aria-labelledby="blog-heading"
  >
    <v-alert
      v-if="loadErrorMessage"
      data-test="posts-load-error"
      type="error"
      variant="tonal"
      border="start"
      border-color="error"
      class="mb-4"
      role="alert"
      closable
      :close-label="t('common.close')"
      @click:close="dismissLoadError"
    >
      {{ loadErrorMessage }}
    </v-alert>

    <div>
      <template v-if="showAuthenticatedSkeletons">
        <NewPostSkeleton />
        <div class="my-4">
          <StoriesStripSkeleton />
        </div>
      </template>
      <template v-else-if="shouldRenderAuthenticatedContent">
        <Suspense>
          <template #default>
            <NewPost
              :avatar="userAvatar"
              :user-name="userName"
              @submit="createPost"
              @attach="onAttach"
            />
          </template>
          <template #fallback>
            <NewPostSkeleton />
          </template>
        </Suspense>

        <div class="my-4">
          <SidebarCard
            class="text-card-foreground px-3 py-2"
            glow
          >
            <input
              ref="storyFileInput"
              type="file"
              accept="image/*"
              class="sr-only"
              @change="onStorySelected"
            />
            <Suspense>
              <template #default>
                <StoriesStrip
                  :items="stories"
                  @open="openStory"
                  @create="createStory"
                />
              </template>
              <template #fallback>
                <StoriesStripSkeleton />
              </template>
            </Suspense>
            <StoryViewerModal
              v-if="isStoryViewerOpen"
              v-model="isStoryViewerOpen"
              :story="activeStory"
              @close="onStoryClosed"
              @react="handleStoryReaction"
              @message="handleStoryMessage"
            />
          </SidebarCard>
        </div>
      </template>
    </div>

    <div
      v-if="pending"
      class="grid gap-4"
    >
      <PostCardSkeleton
        v-for="index in 2"
        :key="index"
        :show-comment-skeleton="false"
      />
    </div>

    <template v-else>
      <div class="flex flex-col gap-4">
        <Suspense
          v-for="(post, index) in posts"
          :key="post.id ?? `post-${index}`"
        >
          <template #default>
            <BlogPostCard
              data-test="blog-post-card"
              :post="post"
              :default-avatar="defaultAvatar"
              :reaction-emojis="reactionEmojis"
              :reaction-labels="reactionLabels"
              :prefer-eager-media-loading="index === 0"
              :defer-offscreen="index > 0"
              :intrinsic-height="blogPostCardIntrinsicHeight"
            />
          </template>
          <template #fallback>
            <PostCardSkeleton :show-comment-skeleton="false" />
          </template>
        </Suspense>

        <div
          v-if="loadingMore"
          class="grid gap-4"
          aria-live="polite"
          data-test="posts-loading-more"
        >
          <PostCardSkeleton
            v-for="index in skeletonBatchSize"
            :key="`loading-${index}`"
            :show-comment-skeleton="false"
          />
        </div>

        <div
          v-if="hasMore"
          ref="loadMoreTrigger"
          class="h-1 w-full"
          aria-hidden="true"
          data-test="posts-infinite-sentinel"
        />
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from "@vueuse/core";
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { callOnce, onNuxtReady, useNuxtApp, useState } from "#app";
import { definePageMeta } from "#imports";
import NewPostSkeleton from "~/components/blog/NewPostSkeleton.vue";
import StoriesStripSkeleton from "~/components/stories/StoriesStripSkeleton.vue";
import { usePostsStore } from "~/composables/usePostsStore";
import { useNonBlockingTask } from "~/composables/useNonBlockingTask";
import type { ReactionType } from "~/lib/mock/blog";
import { useAuthSession } from "~/stores/auth-session";
import { useProfileStore } from "~/stores/profile";
import type { Story, StoryReaction } from "~/types/stories";

const defaultAvatar = "/images/avatars/avatar-default.svg";
const blogPostCardIntrinsicHeight = 520;
const auth = useAuthSession();
const profileStore: ReturnType<typeof useProfileStore> | null = (() => {
  try {
    return useProfileStore();
  } catch (error) {
    if (import.meta.dev) {
      console.warn("[pages/index] Profile store unavailable; using fallback profile state.", error);
    }

    return null;
  }
})();

const isAuthReady = computed(() => auth.isReady.value);
const canAccessAuthenticatedContent = computed(
  () => isAuthReady.value && auth.isAuthenticated.value,
);

type NuxtAppLike = ReturnType<typeof useNuxtApp> | { isHydrating?: boolean };

function resolveNuxtApp(): NuxtAppLike {
  try {
    const app = useNuxtApp();

    if (app) {
      return app;
    }
  } catch (error) {
    const globalResolver = (globalThis as { useNuxtApp?: () => unknown }).useNuxtApp;

    if (typeof globalResolver === "function") {
      const resolved = globalResolver();

      if (resolved && typeof resolved === "object") {
        return resolved as NuxtAppLike;
      }
    }

    if (import.meta.dev) {
      console.warn("[pages/index] Falling back to a mock Nuxt app instance.", error);
    }
  }

  return { isHydrating: false };
}

const nuxtApp = resolveNuxtApp();
const isBrowser = typeof window !== "undefined";
const hasCompletedHydration = ref(!isBrowser || !nuxtApp?.isHydrating);

function resolveSharedState<T>(key: string, initializer: () => T) {
  if (typeof useState === "function") {
    try {
      return useState<T>(key, initializer);
    } catch (error) {
      if (import.meta.dev) {
        console.warn(`[pages/index] Falling back to local state for "${key}".`, error);
      }
    }
  }

  return ref(initializer()) as ReturnType<typeof useState<T>>;
}

function setSharedStateValue<T>(state: { value: T } | null | undefined, value: T) {
  if (state && typeof state === "object" && "value" in state) {
    (state as { value: T }).value = value;
  }
}

type SeoMetaFn = (input: () => Record<string, unknown>) => void;
let useSeoMetaFn: SeoMetaFn | null = null;

try {
  if (typeof useSeoMeta === "function") {
    useSeoMetaFn = useSeoMeta as SeoMetaFn;
  }
} catch (error) {
  if (import.meta.dev) {
    console.warn("[pages/index] Unable to import useSeoMeta helper.", error);
  }
}

if (isBrowser && nuxtApp?.isHydrating) {
  onNuxtReady(() => {
    hasCompletedHydration.value = true;
  });
}

const initialAuthAccessState = resolveSharedState(
  "index:initial-can-access-authenticated-content",
  () => canAccessAuthenticatedContent.value,
);

const shouldRenderAuthenticatedContent = computed(() => {
  if (!hasCompletedHydration.value) {
    return initialAuthAccessState?.value ?? false;
  }

  return canAccessAuthenticatedContent.value;
});
function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

const profileStories = computed(() => profileStore?.storyItems.value ?? []);
const localStories = ref<Story[]>([]);
const stories = computed<Story[]>(() => {
  const local = localStories.value;
  const profile = profileStories.value;

  if (local.length === 0) {
    return profile;
  }

  if (profile.length === 0) {
    return local;
  }

  return [...local, ...profile];
});

const storyObjectUrls = new Set<string>();

function revokeStoryObjectUrls() {
  if (!import.meta.client || storyObjectUrls.size === 0) {
    return;
  }

  storyObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  storyObjectUrls.clear();
}

function resetLocalStories() {
  if (localStories.value.length === 0) {
    return;
  }

  revokeStoryObjectUrls();
  localStories.value = [];
}

const profileDisplayName = computed(() => {
  const preferred = asString(profileStore?.preferredName.value ?? null);

  if (preferred) {
    return preferred;
  }

  const currentUser = auth.currentUser.value;

  if (!currentUser) {
    return null;
  }

  const first = asString((currentUser as { firstName?: string | null }).firstName);
  const last = asString((currentUser as { lastName?: string | null }).lastName);
  const parts = [first, last].filter(Boolean) as string[];

  if (parts.length > 0) {
    return parts.join(" ");
  }

  const username = asString((currentUser as { username?: string | null }).username);

  if (username) {
    return username;
  }

  const email = asString((currentUser as { email?: string | null }).email);

  return email;
});

const userName = computed(() => profileDisplayName.value ?? "");
const userAvatar = computed(() => profileStore?.avatarUrl.value || defaultAvatar);

const activeStory = ref<Story | null>(null);
const isStoryViewerOpen = ref(false);

watch(
  canAccessAuthenticatedContent,
  (canAccess) => {
    if (canAccess) {
      return;
    }

    isStoryViewerOpen.value = false;
    activeStory.value = null;
    resetLocalStories();
  },
  { immediate: true },
);
const lastStoryReaction = ref<{ storyId: Story["id"]; reactionId: StoryReaction["id"] } | null>(
  null,
);
const lastStoryMessage = ref<{ storyId: Story["id"]; message: string } | null>(null);
const storyFileInput = ref<HTMLInputElement | null>(null);

function openStory(story: Story) {
  activeStory.value = story;
  isStoryViewerOpen.value = true;
}
function createStory() {
  storyFileInput.value?.click();
}
function onStoryClosed() {
  activeStory.value = null;
}

function handleStoryReaction({
  story,
  reaction,
}: {
  story: Story | null;
  reaction: StoryReaction;
}) {
  if (!story) {
    return;
  }

  lastStoryReaction.value = {
    storyId: story.id,
    reactionId: reaction.id,
  };
}

function handleStoryMessage({ story, message }: { story: Story | null; message: string }) {
  if (!story) {
    return;
  }

  lastStoryMessage.value = {
    storyId: story.id,
    message,
  };
}
function onAttach(type: string) {
  // Ouvre sélecteur média / GIF / etc.
}

function onStorySelected(event: Event) {
  const input = event.target as HTMLInputElement | null;
  const file = input?.files?.[0];

  if (!file) {
    return;
  }

  const imageUrl = URL.createObjectURL(file);
  storyObjectUrls.add(imageUrl);

  localStories.value = [
    {
      id: Date.now(),
      image: imageUrl,
      name: userName.value || undefined,
      avatar: userAvatar.value,
      state: "new",
    },
    ...localStories.value,
  ];

  if (input) {
    input.value = "";
  }
}

onUnmounted(() => {
  revokeStoryObjectUrls();
});
const reactionEmojis: Record<ReactionType, string> = {
  like: "👍",
  love: "❤️",
  wow: "😮",
  haha: "😂",
  sad: "😢",
  angry: "😡",
  dislike: "👎",
};

const { t } = useI18n();

const pageDescription = computed(() => t("blog.hero.description"));

if (typeof definePageMeta === "function") {
  definePageMeta({
    showRightWidgets: true,
    showContactSidebarCard: true,
    documentDriven: false,
    rightSidebarPreset: "dashboard",
  });
}

if (useSeoMetaFn) {
  useSeoMetaFn(() => ({
    description: pageDescription.value,
  }));
}
const reactionLabels = computed<Record<ReactionType, string>>(() => ({
  like: t("blog.reactions.reactionTypes.like"),
  love: t("blog.reactions.reactionTypes.love"),
  wow: t("blog.reactions.reactionTypes.wow"),
  haha: t("blog.reactions.reactionTypes.haha"),
  sad: t("blog.reactions.reactionTypes.sad"),
  angry: t("blog.reactions.reactionTypes.angry"),
  dislike: t("blog.reactions.reactionTypes.dislike"),
}));

const INITIAL_PAGE_SIZE = 6;

const {
  posts,
  pending,
  loadingMore,
  hasMore,
  error: storeError,
  fetchPosts,
  fetchMorePosts,
  createPost,
  pageSize,
} = usePostsStore();

const error = storeError ?? ref<string | null>(null);
async function callOnceFn<T>(key: string, task: () => Promise<T> | T) {
  if (typeof callOnce === "function") {
    return await callOnce(key, task);
  }

  return await task();
}
const StoriesStrip = defineAsyncComponent({
  loader: () => import("~/components/stories/StoriesStrip.vue"),
  suspensible: false,
});
const StoryViewerModal = defineAsyncComponent({
  loader: () => import("~/components/stories/StoryViewerModal.vue"),
  suspensible: false,
});
const blogPostCardLoader = () => import("~/components/blog/BlogPostCard.vue");
const BlogPostCard = defineAsyncComponent({
  loader: blogPostCardLoader,
  suspensible: false,
});

const showAuthenticatedSkeletonsState = computed(() => !isAuthReady.value || pending.value);

let hasPrefetchedFirstBlogPostCard = false;

watch(
  posts,
  (postItems) => {
    if (hasPrefetchedFirstBlogPostCard || postItems.length === 0) {
      return;
    }

    hasPrefetchedFirstBlogPostCard = true;
    void callOnceFn("index:prefetch-first-blog-post-card", async () => {
      await blogPostCardLoader();
    });
  },
  { immediate: true, flush: "post" },
);

const initialSkeletonVisibilityState = resolveSharedState(
  "index:initial-show-authenticated-skeletons",
  () => showAuthenticatedSkeletonsState.value,
);

const showAuthenticatedSkeletons = computed(() => {
  if (!hasCompletedHydration.value) {
    return initialSkeletonVisibilityState?.value ?? false;
  }

  return showAuthenticatedSkeletonsState.value;
});

watch(
  hasCompletedHydration,
  (hydrated) => {
    if (hydrated) {
      setSharedStateValue(initialAuthAccessState, canAccessAuthenticatedContent.value);
      setSharedStateValue(initialSkeletonVisibilityState, showAuthenticatedSkeletonsState.value);
    }
  },
  { immediate: false },
);

const skeletonBatchSize = computed(() => {
  const size = pageSize.value || INITIAL_PAGE_SIZE;
  return Math.min(Math.max(size, 3), 10);
});

const loadMoreTrigger = ref<HTMLElement | null>(null);
const initialLoadError = resolveSharedState<string | null>("index:initial-load-error", () => null);

const isLoadErrorDismissed = ref(false);
const loadMoreRequestInFlight = ref(false);
const { schedule: scheduleNonBlockingTask } = useNonBlockingTask({ timeout: 500 });
const initialLoadPromise = ref<Promise<void> | null>(null);

const loadErrorMessage = computed(() => {
  if (isLoadErrorDismissed.value) {
    return "";
  }

  const localError =
    typeof initialLoadError?.value === "string" ? initialLoadError.value.trim() : "";

  if (!hasCompletedHydration.value) {
    return localError;
  }

  const storeError = typeof error.value === "string" ? error.value.trim() : "";

  return storeError || localError;
});

watch(
  () => error.value,
  (storeError) => {
    if (!storeError) {
      setSharedStateValue(initialLoadError, null);
      return;
    }

    isLoadErrorDismissed.value = false;
  },
  { immediate: true },
);

function dismissLoadError() {
  isLoadErrorDismissed.value = true;
  setSharedStateValue(initialLoadError, null);
}

async function maybeLoadMore() {
  if (loadMoreRequestInFlight.value || !hasMore.value || pending.value || loadingMore.value) {
    return;
  }

  loadMoreRequestInFlight.value = true;

  scheduleNonBlockingTask(async () => {
    try {
      await fetchMorePosts({ params: { pageSize: INITIAL_PAGE_SIZE } });
    } catch (error) {
      console.error("Failed to load more posts", error);
    } finally {
      loadMoreRequestInFlight.value = false;
    }
  });
}

let stopLoadMoreObserver: (() => void) | undefined;

if (isBrowser) {
  const observer = useIntersectionObserver(
    loadMoreTrigger,
    (entries) => {
      if (!hasMore.value || pending.value || loadingMore.value) {
        return;
      }

      for (const entry of entries) {
        if (entry.isIntersecting) {
          void maybeLoadMore();
          break;
        }
      }
    },
    { rootMargin: "200px 0px" },
  );

  stopLoadMoreObserver = observer.stop;

  watch(
    hasMore,
    (value) => {
      if (!value) {
        stopLoadMoreObserver?.();
      }
    },
    { immediate: true },
  );

  onUnmounted(() => {
    stopLoadMoreObserver?.();
  });
}

async function performInitialPostsLoad() {
  try {
    await fetchPosts(1, { params: { pageSize: INITIAL_PAGE_SIZE } });
    setSharedStateValue(initialLoadError, null);
    isLoadErrorDismissed.value = false;
  } catch (caughtError) {
    const message = caughtError instanceof Error ? caughtError.message : String(caughtError ?? "");

    setSharedStateValue(initialLoadError, message.trim() || t("blog.feed.loadError"));
    isLoadErrorDismissed.value = false;
    console.error("Failed to fetch posts", caughtError);
  }
}

function ensureInitialPostsLoad() {
  if (!initialLoadPromise.value) {
    initialLoadPromise.value = performInitialPostsLoad().finally(() => {
      initialLoadPromise.value = null;
    });
  }

  return initialLoadPromise.value;
}

await callOnceFn("pages:index:initial-posts", async () => {
  function triggerInitialLoad(): Promise<void> {
    return ensureInitialPostsLoad() ?? Promise.resolve();
  }

  if (import.meta.server) {
    await triggerInitialLoad();
    return;
  }

  if (nuxtApp?.isHydrating) {
    await new Promise<void>((resolve) => {
      onNuxtReady(() => {
        if (typeof queueMicrotask === "function") {
          queueMicrotask(() => {
            void triggerInitialLoad().finally(resolve);
          });
          return;
        }

        Promise.resolve()
          .then(() => {
            void triggerInitialLoad().finally(resolve);
          })
          .catch(() => {
            void triggerInitialLoad().finally(resolve);
          });
      });
    });

    return;
  }

  await triggerInitialLoad();
});

if (import.meta.client) {
  onMounted(() => {
    if (posts.value.length > 0 || pending.value || loadingMore.value || initialLoadPromise.value) {
      return;
    }

    scheduleNonBlockingTask(() => {
      void ensureInitialPostsLoad();
    });
  });
}
</script>

<style scoped src="~/assets/styles/pages/index.scss" lang="scss"></style>
