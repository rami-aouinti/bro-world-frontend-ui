<template>
  <SidebarCard
    :dir="isRtl ? 'rtl' : 'ltr'"
    aria-live="polite"
    class="text-card-foreground px-3 py-2"
  >
    <!-- glows -->
    <span
      class="pointer-events-none absolute -left-14 top-8 h-40 w-40 rounded-full bg-primary/25 blur-3xl"
    ></span>
    <span
      class="pointer-events-none absolute -right-16 -top-10 h-48 w-48 rounded-full bg-primary/35 blur-3xl"
    ></span>

    <header class="flex items-center justify-between text-card-foreground">
      <div>
        <h3 class="text-lg font-semibold text-foreground">
          {{ cardTitle }}
        </h3>
        <p class="text-sm text-muted-foreground">
          {{ cardSubtitle }}
        </p>
      </div>
      <div class="flex items-center gap-2 text-right text-foreground">
        <span
          v-if="cardIcon"
          class="text-2xl"
          >{{ cardIcon }}</span
        >
        <div class="text-right">
          <p class="text-3xl font-bold">
            {{ formattedAverage }}
          </p>
          <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">/ {{ maxRating }}</p>
        </div>
      </div>
    </header>

    <div
      v-if="isLoading"
      class="space-y-3"
    >
      <v-skeleton-loader
        v-for="index in 3"
        :key="`skeleton-${index}`"
        type="list-item-two-line"
        class="rounded-2xl -mx-[var(--card-x)] px-[var(--card-x)]"
      />
    </div>

    <div
      v-else
      class="flex flex-col gap-6"
    >
      <div class="flex flex-col items-center gap-3 text-primary">
        <v-rating
          :model-value="averageRating"
          color="primary"
          half-increments
          readonly
          size="small"
          aria-label="Average rating"
        />
        <p class="text-sm text-muted-foreground">
          {{ reviewCountLabel }}
        </p>
      </div>

      <div class="space-y-4">
        <div
          v-for="bar in ratingBars"
          :key="bar.key"
          class="flex items-center gap-3"
        >
          <div class="flex w-16 items-center justify-between text-sm font-medium text-foreground">
            <span>{{ bar.stars }}</span>
            <span>★</span>
          </div>
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-muted/60">
            <div
              class="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
              role="img"
              :style="{ width: `${bar.percent}%` }"
              :aria-label="`${bar.percent}% of ratings are ${bar.stars} stars`"
            />
          </div>
          <span class="w-10 text-right text-xs text-muted-foreground">
            {{ bar.count }}
          </span>
        </div>
      </div>

      <div
        v-if="fetchError"
        class="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-destructive"
      >
        {{ fetchError }}
      </div>

      <div
        v-if="loggedIn"
        class="-mx-[var(--card-x)] flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/60 px-[var(--card-x)] py-3"
      >
        <v-rating
          v-model="newRating"
          half-increments
          color="secondary"
          hover
          aria-label="Submit your rating"
        />
        <v-btn
          color="primary"
          variant="flat"
          icon
          :loading="isSubmitting"
          :disabled="newRating === 0 || isSubmitting"
          @click="submitRating"
        >
          <Icon name="mdi-send" />
        </v-btn>
      </div>

      <p
        v-if="submissionError"
        class="text-xs text-destructive"
      >
        {{ submissionError }}
      </p>
    </div>
  </SidebarCard>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthSession } from "~/stores/auth-session";

interface SidebarRatingCardProps {
  rating?: {
    title?: string;
    subtitle?: string;
    icon?: string;
  };
}

interface ReviewDistribution {
  [range: string]: number;
}

interface ReviewStatsResponse {
  average_rating?: number | null;
  total_reviews?: number | null;
  distribution?: ReviewDistribution | null;
}

const props = defineProps<SidebarRatingCardProps>();

const { t, te, locale } = useI18n();
const rtlLocales = ["ar", "he", "fa", "ur"];
const isRtl = computed(() => rtlLocales.includes(locale.value));

const auth = useAuthSession();
const loggedIn = computed(() => auth.isAuthenticated.value);

function translateWithFallback(
  key: string,
  defaultValue: string,
  params?: Record<string, unknown>,
) {
  if (te(key)) {
    return t(key, params ?? {});
  }

  return defaultValue;
}

function createEmptyDistribution(): ReviewDistribution {
  return { "4-5": 0, "3-4": 0, "2-3": 0, "1-2": 0, "0-1": 0 };
}

const maxRating = 5;
const averageRating = ref(0);
const totalReviews = ref(0);
const distribution = reactive(createEmptyDistribution());

const submissionError = ref<string | null>(null);
const newRating = ref(0);
const isSubmitting = ref(false);
const fetchError = ref<string | null>(null);

const {
  data: statsData,
  pending: statsPending,
  refresh: refreshStats,
  error: statsError,
} = await useAsyncData<ReviewStatsResponse>("sidebar-review-stats", () =>
  $fetch<ReviewStatsResponse>("/api/review/get"),
);

watch(
  () => statsError.value,
  (value) => {
    fetchError.value = value
      ? translateWithFallback("sidebar.rating.error", "Unable to load reviews right now.")
      : null;
  },
  { immediate: true },
);

watch(
  () => statsData.value,
  (value) => {
    const nextAverage = Number.parseFloat(String(value?.average_rating ?? "0"));
    averageRating.value = Number.isFinite(nextAverage)
      ? Math.min(maxRating, Math.max(0, nextAverage))
      : 0;

    const nextTotal = Number.parseInt(String(value?.total_reviews ?? "0"), 10);
    totalReviews.value = Number.isFinite(nextTotal) ? nextTotal : 0;

    const nextDistribution = value?.distribution ?? null;
    const normalized = createEmptyDistribution();

    if (nextDistribution) {
      for (const key of Object.keys(normalized)) {
        const raw = nextDistribution[key];
        normalized[key] = typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
      }
    }

    for (const key of Object.keys(normalized)) {
      distribution[key] = normalized[key];
    }
  },
  { immediate: true },
);

const isLoading = computed(() => statsPending.value && !statsData.value);

const cardTitle = computed(() =>
  translateWithFallback("sidebar.rating.title", props.rating?.title || "Rating overview"),
);
const cardSubtitle = computed(() =>
  translateWithFallback(
    "sidebar.rating.subtitle",
    props.rating?.subtitle || "Member feedback over time",
  ),
);
const cardIcon = computed(() => props.rating?.icon || "⭐");

const reviewCountLabel = computed(() => {
  const count = totalReviews.value;
  return translateWithFallback("sidebar.rating.count", `${count} reviews`, { count });
});

const ratingBars = computed(() => {
  const ranges = [
    { key: "4-5", stars: 5 },
    { key: "3-4", stars: 4 },
    { key: "2-3", stars: 3 },
    { key: "1-2", stars: 2 },
    { key: "0-1", stars: 1 },
  ] as const;

  return ranges.map((range) => {
    const count = distribution[range.key] ?? 0;
    const percent =
      totalReviews.value > 0 ? Math.min(100, Math.max(0, (count / totalReviews.value) * 100)) : 0;

    return {
      key: range.key,
      stars: range.stars,
      count: Math.round(count),
      percent: Number.isFinite(percent) ? Number(percent.toFixed(1)) : 0,
    };
  });
});

const formattedAverage = computed(() => averageRating.value.toFixed(1));

async function submitRating() {
  if (!loggedIn.value || newRating.value === 0 || isSubmitting.value) return;

  isSubmitting.value = true;
  submissionError.value = null;

  try {
    await $fetch("/api/review/post", { method: "POST", body: { rating: newRating.value } });
    newRating.value = 0;
    await refreshStats();
  } catch (error) {
    console.error("Failed to submit rating", error);
    submissionError.value = translateWithFallback(
      "sidebar.rating.submitError",
      "We could not save your rating. Please try again later.",
    );
  } finally {
    isSubmitting.value = false;
  }
}
</script>
