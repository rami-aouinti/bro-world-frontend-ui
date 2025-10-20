<template>
  <SidebarCard
    class="text-card-foreground px-3 py-2"
    glow
  >
    <div class="flex flex-col gap-6 animate-pulse">
      <header class="flex items-center justify-between text-card-foreground">
        <div class="space-y-2">
          <div class="h-5 w-32 rounded-full bg-muted/70" />
          <div class="h-3 w-40 rounded-full bg-muted/50" />
        </div>
        <div class="flex items-center gap-2 text-right text-foreground">
          <div class="h-8 w-8 rounded-full bg-muted/40" />
          <div class="space-y-2">
            <div class="h-6 w-12 rounded-full bg-muted/70" />
            <div class="h-3 w-10 rounded-full bg-muted/40" />
          </div>
        </div>
      </header>

      <div class="flex flex-col items-center gap-3 text-primary">
        <div class="h-6 w-28 rounded-full bg-muted/40" />
        <div class="h-3 w-24 rounded-full bg-muted/30" />
      </div>

      <div class="space-y-4">
        <div
          v-for="index in 5"
          :key="index"
          class="flex items-center gap-3"
        >
          <div class="flex w-16 items-center justify-between">
            <div class="h-4 w-6 rounded-full bg-muted/50" />
            <div class="h-4 w-4 rounded-full bg-muted/40" />
          </div>
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-muted/30">
            <div class="h-full w-1/2 bg-muted/50" />
          </div>
          <div class="w-10 text-right text-xs text-muted-foreground">
            <div class="h-3 rounded-full bg-muted/40" />
          </div>
        </div>
      </div>

      <div class="rounded-xl bg-primary/10 px-3 py-2">
        <div class="h-3 w-40 rounded-full bg-primary/20" />
      </div>

      <div
        v-if="loggedIn"
        class="-mx-[var(--card-x)] flex items-center justify-between gap-1 rounded-2xl border border-border/60 bg-primary/10 px-[var(--card-x)] py-1"
      >
        <div class="h-6 w-32 rounded-full bg-muted/40" />
        <div class="h-8 w-8 rounded-full bg-muted/50" />
      </div>
      <div
        v-else
        class="-mx-[var(--card-x)] flex items-center justify-between gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/40 px-[var(--card-x)] py-2"
      >
        <div class="h-4 w-40 rounded-full bg-muted/50" />
        <div class="h-9 w-24 rounded-full bg-muted/60" />
      </div>

      <div class="h-3 w-40 rounded-full bg-destructive/20" />
    </div>
  </SidebarCard>
</template>

<script setup lang="ts">
import { computed } from "vue";

import SidebarCard from "~/components/layout/SidebarCard.vue";
import { useAuthSession } from "~/stores/auth-session";

const authSession = useAuthSession();

const loggedIn = computed(() => authSession.isLoggedIn);
</script>
