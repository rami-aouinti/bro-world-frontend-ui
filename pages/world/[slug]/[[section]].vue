<template>
  <HomePage />
</template>

<script setup lang="ts">
import { computed } from "vue";
import HomePage from "~/pages/home.vue";
import { useLayoutRightSidebar } from "~/composables/useLayoutRightSidebar";
import { useWorldBlogPage } from "~/composables/useWorldBlogPage";
import WorldSidebarSummary from "~/components/world/WorldSidebarSummary.vue";

interface QuizLeaderboardEntryPayload {
  rank?: number | string | null;
  player?: string | null;
  score?: number | string | null;
  streak?: number | null;
  completed?: string | null;
}

type QuizLeaderboardPayload =
  | QuizLeaderboardEntryPayload[]
  | {
      entries?: QuizLeaderboardEntryPayload[] | null;
      leaderboard?: QuizLeaderboardEntryPayload[] | null;
      updatedAt?: string | null;
    };

const { world } = useWorldBlogPage();

const { data: quizLeaderboardData } = await useAsyncData<QuizLeaderboardPayload | null>(
  "world-quiz-leaderboard",
  async () => {
    try {
      return await $fetch<QuizLeaderboardPayload>("/api/quiz/leaderboard");
    } catch (error) {
      if (import.meta.dev) {
        console.warn("[world-sidebar] Failed to load quiz leaderboard", error);
      }

      return null;
    }
  },
);

function toLeaderboardArray(source: unknown): QuizLeaderboardEntryPayload[] {
  if (!Array.isArray(source)) {
    return [];
  }

  return source.filter(
    (entry): entry is QuizLeaderboardEntryPayload => typeof entry === "object" && entry !== null,
  );
}

const leaderboardEntries = computed<QuizLeaderboardEntryPayload[]>(() => {
  const payload = quizLeaderboardData.value;

  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return toLeaderboardArray(payload);
  }

  const entries = toLeaderboardArray(payload.entries);

  if (entries.length > 0) {
    return entries;
  }

  return toLeaderboardArray(payload.leaderboard);
});

const leaderboardUpdatedAt = computed(() => {
  const payload = quizLeaderboardData.value;

  if (!payload || Array.isArray(payload)) {
    return null;
  }

  return typeof payload.updatedAt === "string" ? payload.updatedAt : null;
});

const { registerRightSidebarContent } = useLayoutRightSidebar();

registerRightSidebarContent(
  computed(() => ({
    component: WorldSidebarSummary,
    props: {
      world: world.value ?? null,
      leaderboard: leaderboardEntries.value,
      leaderboardUpdatedAt: leaderboardUpdatedAt.value,
    },
    wrapperClass: "flex flex-col gap-6",
    intrinsicHeight: 920,
  })),
);
</script>
