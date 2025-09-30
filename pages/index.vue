<template>
  <main aria-labelledby="blog-heading">
    <NewPost
      v-if="isAuthenticated"
      :avatar="user.avatarUrl"
      :user-name="user.name"
      @submit="createPost"
      @attach="onAttach"
    />

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
import { useAuthStore } from "~/composables/useAuthStore";
import type { ReactionType } from "~/lib/mock/blog";
import PostCardSkeleton from "~/components/blog/PostCardSkeleton.vue";
import { useAuthSession } from "~/stores/auth-session";

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
