<template>
  <section
    class="relative overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-br from-[#040b1d] via-[#071330] to-[#0a1f47] p-8 text-slate-200 shadow-[0_45px_120px_-55px_rgba(10,31,71,0.95)] backdrop-blur-2xl"
    :aria-busy="isLoading"
  >
    <span class="pointer-events-none absolute -left-20 top-6 h-52 w-52 rounded-full bg-primary/30 blur-3xl"></span>
    <span class="pointer-events-none absolute -right-24 -top-12 h-60 w-60 rounded-full bg-primary/25 blur-[110px]"></span>
    <span class="pointer-events-none absolute -bottom-16 right-12 h-48 w-48 rounded-full bg-sky-500/20 blur-[100px]"></span>

    <div class="relative flex items-start justify-between gap-6">
      <div class="space-y-3">
        <p class="text-[0.6rem] uppercase tracking-[0.45em] text-slate-400">
          {{ resolvedWeather.badge }}
        </p>
        <h3 class="text-3xl font-semibold text-white">
          {{ resolvedWeather.title }}
        </h3>
        <p class="text-sm text-slate-300">
          <span v-if="isLoading" class="inline-flex items-center gap-2">
            <span class="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
            {{ loadingLabel }}
          </span>
          <span v-else>{{ resolvedWeather.subtitle }}</span>
        </p>
      </div>
      <div
        class="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[2.2rem] bg-white/10 text-4xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/15"
      >
        {{ resolvedWeather.icon }}
      </div>
    </div>

    <dl
      class="relative mt-10 grid gap-4 text-sm text-slate-300 sm:grid-cols-[minmax(0,1fr)_minmax(0,11rem)]"
    >
      <div
        class="relative col-span-1 min-h-[11rem] overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/10 backdrop-blur-xl"
      >
        <span class="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent opacity-70"></span>
        <div class="relative flex h-full flex-col justify-between p-7">
          <dt class="text-[0.58rem] uppercase tracking-[0.45em] text-slate-300">
            {{ resolvedWeather.locationLabel }}
          </dt>
          <dd class="text-2xl font-semibold leading-snug text-white">
            <span
              v-if="isLoading"
              class="inline-flex h-6 w-32 animate-pulse rounded-full bg-white/15"
            ></span>
            <span v-else>{{ resolvedWeather.location }}</span>
          </dd>
        </div>
      </div>
      <div
        class="relative flex min-h-[11rem] flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.08] px-7 py-6 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/10 backdrop-blur-xl"
      >
        <span class="pointer-events-none absolute inset-0 bg-gradient-to-bl from-white/10 via-transparent to-transparent opacity-70"></span>
        <div class="relative space-y-6">
          <dt class="text-[0.58rem] uppercase tracking-[0.45em] text-slate-300">
            {{ resolvedWeather.temperatureLabel }}
          </dt>
          <dd class="text-4xl font-semibold text-white">
            <span
              v-if="isLoading"
              class="ml-auto inline-flex h-8 w-20 animate-pulse rounded-full bg-white/15"
            ></span>
            <span v-else>{{ resolvedWeather.temperature }}</span>
          </dd>
        </div>
      </div>
      <div
        class="relative col-span-full flex flex-col gap-3 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.08] px-6 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/10 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
      >
        <span class="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent opacity-70"></span>
        <div class="relative">
          <dt class="text-[0.58rem] uppercase tracking-[0.45em] text-slate-300">
            {{ resolvedWeather.tipLabel }}
          </dt>
        </div>
        <dd class="relative text-left text-sm leading-snug text-slate-200 sm:text-right">
          <span
            v-if="isLoading"
            class="inline-flex h-5 w-28 animate-pulse rounded-full bg-white/15"
          ></span>
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
