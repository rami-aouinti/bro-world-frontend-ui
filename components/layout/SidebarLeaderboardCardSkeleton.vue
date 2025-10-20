<template>
  <SidebarCard
    class="text-card-foreground px-3 py-2"
    glow
  >
    <div class="space-y-4 animate-pulse">
      <header class="flex items-center justify-between text-card-foreground">
        <div class="h-6 w-28 rounded-full bg-muted/60" />
        <div class="h-3 w-12 rounded-full bg-primary/30" />
      </header>

      <ul class="space-y-4 px-2">
        <li
          v-for="index in 3"
          :key="index"
          class="-mx-[var(--card-x)] my-2 flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 px-[var(--card-x)] py-3 text-sm"
        >
          <span
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-base font-semibold text-primary"
          >
            <span class="h-4 w-4 rounded-full bg-muted/70" />
          </span>
          <div class="flex flex-1 flex-col gap-2">
            <div class="h-4 w-32 rounded-full bg-muted/70" />
            <div class="h-3 w-24 rounded-full bg-muted/50" />
          </div>
          <span class="h-6 w-16 rounded-full bg-muted/60" />
        </li>
      </ul>
    </div>
  </SidebarCard>
</template>

<script setup lang="ts">
import SidebarCard from "~/components/layout/SidebarCard.vue";
</script>
