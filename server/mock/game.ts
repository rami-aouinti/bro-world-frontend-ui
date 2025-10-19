export interface GameProfileSummaryMock {
  playerId: string;
  displayName: string;
  level: number;
  experience: {
    current: number;
    required: number;
  };
  progressPercentage: number;
  streak: {
    current: number;
    longest: number;
    lastClaimedAt: string;
  };
  currencies: {
    aurum: number;
    shards: number;
  };
  lastActivityAt: string;
}

export interface GameQuestMock {
  id: string;
  title: string;
  description: string;
  progress: number;
  goal: number;
  reward: {
    experience: number;
    currencies: {
      aurum: number;
      shards: number;
    };
    items?: {
      id: string;
      name: string;
      rarity: "common" | "rare" | "epic" | "legendary";
    }[];
  };
  status: "inProgress" | "completed" | "upcoming";
  expiresAt: string | null;
}

export interface GameAchievementMock {
  id: string;
  title: string;
  description: string;
  points: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt: string | null;
}

export interface GameLeaderboardEntryMock {
  rank: number;
  playerId: string;
  displayName: string;
  score: number;
  delta: number;
  trend: "up" | "down" | "steady";
}

export interface GameSeasonMock {
  id: string;
  title: string;
  status: "active" | "upcoming" | "completed";
  startsAt: string;
  endsAt: string;
  rewardTrackTiers: number;
  unlockedTiers: number;
  highlight: string;
}

export const gameProfileSummaryMock: GameProfileSummaryMock = {
  playerId: "player-1024",
  displayName: "Nova Rivera",
  level: 42,
  experience: {
    current: 18250,
    required: 20000,
  },
  progressPercentage: 0.9125,
  streak: {
    current: 9,
    longest: 17,
    lastClaimedAt: "2025-02-27T08:15:00Z",
  },
  currencies: {
    aurum: 1260,
    shards: 48,
  },
  lastActivityAt: "2025-02-27T21:40:00Z",
};

export const gameQuestsMock: GameQuestMock[] = [
  {
    id: "quest-weekly-ranked",
    title: "Win three ranked matches",
    description: "Queue for ranked mode and secure three victories to maintain your Diamond tier placement.",
    progress: 2,
    goal: 3,
    reward: {
      experience: 750,
      currencies: {
        aurum: 150,
        shards: 3,
      },
    },
    status: "inProgress",
    expiresAt: "2025-03-02T23:59:59Z",
  },
  {
    id: "quest-daily-artifact",
    title: "Capture six data artifacts",
    description: "Deploy to orbital outposts and extract encrypted artifacts before the opposing squad.",
    progress: 6,
    goal: 6,
    reward: {
      experience: 420,
      currencies: {
        aurum: 75,
        shards: 1,
      },
      items: [
        {
          id: "cosmetic-banner-holo",
          name: "Holographic Victory Banner",
          rarity: "epic",
        },
      ],
    },
    status: "completed",
    expiresAt: "2025-02-27T23:59:59Z",
  },
  {
    id: "quest-community-coop",
    title: "Complete cooperative event chains",
    description: "Finish four co-op event stages with a squad mate without any revives.",
    progress: 1,
    goal: 4,
    reward: {
      experience: 680,
      currencies: {
        aurum: 110,
        shards: 2,
      },
    },
    status: "upcoming",
    expiresAt: "2025-03-05T23:59:59Z",
  },
];

export const gameAchievementsMock: GameAchievementMock[] = [
  {
    id: "achievement-flawless",
    title: "Flawless Vanguard",
    description: "Win ten ranked matches in a row without dropping a round.",
    points: 120,
    rarity: "legendary",
    unlockedAt: null,
  },
  {
    id: "achievement-support",
    title: "Field Medic",
    description: "Revive or heal teammates for a total of 25,000 health during a single season.",
    points: 60,
    rarity: "rare",
    unlockedAt: "2025-02-11T19:22:00Z",
  },
  {
    id: "achievement-builder",
    title: "Systems Architect",
    description: "Construct 200 deployable defenses that survive for more than five minutes.",
    points: 80,
    rarity: "epic",
    unlockedAt: "2025-01-28T10:05:00Z",
  },
  {
    id: "achievement-collector",
    title: "Data Hoarder",
    description: "Collect every artifact variant released during a season event.",
    points: 95,
    rarity: "epic",
    unlockedAt: null,
  },
];

export const gameLeaderboardMock: GameLeaderboardEntryMock[] = [
  {
    rank: 1,
    playerId: "player-509",
    displayName: "Aria Quinn",
    score: 9820,
    delta: 2,
    trend: "up",
  },
  {
    rank: 2,
    playerId: "player-377",
    displayName: "Echo Mercer",
    score: 9675,
    delta: -1,
    trend: "down",
  },
  {
    rank: 3,
    playerId: "player-114",
    displayName: "Kai Solis",
    score: 9520,
    delta: 0,
    trend: "steady",
  },
  {
    rank: 4,
    playerId: "player-823",
    displayName: "Mira Takeda",
    score: 9410,
    delta: 4,
    trend: "up",
  },
  {
    rank: 5,
    playerId: "player-265",
    displayName: "Rowan Idris",
    score: 9360,
    delta: -2,
    trend: "down",
  },
];

export const gameSeasonsMock: GameSeasonMock[] = [
  {
    id: "season-07",
    title: "Synthwave Skies",
    status: "active",
    startsAt: "2025-01-15T00:00:00Z",
    endsAt: "2025-04-07T23:59:59Z",
    rewardTrackTiers: 120,
    unlockedTiers: 68,
    highlight: "Unlock the Aerial Vanguard mythic skin line and reactive banners.",
  },
  {
    id: "season-08",
    title: "Solar Requiem",
    status: "upcoming",
    startsAt: "2025-04-15T00:00:00Z",
    endsAt: "2025-07-06T23:59:59Z",
    rewardTrackTiers: 130,
    unlockedTiers: 0,
    highlight: "Preview limited-time raid encounters and cooperative boss fights.",
  },
];

export const gameOverviewMock = {
  summary: gameProfileSummaryMock,
  quests: gameQuestsMock,
  achievements: gameAchievementsMock,
  leaderboard: gameLeaderboardMock,
  seasons: gameSeasonsMock,
};
