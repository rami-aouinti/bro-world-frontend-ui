import { computed } from "vue";
import type {
  SidebarLeaderboardData,
  SidebarLeaderboardParticipant,
  SidebarLeaderboardRaw,
  SidebarRatingData,
  SidebarRatingRaw,
  SidebarWeatherData,
  SidebarWeatherRaw,
} from "@/components/layout/right-sidebar.types";

const SIDEBAR_I18N_NAMESPACE = "blog.sidebar";

export function useRightSidebarData() {
  const { tm, rt } = useI18n();

  function resolveText(value: unknown): string {
    if (value == null) {
      return "";
    }

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }

    try {
      const rendered = rt(value as never);
      return typeof rendered === "string" ? rendered : String(rendered);
    } catch (error) {
      if (import.meta.dev) {
        console.warn("[useRightSidebarData] Unable to resolve text", value, error);
      }

      try {
        return String(value);
      } catch {
        return "";
      }
    }
  }

  const weather = computed<SidebarWeatherData | null>(() => {
    const raw = tm(`${SIDEBAR_I18N_NAMESPACE}.weather`) as SidebarWeatherRaw | undefined;

    if (!raw) {
      return null;
    }

    const hasContent = raw.title || raw.location || raw.temperature || raw.subtitle;

    if (!hasContent) {
      return null;
    }

    return {
      badge: resolveText(raw.badge),
      title: resolveText(raw.title),
      subtitle: resolveText(raw.subtitle),
      icon: resolveText(raw.icon),
      location: resolveText(raw.location),
      temperature: resolveText(raw.temperature),
      tip: resolveText(raw.tip),
      locationLabel: resolveText(raw.locationLabel),
      temperatureLabel: resolveText(raw.temperatureLabel),
      tipLabel: resolveText(raw.tipLabel),
    } satisfies SidebarWeatherData;
  });

  const leaderboard = computed<SidebarLeaderboardData>(() => {
    const raw = tm(`${SIDEBAR_I18N_NAMESPACE}.leaderboard`) as SidebarLeaderboardRaw | undefined;
    const order: Array<keyof NonNullable<SidebarLeaderboardRaw["participants"]>> = [
      "first",
      "second",
      "third",
    ];

    const participants = order
      .map((key, index) => {
        const participant = raw?.participants?.[key];

        if (!participant) {
          return null;
        }

        return {
          position: index + 1,
          name: resolveText(participant.name),
          role: resolveText(participant.role),
          score: resolveText(participant.score),
        } satisfies SidebarLeaderboardParticipant;
      })
      .filter((participant): participant is SidebarLeaderboardParticipant => Boolean(participant));

    return {
      title: resolveText(raw?.title),
      live: resolveText(raw?.live),
      participants,
    };
  });

  const rating = computed<SidebarRatingData>(() => {
    const raw = tm(`${SIDEBAR_I18N_NAMESPACE}.rating`) as SidebarRatingRaw;

    return {
      title: resolveText(raw.title),
      subtitle: resolveText(raw.subtitle),
      average: resolveText(raw.average),
      total: typeof raw.total === "number" ? raw.total : Number(raw.total ?? 0),
      icon: resolveText(raw.icon),
      stars: typeof raw.stars === "number" ? raw.stars : Number(raw.stars ?? 0),
      categories: Object.values(raw.categories ?? {}).map((category) => ({
        label: resolveText(category.label),
        value: typeof category.value === "number" ? category.value : Number(category.value ?? 0),
      })),
    };
  });

  return { weather, leaderboard, rating };
}
