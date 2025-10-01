<template>
  <section
    class="rounded-3xl border border-white/5 bg-white/5 p-6 text-slate-200 shadow-[0_25px_55px_-20px_hsl(var(--primary)/0.35)] backdrop-blur-xl"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-primary/80">{{ weather.badge }}</p>
        <h3 class="mt-3 text-2xl font-semibold text-foreground">{{ weather.title }}</h3>
        <p class="mt-2 text-sm text-slate-300">{{ weather.subtitle }}</p>
      </div>
      <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-3xl">
        {{ weather.icon }}
      </div>
    </div>
    <dl class="mt-6 space-y-3 text-sm text-slate-300">
      <div class="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
        <dt class="uppercase tracking-wide text-xs text-slate-400">{{ weather.locationLabel }}</dt>
        <dd class="font-medium text-white">{{ weather.location }}</dd>
      </div>
      <div class="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
        <dt class="uppercase tracking-wide text-xs text-slate-400">
          {{ weather.temperatureLabel }}
        </dt>
        <dd class="font-medium text-white">{{ weather.temperature }}</dd>
      </div>
      <div class="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
        <dt class="uppercase tracking-wide text-xs text-slate-400">{{ weather.tipLabel }}</dt>
        <dd class="max-w-[10rem] text-right text-sm leading-snug">{{ weather.tip }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
interface SidebarWeatherCardProps {
  weather: {
    badge: string;
    title: string;
    subtitle: string;
    icon: string;
    location: string;
    temperature: string;
    tip: string;
    locationLabel: string;
    temperatureLabel: string;
    tipLabel: string;
  };
}

defineProps<SidebarWeatherCardProps>();
</script>
