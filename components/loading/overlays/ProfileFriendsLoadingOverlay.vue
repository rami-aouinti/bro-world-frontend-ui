<template>
  <div
    class="profile-friends-overlay"
    aria-hidden="true"
  >
    <SidebarCard
      class="profile-friends-overlay__hero"
      glow
    >
      <div class="profile-friends-overlay__hero-content">
        <div class="profile-friends-overlay__hero-text">
          <v-skeleton-loader
            type="heading"
            class="profile-friends-overlay__title"
          />
          <div class="profile-friends-overlay__stats">
            <v-skeleton-loader
              v-for="index in 3"
              :key="`hero-stat-${index}`"
              type="text"
              class="profile-friends-overlay__stat"
            />
          </div>
        </div>
        <div class="profile-friends-overlay__hero-actions">
          <v-skeleton-loader type="button" />
          <v-skeleton-loader type="button" />
        </div>
      </div>
    </SidebarCard>

    <SidebarCard
      class="profile-friends-overlay__filters"
      glow
    >
      <div class="profile-friends-overlay__filters-header">
        <v-skeleton-loader type="heading" />
        <v-skeleton-loader type="text" />
      </div>
      <div class="profile-friends-overlay__chip-group">
        <v-skeleton-loader
          v-for="index in 5"
          :key="`filter-${index}`"
          type="chip"
        />
      </div>
    </SidebarCard>

    <div class="profile-friends-overlay__grid">
      <SidebarCard
        v-for="index in 6"
        :key="`friend-card-${index}`"
        class="profile-friends-overlay__card"
        glow
      >
        <div class="profile-friends-overlay__card-header">
          <v-skeleton-loader
            type="avatar"
            class="profile-friends-overlay__card-avatar"
          />
          <div class="profile-friends-overlay__card-text">
            <v-skeleton-loader type="text" />
            <v-skeleton-loader type="text" />
            <div class="profile-friends-overlay__card-chips">
              <v-skeleton-loader
                v-for="chip in 3"
                :key="`friend-${index}-chip-${chip}`"
                type="chip"
              />
            </div>
          </div>
        </div>
        <div class="profile-friends-overlay__card-meta">
          <v-skeleton-loader type="text" />
          <v-skeleton-loader type="text" />
        </div>
        <div class="profile-friends-overlay__card-actions">
          <v-skeleton-loader type="button" />
          <v-skeleton-loader type="button" />
        </div>
      </SidebarCard>
    </div>

    <SidebarCard
      class="profile-friends-overlay__suggestions"
      glow
    >
      <div class="profile-friends-overlay__suggestions-header">
        <v-skeleton-loader type="text" />
        <v-skeleton-loader type="button" />
      </div>
      <div class="profile-friends-overlay__suggestions-track">
        <div
          v-for="index in 4"
          :key="`suggestion-${index}`"
          class="profile-friends-overlay__suggestion"
        >
          <v-skeleton-loader type="avatar" />
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
.profile-friends-overlay {
  display: grid;
  gap: clamp(1.5rem, 4vw, 2.5rem);
  width: min(1100px, 100%);
}

.profile-friends-overlay__hero,
.profile-friends-overlay__filters,
.profile-friends-overlay__suggestions {
  padding: clamp(1.5rem, 3.5vw, 2.25rem);
}

.profile-friends-overlay__hero-content {
  display: flex;
  flex-direction: column;
  gap: clamp(1.25rem, 3vw, 2rem);
}

.profile-friends-overlay__hero-text {
  display: grid;
  gap: 1rem;
}

.profile-friends-overlay__title {
  height: 2.25rem;
  border-radius: 0.75rem;
  width: clamp(220px, 40%, 320px);
}

.profile-friends-overlay__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.profile-friends-overlay__stat {
  width: clamp(110px, 22%, 140px);
  height: 1.25rem;
  border-radius: 0.75rem;
}

.profile-friends-overlay__hero-actions {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.profile-friends-overlay__filters-header {
  display: grid;
  gap: 0.75rem;
}

.profile-friends-overlay__chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.profile-friends-overlay__grid {
  display: grid;
  gap: clamp(1.25rem, 3vw, 2rem);
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.profile-friends-overlay__card {
  display: grid;
  gap: 1.25rem;
  padding: clamp(1.5rem, 3vw, 2rem);
}

.profile-friends-overlay__card-header {
  display: flex;
  gap: 1.25rem;
}

.profile-friends-overlay__card-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
}

.profile-friends-overlay__card-text {
  display: grid;
  gap: 0.75rem;
  flex: 1;
}

.profile-friends-overlay__card-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.profile-friends-overlay__card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.profile-friends-overlay__card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.profile-friends-overlay__suggestions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.profile-friends-overlay__suggestions-track {
  display: grid;
  grid-auto-flow: column;
  gap: 1.5rem;
  overflow: hidden;
}

.profile-friends-overlay__suggestion {
  display: grid;
  justify-items: center;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .profile-friends-overlay__hero-content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
