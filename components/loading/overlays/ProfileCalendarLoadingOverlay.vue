<template>
  <div
    class="profile-calendar-overlay"
    aria-hidden="true"
  >
    <SidebarCard
      class="profile-calendar-overlay__header"
      glow
    >
      <div class="profile-calendar-overlay__header-grid">
        <v-skeleton-loader type="heading" />
        <v-skeleton-loader type="text" />
      </div>
    </SidebarCard>
    <SidebarCard
      class="profile-calendar-overlay__calendar"
      glow
    >
      <div class="profile-calendar-overlay__grid">
        <div
          v-for="index in 7"
          :key="`weekday-${index}`"
          class="profile-calendar-overlay__weekday"
        >
          <v-skeleton-loader type="text" />
        </div>
        <div
          v-for="index in 35"
          :key="`day-${index}`"
          class="profile-calendar-overlay__cell"
        >
          <v-skeleton-loader type="text" />
        </div>
      </div>
    </SidebarCard>
  </div>
</template>

<script setup lang="ts">
import SidebarCard from "~/components/layout/SidebarCard.vue";
</script>

<style scoped>
.profile-calendar-overlay {
  display: grid;
  gap: clamp(1.5rem, 3vw, 2rem);
  width: min(960px, 100%);
}

.profile-calendar-overlay__header {
  padding: clamp(1.5rem, 3vw, 2rem);
}

.profile-calendar-overlay__header-grid {
  display: grid;
  gap: 0.75rem;
}

.profile-calendar-overlay__calendar {
  padding: clamp(1.5rem, 3vw, 2rem);
}

.profile-calendar-overlay__grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.profile-calendar-overlay__weekday {
  text-align: center;
}

.profile-calendar-overlay__cell {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
}
</style>
