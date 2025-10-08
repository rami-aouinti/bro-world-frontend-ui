<template>
  <section
    class="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/30 p-7 text-slate-200 shadow-[0_28px_85px_-35px_rgba(15,23,42,0.75)] backdrop-blur-2xl"
    :aria-busy="isLoading"
  >
    <span class="pointer-events-none absolute -left-14 top-8 h-40 w-40 rounded-full bg-primary/25 blur-3xl"></span>
    <span class="pointer-events-none absolute -right-16 -top-10 h-48 w-48 rounded-full bg-primary/35 blur-3xl"></span>

    <div class="relative flex items-start justify-between gap-6">
      <div>
        <p class="text-[0.65rem] uppercase tracking-[0.4em] text-primary/70">{{ resolvedWeather.badge }}</p>
        <h3 class="mt-4 text-3xl font-semibold text-white">{{ resolvedWeather.title }}</h3>
        <p class="mt-3 text-sm text-slate-300">
          <span v-if="isLoading" class="inline-flex items-center gap-2">
            <span class="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
            {{ loadingLabel }}
          </span>
          <span v-else>{{ resolvedWeather.subtitle }}</span>
        </p>
      </div>
      <div
        class="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-4xl text-white shadow-inner shadow-primary/20"
      >
        {{ resolvedWeather.icon }}
      </div>
    </div>

    <dl
      class="relative mt-8 grid grid-cols-1 gap-3 text-sm text-slate-200 md:grid-cols-2"
    >
      <div
        class="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur hover:border-primary/40"
      >
        <dt class="text-[0.6rem] uppercase tracking-[0.35em] text-slate-400 group-hover:text-primary/70">
          {{ resolvedWeather.locationLabel }}
        </dt>
        <dd class="mt-3 text-lg font-semibold text-white md:text-xl">
          <span v-if="isLoading" class="inline-flex h-5 w-24 animate-pulse rounded-full bg-white/20"></span>
          <span v-else>{{ resolvedWeather.location }}</span>
        </dd>
      </div>
      <div
        class="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur hover:border-primary/40"
      >
        <dt class="text-[0.6rem] uppercase tracking-[0.35em] text-slate-400 group-hover:text-primary/70">
          {{ resolvedWeather.temperatureLabel }}
        </dt>
        <dd class="mt-3 text-lg font-semibold text-white md:text-3xl">
          <span v-if="isLoading" class="inline-flex h-5 w-16 animate-pulse rounded-full bg-white/20"></span>
          <span v-else>{{ resolvedWeather.temperature }}</span>
        </dd>
      </div>
      <div
        class="group md:col-span-2 md:flex md:items-center md:justify-between rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-left backdrop-blur hover:border-primary/40"
      >
        <dt class="text-[0.6rem] uppercase tracking-[0.35em] text-slate-400 group-hover:text-primary/70">
          {{ resolvedWeather.tipLabel }}
        </dt>
        <dd class="mt-3 max-w-[16rem] text-sm leading-snug text-slate-200 md:mt-0 md:text-right">
          <span v-if="isLoading" class="inline-flex h-5 w-28 animate-pulse rounded-full bg-white/20"></span>
          <span v-else>{{ resolvedWeather.tip }}</span>
        </dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

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

interface WeatherApiResponse {
  location: {
    name: string;
    region: string;
    country: string;
  };
  current: {
    temp_c: number;
    condition?: {
      text?: string;
    };
  };
}

interface WeatherRuntimeConfig {
  apiKey?: string;
  defaultLocation?: string;
}

const props = defineProps<SidebarWeatherCardProps>();

const runtimeConfig = useRuntimeConfig();

const weatherState = useState<
  | {
      location: string;
      temperature: string;
      condition: string;
      fetchedAt: number;
    }
  | null
>("sidebar-weather", () => null);

const isLoading = ref(!weatherState.value);

const loadingLabel = computed(() => props.weather?.subtitle ?? "Updating weather");

const resolvedWeather = computed(() => {
  const current = weatherState.value;

  return {
    ...props.weather,
    location: current?.location ?? props.weather.location,
    temperature: current?.temperature ?? props.weather.temperature,
    subtitle: current?.condition || props.weather.subtitle,
  };
});

const WEATHER_TTL = 10 * 60 * 1000;

function getWeatherConfig(): WeatherRuntimeConfig {
  const publicConfig = runtimeConfig.public as { weather?: WeatherRuntimeConfig };

  return publicConfig.weather ?? {};
}

function formatLocation(data: WeatherApiResponse["location"]) {
  const parts = [data.name, data.region, data.country].filter(Boolean);

  return parts.join(", ");
}

function applyWeather(data: WeatherApiResponse) {
  const temperatureValue = Number.isFinite(data.current?.temp_c)
    ? `${Math.round(data.current.temp_c)}°C`
    : props.weather.temperature;

  weatherState.value = {
    location: formatLocation(data.location),
    temperature: temperatureValue,
    condition: data.current?.condition?.text ?? props.weather.subtitle,
    fetchedAt: Date.now(),
  };
}

async function fetchWeather(query: string) {
  const { apiKey } = getWeatherConfig();

  if (!apiKey) {
    isLoading.value = false;

    return;
  }

  try {
    const response = await $fetch<WeatherApiResponse>(
      "https://api.weatherapi.com/v1/current.json",
      {
        query: {
          key: apiKey,
          q: query,
          aqi: "no",
        },
      },
    );

    applyWeather(response);
  } catch (error) {
    console.error("Failed to fetch weather data", error);
  } finally {
    isLoading.value = false;
  }
}

if (import.meta.client) {
  onMounted(() => {
    if (weatherState.value && Date.now() - weatherState.value.fetchedAt < WEATHER_TTL) {
      isLoading.value = false;

      return;
    }

    const weatherConfig = getWeatherConfig();
    const defaultLocation = weatherConfig.defaultLocation || props.weather.location;

    function fetchDefaultWeather() {
      void fetchWeather(defaultLocation);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          void fetchWeather(`${latitude},${longitude}`);
        },
        () => {
          console.warn("Geolocation permission denied, using default location");
          fetchDefaultWeather();
        },
      );
    } else {
      fetchDefaultWeather();
    }
  });
}
</script>
