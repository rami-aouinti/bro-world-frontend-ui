<template>
  <main aria-labelledby="blog-heading">
    <NewPost
      v-if="canAccessAuthenticatedContent"
      :avatar="user.avatarUrl"
      :user-name="user.name"
      @submit="createPost"
      @attach="onAttach"
    />
    <SidebarCard
      v-if="canAccessAuthenticatedContent"
      class="text-card-foreground px-3 py-4 my-4"
    >
      <!-- glows -->
      <span
        class="pointer-events-none absolute -left-14 top-8 h-40 w-40 rounded-full bg-primary/25 blur-3xl"
      ></span>
      <span
        class="pointer-events-none absolute -right-16 -top-10 h-48 w-48 rounded-full bg-primary/35 blur-3xl"
      ></span>
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
        v-if="canAccessAuthenticatedContent"
        v-model="isStoryViewerOpen"
        :story="activeStory"
        @close="onStoryClosed"
        @react="handleStoryReaction"
        @message="handleStoryMessage"
      />
    </SidebarCard>

    <div
      v-if="pending"
      class="grid gap-4"
    >
      <PostCardSkeleton
        v-for="index in 4"
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
import { computed, defineAsyncComponent, onUnmounted, ref, watch, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { callOnce } from "#imports";
import { usePostsStore } from "~/composables/usePostsStore";
import type { ReactionType } from "~/lib/mock/blog";
import PostCardSkeleton from "~/components/blog/PostCardSkeleton.vue";
import { useAuthSession } from "~/stores/auth-session";

const NewPost = defineAsyncComponent({
  loader: () => import("~/components/blog/NewPost.vue"),
  suspensible: false,
});

const BlogPostCard = defineAsyncComponent({
  loader: () => import("~/components/blog/BlogPostCard.vue"),
  suspensible: false,
});

const StoriesStrip = defineAsyncComponent({
  loader: () => import("~/components/stories/StoriesStrip.vue"),
  suspensible: false,
});

const StoryViewerModal = defineAsyncComponent({
  loader: () => import("~/components/stories/StoryViewerModal.vue"),
  suspensible: false,
});

definePageMeta({
  showRightWidgets: true,
  documentDriven: false,
});

const defaultAvatar = "https://bro-world-space.com/img/person.png";
const auth = useAuthSession();

const canAccessAuthenticatedContent = computed(
  () => auth.isReady.value && auth.isAuthenticated.value,
);
const user = {
  name: "Rami Aouinti",
  avatarUrl: "https://bro-world-space.com/img/person.png",
};

interface Story {
  id: string | number;
  image?: string;
  name?: string;
  avatar?: string;
  state?: "create" | "new" | "seen";
  duration?: string;
}

interface StoryReaction {
  id: string;
  emoji: string;
  label: string;
}

const stories = ref<Story[]>([
  {
    id: 1,
    image: "https://picsum.photos/seed/1/600/900",
    name: "Asma Hmida",
    avatar: "https://i.pravatar.cc/64?img=5",
    state: "new",
    duration: "0:22",
  },
  {
    id: 2,
    image: "https://picsum.photos/seed/2/600/900",
    name: "Ichrak Ben Youcef",
    avatar: "https://i.pravatar.cc/64?img=7",
    state: "seen",
  },
  {
    id: 3,
    image: "https://picsum.photos/seed/3/600/900",
    name: "Rim Abdelwahed",
    avatar: "https://i.pravatar.cc/64?img=9",
    state: "new",
    duration: "1:03",
  },
  {
    id: 4,
    image: "https://picsum.photos/seed/3/600/900",
    name: "Rim Abdelwahed",
    avatar: "https://i.pravatar.cc/64?img=9",
    state: "new",
    duration: "1:03",
  },
  {
    id: 5,
    image: "https://picsum.photos/seed/3/600/900",
    name: "Rim Abdelwahed",
    avatar: "https://i.pravatar.cc/64?img=9",
    state: "new",
    duration: "1:03",
  },
  {
    id: 6,
    image: "https://picsum.photos/seed/3/600/900",
    name: "Rim Abdelwahed",
    avatar: "https://i.pravatar.cc/64?img=9",
    state: "new",
    duration: "1:03",
  },
]);

const activeStory = ref<Story | null>(null);
const isStoryViewerOpen = ref(false);

watch(canAccessAuthenticatedContent, (value) => {
  if (!value) {
    isStoryViewerOpen.value = false;
    activeStory.value = null;
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

  stories.value = [
    {
      id: Date.now(),
      image: imageUrl,
      name: user.name,
      avatar: user.avatarUrl,
      state: "new",
    },
    ...stories.value,
  ];

  if (input) {
    input.value = "";
  }
}

onUnmounted(() => {
  storyObjectUrls.forEach((url) => URL.revokeObjectURL(url));
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

const { posts, pending, loadingMore, hasMore, fetchPosts, fetchMorePosts, createPost, pageSize } =
  usePostsStore();

const skeletonBatchSize = computed(() => {
  const size = pageSize.value || INITIAL_PAGE_SIZE;
  return Math.min(Math.max(size, 3), 10);
});

const loadMoreTrigger = ref<HTMLElement | null>(null);

async function maybeLoadMore() {
  if (typeof window === "undefined") {
    return;
  }

  if (!hasMore.value || pending.value || loadingMore.value) {
    return;
  }

  try {
    await fetchMorePosts({ params: { pageSize: INITIAL_PAGE_SIZE } });
  } catch (error) {
    console.error("Failed to load more posts", error);
  }
}

if (typeof window !== "undefined") {
  watchEffect((onCleanup) => {
    const target = loadMoreTrigger.value;

    if (!target || pending.value || !hasMore.value || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            void maybeLoadMore();
          }
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(target);

    onCleanup(() => {
      observer.disconnect();
    });
  });
}

await callOnce(() => fetchPosts(1, { params: { pageSize: INITIAL_PAGE_SIZE } }));
</script>
