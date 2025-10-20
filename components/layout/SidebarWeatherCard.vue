<template>
  <SidebarCard
    class="text-card-foreground px-3 py-2"
    :aria-busy="isLoading"
    glow
  >
    <div class="relative z-10 flex items-start justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-primary/80">
          {{ resolvedWeather.badge }}
        </p>
        <h3 class="mt-3 text-2xl font-semibold text-foreground">
          {{ resolvedWeather.temperature }}
        </h3>
        <div class="weather-card__details mt-2">
          <div class="space-y-2">
            <p class="text-sm text-muted-foreground">
              <span
                v-if="isLoading"
                class="inline-flex items-center gap-1"
              >
                <span class="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
                {{ loadingLabel }}
              </span>
              <span v-else>{{ resolvedWeather.location }}</span>
            </p>
            <p
              v-if="locationError"
              class="text-xs text-red-500"
            >
              {{ locationError }}
            </p>
          </div>
          <button
            v-if="canRequestGeolocation"
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-primary/20 px-3 py-1 text-xs font-medium text-primary transition hover:border-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isLoading"
            @click="useCurrentLocation"
          >
            {{ useCurrentLocationLabel }}
          </button>
        </div>
      </div>
      <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-3xl">
        {{ resolvedWeather.icon }}
      </div>
    </div>
  </SidebarCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

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
const { t } = useI18n();

const WEATHER_I18N_BASE = "blog.sidebar.weather";

const weatherState = useState<{
  location: string;
  temperature: string;
  condition: string;
  fetchedAt: number;
} | null>("sidebar-weather", () => null);

const isLoading = ref(!weatherState.value);
const geolocationSupported = ref(false);
const locationError = ref<string | null>(null);

const loadingLabel = computed(() => props.weather?.subtitle ?? t(`${WEATHER_I18N_BASE}.loading`));

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

type WeatherErrorKey = "unavailable" | "denied" | "unsupported" | "updateFailed";

function setLocationError(key: WeatherErrorKey) {
  locationError.value = t(`${WEATHER_I18N_BASE}.errors.${key}`);
}

const useCurrentLocationLabel = computed(() =>
  t(`${WEATHER_I18N_BASE}.actions.useCurrentLocation`),
);

async function fetchWeather(query: string) {
  const { apiKey } = getWeatherConfig();

  locationError.value = null;

  if (!apiKey) {
    isLoading.value = false;
    setLocationError("unavailable");
    return;
  }

  isLoading.value = true;

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
    setLocationError("updateFailed");
  } finally {
    isLoading.value = false;
  }
}

let fallbackLocation = props.weather.location;

function fetchDefaultWeather() {
  void fetchWeather(fallbackLocation);
}

if (import.meta.client) {
  onMounted(() => {
    geolocationSupported.value = Boolean(navigator.geolocation);

    if (weatherState.value && Date.now() - weatherState.value.fetchedAt < WEATHER_TTL) {
      isLoading.value = false;
      return;
    }

    const weatherConfig = getWeatherConfig();
    fallbackLocation = weatherConfig.defaultLocation || props.weather.location;

    fetchDefaultWeather();
  });
}

const canRequestGeolocation = computed(() => geolocationSupported.value);

function useCurrentLocation() {
  if (!import.meta.client || !navigator.geolocation) {
    setLocationError("unsupported");
    return;
  }

  locationError.value = null;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      void fetchWeather(`${latitude},${longitude}`);
    },
    () => {
      console.warn("Geolocation permission denied, using default location");
      setLocationError("denied");
      fetchDefaultWeather();
    },
  );
}
</script>

<style scoped>
.weather-card__details {
  min-height: 4.75rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
