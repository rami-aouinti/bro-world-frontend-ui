<template>
  <div class="relative min-h-screen overflow-hidden bg-transparent text-slate-50">
    <div class="mx-auto flex w-full flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
      <section
        class="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-white/10 via-white/5 to-white/10 p-8 shadow-[0_25px_55px_-25px_rgba(15,23,42,0.65)] backdrop-blur-2xl"
        aria-labelledby="community-hero-heading"
      >
        <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div class="space-y-6">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
              {{ heroContent.eyebrow }}
            </p>
            <div class="space-y-4">
              <h1 id="community-hero-heading" class="text-3xl font-semibold text-white sm:text-4xl">
                {{ heroContent.title }}
              </h1>
              <p class="text-base text-slate-200 sm:text-lg">
                {{ heroContent.description }}
              </p>
            </div>
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <NuxtLink
                :href="heroContent.primary.href"
                class="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                <span>{{ heroContent.primary.label }}</span>
                <span aria-hidden="true">→</span>
              </NuxtLink>
              <NuxtLink
                :href="heroContent.secondary.href"
                class="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-2 text-sm font-semibold text-white transition hover:border-primary/60 hover:bg-primary/10"
                :target="heroContent.secondary.href.startsWith('http') ? '_blank' : undefined"
                :rel="heroContent.secondary.href.startsWith('http') ? 'noopener noreferrer' : undefined"
              >
                <span>{{ heroContent.secondary.label }}</span>
              </NuxtLink>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div
              v-for="stat in heroStats"
              :key="stat.id"
              class="flex flex-col gap-1 rounded-2xl border border-white/10 bg-black/20 p-5 text-white shadow-[0_20px_45px_-25px_rgba(15,23,42,0.65)] backdrop-blur-xl"
            >
              <span class="text-3xl font-semibold text-white">{{ stat.value }}</span>
              <span class="text-sm font-medium text-slate-300">{{ stat.label }}</span>
            </div>
          </div>
        </div>
      </section>

      <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div class="flex flex-col gap-6">
          <div
            v-if="pending"
            class="grid gap-6 sm:grid-cols-2"
          >
            <div
              v-for="index in 4"
              :key="index"
              class="flex flex-col gap-6 rounded-3xl border border-white/5 bg-white/5 p-8 shadow-[0_25px_55px_-25px_rgba(15,23,42,0.65)] backdrop-blur-xl"
            >
              <div class="flex items-center gap-4">
                <div class="h-14 w-14 rounded-2xl bg-white/10" />
                <div class="space-y-3">
                  <div class="h-3 w-32 rounded-full bg-white/10" />
                  <div class="h-3 w-24 rounded-full bg-white/10" />
                </div>
              </div>
              <div class="space-y-3">
                <div class="h-3 w-3/4 rounded-full bg-white/10" />
                <div class="h-3 w-2/3 rounded-full bg-white/10" />
                <div class="h-3 w-full rounded-full bg-white/10" />
              </div>
              <div class="mt-auto flex gap-3">
                <div class="h-7 w-28 rounded-full bg-white/5" />
                <div class="h-7 w-28 rounded-full bg-white/5" />
              </div>
            </div>
          </div>

          <template v-else>
            <form
              class="flex flex-col gap-4 rounded-3xl border border-white/5 bg-white/5 p-6 shadow-[0_25px_55px_-25px_rgba(15,23,42,0.65)] backdrop-blur-xl"
              @submit.prevent="handleCreatePost"
            >
              <div class="flex flex-col gap-3">
                <h2 class="text-lg font-semibold text-white">
                  {{ t("blog.composer.title") }}
                </h2>
                <p class="text-sm text-slate-300">
                  {{ t("blog.composer.subtitle") }}
                </p>
              </div>

              <label class="flex flex-col gap-3 text-sm text-slate-200">
                <span class="font-medium text-slate-100">
                  {{ t("blog.composer.label") }}
                </span>
                <textarea
                  v-model="newPostContent"
                  class="min-h-[140px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  :placeholder="t('blog.composer.placeholder')"
                />
              </label>

              <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p
                  v-if="composerFeedback"
                  :class="composerFeedback.type === 'success' ? 'text-emerald-300' : 'text-rose-300'"
                  class="text-sm"
                >
                  {{ composerFeedback.message }}
                </p>
                <div class="flex items-center gap-3 sm:justify-end">
                  <span class="text-xs text-slate-400">
                    {{ characterCountLabel }}
                  </span>
                  <button
                    type="submit"
                    class="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
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
        </div>

        <aside class="flex flex-col gap-5">
          <div class="rounded-3xl border border-white/5 bg-white/5 p-6 shadow-[0_25px_55px_-25px_rgba(15,23,42,0.65)] backdrop-blur-xl">
            <h2 class="text-lg font-semibold text-white">{{ sidebarContent.title }}</h2>
            <p class="mt-2 text-sm text-slate-300">{{ sidebarContent.subtitle }}</p>
            <div class="mt-5 grid gap-4">
              <SidebarWidget
                v-for="widget in sidebarContent.widgets"
                :key="widget.id"
                :widget="widget"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { callOnce } from "#imports";
import { usePostsStore } from "~/composables/usePostsStore";
import type { ReactionType } from "~/lib/mock/blog";
import type { SidebarWidgetData } from "~/components/blog/SidebarWidget.vue";
import SidebarWidget from "~/components/blog/SidebarWidget.vue";

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
  eyebrow: t("blog.hero.eyebrow"),
  title: t("blog.hero.title"),
  description: t("blog.hero.description"),
  primary: {
    label: t("blog.hero.primaryAction"),
    href: "#latest",
  },
  secondary: {
    label: t("blog.hero.secondaryAction"),
    href: "https://bro-world.com/docs",
  },
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
const sidebarContent = computed(() => ({
  title: t("blog.sidebar.title"),
  subtitle: t("blog.sidebar.subtitle"),
  widgets: [
    {
      id: "community",
      icon: "🤝",
      title: t("blog.sidebar.widgets.community.title"),
      description: t("blog.sidebar.widgets.community.description"),
      action: {
        label: t("blog.sidebar.widgets.community.action"),
        href: "https://discord.gg/broworld",
        external: true,
      },
    },
    {
      id: "docs",
      icon: "📘",
      title: t("blog.sidebar.widgets.docs.title"),
      description: t("blog.sidebar.widgets.docs.description"),
      action: {
        label: t("blog.sidebar.widgets.docs.action"),
        href: "https://bro-world.com/docs",
        external: true,
      },
    },
    {
      id: "contribute",
      icon: "📝",
      title: t("blog.sidebar.widgets.contribute.title"),
      description: t("blog.sidebar.widgets.contribute.description"),
      action: {
        label: t("blog.sidebar.widgets.contribute.action"),
        href: "https://bro-world.com/contact",
        external: true,
      },
    },
  ] satisfies SidebarWidgetData[],
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
