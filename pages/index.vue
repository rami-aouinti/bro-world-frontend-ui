<template>
  <div class="relative min-h-screen overflow-hidden bg-transparent text-slate-50">
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div
          v-if="pending"
          class="grid gap-8 sm:grid-cols-2"
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
        <div class="flex flex-col gap-8">
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
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { callOnce } from "#imports";
import { usePostsStore } from "~/composables/usePostsStore";
import type { ReactionType } from "~/lib/mock/blog";
import type { SidebarWidgetData } from "~/components/blog/SidebarWidget.vue";
import SidebarWidget from "~/components/blog/SidebarWidget.vue";

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

const { posts, pending, fetchPosts } = usePostsStore();
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
</script>
