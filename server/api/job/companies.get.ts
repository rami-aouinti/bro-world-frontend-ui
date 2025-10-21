import { defineEventHandler } from "h3";
import { listCompanies } from "~/server/utils/job";
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

export default defineEventHandler(async (event) => {
  const token = await getUserToken(event);
  const config = useRuntimeConfig();
  const url = `${config.public.apiJobBase}/api/v1/profile/company`;
  const shouldUseMock =
    (typeof config.public.apiJobBase === "string" &&
      config.public.apiJobBase.trim().toLowerCase() === "mock") ||
    resolveBooleanFlag(config.public?.useMockData) ||
    resolveBooleanFlag((config as { useMockData?: unknown }).useMockData);

  if (shouldUseMock) {
    return listCompanies();
  }

  try {
    return await requestWithRetry("GET", url, { token });
  } catch (error) {
    console.warn("[job] Remote company API unavailable, falling back to mock data.", error);
    return listCompanies();
  }
});
