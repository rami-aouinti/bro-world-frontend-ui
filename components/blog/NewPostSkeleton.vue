<template>
  <SidebarCard
    class="text-card-foreground px-3 py-2 d-flex flex-column gap-3"
    glow
    aria-hidden="true"
  >
    <div class="d-flex align-center ga-3">
      <v-skeleton-loader
        class="flex-shrink-0"
        type="avatar"
        height="44"
        width="44"
      />
    </div>

    <v-skeleton-loader
      class="mt-3 w-100 rounded-lg"
      type="text"
      height="48"
    />

    <v-divider class="my-2" />

    <div class="d-flex flex-wrap justify-center ga-4">
      <v-skeleton-loader
        v-for="index in 3"
        :key="index"
        type="button"
        class="mx-2"
        height="36"
        width="100"
      />
    </div>
  </SidebarCard>
</template>

<script setup lang="ts">
import SidebarCard from "~/components/layout/SidebarCard.vue";
</script>
