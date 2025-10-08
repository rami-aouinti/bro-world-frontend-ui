export interface SidebarWeatherData {
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
}

export interface SidebarWeatherRaw {
  badge?: string;
  title?: string;
  subtitle?: string;
  icon?: string;
  location?: string;
  temperature?: string;
  tip?: string;
  locationLabel?: string;
  temperatureLabel?: string;
  tipLabel?: string;
}

export interface SidebarLeaderboardParticipant {
  position: number;
  name: string;
  role: string;
  score: string;
}

export interface SidebarLeaderboardData {
  title: string;
  live: string;
  participants: SidebarLeaderboardParticipant[];
}

export interface SidebarLeaderboardRaw {
  title?: string;
  live?: string;
  participants?: Record<
    "first" | "second" | "third",
    Omit<SidebarLeaderboardParticipant, "position">
  >;
}

export interface SidebarRatingCategory {
  label: string;
  value: number;
}

export interface SidebarRatingData {
  title: string;
  subtitle: string;
  average: string;
  total: number;
  icon: string;
  stars: number;
  categories: SidebarRatingCategory[];
}

export interface SidebarRatingRaw {
  title?: string;
  subtitle?: string;
  average?: string;
  total?: number;
  icon?: string;
  stars?: number;
  categories?: Record<string, SidebarRatingCategory>;
}
