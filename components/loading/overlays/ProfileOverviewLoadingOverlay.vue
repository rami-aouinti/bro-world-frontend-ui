<template>
  <div
    class="profile-overview-overlay"
    aria-hidden="true"
  >
    <SidebarCard
      class="profile-overview-overlay__hero"
      glow
    >
      <div class="profile-overview-overlay__hero-content">
        <v-skeleton-loader
          type="avatar"
          class="profile-overview-overlay__avatar"
        />
        <div class="profile-overview-overlay__hero-text">
          <v-skeleton-loader
            type="heading"
            class="profile-overview-overlay__name"
          />
          <v-skeleton-loader
            type="text"
            class="profile-overview-overlay__username"
          />
          <div class="profile-overview-overlay__chips">
            <v-skeleton-loader
              v-for="index in 3"
              :key="`role-${index}`"
              type="chip"
              class="profile-overview-overlay__chip"
            />
          </div>
          <v-skeleton-loader
            type="paragraph"
            class="profile-overview-overlay__bio"
          />
        </div>
      </div>
    </SidebarCard>

    <div class="profile-overview-overlay__sections">
      <SidebarCard
        v-for="index in 3"
        :key="`section-${index}`"
        class="profile-overview-overlay__section"
        glow
      >
        <v-skeleton-loader
          type="heading"
          class="profile-overview-overlay__section-title"
        />
        <div class="profile-overview-overlay__section-body">
          <v-skeleton-loader
            v-for="item in 4"
            :key="`section-${index}-item-${item}`"
            type="text"
            class="profile-overview-overlay__section-line"
          />
        </div>
      </SidebarCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import SidebarCard from "~/components/layout/SidebarCard.vue";
</script>

<style scoped>
.profile-overview-overlay {
  display: grid;
  gap: clamp(1.75rem, 4vw, 2.5rem);
  width: min(1100px, 100%);
}

.profile-overview-overlay__hero {
  padding: clamp(1.75rem, 4vw, 2.5rem);
}

.profile-overview-overlay__hero-content {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: clamp(1.5rem, 4vw, 2.5rem);
  align-items: center;
}

.profile-overview-overlay__avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
}

.profile-overview-overlay__hero-text {
  display: grid;
  gap: clamp(0.75rem, 2vw, 1.25rem);
}

.profile-overview-overlay__name {
  height: 2.5rem;
  border-radius: 0.75rem;
}

.profile-overview-overlay__username {
  height: 1.25rem;
  width: 40%;
  border-radius: 0.75rem;
}

.profile-overview-overlay__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.profile-overview-overlay__chip {
  width: clamp(80px, 25%, 120px);
  height: 1.75rem;
  border-radius: 999px;
}

.profile-overview-overlay__bio {
  height: 3rem;
  border-radius: 0.75rem;
}

.profile-overview-overlay__sections {
  display: grid;
  gap: clamp(1.25rem, 3vw, 2rem);
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.profile-overview-overlay__section {
  padding: clamp(1.5rem, 3vw, 2rem);
  display: grid;
  gap: 1.5rem;
}

.profile-overview-overlay__section-title {
  height: 1.5rem;
  width: 50%;
  border-radius: 0.75rem;
}

.profile-overview-overlay__section-body {
  display: grid;
  gap: 0.75rem;
}

.profile-overview-overlay__section-line {
  height: 1.1rem;
  border-radius: 0.75rem;
}

@media (max-width: 640px) {
  .profile-overview-overlay__hero-content {
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .profile-overview-overlay__hero-text {
    width: 100%;
  }
}
</style>
