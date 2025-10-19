import { readFile } from "node:fs/promises";
import { join } from "node:path";

import {
  invalidateQuizLandingCache,
  readQuizLandingCache,
  writeQuizLandingCache,
} from "./cache/quiz";

export interface QuizFeature {
  icon: string;
  title: string;
  description: string;
  points: string[];
}

export interface QuizOverviewCard {
  title: string;
  value: string;
  trend?: string;
  caption?: string;
}

export interface QuizProcessStep {
  title: string;
  description: string;
}

export interface QuizQuestionBank {
  title: string;
  description: string;
  count: string;
  focus: string;
  difficulty: string;
}

export interface QuizLeaderboardEntry {
  rank: string;
  player: string;
  score: string;
  completed: string;
}

export interface QuizCta {
  title: string;
  description: string;
  button: string;
  buttonAria: string;
  link: string;
}

export interface QuizLandingData {
  hero: { title: string; subtitle: string };
  overview: QuizOverviewCard[];
  features: QuizFeature[];
  process: QuizProcessStep[];
  questionBanks: QuizQuestionBank[];
  leaderboard: QuizLeaderboardEntry[];
  cta: QuizCta;
}

let cache: QuizLandingData | null = null;

export async function getQuizLandingData(): Promise<QuizLandingData> {
  if (cache) {
    return cache;
  }

  const cached = await readQuizLandingCache();

  if (cached) {
    cache = cached;
    return cached;
  }

  const filePath = join(process.cwd(), "server/mock/quiz.json");
  const content = await readFile(filePath, "utf8");
  const parsed = JSON.parse(content) as QuizLandingData;

  cache = {
    hero: parsed.hero,
    overview: parsed.overview ?? [],
    features: parsed.features ?? [],
    process: parsed.process ?? [],
    questionBanks: parsed.questionBanks ?? [],
    leaderboard: parsed.leaderboard ?? [],
    cta: parsed.cta,
  };

  await writeQuizLandingCache(cache);

  return cache;
}

export async function invalidateQuizCache() {
  cache = null;
  await invalidateQuizLandingCache();
}
