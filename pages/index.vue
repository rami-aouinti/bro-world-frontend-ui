<template>
  <main aria-labelledby="blog-heading">

    <NewPost
        v-if="isAuthenticated"
        :avatar="user.avatarUrl"
        :user-name="user.name"
        @submit="createPost"
        @attach="onAttach"
    />

    <div v-if="pending" class="grid gap-4">
      <PostCardSkeleton v-for="index in 4" :key="index" />
    </div>

    <template v-else>

      <div class="flex flex-col gap-4">
        <BlogPostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            :default-avatar="defaultAvatar"
            :reaction-emojis="reactionEmojis"
            :reaction-labels="reactionLabels"
        />
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { callOnce } from "#imports";
import { usePostsStore } from "~/composables/usePostsStore";
import { useAuthStore } from "~/composables/useAuthStore";
import { formatMetricNumber, resolveCommentTotal, resolveReactionTotal } from "~/lib/blogMetrics";
import type { ReactionAggregate, CommentAggregate } from "~/lib/blogMetrics";
import type { ReactionType } from "~/lib/mock/blog";
import PostCardSkeleton from "~/components/blog/PostCardSkeleton.vue";

definePageMeta({
  showRightWidgets: true,
});

const defaultAvatar = "https://bro-world-space.com/img/person.png";
const { isAuthenticated } = useAuthStore();
const user = {
  name: 'Rami Aouinti',
  avatarUrl: 'https://bro-world-space.com/img/person.png',
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

const { locale, t } = useI18n();

const reactionLabels = computed<Record<ReactionType, string>>(() => ({
  like: t("blog.reactions.reactionTypes.like"),
  love: t("blog.reactions.reactionTypes.love"),
  wow: t("blog.reactions.reactionTypes.wow"),
  haha: t("blog.reactions.reactionTypes.haha"),
  sad: t("blog.reactions.reactionTypes.sad"),
  angry: t("blog.reactions.reactionTypes.angry"),
  dislike: t("blog.reactions.reactionTypes.dislike"),
}));

const { posts, pending, fetchPosts, createPost, creating } = usePostsStore();
const heroContent = computed(() => ({
  title: t("blog.hero.title"),
  description: t("blog.hero.description"),
}));
const heroStats = computed(() => {
  const communityPosts = posts.value ?? [];
  const totalReactions = communityPosts.reduce(
    (total, post) => total + resolveReactionTotal(post as ReactionAggregate),
    0,
  );
  const totalComments = communityPosts.reduce(
    (total, post) => total + resolveCommentTotal(post as CommentAggregate),
    0,
  );
  const activeMembers = new Set(communityPosts.map((post) => post.user?.id)).size;

  return [
    {
      id: "members",
      value: formatMetricNumber(activeMembers, locale.value),
      label: t("blog.hero.stats.members"),
    },
    {
      id: "reactions",
      value: formatMetricNumber(totalReactions, locale.value),
      label: t("blog.hero.stats.reactions"),
    },
    {
      id: "comments",
      value: formatMetricNumber(totalComments, locale.value),
      label: t("blog.hero.stats.comments"),
    },
  ];
});
const navigationItems = computed(() => [
  { id: "apps", icon: "mdi-apps", label: t("layout.sidebar.items.apps") },
  { id: "calendar", icon: "mdi-calendar-month", label: t("layout.sidebar.items.calendar") },
  { id: "cv", icon: "mdi-file-account", label: t("layout.sidebar.items.cv") },
  { id: "jobs", icon: "mdi-briefcase-search", label: t("layout.sidebar.items.jobs") },
  { id: "help", icon: "mdi-lifebuoy", label: t("layout.sidebar.items.help") },
  { id: "about", icon: "mdi-information-outline", label: t("layout.sidebar.items.about") },
  { id: "contact", icon: "mdi-email-outline", label: t("layout.sidebar.items.contact") },
]);

const activeNavigation = ref("apps");

watch(
  navigationItems,
  (items) => {
    if (!items.some((item) => item.id === activeNavigation.value)) {
      activeNavigation.value = items[0]?.id ?? "apps";
    }
  },
  { immediate: true },
);

const weatherCard = computed(() => ({
  location: "Berlin",
  temperature: "12.4°C",
  feelsLike: "Feels like 10°C",
  condition: "Cloudy",
  icon: "mdi-weather-partly-cloudy",
}));

const newsDigest = computed(() => [
  { id: "community", title: "Community update – new events added", time: "3 hours ago" },
  { id: "academy", title: "Academy launches mentorship cohort", time: "Yesterday" },
  { id: "jobs", title: "5 new roles open in the marketplace", time: "2 days ago" },
]);

const ratingOverview = computed(() => ({
  title: "Rating overview",
  subtitle: "Your recent feedback summary",
  badge: "Insights",
  score: "0.0",
  total: 5,
  metrics: [
    { id: "response", label: "Response time", value: "0%", progress: "10%" },
    { id: "satisfaction", label: "Member satisfaction", value: "0%", progress: "18%" },
    { id: "growth", label: "Community growth", value: "0%", progress: "12%" },
  ],
}));

await callOnce(() => fetchPosts());

const newPostContent = ref("");
const composerFeedback = ref<{ type: "success" | "error"; message: string } | null>(null);

const characterCountLabel = computed(() => {
  const length = newPostContent.value.trim().length;
  return t("blog.composer.characterCount", {
    count: formatMetricNumber(length, locale.value),
  });
});

async function handleCreatePost() {
  composerFeedback.value = null;

  const content = newPostContent.value.trim();

  if (!content) {
    composerFeedback.value = {
      type: "error",
      message: t("blog.composer.validation"),
    };
    return;
  }

  try {
    await createPost({ content });
    composerFeedback.value = {
      type: "success",
      message: t("blog.composer.success"),
    };
    newPostContent.value = "";
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : t("blog.composer.error");

    composerFeedback.value = {
      type: "error",
      message,
    };
  }
}
</script>
