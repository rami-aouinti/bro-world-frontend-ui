<template>
  <SidebarCard class="text-card-foreground px-3 py-2">
    <!-- glows -->
    <span class="pointer-events-none absolute -left-14 top-8 h-40 w-40 rounded-full bg-primary/25 blur-3xl"></span>
    <span class="pointer-events-none absolute -right-16 -top-10 h-48 w-48 rounded-full bg-primary/35 blur-3xl"></span>

    <header class="flex items-center justify-between text-card-foreground">
      <h3 class="text-lg font-semibold text-foreground">{{ title }}</h3>
      <span class="text-xs uppercase tracking-[0.3em] text-primary/70">{{ liveLabel }}</span>
    </header>

    <ul class="space-y-4">
      <li
          v-for="participant in participants"
          :key="participant.name"
          class="-mx-[var(--card-x)] my-2 flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/60 px-[var(--card-x)] py-3 text-sm text-muted-foreground"
      >
        <span
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-base font-semibold text-primary"
        >
          {{ participant.position }}
        </span>
        <div class="flex-1">
          <p class="font-medium text-foreground">{{ participant.name }}</p>
          <p class="text-xs uppercase tracking-wide text-muted-foreground">{{ participant.role }}</p>
        </div>
        <span class="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
          {{ participant.score }}
        </span>
      </li>
    </ul>
  </SidebarCard>
</template>

<script setup lang="ts">
interface SidebarLeaderboardCardProps {
  title: string;
  liveLabel: string;
  participants: Array<{
    position: number;
    name: string;
    role: string;
    score: string;
  }>;
}

defineProps<SidebarLeaderboardCardProps>();
</script>
