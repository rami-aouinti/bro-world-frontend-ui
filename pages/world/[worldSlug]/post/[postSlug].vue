<template>
  <main
    class="post-detail-page"
    aria-labelledby="post-heading"
  >
    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      border="start"
      border-color="error"
      class="mb-4"
      role="alert"
    >
      {{ errorMessage }}
    </v-alert>

    <div
      v-if="pending"
      class="grid gap-4"
    >
      <PostCardSkeleton :show-comment-skeleton="false" />
    </div>

    <template v-else>
      <BlogPostCard
        v-if="post"
        :post="post"
        :default-avatar="defaultAvatar"
        :reaction-emojis="reactionEmojis"
        :reaction-labels="reactionLabels"
        :prefer-eager-media-loading="true"
        :enable-post-link="false"
      />

      <v-alert
        v-else
        type="warning"
        variant="tonal"
        border="start"
        border-color="warning"
        class="mb-4"
        role="status"
      >
        {{ t("blog.posts.notFound") }}
      </v-alert>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { createError, useRoute, useSeoMeta } from "#imports";

import { useLayoutRightSidebar } from "~/composables/useLayoutRightSidebar";
import { usePostsStore } from "~/composables/usePostsStore";
import { blogPostCardLoader, prefetchBlogPostCard } from "~/lib/prefetch/blog-post-card";
import type { BlogPost, ReactionType } from "~/lib/mock/blog";
import PostAuthorSidebarCard from "~/components/blog/PostAuthorSidebarCard.vue";

const defaultAvatar = "/images/avatars/avatar-default.svg";
const BlogPostCard = defineAsyncComponent({ loader: blogPostCardLoader });
const PostCardSkeleton = defineAsyncComponent(
  () => import("~/components/blog/PostCardSkeleton.vue"),
);

await prefetchBlogPostCard();

const route = useRoute();
const { t } = useI18n();
const postsStore = usePostsStore();
const { registerRightSidebarContent } = useLayoutRightSidebar();

function normalizeParam(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    const candidate = value.find((entry) => typeof entry === "string");

    if (typeof candidate === "string") {
      return candidate.trim();
    }
  }

  return "";
}

const worldSlug = computed(() => normalizeParam(route.params.worldSlug));
const postSlug = computed(() => normalizeParam(route.params.postSlug));

const reactionEmojis: Record<ReactionType, string> = {
  like: "👍",
  love: "❤️",
  wow: "😮",
  haha: "😂",
  sad: "😢",
  angry: "😡",
  dislike: "👎",
};

const reactionLabels = computed<Record<ReactionType, string>>(() => ({
  like: t("blog.reactions.reactionTypes.like"),
  love: t("blog.reactions.reactionTypes.love"),
  wow: t("blog.reactions.reactionTypes.wow"),
  haha: t("blog.reactions.reactionTypes.haha"),
  sad: t("blog.reactions.reactionTypes.sad"),
  angry: t("blog.reactions.reactionTypes.angry"),
  dislike: t("blog.reactions.reactionTypes.dislike"),
}));

function sanitizeText(value?: string | null) {
  return (
    value
      ?.replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim() ?? ""
  );
}

function findPostInStore(targetSlug: string) {
  return postsStore.posts.value.find((entry) => entry.slug === targetSlug);
}

async function resolvePost(targetSlug: string): Promise<BlogPost> {
  const trimmedSlug = targetSlug.trim();

  if (!trimmedSlug) {
    throw createError({ statusCode: 404, statusMessage: t("blog.posts.notFound") });
  }

  const existing = findPostInStore(trimmedSlug);

  if (existing) {
    return existing;
  }

  let lastError: unknown = null;

  try {
    await postsStore.fetchPosts({ force: true });
  } catch (error) {
    lastError = error;
  }

  let matched = findPostInStore(trimmedSlug);

  if (matched) {
    return matched;
  }

  let iterations = 0;

  while (!matched && postsStore.hasMore.value && iterations < 10) {
    const before = postsStore.posts.value.length;

    try {
      await postsStore.fetchMorePosts({ force: true });
    } catch (error) {
      lastError = error;
      break;
    }

    const after = postsStore.posts.value.length;

    if (after <= before) {
      break;
    }

    matched = findPostInStore(trimmedSlug);

    if (matched) {
      return matched;
    }

    iterations += 1;
  }

  if (!matched) {
    try {
      const fetched = await postsStore.getPost(trimmedSlug, { force: true });

      if (fetched.slug === trimmedSlug || fetched.id === trimmedSlug) {
        return fetched;
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError instanceof Error ? lastError : new Error(String(lastError ?? ""));
  }

  throw createError({ statusCode: 404, statusMessage: t("blog.posts.notFound") });
}

const {
  data: post,
  pending,
  error,
} = await useAsyncData(
  () => `world-post-${worldSlug.value}-${postSlug.value}`,
  async () => resolvePost(postSlug.value),
  { watch: [postSlug] },
);

const errorMessage = computed(() => {
  const current = error.value as (Error & { statusMessage?: string }) | null;

  if (!current) {
    return null;
  }

  if (current.statusMessage) {
    return current.statusMessage;
  }

  return current.message || t("blog.posts.notFound");
});

const pageTitle = computed(() => post.value?.title ?? t("blog.posts.detailHeading"));
const pageDescription = computed(() => {
  if (!post.value) {
    return t("blog.hero.description");
  }

  const summary = post.value.summary?.trim();

  if (summary) {
    return summary;
  }

  return sanitizeText(post.value.content).slice(0, 160);
});

useSeoMeta(() => ({
  title: pageTitle.value,
  description: pageDescription.value,
}));

definePageMeta({
  documentDriven: false,
  showRightWidgets: true,
  showContactSidebarCard: false,
  requiresPlugin: "blog",
});

registerRightSidebarContent(
  computed(() => {
    const author = post.value?.user ?? null;

    if (!author) {
      return null;
    }

    return {
      component: PostAuthorSidebarCard,
      props: {
        author,
        worldSlug: worldSlug.value,
      },
      intrinsicHeight: 420,
    };
  }),
);
</script>

<style scoped>
.post-detail-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
