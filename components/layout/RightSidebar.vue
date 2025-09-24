<template>
  <aside class="sticky top-24 hidden h-[calc(100vh-6rem)] lg:flex">
    <UiScrollArea
      orientation="vertical"
      type="hover"
      class="h-full w-full overflow-hidden py-6 pr-2"
    >
      <div class="flex h-full flex-col gap-6 pr-4">
        <LayoutSidebarWeatherCard :weather="weather" />
        <LayoutSidebarLeaderboardCard
          :title="leaderboard.title"
          :live-label="leaderboard.live"
          :participants="leaderboard.participants"
        />
        <LayoutSidebarRatingCard :rating="rating" />
      </div>
    </UiScrollArea>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface SidebarWeatherContent {
  badge: string;
  title: string;
  subtitle: string;
  icon: string;
  location: string;
  temperature: string;
  tip: string;
  locationLabel: string;
  temperatureLabel: string;
  tipLabel: string;
}

interface SidebarParticipant {
  name: string;
  role: string;
  score: string;
}

interface SidebarLeaderboardContent {
  title: string;
  live: string;
  participants: Record<"first" | "second" | "third", SidebarParticipant>;
}

interface SidebarRatingCategory {
  label: string;
  value: number;
}

interface SidebarRatingContent {
  title: string;
  subtitle: string;
  average: string;
  total: number;
  icon: string;
  stars: number;
  categories: Record<string, SidebarRatingCategory>;
}

const { tm } = useI18n();

const weather = computed(() => tm("sidebar.weather") as SidebarWeatherContent);

const leaderboard = computed(() => {
  const raw = tm("sidebar.leaderboard") as SidebarLeaderboardContent | undefined;
  const order: Array<keyof SidebarLeaderboardContent["participants"]> = [
    "first",
    "second",
    "third",
  ];

  const participants = order
    .map((key) => raw?.participants?.[key])
    .filter((participant): participant is SidebarParticipant => Boolean(participant))
    .map((participant, index) => ({
      position: index + 1,
      ...participant,
    }));

  return {
    title: raw?.title ?? "",
    live: raw?.live ?? "",
    participants,
  };
});

const rating = computed(() => {
  const raw = tm("sidebar.rating") as SidebarRatingContent;

  return {
    ...raw,
    categories: Object.values(raw.categories ?? {}),
  };
});
</script>
