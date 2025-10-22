<template>
  <SidebarCard
    class="text-card-foreground px-3 py-2"
    padding="none"
    glow
  >
    <div class="d-flex flex-column gap-4">
      <header class="px-3 pt-3 pb-0">
        <h2 class="text-subtitle-1 font-weight-semibold mb-1">
          {{ t("pages.profile.calendar.upcoming") }}
        </h2>
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ t("pages.profile.calendar.subtitle") }}
        </p>
      </header>

      <div class="px-3 pb-3 d-flex flex-column gap-4">
        <v-card
          v-if="selectedEvent"
          variant="tonal"
          color="primary"
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
                {{
                  selectedEvent.allDay
                    ? t("pages.profile.calendar.allDay")
                    : formatEventTime(selectedEvent)
                }}
              </span>
            </div>
          </v-card-text>
          <v-card-actions class="justify-end flex-wrap gap-2">
            <v-btn
              size="small"
              variant="flat"
              color="primary"
              :disabled="!canEditEvent"
              @click="handleEdit(selectedEvent)"
            >
              {{ t("pages.profile.calendar.actions.edit") }}
            </v-btn>
            <v-btn
              size="small"
              color="error"
              variant="tonal"
              :disabled="!canDeleteEvent"
              @click="handleDelete(selectedEvent)"
            >
              {{ t("pages.profile.calendar.actions.delete") }}
            </v-btn>
          </v-card-actions>
        </v-card>
        <div
          v-else
          class="d-flex flex-column align-center justify-center text-center py-10 gap-4"
        >
          <v-avatar
            size="72"
            color="primary"
            variant="tonal"
          >
            <v-icon
              icon="mdi:calendar-blank"
              size="32"
            />
          </v-avatar>
          <div>
            <p class="text-subtitle-1 font-weight-semibold mb-2">
              {{ t("pages.profile.calendar.emptyTitle") }}
            </p>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ t("pages.profile.calendar.emptyDescription") }}
            </p>
          </div>
        </div>

        <div>
          <h3 class="text-subtitle-2 text-medium-emphasis mb-2">
            {{ t("pages.profile.calendar.upcoming") }}
          </h3>
          <v-list
            v-if="upcomingEvents.length"
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
              @click="handleSelect(event)"
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
          <div
            v-else
            class="text-body-2 text-medium-emphasis"
          >
            {{ t("pages.profile.calendar.emptyDescription") }}
          </div>
        </div>
      </div>
    </div>
  </SidebarCard>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useProfileCalendarSharedState } from "~/composables/useProfileCalendarSharedState";
import type { ProfileCalendarDisplayEvent } from "~/types/components/profile-calendar";

const SidebarCard = defineAsyncComponent({
  loader: () => import("~/components/layout/SidebarCard.vue"),
  suspensible: false,
});

const { t, locale } = useI18n();
const calendarState = useProfileCalendarSharedState();

const selectedEvent = computed(() => calendarState.value.selectedEvent);
const upcomingEvents = computed(() => calendarState.value.upcomingEvents);
const canEditEvent = computed(() => Boolean(calendarState.value.openEventEditor));
const canDeleteEvent = computed(() => Boolean(calendarState.value.requestDeleteEvent));

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

function parseDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatEventRange(event: ProfileCalendarDisplayEvent): string {
  const startDate = parseDate(event.start);
  const endDate = parseDate(event.end ?? event.start);

  if (!startDate) {
    return "";
  }

  if (!endDate || startDate.toDateString() === endDate.toDateString()) {
    return dateFormatter.value.format(startDate);
  }

  return `${dateFormatter.value.format(startDate)} → ${dateFormatter.value.format(endDate)}`;
}

function formatEventTime(event: ProfileCalendarDisplayEvent): string {
  const startDate = parseDate(event.start);
  const endDate = parseDate(event.end ?? event.start);

  if (!startDate) {
    return "";
  }

  if (!endDate) {
    return dateTimeFormatter.value.format(startDate);
  }

  const start = dateTimeFormatter.value.format(startDate);
  const end = event.allDay
    ? dateFormatter.value.format(endDate)
    : timeFormatter.value.format(endDate);
  return `${start} → ${end}`;
}

function handleSelect(event: ProfileCalendarDisplayEvent) {
  calendarState.value.selectEvent?.(event);
}

function handleEdit(event: ProfileCalendarDisplayEvent) {
  calendarState.value.openEventEditor?.(event);
}

function handleDelete(event: ProfileCalendarDisplayEvent) {
  calendarState.value.requestDeleteEvent?.(event);
}
</script>
