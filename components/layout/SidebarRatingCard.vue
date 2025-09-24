<template>
  <section class="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl">
    <header class="flex items-start justify-between">
      <div>
        <h3 class="text-lg font-semibold text-white">{{ rating.title }}</h3>
        <p class="text-sm text-slate-300">{{ rating.subtitle }}</p>
      </div>
      <div class="text-right text-white">
        <p class="text-3xl font-bold">{{ rating.average }}</p>
        <p class="text-xs uppercase tracking-[0.3em] text-slate-400">/ {{ rating.total }}</p>
      </div>
    </header>
    <div class="mt-6 flex items-center gap-3 text-primary">
      <span class="text-2xl">{{ rating.icon }}</span>
      <div class="flex gap-1 text-xl">
        <span
          v-for="star in 5"
          :key="star"
          >{{ star <= rating.stars ? "★" : "☆" }}</span
        >
      </div>
    </div>
    <ul class="mt-6 space-y-4 text-sm text-slate-300">
      <li
        v-for="category in rating.categories"
        :key="category.label"
        class="space-y-2"
      >
        <div class="flex items-center justify-between">
          <span class="font-medium text-white">{{ category.label }}</span>
          <span class="text-xs text-slate-400">{{ category.value }}%</span>
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-black/20">
          <div
            class="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
            :style="{ width: `${category.value}%` }"
          />
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
interface SidebarRatingCardProps {
  rating: {
    title: string;
    subtitle: string;
    average: string;
    total: number;
    icon: string;
    stars: number;
    categories: Array<{
      label: string;
      value: number;
    }>;
  };
}

defineProps<SidebarRatingCardProps>();
</script>
