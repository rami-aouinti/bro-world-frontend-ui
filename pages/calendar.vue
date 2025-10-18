<template>
  <v-container fluid>
    <client-only>
      <teleport
        v-if="canTeleport"
        to="#menu-bar-world"
      >
        <div v-if="isAuthenticated">
          <div class="d-flex align-center justify-space-between px-4 pt-4">
            <h6 class="text-h6 font-weight-bold text-typo">
              {{ t("pages.calendar.menuTitle") }}
            </h6>
            <v-btn
              variant="text"
              color="primary"
              prepend-icon="mdi-plus"
              @click="openCreateDialog(focus)"
            >
              {{ t("pages.calendar.actions.newEvent") }}
            </v-btn>
          </div>
          <div class="px-4 pt-3 pb-3">
            <v-list
              v-if="todayEvents.length"
              style="background-color: transparent; max-height: 320px;"
              density="compact"
            >
              <v-list-item-group class="border-radius-sm">
                <v-list-item
                  v-for="(item, index) in todayEvents"
                  :key="item.id"
                  class="px-0 border-radius-sm"
                  :class="index < todayEvents.length - 1 ? 'mb-4' : ''"
                  :ripple="false"
                >
                  <v-list-item-content class="py-0">
                    <div class="d-flex align-center">
                      <v-avatar
                        size="48"
                        class="text-white px-2 py-2 me-4 bg-gradient-default shadow"
                      >
                        <v-icon
                          class="text-white"
                          size="20"
                        >
                          mdi-calendar
                        </v-icon>
                      </v-avatar>

                      <div class="d-flex flex-column">
                        <h6 class="mb-1 text-dark text-sm font-weight-bold">
                          {{ item.title }}
                        </h6>
                        <span class="text-sm text-body font-weight-light">
                          {{ formatEventRange(item) }}
                        </span>
                      </div>
                    </div>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
            <v-alert
              v-else
              type="primary"
              density="compact"
            >
              {{ t("pages.calendar.menuEmpty") }}
            </v-alert>
          </div>
        </div>
        <div v-else>
          <v-alert
            class="ma-4"
            type="info"
            density="comfortable"
            variant="tonal"
          >
            {{ t("pages.calendar.authNotice") }}
          </v-alert>
        </div>
      </teleport>
    </client-only>

    <v-row>
      <v-col cols="12">
        <v-dialog
          v-model="eventDialog"
          max-width="640"
          class="border-radius-xl"
        >
          <v-card
            rounded="xl"
            :loading="isSaving"
          >
            <v-card-title class="text-h6 text-primary px-6 py-4">
              {{ dialogMode === 'edit' ? t('pages.calendar.dialog.editTitle') : t('pages.calendar.dialog.createTitle') }}
            </v-card-title>
            <v-card-text class="pb-2">
              <v-text-field
                v-model="eventForm.title"
                :label="t('pages.calendar.dialog.titleLabel')"
                :error-messages="validationErrors.title"
                rounded="xl"
                density="comfortable"
                autofocus
              />
              <v-row dense>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-date-input
                    v-model="eventForm.startDate"
                    :label="t('pages.calendar.dialog.startLabel')"
                    rounded="xl"
                    color="primary"
                    header-color="primary"
                    prepend-inner-icon="$calendar"
                    :error-messages="validationErrors.startDate"
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-date-input
                    v-model="eventForm.endDate"
                    :label="t('pages.calendar.dialog.endLabel')"
                    rounded="xl"
                    color="primary"
                    header-color="primary"
                    prepend-inner-icon="$calendar"
                  />
                </v-col>
              </v-row>
              <v-row dense>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="eventForm.startTime"
                    :label="t('pages.calendar.dialog.startTimeLabel')"
                    type="time"
                    rounded="xl"
                    density="comfortable"
                    :disabled="eventForm.allDay"
                    :error-messages="validationErrors.startTime"
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="eventForm.endTime"
                    :label="t('pages.calendar.dialog.endTimeLabel')"
                    type="time"
                    rounded="xl"
                    density="comfortable"
                    :disabled="eventForm.allDay"
                    :error-messages="validationErrors.endTime"
                  />
                </v-col>
              </v-row>
              <v-switch
                v-model="eventForm.allDay"
                :label="t('pages.calendar.dialog.allDayLabel')"
                color="primary"
                inset
              />
              <v-switch
                v-model="eventForm.isPrivate"
                :label="t('pages.calendar.dialog.privateLabel')"
                color="primary"
                inset
              />
              <v-text-field
                v-model="eventForm.location"
                :label="t('pages.calendar.dialog.locationLabel')"
                rounded="xl"
                density="comfortable"
                prepend-inner-icon="mdi-map-marker"
              />
              <v-textarea
                v-model="eventForm.description"
                :label="t('pages.calendar.dialog.descriptionLabel')"
                rounded="xl"
                rows="3"
                density="comfortable"
                auto-grow
              />
              <v-alert
                v-if="formError"
                type="error"
                class="mt-4"
                variant="tonal"
              >
                {{ formError }}
              </v-alert>
            </v-card-text>
            <v-card-actions class="justify-space-between px-6 pb-4">
              <v-btn
                v-if="dialogMode === 'edit'"
                color="error"
                variant="text"
                prepend-icon="mdi-delete"
                :loading="isDeleting"
                :disabled="isSaving"
                @click="confirmDeleteDialog = true"
              >
                {{ t('pages.calendar.dialog.delete') }}
              </v-btn>
              <v-spacer />
              <v-btn
                variant="text"
                color="secondary"
                @click="closeEventDialog"
              >
                {{ t('pages.calendar.dialog.cancel') }}
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                prepend-icon="mdi-content-save"
                :loading="isSaving"
                @click="submitEvent"
              >
                {{ t('pages.calendar.dialog.save') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>

    <v-dialog
      v-model="confirmDeleteDialog"
      max-width="420"
      class="border-radius-xl"
    >
      <v-card rounded="xl">
        <v-card-title class="text-h6 text-error px-6 py-4">
          {{ t('pages.calendar.dialog.confirmDelete') }}
        </v-card-title>
        <v-card-text>
          {{ t('pages.calendar.dialog.confirmDeleteMessage') }}
        </v-card-text>
        <v-card-actions class="justify-end px-6 pb-4">
          <v-btn
            variant="text"
            color="secondary"
            @click="confirmDeleteDialog = false"
          >
            {{ t('pages.calendar.dialog.cancel') }}
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            :loading="isDeleting"
            @click="removeCurrentEvent"
          >
            {{ t('pages.calendar.dialog.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-row>
      <v-col cols="12">
        <v-card
          rounded="xl"
          class="bg-gradient-primary shadow-primary mx-3"
          variant="text"
          elevation="10"
        >
          <v-card-title class="d-flex align-center justify-space-between px-6 py-4">
            <span class="text-h6">
              {{ t('pages.calendar.cardTitle') }}
            </span>
            <v-btn
              variant="tonal"
              color="primary"
              prepend-icon="mdi-plus"
              @click="openCreateDialog(focus)"
            >
              {{ t('pages.calendar.actions.newEvent') }}
            </v-btn>
          </v-card-title>
          <v-divider class="mx-6" />
          <v-card-text class="px-0 py-4">
            <v-progress-linear
              v-if="loading"
              indeterminate
              color="primary"
              height="4"
              class="mb-4 mx-6"
            />
            <v-alert
              v-if="loadError"
              type="error"
              variant="tonal"
              class="mx-6 mb-4"
            >
              {{ loadError }}
            </v-alert>
            <div class="px-2 pb-4">
              <v-calendar
                v-model="focus"
                color="primary"
                :events="calendarEvents"
                :event-color="getEventColor"
                :weekdays="weekdays"
                type="month"
                @click:day="onDayClick"
                @click:event="onEventClick"
              >
                <template #event="{ event }">
                  <div class="text-truncate font-weight-medium">
                    {{ event.title }}
                  </div>
                </template>
              </v-calendar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from "vue"
import dayjs from "dayjs"
import { useI18n } from "vue-i18n"
import { useAuthSession } from "~/stores/auth-session"
import { useEventStore } from "~/stores/useEventStore"
import type { ProfileEvent } from "~/types/pages/profile"

definePageMeta({
  layout: "default",
  breadcrumb: "disabled",
  title: "Calendar",
  description: "Manage and track your events.",
  scrollToTop: true,
})

interface CalendarDisplayEvent {
  id: string
  title: string
  start: string
  end: string | null
  color: string
  allDay: boolean
  description?: string | null
  location?: string | null
  isPrivate?: boolean | null
}

interface EventFormState {
  id: string | null
  title: string
  description: string
  location: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  allDay: boolean
  isPrivate: boolean
}

const DEFAULT_START_TIME = "09:00"
const DEFAULT_END_TIME = "10:00"

const weekdays = [1, 2, 3, 4, 5, 6, 0]

const { t } = useI18n()
const authSession = useAuthSession()
const eventStore = useEventStore()

const isAuthenticated = computed(() => authSession.isAuthenticated)

const loading = computed(() => eventStore.loading)
const loadError = computed(() => eventStore.error)

const focus = ref(new Date().toISOString().slice(0, 10))
const calendarEvents = computed<CalendarDisplayEvent[]>(() =>
  eventStore.events.map((event) => normalizeEvent(event)),
)

const todayEvents = computed(() => {
  const today = dayjs().format("YYYY-MM-DD")

  return calendarEvents.value
    .filter((event) => event.start.startsWith(today))
    .sort((a, b) => getComparableTime(a.start).localeCompare(getComparableTime(b.start)))
})

const canTeleport = ref(false)
const eventDialog = ref(false)
const confirmDeleteDialog = ref(false)
const dialogMode = ref<"create" | "edit">("create")
const isSaving = ref(false)
const isDeleting = ref(false)
const formError = ref<string | null>(null)

const eventForm = reactive<EventFormState>({
  id: null,
  title: "",
  description: "",
  location: "",
  startDate: focus.value,
  endDate: focus.value,
  startTime: DEFAULT_START_TIME,
  endTime: DEFAULT_END_TIME,
  allDay: false,
  isPrivate: false,
})

const validationErrors = reactive({
  title: [] as string[],
  startDate: [] as string[],
  startTime: [] as string[],
  endTime: [] as string[],
})

function normalizeEvent(event: ProfileEvent): CalendarDisplayEvent {
  const id = event.id || `event-${Math.random().toString(36).slice(2)}`
  const allDay = Boolean(event.allDay)
  const normalizedStart = normalizeTimestamp(event.start, allDay)
  const normalizedEnd = event.end ? normalizeTimestamp(event.end, allDay) : null
  const color = event.color && event.color.trim() ? event.color : "primary"

  return {
    id,
    title: event.title || t("pages.calendar.fallbackTitle"),
    start: normalizedStart,
    end: normalizedEnd,
    color,
    allDay,
    description: event.description ?? null,
    location: event.location ?? null,
    isPrivate: event.isPrivate ?? null,
  }
}

function normalizeTimestamp(value: string, allDay: boolean): string {
  const trimmed = value?.trim()

  if (!trimmed) {
    const today = dayjs().format("YYYY-MM-DD")
    return allDay ? today : `${today} ${DEFAULT_START_TIME}`
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return allDay ? trimmed : `${trimmed} ${DEFAULT_START_TIME}`
  }

  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed
  }

  const parsed = dayjs(trimmed)

  if (!parsed.isValid()) {
    const today = dayjs().format("YYYY-MM-DD")
    return allDay ? today : `${today} ${DEFAULT_START_TIME}`
  }

  return allDay ? parsed.format("YYYY-MM-DD") : parsed.format("YYYY-MM-DD HH:mm")
}

function getComparableTime(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/.test(value)) {
    return value.split(" ")[1]
  }

  return value
}

function formatEventRange(event: CalendarDisplayEvent): string {
  if (event.allDay) {
    return t("pages.calendar.rangeAllDay")
  }

  const startTime = extractTime(event.start)
  const endTime = event.end ? extractTime(event.end) : null

  if (startTime && endTime) {
    return `${startTime} - ${endTime}`
  }

  return startTime ?? ""
}

function extractTime(value: string | null): string | null {
  if (!value) {
    return null
  }

  const match = value.match(/\d{2}:\d{2}$/)

  if (match) {
    return match[0]
  }

  const parsed = dayjs(value)

  return parsed.isValid() ? parsed.format("HH:mm") : null
}

function getEventColor(event: CalendarDisplayEvent): string {
  return event.color || "primary"
}

function openCreateDialog(date?: string | null) {
  dialogMode.value = "create"
  resetForm()

  if (date) {
    eventForm.startDate = dayjs(date).format("YYYY-MM-DD")
    eventForm.endDate = eventForm.startDate
  }

  eventDialog.value = true
}

function openEditDialog(event: CalendarDisplayEvent) {
  dialogMode.value = "edit"
  resetForm({
    id: event.id,
    title: event.title,
    description: event.description ?? "",
    location: event.location ?? "",
    startDate: dayjs(event.start).format("YYYY-MM-DD"),
    endDate: event.end ? dayjs(event.end).format("YYYY-MM-DD") : dayjs(event.start).format("YYYY-MM-DD"),
    startTime: extractTime(event.start) ?? DEFAULT_START_TIME,
    endTime: extractTime(event.end) ?? extractTime(event.start) ?? DEFAULT_END_TIME,
    allDay: event.allDay,
    isPrivate: Boolean(event.isPrivate),
  })
  eventDialog.value = true
}

function onDayClick(payload: { date?: string }) {
  const date = payload.date
  if (!date) {
    return
  }
  focus.value = date
  openCreateDialog(date)
}

function onEventClick(payload: { event?: CalendarDisplayEvent }) {
  if (!payload.event) {
    return
  }
  openEditDialog(payload.event)
}

function closeEventDialog() {
  eventDialog.value = false
  formError.value = null
}

function resetForm(overrides: Partial<EventFormState> = {}) {
  eventForm.id = overrides.id ?? null
  eventForm.title = overrides.title ?? ""
  eventForm.description = overrides.description ?? ""
  eventForm.location = overrides.location ?? ""
  eventForm.startDate = overrides.startDate ?? focus.value
  eventForm.endDate = overrides.endDate ?? eventForm.startDate
  eventForm.startTime = overrides.startTime ?? DEFAULT_START_TIME
  eventForm.endTime = overrides.endTime ?? DEFAULT_END_TIME
  eventForm.allDay = overrides.allDay ?? false
  eventForm.isPrivate = overrides.isPrivate ?? false

  validationErrors.title = []
  validationErrors.startDate = []
  validationErrors.startTime = []
  validationErrors.endTime = []
}

function validateForm(): boolean {
  validationErrors.title = []
  validationErrors.startDate = []
  validationErrors.startTime = []
  validationErrors.endTime = []
  formError.value = null

  if (!eventForm.title.trim()) {
    validationErrors.title = [t("pages.calendar.validation.title")]
  }

  if (!eventForm.startDate) {
    validationErrors.startDate = [t("pages.calendar.validation.startDate")]
  }

  if (!eventForm.allDay && !eventForm.startTime) {
    validationErrors.startTime = [t("pages.calendar.validation.startTime")]
  }

  if (!eventForm.allDay && eventForm.endTime && eventForm.startTime && eventForm.endTime < eventForm.startTime) {
    validationErrors.endTime = [t("pages.calendar.validation.endTime")]
  }

  const hasErrors =
    validationErrors.title.length ||
    validationErrors.startDate.length ||
    validationErrors.startTime.length ||
    validationErrors.endTime.length

  if (hasErrors) {
    return false
  }

  const start = buildComparableDate(eventForm.startDate, eventForm.startTime, eventForm.allDay, false)
  const end = buildComparableDate(eventForm.endDate || eventForm.startDate, eventForm.endTime, eventForm.allDay, true)

  if (start && end && end.getTime() < start.getTime()) {
    formError.value = t("pages.calendar.validation.range")
    return false
  }

  return true
}

function buildComparableDate(date: string | null, time: string | null, allDay: boolean, isEnd: boolean): Date | null {
  if (!date) {
    return null
  }

  if (allDay) {
    return new Date(`${date}T${isEnd ? "23:59" : "00:00"}:00`)
  }

  const safeTime = time || (isEnd ? DEFAULT_END_TIME : DEFAULT_START_TIME)
  return new Date(`${date}T${safeTime}:00`)
}

function buildEventPayload() {
  const start = eventForm.allDay
    ? eventForm.startDate
    : `${eventForm.startDate} ${eventForm.startTime || DEFAULT_START_TIME}`

  const normalizedEndDate = eventForm.endDate || eventForm.startDate
  const end = eventForm.allDay
    ? normalizedEndDate && normalizedEndDate !== eventForm.startDate
      ? normalizedEndDate
      : null
    : `${normalizedEndDate} ${eventForm.endTime || eventForm.startTime || DEFAULT_END_TIME}`

  return {
    title: eventForm.title.trim(),
    description: eventForm.description.trim() || null,
    location: eventForm.location.trim() || null,
    start,
    end,
    allDay: eventForm.allDay,
    isPrivate: eventForm.isPrivate,
  }
}

async function submitEvent() {
  if (!validateForm()) {
    return
  }

  const payload = buildEventPayload()
  isSaving.value = true

  try {
    if (dialogMode.value === "edit" && eventForm.id) {
      await eventStore.updateEvent({ id: eventForm.id, ...payload })
    } else {
      await eventStore.addEvent(payload)
    }

    eventDialog.value = false
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "")
    formError.value = message || t("pages.calendar.errors.save")
  } finally {
    isSaving.value = false
  }
}

async function removeCurrentEvent() {
  if (!eventForm.id) {
    return
  }

  isDeleting.value = true
  formError.value = null

  try {
    await eventStore.removeEvent(eventForm.id)
    confirmDeleteDialog.value = false
    eventDialog.value = false
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "")
    formError.value = message || t("pages.calendar.errors.delete")
  } finally {
    isDeleting.value = false
  }
}

onMounted(async () => {
  try {
    await eventStore.fetchEventsFromApi()
  } catch (error) {
    if (!formError.value) {
      const message = error instanceof Error ? error.message : String(error ?? "")
      formError.value = message || t("pages.calendar.errors.load")
    }
  }

  await nextTick()
  setTimeout(() => {
    canTeleport.value = Boolean(document.getElementById("menu-bar-world"))
  }, 200)
})
</script>

<style scoped>
:deep(.v-calendar) {
  border-radius: var(--ui-card-radius, calc(var(--radius, var(--ui-radius)) + 4px));
  border: 1px solid var(--v-theme-outline-variant);
  overflow: hidden;
}
</style>
