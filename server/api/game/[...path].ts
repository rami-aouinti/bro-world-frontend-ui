import {
  createError,
  defineEventHandler,
  getHeader,
  getMethod,
  getQuery,
  readBody,
  readMultipartFormData,
} from "h3";
import type { QueryObject } from "ufo";
import { joinURL } from "ufo";
import { useRuntimeConfig } from "#imports";
import { getUserToken } from "~/server/utils/getUserToken";
import {
  gameAchievementsMock,
  gameLeaderboardMock,
  gameOverviewMock,
  gameProfileSummaryMock,
  gameQuestsMock,
  gameSeasonsMock,
} from "~/server/mock/game";
import {
  resolveErrorMessage,
  resolveErrorStatusCode,
  sanitizeErrorStack,
} from "~/server/utils/errors";

interface NormalizedRequestContext {
  method: string;
  segments: string[];
}

function normalizeSegments(raw: string | string[] | undefined): string[] {
  if (!raw) {
    return [];
  }

  const segments = Array.isArray(raw) ? raw : [raw];

  return segments
    .map((segment) => String(segment ?? "").trim())
    .filter((segment) => segment.length > 0);
}

function resolveBooleanFlag(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) {
      return true;
    }

    if (value === 0) {
      return false;
    }
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (!normalized) {
      return false;
    }

    if (["1", "true", "yes", "on"].includes(normalized)) {
      return true;
    }

    if (["0", "false", "no", "off"].includes(normalized)) {
      return false;
    }
  }

  return false;
}

function normalizeRequest(event: Parameters<typeof getMethod>[0]): NormalizedRequestContext {
  const method = getMethod(event).toUpperCase();
  const segments = normalizeSegments(event.context.params?.path);

  return { method, segments };
}

function buildFormData(entries: Awaited<ReturnType<typeof readMultipartFormData>>): FormData {
  const formData = new FormData();

  for (const entry of entries ?? []) {
    const name = entry.name?.trim();

    if (!name) {
      continue;
    }

    if (entry.filename) {
      const blob = new Blob([entry.data], { type: entry.type || "application/octet-stream" });
      formData.append(name, blob, entry.filename);
    } else {
      formData.append(name, entry.data.toString("utf-8"));
    }
  }

  return formData;
}

function serveMockResponse(method: string, segments: string[]) {
  const normalizedMethod = method === "HEAD" ? "GET" : method;

  if (normalizedMethod !== "GET") {
    throw createError({
      statusCode: 405,
      statusMessage: "Mock game endpoints only support read operations.",
    });
  }

  const [primary, secondary] = segments;

  switch (primary ?? "overview") {
    case "overview":
    case "summary":
      return gameOverviewMock;
    case "profile":
      return gameProfileSummaryMock;
    case "quests": {
      if (!secondary) {
        return { data: gameQuestsMock };
      }

      const quest = gameQuestsMock.find((entry) => entry.id === secondary);

      if (quest) {
        return { data: quest };
      }

      break;
    }
    case "achievements": {
      if (!secondary) {
        return { data: gameAchievementsMock };
      }

      const achievement = gameAchievementsMock.find((entry) => entry.id === secondary);

      if (achievement) {
        return { data: achievement };
      }

      break;
    }
    case "leaderboard":
      return { data: gameLeaderboardMock };
    case "seasons": {
      if (!secondary) {
        return { data: gameSeasonsMock };
      }

      const season = gameSeasonsMock.find((entry) => entry.id === secondary);

      if (season) {
        return { data: season };
      }

      break;
    }
    default:
      break;
  }

  throw createError({
    statusCode: 404,
    statusMessage: `Mock response for /api/game/${segments.join("/") || ""} is not available.`,
  });
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const query = getQuery(event) as QueryObject;
  const { method, segments } = normalizeRequest(event);
  const base = config.public?.apiGameBase ?? "https://game.bro-world.org";
  const shouldUseMock =
    (typeof base === "string" && base.trim().toLowerCase() === "mock") ||
    resolveBooleanFlag(config.public?.useMockData) ||
    resolveBooleanFlag((config as { useMockData?: unknown }).useMockData);

  let token: string | null = null;

  try {
    token = await getUserToken(event);
  } catch {
    token = null;
  }

  if (shouldUseMock) {
    return serveMockResponse(method, segments);
  }

  const targetBase = base.replace(/\/$/, "");
  const targetUrl = joinURL(targetBase, ...segments);

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const incomingContentType = getHeader(event, "content-type");

  if (incomingContentType) {
    headers["Content-Type"] = incomingContentType;
  }

  const fetchOptions: Parameters<typeof $fetch>[1] = {
    method,
    headers,
    query,
  };

  if (method !== "GET" && method !== "HEAD") {
    if (incomingContentType && incomingContentType.includes("multipart/form-data")) {
      const entries = await readMultipartFormData(event);
      fetchOptions.body = buildFormData(entries);
      delete fetchOptions.headers?.["Content-Type"];
    } else {
      fetchOptions.body = await readBody(event);
    }
  }

  try {
    return await $fetch(targetUrl, fetchOptions);
  } catch (error) {
    const statusCode = resolveErrorStatusCode(error, 502);

    if (method === "GET" && statusCode >= 500) {
      console.warn("[game] Remote game API unavailable, falling back to mock data.", error);
      return serveMockResponse("GET", segments);
    }

    const message = resolveErrorMessage(error, "Unable to reach the game service.");

    throw sanitizeErrorStack(
      createError({
        statusCode,
        statusMessage: statusCode === 502 ? "Unable to reach the game service." : message,
        data: { message },
      }),
    );
  }
});
