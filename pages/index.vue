<template>
  <main aria-labelledby="blog-heading">
    <NewPost
      v-if="isAuthenticated"
      :avatar="user.avatarUrl"
      :user-name="user.name"
      @submit="createPost"
      @attach="onAttach"
    />
    <section
      class="rounded-3xl py-4 my-3 px-2 border border-white/5 bg-white/5 p-6 text-slate-200 shadow-[0_25px_55px_-20px_hsl(var(--primary)/0.35)] backdrop-blur-xl"
    >
      <StoriesStrip
        v-if="isAuthenticated"
        :items="stories"
        @open="openStory"
        @create="createStory"
      />
      <StoryViewerModal
        v-if="isAuthenticated"
        v-model="isStoryViewerOpen"
        :story="activeStory"
        @close="onStoryClosed"
        @react="handleStoryReaction"
        @message="handleStoryMessage"
      />
    </section>

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
          v-for="post in posts"
          :key="post.id"
          data-test="blog-post-card"
          :post="post"
          :default-avatar="defaultAvatar"
          :reaction-emojis="reactionEmojis"
          :reaction-labels="reactionLabels"
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
import { computed, ref, watchEffect } from "vue";
import { callOnce } from "#imports";
import { usePostsStore } from "~/composables/usePostsStore";
import type { ReactionType } from "~/lib/mock/blog";
import PostCardSkeleton from "~/components/blog/PostCardSkeleton.vue";
import { useAuthSession } from "~/stores/auth-session";
import StoriesStrip from "~/components/stories/StoriesStrip.vue";
import StoryViewerModal from "~/components/stories/StoryViewerModal.vue";

definePageMeta({
  showRightWidgets: true,
});

const defaultAvatar = "https://bro-world-space.com/img/person.png";
const auth = useAuthSession();
const isAuthenticated = computed(() => auth.isAuthenticated.value);
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
const lastStoryReaction = ref<{ storyId: Story["id"]; reactionId: StoryReaction["id"] } | null>(null);
const lastStoryMessage = ref<{ storyId: Story["id"]; message: string } | null>(null);

function openStory(story: Story) {
  activeStory.value = story;
  isStoryViewerOpen.value = true;
}
function createStory() {
  /* ouvrir éditeur */
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

function handleStoryMessage({
  story,
  message,
}: {
  story: Story | null;
  message: string;
}) {
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
