<template>
  <main aria-labelledby="blog-heading">

    <NewPost v-if="isAuthenticated"
             :avatar="user.avatarUrl"
             :userName="user.name"
             @submit="createPost"
             @attach="onAttach" />

    <div v-if="pending" class="grid gap-4">
      <div
          v-for="index in 4"
          :key="index"
          class="flex flex-col gap-6 rounded-[32px] border border-white/80 bg-white/80 p-6 shadow-[0_30px_60px_-40px_rgba(15,23,42,0.55)]"
      >
        <div class="flex items-center gap-4">
          <div class="h-12 w-12 rounded-2xl bg-slate-200/60" />
          <div class="flex-1 space-y-2">
            <div class="h-3 w-32 rounded-full bg-slate-200/60" />
            <div class="h-3 w-24 rounded-full bg-slate-200/60" />
          </div>
        </div>
        <div class="space-y-3">
          <div class="h-3 w-3/4 rounded-full bg-slate-200/60" />
          <div class="h-3 w-2/3 rounded-full bg-slate-200/60" />
          <div class="h-3 w-full rounded-full bg-slate-200/60" />
        </div>
        <div class="mt-auto flex gap-3">
          <div class="h-8 w-32 rounded-full bg-slate-200/60" />
          <div class="h-8 w-32 rounded-full bg-slate-200/60" />
        </div>
      </div>
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
import type { BlogPost, ReactionType } from "~/lib/mock/blog";

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
function toFiniteNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  if (Array.isArray(value)) {
    return value.length;
  }

  return 0;
}

function resolveReactionTotal(post: Partial<BlogPost> & {
  likes_count?: number | null;
  likes?: unknown[] | null;
  reactions?: unknown[] | null;
}): number {
  const candidates = [post.likes_count, post.reactions_count];

  for (const candidate of candidates) {
    const numeric = toFiniteNumber(candidate ?? 0);

    if (numeric) {
      return numeric;
    }
  }

  if (post.likes) {
    return toFiniteNumber(post.likes);
  }

  if (post.reactions) {
    return toFiniteNumber(post.reactions);
  }

  return 0;
}

function resolveCommentTotal(post: Partial<BlogPost> & {
  totalComments?: number | null;
  comments?: unknown;
  children?: unknown;
  replies?: unknown;
}): number {
  const direct = toFiniteNumber(post.totalComments ?? 0);

  if (direct) {
    return direct;
  }

  const collections = [post.comments, post.children, post.replies];

  for (const collection of collections) {
    if (Array.isArray(collection) && collection.length > 0) {
      return collection.length;
    }
  }

  return 0;
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
    (total, post) => total + resolveReactionTotal(post),
    0,
  );
  const totalComments = communityPosts.reduce(
    (total, post) => total + resolveCommentTotal(post),
    0,
  );
  const activeMembers = new Set(communityPosts.map((post) => post.user?.id)).size;

  return [
    {
      id: "members",
      value: formatNumber(activeMembers),
      label: t("blog.hero.stats.members"),
    },
    {
      id: "reactions",
      value: formatNumber(totalReactions),
      label: t("blog.hero.stats.reactions"),
    },
    {
      id: "comments",
      value: formatNumber(totalComments),
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

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat(locale.value).format(value ?? 0);
}

await callOnce(() => fetchPosts());

const newPostContent = ref("");
const composerFeedback = ref<{ type: "success" | "error"; message: string } | null>(null);

const characterCountLabel = computed(() => {
  const length = newPostContent.value.trim().length;
  return t("blog.composer.characterCount", { count: formatNumber(length) });
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
