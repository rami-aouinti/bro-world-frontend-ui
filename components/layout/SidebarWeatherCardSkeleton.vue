<template>
  <SidebarCard
    class="text-card-foreground px-3 py-2"
    glow
  >
    <div class="flex items-start justify-between gap-3 animate-pulse">
      <div class="flex flex-1 flex-col gap-3">
        <div class="h-3 w-24 rounded-full bg-muted/60" />
        <div class="h-9 w-28 rounded-full bg-muted/80" />
        <div class="weather-card__details mt-2">
          <div class="space-y-2">
            <div class="h-3 w-32 rounded-full bg-muted/50" />
            <div class="h-3 w-28 rounded-full bg-muted/40" />
          </div>
          <div class="h-8 w-36 rounded-full bg-muted/30" />
        </div>
      </div>
      <div class="h-14 w-14 rounded-2xl bg-muted/40" />
    </div>
  </SidebarCard>
</template>

<script setup lang="ts">
import SidebarCard from "~/components/layout/SidebarCard.vue";
</script>

<style scoped>
.weather-card__details {
  min-height: 4.75rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
