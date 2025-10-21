<template>
  <main
    class="blog-author-page"
    aria-labelledby="blog-author-heading"
  >
    <div class="mb-6 flex flex-wrap items-center gap-3">
      <v-btn
        :to="feedLink"
        variant="text"
        color="primary"
        class="px-0"
        prepend-icon="mdi:arrow-left"
      >
        {{ t("blog.posts.backToFeed") }}
      </v-btn>
    </div>

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
      <SidebarCard
        v-if="author"
        class="text-card-foreground px-4 py-4 mb-6"
        glow
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <v-avatar
              size="80"
              class="flex-shrink-0"
              color="primary"
              variant="tonal"
            >
              <NuxtImg
                :src="authorAvatar"
                :alt="authorName"
                width="80"
                height="80"
                class="h-full w-full object-cover"
              />
            </v-avatar>
            <div class="space-y-2">
              <h1
                id="blog-author-heading"
                class="text-h5 font-semibold text-foreground"
              >
                {{ authorHeading }}
              </h1>
              <p class="text-body-2 text-medium-emphasis">
                {{ authorSubtitle }}
              </p>
            </div>
          </div>
        </div>
      </SidebarCard>

      <div class="grid gap-4">
        <template v-if="authorPosts.length">
          <h2 class="text-subtitle-1 font-semibold text-foreground">
            {{ t("blog.authors.postsHeading") }}
          </h2>

          <div class="grid gap-4">
            <BlogPostCard
              v-for="post in authorPosts"
              :key="post.id"
              :post="post"
              :default-avatar="defaultAvatar"
              :reaction-emojis="reactionEmojis"
              :reaction-labels="reactionLabels"
              :prefer-eager-media-loading="true"
            />
          </div>
        </template>

        <v-alert
          v-else
          type="info"
          variant="tonal"
          border="start"
          border-color="info"
          role="status"
        >
          {{ t("blog.authors.empty") }}
        </v-alert>
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { createError, useHead, useSeoMeta } from "#imports";

import { usePostsStore } from "~/composables/usePostsStore";
import type { BlogPost, BlogUser, ReactionType } from "~/lib/mock/blog";
import { optimizeAvatarUrl } from "~/lib/images/avatar";
import { blogPostCardLoader, prefetchBlogPostCard } from "~/lib/prefetch/blog-post-card";
import SidebarCard from "~/components/layout/SidebarCard.vue";

const defaultAvatar = "/images/avatars/avatar-default.svg";
const BlogPostCard = defineAsyncComponent({ loader: blogPostCardLoader });
const PostCardSkeleton = defineAsyncComponent(() => import("~/components/blog/PostCardSkeleton.vue"));

await prefetchBlogPostCard();

const route = useRoute();
const localePath = useLocalePath();
const { t } = useI18n();
const postsStore = usePostsStore();

const authorId = computed(() => String(route.params.id ?? ""));
const feedLink = computed(() => localePath({ name: "index" }));

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

interface AuthorPayload {
  user: BlogUser;
  posts: BlogPost[];
}

function findAuthorPosts(targetId: string) {
  return postsStore.posts.value.filter((entry) => entry.user?.id === targetId);
}

async function resolveAuthor(targetId: string): Promise<AuthorPayload> {
  const trimmedId = targetId.trim();

  if (!trimmedId) {
    throw createError({ statusCode: 404, statusMessage: t("blog.authors.notFound") });
  }

  let posts = findAuthorPosts(trimmedId);

  if (posts.length > 0) {
    return { user: posts[0].user, posts };
  }

  let lastError: unknown = null;

  try {
    await postsStore.fetchPosts({ force: true });
  } catch (error) {
    lastError = error;
  }

  posts = findAuthorPosts(trimmedId);

  if (posts.length > 0) {
    return { user: posts[0].user, posts };
  }

  let attempts = 0;

  while (!posts.length && postsStore.hasMore.value && attempts < 10) {
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

    posts = findAuthorPosts(trimmedId);

    if (posts.length > 0) {
      return { user: posts[0].user, posts };
    }

    attempts += 1;
  }

  if (lastError) {
    throw lastError instanceof Error ? lastError : new Error(String(lastError ?? ""));
  }

  throw createError({ statusCode: 404, statusMessage: t("blog.authors.notFound") });
}

const { data, pending, error } = await useAsyncData(
  () => `blog-author-${authorId.value}`,
  async () => resolveAuthor(authorId.value),
  { watch: [authorId] },
);

const author = computed(() => data.value?.user ?? null);
const authorPosts = computed(() => data.value?.posts ?? []);

const authorName = computed(() => {
  if (!author.value) {
    return "";
  }

  const parts = [author.value.firstName, author.value.lastName].filter(Boolean) as string[];

  if (parts.length > 0) {
    return parts.join(" ");
  }

  return author.value.username || author.value.email || "";
});

const authorHeading = computed(() =>
  author.value ? t("blog.authors.heading", { name: authorName.value }) : t("blog.authors.title"),
);
const authorSubtitle = computed(() => t("blog.authors.subtitle"));
const authorAvatar = computed(() => optimizeAvatarUrl(author.value?.photo ?? null, 80) ?? defaultAvatar);

const errorMessage = computed(() => {
  if (!error.value) {
    return "";
  }

  if (error.value instanceof Error) {
    return error.value.message;
  }

  return String(error.value ?? "");
});

const pageTitle = computed(() => authorHeading.value);
const pageDescription = computed(() =>
  author.value
    ? t("blog.authors.description", { name: authorName.value || t("blog.authors.title") })
    : t("blog.authors.defaultDescription"),
);

useHead(() => ({
  title: pageTitle.value,
}));

useSeoMeta(() => ({
  description: pageDescription.value,
}));

definePageMeta({
  title: "blog-author",
  documentDriven: false,
});
</script>

<style scoped>
.blog-author-page {
  display: grid;
  gap: 1.5rem;
}
</style>
