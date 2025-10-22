<template>
  <div class="flex flex-col gap-6">
    <SidebarCard
      padding="lg"
      class="flex flex-col gap-5"
    >
      <div class="d-flex align-center gap-4">
        <UserAvatar
          :src="playerAvatar ?? undefined"
          :name="playerName"
          :alt="playerName"
          :size="56"
        />
        <div class="flex-1 min-w-0">
          <p class="text-caption text-medium-emphasis mb-1">
            {{ playerLabel }}
          </p>
          <p class="text-subtitle-1 font-weight-semibold mb-0 text-truncate">
            {{ playerName }}
          </p>
        </div>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <VChip
          v-for="chip in chips"
          :key="chip.key"
          color="primary"
          variant="tonal"
          size="small"
          class="font-medium"
        >
          {{ chip.label }}
        </VChip>
      </div>
    </SidebarCard>

    <SidebarCard
      padding="lg"
      class="flex flex-col gap-4"
    >
      <div class="flex flex-col gap-3">
        <div class="d-flex align-center justify-space-between gap-3">
          <span class="text-body-2 text-medium-emphasis">{{ timerLabel }}</span>
          <span class="text-subtitle-1 font-weight-semibold text-right">{{ timerValue }}</span>
        </div>
        <div class="d-flex align-center justify-space-between gap-3">
          <span class="text-body-2 text-medium-emphasis">{{ scoreLabel }}</span>
          <span class="text-subtitle-1 font-weight-semibold text-right">{{ scoreValue }}</span>
        </div>
        <div>
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-body-2 text-medium-emphasis">{{ progressLabel }}</span>
            <span class="text-body-2 font-weight-semibold">{{ progressSummary }}</span>
          </div>
          <VProgressLinear
            :model-value="progressValue"
            color="primary"
            height="6"
            rounded
          />
        </div>
      </div>
      <p class="text-caption text-medium-emphasis mb-0">
        {{ helperMessage }}
      </p>
    </SidebarCard>

    <SidebarCard
      padding="lg"
      class="flex flex-col gap-4"
    >
      <div class="d-flex align-center justify-space-between">
        <h3 class="text-subtitle-1 font-weight-semibold mb-0">
          {{ leaderboardTitle }}
        </h3>
        <span
          v-if="leaderboardLoading"
          class="text-caption text-medium-emphasis"
        >
          {{ leaderboardLoadingLabel }}
        </span>
      </div>

      <div
        v-if="leaderboardLoading"
        class="flex flex-col gap-2"
      >
        <VSkeletonLoader
          v-for="index in 3"
          :key="`leaderboard-skeleton-${index}`"
          type="list-item"
          class="border-radius-lg"
        />
      </div>
      <template v-else>
        <ol
          v-if="hasLeaderboardEntries"
          class="game-sidebar-leaderboard"
        >
          <li
            v-for="entry in leaderboardEntries"
            :key="entry.id"
            class="game-sidebar-leaderboard__item"
          >
            <div class="d-flex align-center justify-space-between gap-3">
              <div class="d-flex align-center gap-3">
                <span class="game-sidebar-rank">{{ entry.rankLabel }}</span>
                <span class="text-body-2 font-weight-medium">{{ entry.player }}</span>
              </div>
              <span class="text-caption text-medium-emphasis">{{ entry.scoreText }}</span>
            </div>
          </li>
        </ol>
        <p
          v-else
          class="text-caption text-medium-emphasis mb-0"
        >
          {{ leaderboardEmptyLabel }}
        </p>
      </template>
    </SidebarCard>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";

import UserAvatar from "~/components/UserAvatar.vue";
import SidebarCard from "~/components/layout/SidebarCard.vue";

const vuetifyComponentsPromise = import("vuetify/components");

const VChip = defineAsyncComponent(() => vuetifyComponentsPromise.then((mod) => mod.VChip));
const VProgressLinear = defineAsyncComponent(() =>
  vuetifyComponentsPromise.then((mod) => mod.VProgressLinear),
);
const VSkeletonLoader = defineAsyncComponent(() =>
  vuetifyComponentsPromise.then((mod) => mod.VSkeletonLoader),
);

interface LeaderboardEntry {
  id: string;
  player: string;
  scoreText: string;
  rankLabel: string;
}

const props = defineProps<{
  playerName: string;
  playerLabel: string;
  playerAvatar?: string | null;
  categoryTitle: string;
  levelTitle: string;
  timerValue: string;
  scoreValue: string;
  answeredCount: number;
  totalQuestions: number;
  progressValue: number;
  helperText: string;
  leaderboardEntries: LeaderboardEntry[];
  leaderboardLoading: boolean;
}>();

const { t } = useI18n();

const timerLabel = computed(() => t("pages.game.menu.timer"));
const scoreLabel = computed(() => t("pages.game.menu.score"));
const progressLabel = computed(() => t("pages.game.menu.progress"));
const progressSummary = computed(() =>
  t("pages.game.questions.progress", {
    answered: props.answeredCount,
    total: props.totalQuestions,
  }),
);
const helperMessage = computed(() => props.helperText);
const leaderboardTitle = computed(() => t("pages.game.leaderboard.title"));
const leaderboardLoadingLabel = computed(() => t("pages.game.leaderboard.loading"));
const leaderboardEmptyLabel = computed(() => t("pages.game.leaderboard.empty"));
const hasLeaderboardEntries = computed(() => props.leaderboardEntries.length > 0);
const chips = computed(() => [
  { key: "category", label: props.categoryTitle },
  { key: "level", label: props.levelTitle },
]);
</script>

<style scoped>
@reference "../../assets/css/tailwind.css";

.game-sidebar-leaderboard {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0;
  margin: 0;
}

.game-sidebar-leaderboard__item {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.game-sidebar-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.12);
}
</style>
