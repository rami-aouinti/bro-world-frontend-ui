import { defineStore } from "pinia";
import dayjs from "dayjs";
import type { ProfileEvent } from "~/types/pages/profile";

type EventPayload = {
  id?: string;
  title: string;
  description?: string | null;
  location?: string | null;
  start: string;
  end?: string | null;
  allDay?: boolean | null;
  isPrivate?: boolean | null;
};

interface EventsState {
  events: ProfileEvent[];
  loading: boolean;
  error: string | null;
}

function normalizeEvent(event: ProfileEvent): ProfileEvent {
  const id = event.id?.trim() || `event-${Math.random().toString(36).slice(2)}`;
  const title = event.title?.trim() || "Untitled event";
  const start = normalizeTimestamp(event.start, Boolean(event.allDay));
  const end = event.end ? normalizeTimestamp(event.end, Boolean(event.allDay)) : null;

  return {
    ...event,
    id,
    title,
    start,
    end,
    allDay: Boolean(event.allDay),
  };
}

function normalizeTimestamp(value: string | null | undefined, allDay: boolean): string {
  const trimmed = value?.trim();

  if (!trimmed) {
    return allDay ? dayjs().format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD HH:mm");
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return allDay ? trimmed : `${trimmed} 00:00`;
  }

  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed.replace("T", " ");
  }

  const parsed = dayjs(trimmed);

  if (!parsed.isValid()) {
    return allDay ? dayjs().format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD HH:mm");
  }

  return allDay ? parsed.format("YYYY-MM-DD") : parsed.format("YYYY-MM-DD HH:mm");
}

function buildFormData(payload: EventPayload): FormData {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("start", payload.start);

  if (payload.end) {
    formData.append("end", payload.end);
  }

  if (payload.description != null) {
    formData.append("description", payload.description);
  }

  if (payload.location != null) {
    formData.append("location", payload.location);
  }

  if (payload.allDay != null) {
    formData.append("allDay", String(payload.allDay));
  }

  if (payload.isPrivate != null) {
    formData.append("isPrivate", String(payload.isPrivate));
  }

  return formData;
}

export const useEventStore = defineStore("calendar-events", {
  state: (): EventsState => ({
    events: [],
    loading: false,
    error: null,
  }),
  actions: {
    setEvents(events: ProfileEvent[]) {
      this.events = events.map((event) => normalizeEvent(event));
    },
    setError(message: string | null) {
      this.error = message;
    },
    async fetchEventsFromApi() {
      this.loading = true;
      this.error = null;

      try {
        const response = await $fetch<ProfileEvent[] | { data?: ProfileEvent[] }>(
          "/api/profile/events",
          {
            method: "GET",
          },
        );

        const events = Array.isArray(response)
          ? response
          : Array.isArray((response as { events?: ProfileEvent[] }).events)
            ? ((response as { events?: ProfileEvent[] }).events ?? [])
            : Array.isArray((response as { data?: ProfileEvent[] }).data)
              ? ((response as { data?: ProfileEvent[] }).data ?? [])
              : [];

        this.setEvents(events);
        return this.events;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error ?? "");
        this.setError(message || "Unable to load events.");
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async addEvent(payload: EventPayload) {
      this.loading = true;
      this.error = null;

      try {
        const formData = buildFormData(payload);
        await $fetch("/api/profile/events", {
          method: "POST",
          body: formData,
        });
        await this.fetchEventsFromApi();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error ?? "");
        this.setError(message || "Unable to create the event.");
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async updateEvent(payload: EventPayload & { id: string }) {
      const id = payload.id?.trim();

      if (!id) {
        throw new Error("An event identifier is required.");
      }

      this.loading = true;
      this.error = null;

      try {
        const formData = buildFormData(payload);
        await $fetch(`/api/profile/events/${encodeURIComponent(id)}`, {
          method: "POST",
          body: formData,
        });
        await this.fetchEventsFromApi();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error ?? "");
        this.setError(message || "Unable to update the event.");
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async removeEvent(id: string) {
      const trimmed = id?.trim();

      if (!trimmed) {
        throw new Error("An event identifier is required.");
      }

      this.loading = true;
      this.error = null;

      try {
        await $fetch(`/api/profile/events/${encodeURIComponent(trimmed)}`, {
          method: "DELETE",
        });
        await this.fetchEventsFromApi();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error ?? "");
        this.setError(message || "Unable to delete the event.");
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
