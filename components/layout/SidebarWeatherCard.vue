<template>
  <SidebarCard
    class="text-card-foreground px-3 py-2"
    :aria-busy="isLoading" glow>

    <div class="relative z-10 flex items-start justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-primary/80">
          {{ resolvedWeather.badge }}
        </p>
        <h3 class="mt-3 text-2xl font-semibold text-foreground">
          {{ resolvedWeather.temperature }}
        </h3>
        <p class="mt-2 text-sm text-muted-foreground">
          <span
            v-if="isLoading"
            class="inline-flex items-center gap-1"
          >
            <span class="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
            {{ loadingLabel }}
          </span>
          <span v-else>{{ resolvedWeather.location }}</span>
        </p>
      </div>
      <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-3xl">
        {{ resolvedWeather.icon }}
      </div>
    </div>
  </SidebarCard>
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

const weatherState = useState<{
  location: string;
  temperature: string;
  condition: string;
  fetchedAt: number;
} | null>("sidebar-weather", () => null);

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
        query: { key: apiKey, q: query, aqi: "no" },
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
