<template>
  <div
    class="profile-photos-overlay"
    aria-hidden="true"
  >
    <SidebarCard
      class="profile-photos-overlay__hero"
      glow
    >
      <div class="profile-photos-overlay__hero-grid">
        <div class="profile-photos-overlay__hero-text">
          <v-skeleton-loader type="heading" />
          <v-skeleton-loader type="text" />
          <div class="profile-photos-overlay__stats">
            <v-skeleton-loader
              v-for="index in 3"
              :key="`stat-${index}`"
              type="text"
            />
          </div>
        </div>
        <div class="profile-photos-overlay__hero-actions">
          <v-skeleton-loader type="button" />
          <v-skeleton-loader type="button" />
        </div>
      </div>
    </SidebarCard>

    <div class="profile-photos-overlay__layout">
      <SidebarCard
        class="profile-photos-overlay__pinned"
        glow
      >
        <div class="profile-photos-overlay__pinned-header">
          <div>
            <v-skeleton-loader type="heading" />
            <v-skeleton-loader type="text" />
          </div>
          <div class="profile-photos-overlay__filter-chips">
            <v-skeleton-loader
              v-for="index in 4"
              :key="`filter-${index}`"
              type="chip"
            />
          </div>
        </div>
        <div class="profile-photos-overlay__pinned-grid">
          <SidebarCard
            class="profile-photos-overlay__pinned-feature"
            glow
          >
            <div class="profile-photos-overlay__image" />
            <v-skeleton-loader type="text" />
            <v-skeleton-loader type="text" />
            <div class="profile-photos-overlay__meta">
              <v-skeleton-loader type="text" />
              <v-skeleton-loader type="text" />
            </div>
          </SidebarCard>
          <div class="profile-photos-overlay__pinned-list">
            <SidebarCard
              v-for="index in 3"
              :key="`pinned-${index}`"
              class="profile-photos-overlay__pinned-item"
              glow
            >
              <div class="profile-photos-overlay__pinned-item-grid">
                <div class="profile-photos-overlay__thumb" />
                <div class="profile-photos-overlay__pinned-text">
                  <v-skeleton-loader type="text" />
                  <v-skeleton-loader type="text" />
                </div>
                <v-skeleton-loader type="chip" />
              </div>
            </SidebarCard>
          </div>
        </div>
      </SidebarCard>

      <SidebarCard
        class="profile-photos-overlay__gallery"
        glow
      >
        <div class="profile-photos-overlay__gallery-header">
          <div>
            <v-skeleton-loader type="heading" />
            <v-skeleton-loader type="text" />
          </div>
          <v-skeleton-loader type="button" />
        </div>
        <div class="profile-photos-overlay__gallery-grid">
          <div
            v-for="index in 9"
            :key="`gallery-${index}`"
            class="profile-photos-overlay__gallery-item"
          >
            <div class="profile-photos-overlay__gallery-thumb" />
            <v-skeleton-loader type="text" />
          </div>
        </div>
      </SidebarCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import SidebarCard from "~/components/layout/SidebarCard.vue";
</script>

<style scoped>
.profile-photos-overlay {
  display: grid;
  gap: clamp(1.75rem, 4vw, 2.5rem);
  width: min(1100px, 100%);
}

.profile-photos-overlay__hero {
  padding: clamp(1.75rem, 4vw, 2.5rem);
}

.profile-photos-overlay__hero-grid {
  display: flex;
  flex-direction: column;
  gap: clamp(1.25rem, 3vw, 2rem);
}

.profile-photos-overlay__hero-text {
  display: grid;
  gap: 1rem;
}

.profile-photos-overlay__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.profile-photos-overlay__hero-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.profile-photos-overlay__layout {
  display: grid;
  gap: clamp(1.5rem, 3vw, 2rem);
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.profile-photos-overlay__pinned,
.profile-photos-overlay__gallery {
  padding: clamp(1.5rem, 3vw, 2rem);
  display: grid;
  gap: 1.75rem;
}

.profile-photos-overlay__pinned-header,
.profile-photos-overlay__gallery-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.profile-photos-overlay__filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.profile-photos-overlay__pinned-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.profile-photos-overlay__pinned-feature {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
}

.profile-photos-overlay__image {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 1rem;
  background: linear-gradient(135deg, hsl(var(--primary) / 0.15), transparent);
}

.profile-photos-overlay__meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.profile-photos-overlay__pinned-list {
  display: grid;
  gap: 1rem;
}

.profile-photos-overlay__pinned-item {
  padding: 1rem;
}

.profile-photos-overlay__pinned-item-grid {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: center;
}

.profile-photos-overlay__thumb {
  width: 72px;
  height: 72px;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, hsl(var(--primary) / 0.15), transparent);
}

.profile-photos-overlay__pinned-text {
  display: grid;
  gap: 0.5rem;
}

.profile-photos-overlay__gallery-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.profile-photos-overlay__gallery-item {
  display: grid;
  gap: 0.5rem;
}

.profile-photos-overlay__gallery-thumb {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, hsl(var(--primary) / 0.15), transparent);
}

@media (min-width: 768px) {
  .profile-photos-overlay__hero-grid {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
