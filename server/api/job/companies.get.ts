import { defineEventHandler } from "h3";
import { listCompanies } from "~/server/utils/job";
import { getUserToken } from "~/server/utils/getUserToken";
import { requestWithRetry } from "~/server/utils/requestWithRetry";

export default defineEventHandler(async (event) => {
  const token = await getUserToken(event);
  const config = useRuntimeConfig();
  const url = `${config.public.apiJobBase}/api/v1/profile/company`;
  const shouldUseMock = config.public.apiJobBase === "mock";

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
