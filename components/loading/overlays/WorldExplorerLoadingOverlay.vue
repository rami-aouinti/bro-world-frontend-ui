<template>
  <div
    class="world-explorer-overlay"
    aria-hidden="true"
  >
    <SidebarCard
      class="world-explorer-overlay__header"
      glow
    >
      <div class="world-explorer-overlay__header-content">
        <v-skeleton-loader
          type="heading"
          class="world-explorer-overlay__title"
        />
        <v-skeleton-loader
          type="text"
          class="world-explorer-overlay__description"
        />
        <v-skeleton-loader
          type="button"
          class="world-explorer-overlay__cta"
        />
      </div>
    </SidebarCard>

    <div class="world-explorer-overlay__grid">
      <SidebarCard
        v-for="index in 6"
        :key="`world-card-${index}`"
        class="world-explorer-overlay__card"
        glow
      >
        <div class="world-explorer-overlay__card-body">
          <v-skeleton-loader
            type="chip"
            class="world-explorer-overlay__chip"
          />
          <v-skeleton-loader
            type="heading"
            class="world-explorer-overlay__card-title"
          />
          <v-skeleton-loader
            type="paragraph"
            class="world-explorer-overlay__card-text"
          />
          <div class="world-explorer-overlay__meta">
            <v-skeleton-loader type="text" />
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
.world-explorer-overlay {
  display: grid;
  gap: clamp(1.75rem, 4vw, 2.5rem);
  width: min(1100px, 100%);
}

.world-explorer-overlay__header {
  padding: clamp(1.5rem, 3vw, 2rem);
}

.world-explorer-overlay__header-content {
  display: grid;
  gap: clamp(1rem, 3vw, 1.5rem);
}

.world-explorer-overlay__title {
  height: 2.75rem;
  border-radius: 0.75rem;
}

.world-explorer-overlay__description {
  height: 1.5rem;
  border-radius: 0.75rem;
}

.world-explorer-overlay__cta {
  height: 2.5rem;
  width: clamp(160px, 30%, 200px);
  border-radius: 999px;
}

.world-explorer-overlay__grid {
  display: grid;
  gap: clamp(1.5rem, 3vw, 2rem);
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

.world-explorer-overlay__card {
  padding: clamp(1.25rem, 3vw, 1.75rem);
}

.world-explorer-overlay__card-body {
  display: grid;
  gap: clamp(0.75rem, 2vw, 1.25rem);
}

.world-explorer-overlay__chip {
  width: clamp(120px, 40%, 160px);
  height: 1.75rem;
  border-radius: 999px;
}

.world-explorer-overlay__card-title {
  height: 1.75rem;
  border-radius: 0.75rem;
}

.world-explorer-overlay__card-text {
  height: 3.25rem;
  border-radius: 0.75rem;
}

.world-explorer-overlay__meta {
  display: grid;
  gap: 0.5rem;
}
</style>
