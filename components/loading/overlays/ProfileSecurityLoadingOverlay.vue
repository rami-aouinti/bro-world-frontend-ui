<template>
  <div
    class="profile-security-overlay"
    aria-hidden="true"
  >
    <SidebarCard
      v-for="index in 3"
      :key="`security-section-${index}`"
      class="profile-security-overlay__card"
      glow
    >
      <div class="profile-security-overlay__header">
        <v-skeleton-loader type="heading" />
        <v-skeleton-loader type="text" />
      </div>
      <div class="profile-security-overlay__content">
        <div
          v-for="item in 3"
          :key="`security-${index}-item-${item}`"
          class="profile-security-overlay__item"
        >
          <div class="profile-security-overlay__item-body">
            <v-skeleton-loader type="text" />
            <v-skeleton-loader type="text" />
          </div>
          <div class="profile-security-overlay__item-actions">
            <v-skeleton-loader type="button" />
            <v-skeleton-loader type="chip" />
          </div>
        </div>
      </div>
    </SidebarCard>
  </div>
</template>

<script setup lang="ts">
import SidebarCard from "~/components/layout/SidebarCard.vue";
</script>

<style scoped>
.profile-security-overlay {
  display: grid;
  gap: clamp(1.5rem, 3vw, 2rem);
  width: min(960px, 100%);
}

.profile-security-overlay__card {
  padding: clamp(1.75rem, 4vw, 2.5rem);
  display: grid;
  gap: 1.5rem;
}

.profile-security-overlay__header {
  display: grid;
  gap: 0.5rem;
}

.profile-security-overlay__content {
  display: grid;
  gap: 1.25rem;
}

.profile-security-overlay__item {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
}

.profile-security-overlay__item-body {
  display: grid;
  gap: 0.5rem;
  flex: 1 1 60%;
}

.profile-security-overlay__item-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
</style>
