<template>
  <div
    class="profile-friend-overlay"
    aria-hidden="true"
  >
    <SidebarCard
      class="profile-friend-overlay__hero"
      glow
    >
      <div class="profile-friend-overlay__hero-grid">
        <v-skeleton-loader
          type="avatar"
          class="profile-friend-overlay__avatar"
        />
        <div class="profile-friend-overlay__hero-text">
          <v-skeleton-loader type="heading" />
          <v-skeleton-loader type="text" />
          <div class="profile-friend-overlay__hero-meta">
            <v-skeleton-loader
              v-for="index in 3"
              :key="`meta-${index}`"
              type="text"
            />
          </div>
        </div>
        <div class="profile-friend-overlay__hero-actions">
          <v-skeleton-loader type="chip" />
          <v-skeleton-loader type="button" />
          <v-skeleton-loader type="button" />
        </div>
      </div>
    </SidebarCard>

    <div class="profile-friend-overlay__body">
      <SidebarCard
        class="profile-friend-overlay__section profile-friend-overlay__section--main"
        glow
      >
        <v-skeleton-loader type="heading" />
        <v-skeleton-loader type="paragraph" />
        <v-skeleton-loader type="text" />
        <div class="profile-friend-overlay__chip-list">
          <v-skeleton-loader
            v-for="index in 4"
            :key="`skill-${index}`"
            type="chip"
          />
        </div>
      </SidebarCard>
      <SidebarCard
        class="profile-friend-overlay__section profile-friend-overlay__section--aside"
        glow
      >
        <v-skeleton-loader type="heading" />
        <div class="profile-friend-overlay__aside-list">
          <div
            v-for="index in 3"
            :key="`aside-${index}`"
            class="profile-friend-overlay__aside-item"
          >
            <v-skeleton-loader type="avatar" />
            <div class="profile-friend-overlay__aside-text">
              <v-skeleton-loader type="text" />
              <v-skeleton-loader type="text" />
            </div>
          </div>
        </div>
      </SidebarCard>
    </div>

    <SidebarCard
      class="profile-friend-overlay__suggestions"
      glow
    >
      <div class="profile-friend-overlay__suggestions-header">
        <v-skeleton-loader type="heading" />
        <v-skeleton-loader type="button" />
      </div>
      <div class="profile-friend-overlay__suggestions-carousel">
        <div
          v-for="index in 5"
          :key="`carousel-${index}`"
          class="profile-friend-overlay__suggestion"
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
.profile-friend-overlay {
  display: grid;
  gap: clamp(1.75rem, 4vw, 2.5rem);
  width: min(1100px, 100%);
}

.profile-friend-overlay__hero {
  padding: clamp(1.75rem, 4vw, 2.5rem);
}

.profile-friend-overlay__hero-grid {
  display: grid;
  gap: clamp(1.25rem, 3vw, 2rem);
  grid-template-columns: minmax(0, auto) 1fr;
  align-items: start;
}

.profile-friend-overlay__avatar {
  width: 104px;
  height: 104px;
  border-radius: 50%;
}

.profile-friend-overlay__hero-text {
  display: grid;
  gap: 0.75rem;
}

.profile-friend-overlay__hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.profile-friend-overlay__hero-actions {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.profile-friend-overlay__body {
  display: grid;
  gap: clamp(1.25rem, 3vw, 2rem);
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.profile-friend-overlay__section {
  padding: clamp(1.5rem, 3vw, 2rem);
  display: grid;
  gap: 1.25rem;
}

.profile-friend-overlay__chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.profile-friend-overlay__aside-list {
  display: grid;
  gap: 1rem;
}

.profile-friend-overlay__aside-item {
  display: flex;
  gap: 0.75rem;
}

.profile-friend-overlay__aside-text {
  display: grid;
  gap: 0.5rem;
  flex: 1;
}

.profile-friend-overlay__suggestions {
  padding: clamp(1.5rem, 3vw, 2rem);
  display: grid;
  gap: 1.5rem;
}

.profile-friend-overlay__suggestions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.profile-friend-overlay__suggestions-carousel {
  display: grid;
  grid-auto-flow: column;
  gap: 1.25rem;
  overflow: hidden;
}

.profile-friend-overlay__suggestion {
  display: grid;
  gap: 0.5rem;
  justify-items: center;
}

@media (max-width: 768px) {
  .profile-friend-overlay__hero-grid {
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .profile-friend-overlay__hero-actions {
    width: 100%;
  }
}
</style>
