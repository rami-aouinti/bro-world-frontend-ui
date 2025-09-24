<template>
  <section class="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl">
    <header class="flex items-center justify-between text-slate-200">
      <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
      <span class="text-xs uppercase tracking-[0.3em] text-primary/70">{{ liveLabel }}</span>
    </header>
    <ul class="mt-5 space-y-4">
      <li
        v-for="participant in participants"
        :key="participant.name"
        class="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/20 px-4 py-3 text-sm text-slate-300"
      >
        <span
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-base font-semibold text-primary"
        >
          {{ participant.position }}
        </span>
        <div class="flex-1">
          <p class="font-medium text-white">{{ participant.name }}</p>
          <p class="text-xs uppercase tracking-wide text-slate-400">{{ participant.role }}</p>
        </div>
        <span class="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
          {{ participant.score }}
        </span>
      </li>
    </ul>
  </section>
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
