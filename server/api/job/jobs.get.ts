import { defineEventHandler, getQuery } from "h3";
import { listJobs, type ListJobsQuery } from "~/server/utils/job";
import { getUserToken } from "~/server/utils/getUserToken";
import { requestWithRetry } from "~/server/utils/requestWithRetry";

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

type QueryValue = string | string[] | undefined;

function toArray(value: QueryValue): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => entry?.toString?.() ?? "").filter(Boolean);
  }

  if (typeof value === "string" && value.trim().length) {
    return [value];
  }

  return [];
}

function toNumber(value: QueryValue): number | null {
  if (Array.isArray(value)) {
    return toNumber(value[0]);
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length) {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

function sanitiseQuery(rawQuery: Record<string, QueryValue>): ListJobsQuery {
  return {
    title: typeof rawQuery.title === "string" ? rawQuery.title : undefined,
    company: typeof rawQuery.company === "string" ? rawQuery.company : undefined,
    experience: toNumber(rawQuery.experience),
    salaryMin: toNumber(rawQuery.salaryMin),
    skills: toArray(rawQuery["skills[]"] ?? rawQuery.skills),
    works: toArray(rawQuery["works[]"] ?? rawQuery.works),
    contracts: toArray(rawQuery["contracts[]"] ?? rawQuery.contracts),
    location: typeof rawQuery.location === "string" ? rawQuery.location : undefined,
    page: toNumber(rawQuery.page) ?? undefined,
    limit: toNumber(rawQuery.limit) ?? undefined,
  };
}

export default defineEventHandler(async (event) => {
  const token = await getUserToken(event);
  const config = useRuntimeConfig();
  const rawQuery = getQuery(event) as Record<string, QueryValue>;
  const queryPayload = sanitiseQuery(rawQuery);

  const searchParams = new URLSearchParams();
  Object.entries(rawQuery).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item));
        }
      });
    } else if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  const baseUrl = `${config.public.apiJobBase}/api/v1/job`;
  const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

  const shouldUseMock =
    (typeof config.public.apiJobBase === "string" &&
      config.public.apiJobBase.trim().toLowerCase() === "mock") ||
    resolveBooleanFlag(config.public?.useMockData) ||
    resolveBooleanFlag((config as { useMockData?: unknown }).useMockData);

  if (shouldUseMock) {
    return listJobs(queryPayload);
  }

  try {
    return await requestWithRetry("GET", url, { token });
  } catch (error) {
    console.warn("[job] Remote job API unavailable, falling back to mock data.", error);
    return listJobs(queryPayload);
  }
});
