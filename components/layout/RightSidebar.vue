<template>
  <aside class="sticky top-24 flex flex-col gap-6">
    <section
      class="rounded-3xl border border-white/5 bg-white/5 p-6 text-slate-200 shadow-[0_25px_55px_-20px_hsl(var(--primary)/0.35)] backdrop-blur-xl"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-primary/80">{{ weather.badge }}</p>
          <h3 class="mt-3 text-2xl font-semibold text-white">{{ weather.title }}</h3>
          <p class="mt-2 text-sm text-slate-300">{{ weather.subtitle }}</p>
        </div>
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-3xl">
          {{ weather.icon }}
        </div>
      </div>
      <dl class="mt-6 space-y-3 text-sm text-slate-300">
        <div class="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
          <dt class="uppercase tracking-wide text-xs text-slate-400">Localisation</dt>
          <dd class="font-medium text-white">{{ weather.location }}</dd>
        </div>
        <div class="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
          <dt class="uppercase tracking-wide text-xs text-slate-400">Température</dt>
          <dd class="font-medium text-white">{{ weather.temperature }}</dd>
        </div>
        <div class="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
          <dt class="uppercase tracking-wide text-xs text-slate-400">Conseil</dt>
          <dd class="max-w-[10rem] text-right text-sm leading-snug">{{ weather.tip }}</dd>
        </div>
      </dl>
    </section>

    <section class="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl">
      <header class="flex items-center justify-between text-slate-200">
        <h3 class="text-lg font-semibold text-white">Top 3 in Quiz</h3>
        <span class="text-xs uppercase tracking-[0.3em] text-primary/70">live</span>
      </header>
      <ul class="mt-5 space-y-4">
        <li
          v-for="(participant, index) in topParticipants"
          :key="participant.name"
          class="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/20 px-4 py-3 text-sm text-slate-300"
        >
          <span
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-base font-semibold text-primary"
          >
            {{ index + 1 }}
          </span>
          <div class="flex-1">
            <p class="font-medium text-white">{{ participant.name }}</p>
            <p class="text-xs uppercase tracking-wide text-slate-400">{{ participant.role }}</p>
          </div>
          <span class="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">{{
            participant.score
          }}</span>
        </li>
      </ul>
    </section>

    <section class="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl">
      <header class="flex items-start justify-between">
        <div>
          <h3 class="text-lg font-semibold text-white">Rating overview</h3>
          <p class="text-sm text-slate-300">Commentaires des membres pour la semaine</p>
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
  </aside>
</template>

<script setup lang="ts">
const weather = {
  badge: "News",
  title: "Rain ahead",
  subtitle: "Préparez-vous pour une journée humide avec des vents légers.",
  icon: "🌧️",
  location: "Berlin, Allemagne",
  temperature: "18°C",
  tip: "N'oubliez pas votre parapluie pour rester au sec.",
};

const topParticipants = [
  { name: "Bro World", role: "Product Team", score: "982 pts" },
  { name: "Adam Don", role: "Community", score: "953 pts" },
  { name: "Nina Ko", role: "Marketing", score: "917 pts" },
];

const rating = {
  average: "4.7",
  total: 5,
  icon: "⭐",
  stars: 5,
  categories: [
    { label: "Engagement", value: 92 },
    { label: "Contenu", value: 88 },
    { label: "Réactivité", value: 84 },
  ],
};
</script>
