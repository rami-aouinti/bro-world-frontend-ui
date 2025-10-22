import type { ProfileCalendarDisplayEvent } from "~/types/components/profile-calendar";

interface ProfileCalendarSharedState {
  events: ProfileCalendarDisplayEvent[];
  upcomingEvents: ProfileCalendarDisplayEvent[];
  selectedEvent: ProfileCalendarDisplayEvent | null;
  selectEvent?: (event: ProfileCalendarDisplayEvent) => void;
  openEventEditor?: (event: ProfileCalendarDisplayEvent) => void;
  requestDeleteEvent?: (event: ProfileCalendarDisplayEvent) => void;
}

export function useProfileCalendarSharedState() {
  return useState<ProfileCalendarSharedState>("profile-calendar-shared-state", () => ({
    events: [],
    upcomingEvents: [],
    selectedEvent: null,
  }));
}
