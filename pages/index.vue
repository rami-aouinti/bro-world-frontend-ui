<template>
  <main aria-labelledby="blog-heading">
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

    <template v-if="canAccessAuthenticatedContent">
      <NewPost
        :avatar="userAvatar"
        :user-name="userName"
        @submit="createPost"
        @attach="onAttach"
      />
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
          <StoriesStrip
            :items="stories"
            @open="openStory"
            @create="createStory"
          />
          <StoryViewerModal
            v-model="isStoryViewerOpen"
            :story="activeStory"
            @close="onStoryClosed"
            @react="handleStoryReaction"
            @message="handleStoryMessage"
          />
        </SidebarCard>
      </div>
    </template>

    <div
      v-if="pending"
      class="grid gap-4"
    >
      <PostCardSkeleton
        v-for="index in 2"
        :key="index"
      />
    </div>

    <template v-else>
      <div class="flex flex-col gap-4">
        <BlogPostCard
          v-for="(post, index) in posts"
          :key="post.id ?? `post-${index}`"
          data-test="blog-post-card"
          :post="post"
          :default-avatar="defaultAvatar"
          :reaction-emojis="reactionEmojis"
          :reaction-labels="reactionLabels"
          :prefer-eager-media-loading="index === 0"
        />

        <div
          v-if="loadingMore"
          class="grid gap-4"
          aria-live="polite"
          data-test="posts-loading-more"
        >
          <PostCardSkeleton
            v-for="index in skeletonBatchSize"
            :key="`loading-${index}`"
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
import { computed, onMounted, onUnmounted, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { callOnce } from "#imports";
import { usePostsStore } from "~/composables/usePostsStore";
import type { ReactionType } from "~/lib/mock/blog";
import { useAuthSession } from "~/stores/auth-session";
import { useProfileStore } from "~/stores/profile";
import type { Story, StoryReaction } from "~/types/stories";

import NewPost from "~/components/blog/NewPost.vue";
import BlogPostCard from "~/components/blog/BlogPostCard.vue";
import StoriesStrip from "~/components/stories/StoriesStrip.vue";
import StoryViewerModal from "~/components/stories/StoryViewerModal.vue";
import PostCardSkeleton from "~/components/blog/PostCardSkeleton.vue";

const defaultAvatar = "/images/avatars/avatar-default.svg";
const auth = useAuthSession();
const profileStore = useProfileStore();

const isAuthReady = computed(() => auth.isReady.value);
const canAccessAuthenticatedContent = computed(
  () => isAuthReady.value && auth.isAuthenticated.value,
);
function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

const profileStories = computed(() => profileStore.storyItems.value);
const localStories = ref<Story[]>([]);
const stories = computed<Story[]>(() => [...localStories.value, ...profileStories.value]);

const profileDisplayName = computed(() => {
  const preferred = asString(profileStore.preferredName.value);

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
const userAvatar = computed(() => profileStore.avatarUrl.value || defaultAvatar);

const activeStory = ref<Story | null>(null);
const isStoryViewerOpen = ref(false);

watchEffect(() => {
  if (!canAccessAuthenticatedContent.value) {
    isStoryViewerOpen.value = false;
    activeStory.value = null;
    if (localStories.value.length > 0) {
      if (import.meta.client) {
        localStories.value.forEach((story) => {
          if (typeof story.image === "string" && storyObjectUrls.has(story.image)) {
            URL.revokeObjectURL(story.image);
            storyObjectUrls.delete(story.image);
          }
        });
      }
      localStories.value = [];
    }
  }
});
const lastStoryReaction = ref<{ storyId: Story["id"]; reactionId: StoryReaction["id"] } | null>(
  null,
);
const lastStoryMessage = ref<{ storyId: Story["id"]; message: string } | null>(null);
const storyFileInput = ref<HTMLInputElement | null>(null);
const storyObjectUrls = new Set<string>();

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
  if (import.meta.client) {
    storyObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  }
  storyObjectUrls.clear();
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

definePageMeta({
  showRightWidgets: true,
  documentDriven: false,
});
useSeoMeta(() => ({
  description: pageDescription.value,
}));
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

const { posts, pending, loadingMore, hasMore, error, fetchPosts, fetchMorePosts, createPost, pageSize } =
  usePostsStore();

const skeletonBatchSize = computed(() => {
  const size = pageSize.value || INITIAL_PAGE_SIZE;
  return Math.min(Math.max(size, 3), 10);
});

const loadMoreTrigger = ref<HTMLElement | null>(null);
const initialLoadError = ref<string | null>(null);

const isLoadErrorDismissed = ref(false);

const loadErrorMessage = computed(() => {
  if (isLoadErrorDismissed.value) {
    return "";
  }

  const storeError = typeof error.value === "string" ? error.value.trim() : "";
  const localError = typeof initialLoadError.value === "string" ? initialLoadError.value.trim() : "";

  return storeError || localError;
});

watchEffect(() => {
  if (!error.value) {
    initialLoadError.value = null;
    isLoadErrorDismissed.value = false;
  }
});

function dismissLoadError() {
  isLoadErrorDismissed.value = true;
  initialLoadError.value = null;
}

async function maybeLoadMore() {
  if (!hasMore.value || pending.value || loadingMore.value) {
    return;
  }

  try {
    await fetchMorePosts({ params: { pageSize: INITIAL_PAGE_SIZE } });
  } catch (error) {
    console.error("Failed to load more posts", error);
  }
}

if (import.meta.client) {
  useIntersectionObserver(
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
}

async function loadInitialPosts() {
  try {
    await fetchPosts(1, { params: { pageSize: INITIAL_PAGE_SIZE } });
    initialLoadError.value = null;
    isLoadErrorDismissed.value = false;
  } catch (caughtError) {
    const message =
      caughtError instanceof Error ? caughtError.message : String(caughtError ?? "");

    initialLoadError.value = message.trim() || t("blog.feed.loadError");
    isLoadErrorDismissed.value = false;
    console.error("Failed to fetch posts", caughtError);
  }
}

await callOnce(loadInitialPosts);

if (import.meta.client) {
  onMounted(async () => {
    if (posts.value.length > 0 || pending.value || loadingMore.value) {
      return;
    }

    await loadInitialPosts();
  });
}
</script>
