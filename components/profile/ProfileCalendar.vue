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
          <div class="d-flex flex-wrap align-center justify-end gap-2">
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
            <v-btn
              size="small"
              color="primary"
              variant="flat"
              prepend-icon="mdi:plus"
              @click="createEventForFocus()"
            >
              {{ t("pages.profile.calendar.actions.add") }}
            </v-btn>
          </div>
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
                @click:event="onEventClick"
                @click:day="onDayClick"
                @click:date="onDayClick"
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
                        icon="mdi:map-marker"
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
                        icon="mdi:clock-outline"
                        size="small"
                      />
                      <span class="text-body-2">
                        {{ selectedEvent.allDay ? t("pages.profile.calendar.allDay") : formatEventTime(selectedEvent) }}
                      </span>
                    </div>
                  </v-card-text>
                  <v-card-actions class="justify-end flex-wrap gap-2">
                    <v-btn
                      size="small"
                      variant="flat"
                      color="primary"
                      @click="openEventEditor(selectedEvent)"
                    >
                      {{ t("pages.profile.calendar.actions.edit") }}
                    </v-btn>
                    <v-btn
                      size="small"
                      color="error"
                      variant="tonal"
                      @click="requestDeleteEvent(selectedEvent)"
                    >
                      {{ t("pages.profile.calendar.actions.delete") }}
                    </v-btn>
                  </v-card-actions>
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
                            icon="mdi:calendar"
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
                  icon="mdi:calendar-blank"
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

    <v-dialog
        v-model="isEventDialogOpen"
        max-width="480"
        transition="dialog-bottom-transition"
      >
        <v-card>
          <v-card-title class="d-flex flex-column align-start gap-1">
            <span class="text-h6 font-weight-semibold">
              {{
                eventDialogMode === "create"
                  ? t("pages.profile.calendar.form.createTitle")
                  : t("pages.profile.calendar.form.editTitle")
              }}
            </span>
            <span class="text-body-2 text-medium-emphasis">
              {{
                eventDialogMode === "create"
                  ? t("pages.profile.calendar.form.createDescription")
                  : t("pages.profile.calendar.form.editDescription")
              }}
            </span>
          </v-card-title>
          <v-card-text>
            <form class="d-flex flex-column gap-4" @submit.prevent>
              <v-text-field
                v-model="eventForm.title"
                :label="t('pages.profile.calendar.form.fields.title')"
                :error-messages="eventErrors.title"
                required
              />
              <div class="d-flex flex-column flex-md-row gap-4">
                <v-date-input
                  v-model="eventForm.startDate"
                  :label="t('pages.profile.calendar.form.fields.startDate')"
                  :error-messages="eventErrors.startDate"
                  class="flex-grow-1"
                  hide-details="auto"
                />
                <v-date-input
                  v-model="eventForm.endDate"
                  :label="t('pages.profile.calendar.form.fields.endDate')"
                  :min="eventForm.startDate"
                  :error-messages="eventErrors.endDate"
                  class="flex-grow-1"
                  hide-details="auto"
                />
              </div>
              <div class="d-flex flex-column flex-md-row gap-4">
                <v-text-field
                  v-model="eventForm.startTime"
                  type="time"
                  :label="t('pages.profile.calendar.form.fields.startTime')"
                  :disabled="eventForm.allDay"
                  :error-messages="eventErrors.startTime"
                  class="flex-grow-1"
                />
                <v-text-field
                  v-model="eventForm.endTime"
                  type="time"
                  :label="t('pages.profile.calendar.form.fields.endTime')"
                  :disabled="eventForm.allDay"
                  :error-messages="eventErrors.endTime"
                  class="flex-grow-1"
                />
              </div>
              <v-switch
                v-model="eventForm.allDay"
                :label="t('pages.profile.calendar.form.fields.allDay')"
                color="primary"
              />
              <v-select
                v-model="eventForm.color"
                :items="colorOptions"
                item-title="label"
                item-value="value"
                :label="t('pages.profile.calendar.form.fields.color')"
              />
              <v-text-field
                v-model="eventForm.location"
                :label="t('pages.profile.calendar.form.fields.location')"
              />
              <v-textarea
                v-model="eventForm.description"
                :label="t('pages.profile.calendar.form.fields.description')"
                auto-grow
                rows="2"
              />
              <v-switch
                v-model="eventForm.isPrivate"
                :label="t('pages.profile.calendar.form.fields.isPrivate')"
                color="primary"
              />
              <v-alert
                v-if="eventErrors.general.length"
                type="error"
                variant="tonal"
                :text="eventErrors.general[0]"
              />
            </form>
          </v-card-text>
          <v-card-actions class="justify-space-between flex-wrap gap-2">
            <div class="d-flex gap-2 flex-wrap">
              <v-btn
                v-if="eventDialogMode === 'edit'"
                color="error"
                variant="text"
                @click="eventForm.id && confirmDeleteFromDialog()"
              >
                {{ t('pages.profile.calendar.actions.delete') }}
              </v-btn>
            </div>
            <div class="d-flex gap-2 flex-wrap">
              <v-btn
                variant="text"
                @click="closeEventDialog()"
              >
                {{ t('pages.profile.calendar.form.actions.cancel') }}
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                @click="submitEventForm()"
              >
                {{
                  eventDialogMode === "create"
                    ? t("pages.profile.calendar.form.actions.create")
                    : t("pages.profile.calendar.form.actions.save")
                }}
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-dialog>

    <v-dialog
        v-model="isDeleteDialogOpen"
        max-width="420"
      >
        <v-card>
          <v-card-title class="text-h6 font-weight-semibold">
            {{ t('pages.profile.calendar.delete.title') }}
          </v-card-title>
          <v-card-text class="text-body-2">
            {{ t('pages.profile.calendar.delete.description', { title: pendingDeleteEvent?.title ?? '' }) }}
          </v-card-text>
          <v-card-actions class="justify-end gap-2">
            <v-btn variant="text" @click="cancelDeleteEvent()">
              {{ t('pages.profile.calendar.form.actions.cancel') }}
            </v-btn>
            <v-btn color="error" variant="flat" @click="confirmDeleteEvent()">
              {{ t('pages.profile.calendar.actions.delete') }}
            </v-btn>
          </v-card-actions>
        </v-card>
    </v-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { resolveApiFetcher } from "~/lib/api/fetcher";
import type { ProfileEvent } from "~/types/pages/profile";

interface CalendarDisplayEvent extends ProfileEvent {
  color: string;
  sourceColor: string;
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
const internalEvents = ref<ProfileEvent[]>([]);

const colorMap: Record<string, string> = {
  meetings: "primary",
  personal: "secondary",
  travel: "info",
  focus: "warning",
};

const colorOptions = computed(() =>
  Object.keys(colorMap).map((key) => ({
    value: key,
    label: t(`pages.profile.calendar.colors.${key}`),
  })),
);

const defaultCategory = computed(() => colorOptions.value[0]?.value ?? "meetings");

watch(
  () => eventsData.value,
  (value) => {
    internalEvents.value = value ? value.map((event) => ({ ...event })) : [];
  },
  { immediate: true },
);

const calendarEvents = computed<CalendarDisplayEvent[]>(() => {
  const events = internalEvents.value ?? [];

  return events
    .map((event) => {
      const allDay = Boolean(event.allDay);
      const start = normalizeCalendarTimestamp(event.start, allDay);

      if (!start) {
        return null;
      }

      const end = normalizeCalendarTimestamp(event.end ?? event.start, allDay) ?? start;

      const resolvedColor = resolveEventColor(event.color);
      return {
        ...event,
        color: resolvedColor,
        sourceColor: resolveEventCategory(event.color, resolvedColor),
        start,
        end,
        allDay,
        description: event.description ?? undefined,
        location: event.location ?? undefined,
      } satisfies CalendarDisplayEvent;
    })
    .filter((event): event is CalendarDisplayEvent => Boolean(event));
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

type EventDialogMode = "create" | "edit";

interface EventFormState {
  id: string | null;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  color: string;
  isPrivate: boolean;
}

const DEFAULT_START_TIME = "09:00";
const DEFAULT_END_TIME = "10:00";

const eventForm = reactive<EventFormState>({
  id: null,
  title: "",
  description: "",
  location: "",
  startDate: focus.value,
  endDate: focus.value,
  startTime: DEFAULT_START_TIME,
  endTime: DEFAULT_END_TIME,
  allDay: true,
  color: defaultCategory.value,
  isPrivate: false,
});

const eventDialogMode = ref<EventDialogMode>("create");
const isEventDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const pendingDeleteEvent = ref<CalendarDisplayEvent | null>(null);

const eventErrors = reactive({
  title: [] as string[],
  startDate: [] as string[],
  endDate: [] as string[],
  startTime: [] as string[],
  endTime: [] as string[],
  general: [] as string[],
});

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

watch(
  () => eventForm.allDay,
  (value) => {
    if (!value) {
      eventForm.startTime = eventForm.startTime || DEFAULT_START_TIME;
      eventForm.endTime = eventForm.endTime || DEFAULT_END_TIME;
    }
  },
);

watch(
  () => eventForm.startDate,
  (value) => {
    if (!value) {
      return;
    }
    if (!eventForm.endDate || eventForm.endDate < value) {
      eventForm.endDate = value;
    }
  },
);

function parseDate(value: string | undefined | null): Date | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeCalendarTimestamp(value: string | null | undefined, allDay: boolean): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const match = trimmed.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?$/,
  );

  if (match) {
    const [, rawYear, rawMonth, rawDay, rawHour, rawMinute] = match;

    const year = rawYear.padStart(4, "0");
    const month = rawMonth.padStart(2, "0");
    const day = rawDay.padStart(2, "0");

    if (rawHour != null && rawMinute != null && !allDay) {
      const hour = rawHour.padStart(2, "0");
      const minute = rawMinute.padStart(2, "0");
      return `${year}-${month}-${day} ${hour}:${minute}`;
    }

    return `${year}-${month}-${day}`;
  }

  const date = new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = `${date.getFullYear()}`;
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  if (allDay) {
    return `${year}-${month}-${day}`;
  }

  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function resolveEventColor(rawColor: string | null | undefined): string {
  if (!rawColor) {
    return "primary";
  }
  return colorMap[rawColor] ?? "primary";
}

function resolveEventCategory(
  rawColor: string | null | undefined,
  resolvedColor: string,
): string {
  if (rawColor && colorMap[rawColor]) {
    return rawColor;
  }
  const match = Object.entries(colorMap).find(([, value]) => value === resolvedColor);
  return match?.[0] ?? defaultCategory.value;
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

function onDayClick(payload: { date?: string } | undefined) {
  const date = payload?.date;
  if (!date) {
    return;
  }
  focus.value = date;
  openCreateDialog(date);
}

function createEventForFocus() {
  const date = typeof focus.value === "string" && focus.value ? focus.value : new Date().toISOString().slice(0, 10);
  openCreateDialog(date);
}

function openCreateDialog(date: string) {
  resetEventForm({
    id: null,
    startDate: date,
    endDate: date,
  });
  eventDialogMode.value = "create";
  isEventDialogOpen.value = true;
}

function openEventEditor(event: CalendarDisplayEvent) {
  const startParts = splitTimestamp(event.start, Boolean(event.allDay));
  const endParts = event.end
    ? splitTimestamp(event.end, Boolean(event.allDay))
    : startParts;

  resetEventForm({
    id: event.id,
    title: event.title,
    description: event.description ?? "",
    location: event.location ?? "",
    startDate: startParts.date,
    endDate: endParts.date,
    startTime: startParts.time || DEFAULT_START_TIME,
    endTime: endParts.time || startParts.time || DEFAULT_END_TIME,
    allDay: Boolean(event.allDay),
    color: event.sourceColor ?? resolveEventCategory(null, event.color),
    isPrivate: Boolean(event.isPrivate),
  });

  eventDialogMode.value = "edit";
  isEventDialogOpen.value = true;
}

function resetEventForm(overrides: Partial<EventFormState> = {}) {
  eventForm.id = overrides.id ?? null;
  eventForm.title = overrides.title ?? "";
  eventForm.description = overrides.description ?? "";
  eventForm.location = overrides.location ?? "";
  eventForm.startDate = overrides.startDate ?? focus.value;
  eventForm.endDate = overrides.endDate ?? eventForm.startDate;
  eventForm.startTime = overrides.startTime ?? DEFAULT_START_TIME;
  eventForm.endTime = overrides.endTime ?? DEFAULT_END_TIME;
  eventForm.allDay = overrides.allDay ?? true;
  eventForm.color = overrides.color ?? defaultCategory.value;
  eventForm.isPrivate = overrides.isPrivate ?? false;
  clearEventErrors();
}

interface SplitTimestampResult {
  date: string;
  time: string | null;
}

function splitTimestamp(value: string | null | undefined, allDay: boolean): SplitTimestampResult {
  if (!value) {
    return { date: focus.value, time: null };
  }

  const [date, time] = value.split(" ");

  if (allDay) {
    return { date, time: null };
  }

  return { date, time: time ?? null };
}

function clearEventErrors() {
  eventErrors.title = [];
  eventErrors.startDate = [];
  eventErrors.endDate = [];
  eventErrors.startTime = [];
  eventErrors.endTime = [];
  eventErrors.general = [];
}

function submitEventForm() {
  if (!validateEventForm()) {
    return;
  }

  const id = eventForm.id ?? `local-${Date.now()}`;
  const start = eventForm.allDay
    ? eventForm.startDate
    : `${eventForm.startDate} ${eventForm.startTime || DEFAULT_START_TIME}`;
  const normalizedEndDate = eventForm.endDate || eventForm.startDate;
  const normalizedEndTime = eventForm.allDay
    ? null
    : eventForm.endTime || eventForm.startTime || DEFAULT_END_TIME;
  const end = eventForm.allDay
    ? normalizedEndDate && normalizedEndDate !== eventForm.startDate
      ? normalizedEndDate
      : null
    : normalizedEndDate
    ? `${normalizedEndDate} ${normalizedEndTime}`
    : null;

  const payload: ProfileEvent = {
    id,
    title: eventForm.title.trim(),
    description: eventForm.description.trim() || null,
    location: eventForm.location.trim() || null,
    start,
    end,
    allDay: eventForm.allDay,
    color: eventForm.color,
    isPrivate: eventForm.isPrivate,
  };

  if (eventDialogMode.value === "edit") {
    updateEvent(payload);
  } else {
    addEvent(payload);
  }

  isEventDialogOpen.value = false;

  nextTick(() => {
    selectEventById(payload.id);
  });
}

function validateEventForm(): boolean {
  clearEventErrors();

  if (!eventForm.title.trim()) {
    eventErrors.title = [t("pages.profile.calendar.form.validation.title")];
  }

  if (!eventForm.startDate) {
    eventErrors.startDate = [t("pages.profile.calendar.form.validation.startDate")];
  }

  if (!eventForm.allDay && !eventForm.startTime) {
    eventErrors.startTime = [t("pages.profile.calendar.form.validation.startTime")];
  }

  if (!eventForm.allDay && eventForm.endTime && eventForm.startTime && eventForm.endTime < eventForm.startTime) {
    eventErrors.endTime = [t("pages.profile.calendar.form.validation.endTime")];
  }

  const comparableEndTime = eventForm.endTime || eventForm.startTime;

  const startComparable = buildComparableDate(eventForm.startDate, eventForm.startTime, eventForm.allDay, false);
  const endComparable = buildComparableDate(eventForm.endDate || eventForm.startDate, comparableEndTime, eventForm.allDay, true);

  if (startComparable && endComparable && endComparable.getTime() < startComparable.getTime()) {
    eventErrors.endDate = [t("pages.profile.calendar.form.validation.range")];
  }

  return !eventErrors.title.length && !eventErrors.startDate.length && !eventErrors.startTime.length && !eventErrors.endDate.length && !eventErrors.endTime.length;
}

function buildComparableDate(
  date: string | null,
  time: string | null,
  allDay: boolean,
  isEnd: boolean,
): Date | null {
  if (!date) {
    return null;
  }
  const safeTime = allDay
    ? isEnd
      ? "23:59"
      : "00:00"
    : time || (isEnd ? DEFAULT_END_TIME : DEFAULT_START_TIME);
  return new Date(`${date}T${safeTime}:00`);
}

function addEvent(event: ProfileEvent) {
  internalEvents.value = [...internalEvents.value, event];
}

function updateEvent(event: ProfileEvent) {
  internalEvents.value = internalEvents.value.map((existing) => (existing.id === event.id ? event : existing));
}

function selectEventById(id: string) {
  const event = calendarEvents.value.find((item) => item.id === id);
  if (event) {
    selectedEvent.value = event;
  }
}

function closeEventDialog() {
  isEventDialogOpen.value = false;
}

function requestDeleteEvent(event: CalendarDisplayEvent) {
  pendingDeleteEvent.value = event;
  isDeleteDialogOpen.value = true;
}

function confirmDeleteFromDialog() {
  if (!eventForm.id) {
    return;
  }
  const target = calendarEvents.value.find((event) => event.id === eventForm.id);
  if (target) {
    requestDeleteEvent(target);
    isEventDialogOpen.value = false;
  }
}

function confirmDeleteEvent() {
  const event = pendingDeleteEvent.value;
  if (!event) {
    return;
  }

  internalEvents.value = internalEvents.value.filter((item) => item.id !== event.id);
  pendingDeleteEvent.value = null;
  isDeleteDialogOpen.value = false;

  if (selectedEvent.value?.id === event.id) {
    selectedEvent.value = null;
  }
}

function cancelDeleteEvent() {
  pendingDeleteEvent.value = null;
  isDeleteDialogOpen.value = false;
}
</script>

<style scoped>
:deep(.v-calendar) {
  border-radius: var(--ui-card-radius, calc(var(--radius, var(--ui-radius)) + 4px));
  border: 1px solid var(--v-theme-outline-variant);
  overflow: hidden;
}
</style>
