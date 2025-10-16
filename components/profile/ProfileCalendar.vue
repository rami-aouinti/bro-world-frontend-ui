<template>
  <section
    class="h-100"
    aria-labelledby="profile-calendar-title"
  >
    <SidebarCard
      class="text-card-foreground px-3 py-2"
      padding="none"
      glow
    >
      <div class="d-flex flex-column gap-4">
        <header class="d-flex flex-wrap align-center justify-space-between gap-3 px-3 pt-3">
          <div>
            <h2
              id="profile-calendar-title"
              class="text-h5 font-weight-semibold mb-1"
            >
              {{ t("pages.profile.sections.calendar") }}
            </h2>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ t("pages.profile.calendar.subtitle") }}
            </p>
          </div>
          <v-btn-toggle
            v-model="viewMode"
            class="flex-wrap"
            mandatory
            density="comfortable"
            rounded="pill"
            color="primary"
            :aria-label="t('pages.profile.calendar.viewLabel')"
          >
            <v-btn
              v-for="option in viewOptions"
              :key="option.value"
              :value="option.value"
              size="small"
              variant="tonal"
            >
              {{ option.label }}
            </v-btn>
          </v-btn-toggle>
        </header>

        <div class="px-3">
          <v-skeleton-loader
            v-if="pending"
            type="table-heading, list-item-three-line@3"
          />
          <template v-else>
            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              :title="t('pages.profile.calendar.errorTitle')"
              class="mb-4"
            >
              <div class="d-flex align-center justify-space-between gap-3 flex-wrap">
                <span>{{ errorMessage }}</span>
                <v-btn
                  color="error"
                  variant="flat"
                  size="small"
                  @click="refreshEvents"
                >
                  {{ t("pages.profile.calendar.retry") }}
                </v-btn>
              </div>
            </v-alert>

            <template v-if="calendarEvents.length">
              <v-calendar
                v-model="focus"
                :type="viewMode"
                :events="calendarEvents"
                :event-color="getEventColor"
                :weekdays="weekdays"
                :hide-header="false"
                color="primary"
                @event-click="onEventClick"
              >
                <template #event="{ event }">
                  <div class="text-truncate font-weight-medium">
                    {{ event.title }}
                  </div>
                </template>
              </v-calendar>

              <v-divider class="my-4" />

              <div class="d-flex flex-column flex-lg-row gap-4">
                <v-card
                  v-if="selectedEvent"
                  variant="tonal"
                  color="primary"
                  class="flex-grow-1"
                >
                  <v-card-title class="d-flex align-start justify-space-between gap-3">
                    <div>
                      <div class="text-body-2 text-medium-emphasis mb-1">
                        {{ formatEventRange(selectedEvent) }}
                      </div>
                      <div class="text-h6 font-weight-semibold mb-1">
                        {{ selectedEvent.title }}
                      </div>
                    </div>
                    <v-chip
                      v-if="selectedEvent.isPrivate"
                      size="small"
                      color="primary"
                      variant="flat"
                    >
                      {{ t("pages.profile.calendar.privateLabel") }}
                    </v-chip>
                  </v-card-title>
                  <v-card-text class="d-flex flex-column gap-3">
                    <div
                      v-if="selectedEvent.location"
                      class="d-flex align-center gap-2"
                    >
                      <v-icon
                        icon="mdi-map-marker"
                        size="small"
                      />
                      <span class="text-body-2">{{ selectedEvent.location }}</span>
                    </div>
                    <div
                      v-if="selectedEvent.description"
                      class="text-body-2 text-medium-emphasis"
                    >
                      {{ selectedEvent.description }}
                    </div>
                    <div class="d-flex align-center gap-2">
                      <v-icon
                        icon="mdi-clock-outline"
                        size="small"
                      />
                      <span class="text-body-2">
                        {{ selectedEvent.allDay ? t("pages.profile.calendar.allDay") : formatEventTime(selectedEvent) }}
                      </span>
                    </div>
                  </v-card-text>
                </v-card>

                <div class="flex-grow-1">
                  <h3 class="text-subtitle-1 text-medium-emphasis mb-2">
                    {{ t("pages.profile.calendar.upcoming") }}
                  </h3>
                  <v-list
                    density="comfortable"
                    nav
                    class="rounded-xl border"
                    :style="{ borderColor: 'var(--v-theme-outline-variant)' }"
                  >
                    <v-list-item
                      v-for="event in upcomingEvents"
                      :key="event.id"
                      :active="selectedEvent?.id === event.id"
                      color="primary"
                      rounded="xl"
                      link
                      @click="selectEvent(event)"
                    >
                      <template #prepend>
                        <v-avatar
                          size="36"
                          :color="event.color"
                          variant="tonal"
                        >
                          <v-icon
                            icon="mdi-calendar"
                            size="small"
                          />
                        </v-avatar>
                      </template>
                      <v-list-item-title class="font-weight-medium">
                        {{ event.title }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        {{ formatEventRange(event) }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </div>
              </div>
            </template>

            <div
              v-else
              class="d-flex flex-column align-center justify-center text-center py-10 gap-4"
            >
              <v-avatar
                size="80"
                color="primary"
                variant="tonal"
              >
                <v-icon
                  icon="mdi-calendar-blank"
                  size="36"
                />
              </v-avatar>
              <div>
                <p class="text-h6 font-weight-semibold mb-2">
                  {{ t("pages.profile.calendar.emptyTitle") }}
                </p>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ t("pages.profile.calendar.emptyDescription") }}
                </p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </SidebarCard>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { resolveApiFetcher } from "~/lib/api/fetcher";
import type { ProfileEvent } from "~/types/pages/profile";

interface CalendarDisplayEvent extends ProfileEvent {
  color: string;
}

const { t, locale } = useI18n();

const fetcher = resolveApiFetcher();

const {
  data: eventsData,
  pending,
  error,
  refresh,
} = await useAsyncData("profile-calendar-events", () =>
  fetcher<ProfileEvent[]>("/profile/events", {
    method: "GET",
    isPrivate: true,
    withCredentials: false,
    context: {
      suppressErrorNotification: true,
    },
  }),
);

const weekdays = [1, 2, 3, 4, 5, 6, 0];

const viewMode = ref<"month" | "week" | "day">("month");
const focus = ref(new Date().toISOString().slice(0, 10));
const selectedEvent = ref<CalendarDisplayEvent | null>(null);

const colorMap: Record<string, string> = {
  meetings: "primary",
  personal: "secondary",
  travel: "info",
  focus: "warning",
};

const calendarEvents = computed<CalendarDisplayEvent[]>(() => {
  const events = eventsData.value ?? [];

  return events.map((event) => ({
    ...event,
    color: resolveEventColor(event.color),
    start: event.start,
    end: event.end ?? event.start,
    allDay: Boolean(event.allDay),
    description: event.description ?? undefined,
    location: event.location ?? undefined,
  }));
});

const upcomingEvents = computed(() => {
  const sorted = [...calendarEvents.value].sort((a, b) => {
    const aDate = parseDate(a.start);
    const bDate = parseDate(b.start);

    if (!aDate && !bDate) {
      return 0;
    }
    if (!aDate) {
      return 1;
    }
    if (!bDate) {
      return -1;
    }

    return aDate.getTime() - bDate.getTime();
  });

  const now = Date.now();
  const future = sorted.filter((event) => {
    const endDate = parseDate(event.end);
    if (!endDate) {
      return true;
    }
    return endDate.getTime() >= now;
  });

  return (future.length ? future : sorted).slice(0, 5);
});

const viewOptions = computed(() => [
  { value: "month", label: t("pages.profile.calendar.views.month") },
  { value: "week", label: t("pages.profile.calendar.views.week") },
  { value: "day", label: t("pages.profile.calendar.views.day") },
]);

const dateFormatter = computed(
  () =>
    new Intl.DateTimeFormat(locale.value, {
      dateStyle: "medium",
    }),
);

const dateTimeFormatter = computed(
  () =>
    new Intl.DateTimeFormat(locale.value, {
      dateStyle: "medium",
      timeStyle: "short",
    }),
);

const timeFormatter = computed(
  () =>
    new Intl.DateTimeFormat(locale.value, {
      timeStyle: "short",
    }),
);

const errorMessage = computed(() => {
  if (!error.value) {
    return "";
  }

  const message = error.value instanceof Error ? error.value.message : String(error.value);
  return message || t("pages.profile.calendar.errorFallback");
});

watch(
  calendarEvents,
  (events) => {
    if (!events.length) {
      selectedEvent.value = null;
      return;
    }

    const existing = selectedEvent.value
      ? events.find((event) => event.id === selectedEvent.value?.id)
      : null;

    if (existing) {
      selectedEvent.value = existing;
      return;
    }

    const upcoming = upcomingEvents.value[0];
    selectedEvent.value = upcoming ?? events[0];
  },
  { immediate: true },
);

function parseDate(value: string | undefined | null): Date | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function resolveEventColor(rawColor: string | null | undefined): string {
  if (!rawColor) {
    return "primary";
  }
  return colorMap[rawColor] ?? "primary";
}

function formatEventRange(event: CalendarDisplayEvent): string {
  const startDate = parseDate(event.start);
  const endDate = parseDate(event.end);

  if (!startDate) {
    return "";
  }

  if (event.allDay) {
    if (!endDate || startDate.toDateString() === endDate.toDateString()) {
      return dateFormatter.value.format(startDate);
    }

    return `${dateFormatter.value.format(startDate)} – ${dateFormatter.value.format(endDate)}`;
  }

  if (!endDate) {
    return dateTimeFormatter.value.format(startDate);
  }

  if (startDate.toDateString() === endDate.toDateString()) {
    const startTime = timeFormatter.value.format(startDate);
    const endTime = timeFormatter.value.format(endDate);

    return `${dateFormatter.value.format(startDate)} · ${startTime} – ${endTime}`;
  }

  return `${dateTimeFormatter.value.format(startDate)} – ${dateTimeFormatter.value.format(endDate)}`;
}

function formatEventTime(event: CalendarDisplayEvent): string {
  const startDate = parseDate(event.start);
  const endDate = parseDate(event.end);

  if (!startDate) {
    return "";
  }

  const startTime = timeFormatter.value.format(startDate);

  if (!endDate || startDate.toISOString() === endDate.toISOString()) {
    return startTime;
  }

  return `${startTime} → ${timeFormatter.value.format(endDate)}`;
}

function getEventColor(event: { color?: string }): string {
  return event.color ?? "primary";
}

function onEventClick(payload: { event?: CalendarDisplayEvent } | undefined) {
  const event = payload?.event;

  if (!event) {
    return;
  }
  selectEvent(event);
}

function selectEvent(event: CalendarDisplayEvent) {
  selectedEvent.value = event;
}

function refreshEvents() {
  refresh();
}
</script>

<style scoped>
:deep(.v-calendar) {
  border-radius: var(--ui-card-radius, calc(var(--radius, var(--ui-radius)) + 4px));
  border: 1px solid var(--v-theme-outline-variant);
  overflow: hidden;
}
</style>
