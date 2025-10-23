<template>
  <div class="flex flex-col gap-6">
    <SidebarCard
      class="bg-card/80 backdrop-blur"
      :particles="false"
      padding="md"
    >
      <header class="mb-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-primary">
          {{ t("pages.world.sidebar.overview.title") }}
        </p>
        <h2 class="text-lg font-semibold text-card-foreground">
          {{ worldName }}
        </h2>
        <p
          v-if="worldDescription"
          class="mt-2 text-sm text-muted-foreground"
        >
          {{ worldDescription }}
        </p>
      </header>

      <dl class="space-y-3 text-sm">
        <div class="flex items-start justify-between gap-4">
          <dt class="text-muted-foreground">
            {{ t("pages.world.sidebar.overview.creator") }}
          </dt>
          <dd class="text-right font-medium text-card-foreground">
            {{ creatorLabel }}
          </dd>
        </div>
        <div class="flex items-start justify-between gap-4">
          <dt class="text-muted-foreground">
            {{ t("pages.world.sidebar.overview.visibility") }}
          </dt>
          <dd class="text-right font-medium text-card-foreground">
            {{ visibilityLabel }}
          </dd>
        </div>
        <div
          v-if="themeLabel"
          class="flex items-start justify-between gap-4"
        >
          <dt class="text-muted-foreground">
            {{ t("pages.world.sidebar.overview.theme") }}
          </dt>
          <dd class="text-right font-medium text-card-foreground">
            {{ themeLabel }}
          </dd>
        </div>
      </dl>

      <div class="mt-5">
        <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {{ t("pages.world.sidebar.overview.tags") }}
        </p>
        <div
          v-if="worldTags.length"
          class="mt-2 flex flex-wrap gap-2"
        >
          <span
            v-for="tag in worldTags"
            :key="tag"
            class="inline-flex items-center rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-xs font-medium text-muted-foreground"
          >
            {{ tag }}
          </span>
        </div>
        <p
          v-else
          class="mt-2 text-xs text-muted-foreground"
        >
          {{ t("pages.world.sidebar.overview.tagsEmpty") }}
        </p>
      </div>
    </SidebarCard>

    <SidebarCard
      class="bg-card/80 backdrop-blur"
      :particles="false"
      padding="md"
    >
      <header class="mb-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-primary">
          {{ t("pages.world.sidebar.members.title") }}
        </p>
      </header>

      <ul class="space-y-3 text-sm">
        <li v-if="participantsLabel">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">{{ t("pages.world.sidebar.members.participantsLabel") }}</span>
            <span class="font-semibold text-card-foreground">{{ participantsLabel }}</span>
          </div>
        </li>
        <li v-if="ratingLabel">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">{{ t("pages.world.sidebar.members.ratingLabel") }}</span>
            <span class="font-semibold text-card-foreground">{{ ratingLabel }}</span>
          </div>
        </li>
        <li v-if="launchLabel">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">{{ t("pages.world.sidebar.members.launchLabel") }}</span>
            <span class="font-semibold text-card-foreground">{{ launchLabel }}</span>
          </div>
        </li>
        <li v-if="guestAccessLabel">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">{{ t("pages.world.sidebar.members.guests") }}</span>
            <span class="font-semibold text-card-foreground">{{ guestAccessLabel }}</span>
          </div>
        </li>
      </ul>
    </SidebarCard>

    <SidebarCard
      class="bg-card/80 backdrop-blur"
      :particles="false"
      padding="md"
    >
      <header class="mb-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-primary">
          {{ t("pages.world.sidebar.quiz.title") }}
        </p>
        <p
          v-if="leaderboardUpdatedLabel"
          class="text-xs text-muted-foreground"
        >
          {{ leaderboardUpdatedLabel }}
        </p>
      </header>

      <ul
        v-if="leaderboard.length"
        class="space-y-3"
      >
        <li
          v-for="entry in leaderboard"
          :key="entry.rank + entry.player"
          class="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/60 px-3 py-2"
        >
          <div class="flex items-center gap-3">
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {{ entry.rank }}
            </span>
            <div>
              <p class="text-sm font-medium text-card-foreground">{{ entry.player }}</p>
              <p
                v-if="entry.meta"
                class="text-xs text-muted-foreground"
              >
                {{ entry.meta }}
              </p>
            </div>
          </div>
          <span class="text-sm font-semibold text-card-foreground">{{ entry.score }}</span>
        </li>
      </ul>
      <p
        v-else
        class="text-sm text-muted-foreground"
      >
        {{ t("pages.world.sidebar.quiz.empty") }}
      </p>
    </SidebarCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import SidebarCard from "~/components/layout/SidebarCard.vue";
import type { SiteWorldSettings } from "~/types/settings";

interface RawLeaderboardEntry {
  rank?: number | string | null;
  player?: string | null;
  score?: number | string | null;
  streak?: number | null;
  completed?: string | null;
}

interface NormalizedLeaderboardEntry {
  rank: string;
  player: string;
  score: string;
  meta: string | null;
}

const props = defineProps<{
  world: SiteWorldSettings | null;
  leaderboard: RawLeaderboardEntry[];
  leaderboardUpdatedAt?: string | null;
}>();

const { t, locale } = useI18n();

const worldName = computed(() => props.world?.name?.trim() || t("app.worldSummary.untitled"));
const worldDescription = computed(() => props.world?.description?.trim() || "");

const creatorLabel = computed(() => {
  const creatorName = props.world?.createdBy?.name?.trim();

  if (creatorName) {
    return creatorName;
  }

  return t("pages.world.sidebar.overview.creatorFallback");
});

const visibilityLabel = computed(() => {
  const visibility = props.world?.visibility?.trim().toLowerCase();

  if (visibility === "public") {
    return t("pages.world.sidebar.overview.visibilityPublic");
  }

  if (visibility === "private") {
    return t("pages.world.sidebar.overview.visibilityPrivate");
  }

  return t("pages.world.sidebar.overview.visibilityUnknown");
});

const themeLabel = computed(() => props.world?.theme?.trim() || "");

const worldTags = computed(() => {
  const tags = props.world?.tags ?? [];

  return tags
    .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
    .filter((tag): tag is string => Boolean(tag));
});

const numberFormatter = computed(() => new Intl.NumberFormat(locale.value));

const participantsLabel = computed(() => {
  const count = props.world?.participantsCount;

  if (!Number.isFinite(count) || count == null) {
    return null;
  }

  return numberFormatter.value.format(count);
});

const ratingLabel = computed(() => {
  const rating = props.world?.rating;

  if (!Number.isFinite(rating) || rating == null) {
    return null;
  }

  return (Math.round(rating * 10) / 10).toFixed(1);
});

const launchLabel = computed(() => {
  const launchDate = props.world?.launchDate?.trim();

  if (!launchDate) {
    return null;
  }

  const parsed = new Date(launchDate);
  const isValidDate = !Number.isNaN(parsed.getTime());
  return isValidDate
    ? new Intl.DateTimeFormat(locale.value, { dateStyle: "medium" }).format(parsed)
    : launchDate;
});

const guestAccessLabel = computed(() => {
  if (!props.world) {
    return null;
  }

  return props.world.allowGuests
    ? t("pages.world.sidebar.members.guestsOpen")
    : t("pages.world.sidebar.members.guestsClosed");
});

function formatLeaderboardEntry(entry: RawLeaderboardEntry): NormalizedLeaderboardEntry | null {
  const playerName = entry.player?.trim();

  if (!playerName) {
    return null;
  }

  const rankLabel = (() => {
    if (typeof entry.rank === "number") {
      return `#${numberFormatter.value.format(entry.rank)}`;
    }

    if (typeof entry.rank === "string" && entry.rank.trim()) {
      return entry.rank.trim();
    }

    return "#";
  })();

  const scoreLabel = (() => {
    if (typeof entry.score === "number") {
      return t("pages.world.sidebar.quiz.score", { points: numberFormatter.value.format(entry.score) });
    }

    if (typeof entry.score === "string" && entry.score.trim()) {
      return entry.score.trim();
    }

    return "";
  })();

  const metaLabel = (() => {
    if (typeof entry.streak === "number" && Number.isFinite(entry.streak)) {
      return t("pages.world.sidebar.quiz.streak", { count: numberFormatter.value.format(entry.streak) });
    }

    if (typeof entry.completed === "string" && entry.completed.trim()) {
      return entry.completed.trim();
    }

    return null;
  })();

  return {
    rank: rankLabel,
    player: playerName,
    score: scoreLabel || "—",
    meta: metaLabel,
  } satisfies NormalizedLeaderboardEntry;
}

const leaderboard = computed<NormalizedLeaderboardEntry[]>(() => {
  const entries = Array.isArray(props.leaderboard) ? props.leaderboard : [];

  return entries
    .map((entry) => formatLeaderboardEntry(entry))
    .filter((entry): entry is NormalizedLeaderboardEntry => Boolean(entry))
    .slice(0, 3);
});

const leaderboardUpdatedLabel = computed(() => {
  const updatedAt = props.leaderboardUpdatedAt;

  if (!updatedAt) {
    return null;
  }

  const parsed = new Date(updatedAt);
  const formatted = Number.isNaN(parsed.getTime())
    ? updatedAt
    : new Intl.DateTimeFormat(locale.value, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(parsed);

  return t("pages.world.sidebar.quiz.updated", { date: formatted });
});
</script>
