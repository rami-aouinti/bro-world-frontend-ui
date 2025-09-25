<template>
  <div class="flex h-full flex-col gap-6">
    <SidebarWeatherCard :weather="weather" />
    <SidebarLeaderboardCard
      :title="leaderboard.title"
      :live-label="leaderboard.live"
      :participants="leaderboard.participants"
    />
    <SidebarRatingCard :rating="rating" />
  </div>
</template>

<script setup lang="ts">
import SidebarLeaderboardCard from "~/components/layout/SidebarLeaderboardCard.vue";
import SidebarRatingCard from "~/components/layout/SidebarRatingCard.vue";
import SidebarWeatherCard from "~/components/layout/SidebarWeatherCard.vue";
import type {
  SidebarLeaderboardData,
  SidebarRatingData,
  SidebarWeatherData,
} from "~/components/layout/right-sidebar.types";

defineProps<{
  weather: SidebarWeatherData;
  leaderboard: SidebarLeaderboardData;
  rating: SidebarRatingData;
}>();
</script>
