<template>
  <div
    class="profile-notifications-overlay"
    aria-hidden="true"
  >
    <SidebarCard
      v-for="index in 2"
      :key="`notifications-section-${index}`"
      class="profile-notifications-overlay__card"
      glow
    >
      <div class="profile-notifications-overlay__header">
        <v-skeleton-loader type="heading" />
        <v-skeleton-loader type="text" />
      </div>
      <div class="profile-notifications-overlay__list">
        <div
          v-for="item in 4"
          :key="`notifications-${index}-item-${item}`"
          class="profile-notifications-overlay__item"
        >
          <div class="profile-notifications-overlay__item-text">
            <v-skeleton-loader type="text" />
            <v-skeleton-loader type="text" />
          </div>
          <v-skeleton-loader type="switch" />
        </div>
      </div>
    </SidebarCard>
  </div>
</template>

<script setup lang="ts">
import SidebarCard from "~/components/layout/SidebarCard.vue";
</script>

<style scoped>
.profile-notifications-overlay {
  display: grid;
  gap: clamp(1.5rem, 3vw, 2rem);
  width: min(960px, 100%);
}

.profile-notifications-overlay__card {
  padding: clamp(1.75rem, 4vw, 2.5rem);
  display: grid;
  gap: 1.5rem;
}

.profile-notifications-overlay__header {
  display: grid;
  gap: 0.5rem;
}

.profile-notifications-overlay__list {
  display: grid;
  gap: 1.25rem;
}

.profile-notifications-overlay__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.profile-notifications-overlay__item-text {
  display: grid;
  gap: 0.5rem;
  flex: 1;
}
</style>
