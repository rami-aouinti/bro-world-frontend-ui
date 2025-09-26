import { computed } from 'vue'
import type {
  SidebarLeaderboardData,
  SidebarLeaderboardParticipant,
  SidebarLeaderboardRaw,
  SidebarRatingData,
  SidebarRatingRaw,
  SidebarWeatherData,
} from '@/components/layout/right-sidebar.types'

export function useRightSidebarData() {
  const { tm } = useI18n()

  const weather = computed(() => tm('sidebar.weather') as SidebarWeatherData)

  const leaderboard = computed<SidebarLeaderboardData>(() => {
    const raw = tm('sidebar.leaderboard') as SidebarLeaderboardRaw | undefined
    const order: Array<keyof NonNullable<SidebarLeaderboardRaw['participants']>> = [
      'first',
      'second',
      'third',
    ]

    const participants = order
      .map((key, index) => {
        const participant = raw?.participants?.[key]

        if (!participant) {
          return null
        }

        return {
          position: index + 1,
          ...participant,
        } satisfies SidebarLeaderboardParticipant
      })
      .filter((participant): participant is SidebarLeaderboardParticipant => Boolean(participant))

    return {
      title: raw?.title ?? '',
      live: raw?.live ?? '',
      participants,
    }
  })

  const rating = computed<SidebarRatingData>(() => {
    const raw = tm('sidebar.rating') as SidebarRatingRaw

    return {
      title: raw.title ?? '',
      subtitle: raw.subtitle ?? '',
      average: raw.average ?? '',
      total: raw.total ?? 0,
      icon: raw.icon ?? '',
      stars: raw.stars ?? 0,
      categories: Object.values(raw.categories ?? {}),
    }
  })

  return { weather, leaderboard, rating }
}
