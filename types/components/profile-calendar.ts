import type { ProfileEvent } from "~/types/pages/profile";

export interface ProfileCalendarDisplayEvent extends ProfileEvent {
  color: string;
  sourceColor: string;
  start: string;
  end: string | null;
  allDay: boolean;
  description?: string;
  location?: string;
}
