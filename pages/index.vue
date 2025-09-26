<template>
  <div class="relative min-h-screen bg-[#f3f6ff] text-slate-800">
    <div class="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
    <div class="pointer-events-none absolute -right-40 top-72 h-80 w-80 rounded-full bg-rose-200/60 blur-3xl" />

    <div class="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
      <div class="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside class="space-y-6">
          <section
            class="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-[0_35px_65px_-35px_rgba(15,23,42,0.45)] backdrop-blur-xl"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <v-icon
                  icon="mdi-login"
                  size="26"
                />
              </div>
              <div>
                <h2 class="text-lg font-semibold text-slate-900">Connect</h2>
                <p class="text-sm text-slate-500">Quick access to your BroWorld spaces.</p>
              </div>
            </div>

            <div class="mt-6 space-y-2">
              <button
                v-for="item in navigationItems"
                :key="item.id"
                type="button"
                class="group flex w-full items-center justify-between gap-3 rounded-2xl border border-transparent px-4 py-3 text-left transition hover:-translate-y-0.5"
                :class="
                  activeNavigation === item.id
                    ? 'bg-gradient-to-r from-primary to-fuchsia-500 text-white shadow-lg shadow-primary/30'
                    : 'bg-white/60 text-slate-600 hover:border-primary/30 hover:bg-white'
                "
                @click="activeNavigation = item.id"
              >
                <div class="flex items-center gap-3">
                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-xl"
                    :class="activeNavigation === item.id ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'"
                  >
                    <v-icon
                      :icon="item.icon"
                      size="22"
                    />
                  </span>
                  <span class="font-medium">{{ item.label }}</span>
                </div>
                <v-icon
                  icon="mdi-arrow-right"
                  size="18"
                  :class="activeNavigation === item.id ? 'text-white' : 'text-slate-400 group-hover:text-primary'"
                />
              </button>
            </div>
          </section>

          <section
            class="overflow-hidden rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/10 via-white to-white p-6 shadow-[0_30px_55px_-35px_rgba(192,132,252,0.45)]"
          >
            <div class="flex flex-col gap-4">
              <h3 class="text-base font-semibold text-slate-900">Stay in sync</h3>
              <p class="text-sm text-slate-600">
                Create meetings, share updates, and collaborate with your team from a single workspace.
              </p>
              <NuxtLink
                to="/about"
                class="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
              >
                Explore features
                <span aria-hidden="true">→</span>
              </NuxtLink>
            </div>
          </section>
        </aside>

        <main class="space-y-6">
          <section
            class="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_40px_75px_-45px_rgba(15,23,42,0.6)] backdrop-blur-xl"
          >
            <div class="flex flex-col gap-3">
              <h1 class="text-2xl font-semibold text-slate-900">{{ heroContent.title }}</h1>
              <p class="text-sm text-slate-600">{{ heroContent.description }}</p>
            </div>
            <div class="mt-6 grid gap-4 sm:grid-cols-3">
              <div
                v-for="stat in heroStats"
                :key="stat.id"
                class="rounded-2xl bg-slate-900/5 px-4 py-3"
              >
                <p class="text-xs font-medium uppercase tracking-[0.2em] text-primary">{{ stat.label }}</p>
                <p class="mt-2 text-2xl font-semibold text-slate-900">{{ stat.value }}</p>
              </div>
            </div>
          </section>

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
            <form
              class="flex flex-col gap-5 rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_40px_75px_-45px_rgba(15,23,42,0.6)] backdrop-blur-xl"
              @submit.prevent="handleCreatePost"
            >
              <div class="flex flex-col gap-2">
                <h2 class="text-lg font-semibold text-slate-900">
                  {{ t("blog.composer.title") }}
                </h2>
                <p class="text-sm text-slate-600">
                  {{ t("blog.composer.subtitle") }}
                </p>
              </div>

              <label class="flex flex-col gap-3 text-sm text-slate-600">
                <span class="font-medium text-slate-800">
                  {{ t("blog.composer.label") }}
                </span>
                <textarea
                  v-model="newPostContent"
                  class="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  :placeholder="t('blog.composer.placeholder')"
                />
              </label>

              <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p
                  v-if="composerFeedback"
                  :class="composerFeedback.type === 'success' ? 'text-emerald-500' : 'text-rose-500'"
                  class="text-sm"
                >
                  {{ composerFeedback.message }}
                </p>
                <div class="flex items-center gap-3 sm:justify-end">
                  <span class="text-xs text-slate-500">
                    {{ characterCountLabel }}
                  </span>
                  <button
                    type="submit"
                    class="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="creating"
                  >
                    <span v-if="creating">
                      {{ t("blog.composer.submitting") }}
                    </span>
                    <span v-else>
                      {{ t("blog.composer.submit") }}
                    </span>
                  </button>
                </div>
              </div>
            </form>

            <div class="flex flex-col gap-4">
              <PostCard
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

        <aside class="space-y-4">
          <section class="rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_35px_65px_-45px_rgba(15,23,42,0.55)]">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.3em] text-primary">Weather today</p>
                <h2 class="mt-2 text-xl font-semibold text-slate-900">{{ weatherCard.location }}</h2>
                <p class="mt-1 text-sm text-slate-600">{{ weatherCard.condition }}</p>
              </div>
              <span class="rounded-full bg-primary/10 p-3 text-primary">
                <v-icon
                  :icon="weatherCard.icon"
                  size="30"
                />
              </span>
            </div>
            <div class="mt-6 flex items-baseline gap-2">
              <span class="text-4xl font-semibold text-slate-900">{{ weatherCard.temperature }}</span>
              <span class="text-sm text-slate-500">{{ weatherCard.feelsLike }}</span>
            </div>
          </section>

          <section class="space-y-4 rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_35px_65px_-45px_rgba(15,23,42,0.55)]">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-slate-900">News</h2>
              <NuxtLink
                to="/blog"
                class="text-sm font-medium text-primary hover:underline"
              >
                View all
              </NuxtLink>
            </div>
            <ul class="space-y-3">
              <li
                v-for="item in newsDigest"
                :key="item.id"
                class="rounded-2xl border border-slate-200/70 bg-slate-50/60 px-4 py-3"
              >
                <p class="text-sm font-medium text-slate-800">{{ item.title }}</p>
                <p class="text-xs text-slate-500">{{ item.time }}</p>
              </li>
            </ul>
          </section>

          <section class="rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_35px_65px_-45px_rgba(15,23,42,0.55)]">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm font-semibold text-slate-900">{{ ratingOverview.title }}</p>
                <p class="text-xs text-slate-500">{{ ratingOverview.subtitle }}</p>
              </div>
              <span class="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-500">
                {{ ratingOverview.badge }}
              </span>
            </div>
            <div class="mt-6 flex items-baseline gap-2">
              <span class="text-4xl font-semibold text-slate-900">{{ ratingOverview.score }}</span>
              <span class="text-sm text-slate-500">/ {{ ratingOverview.total }}</span>
            </div>
            <div class="mt-5 space-y-3">
              <div
                v-for="metric in ratingOverview.metrics"
                :key="metric.id"
              >
                <div class="flex items-center justify-between text-xs text-slate-500">
                  <span class="font-medium text-slate-700">{{ metric.label }}</span>
                  <span>{{ metric.value }}</span>
                </div>
                <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-200/80">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-primary to-fuchsia-500"
                    :style="{ width: metric.progress }"
                  />
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { callOnce } from "#imports";
import { usePostsStore } from "~/composables/usePostsStore";
import type { ReactionType } from "~/lib/mock/blog";

definePageMeta({
  showRightWidgets: false,
});

const defaultAvatar = "https://bro-world-space.com/img/person.png";

const reactionEmojis: Record<ReactionType, string> = {
  like: "👍",
  love: "❤️",
  wow: "😮",
  haha: "😂",
  sad: "😢",
  angry: "😡",
};

const { locale, t } = useI18n();

const reactionLabels = computed<Record<ReactionType, string>>(() => ({
  like: t("blog.reactions.reactionTypes.like"),
  love: t("blog.reactions.reactionTypes.love"),
  wow: t("blog.reactions.reactionTypes.wow"),
  haha: t("blog.reactions.reactionTypes.haha"),
  sad: t("blog.reactions.reactionTypes.sad"),
  angry: t("blog.reactions.reactionTypes.angry"),
}));

const { posts, pending, fetchPosts, createPost, creating } = usePostsStore();
const heroContent = computed(() => ({
  title: t("blog.hero.title"),
  description: t("blog.hero.description"),
}));
const heroStats = computed(() => {
  const communityPosts = posts.value ?? [];
  const totalReactions = communityPosts.reduce((total, post) => total + (post.reactions_count ?? 0), 0);
  const totalComments = communityPosts.reduce((total, post) => total + (post.totalComments ?? 0), 0);
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
