import type { H3Event } from "h3";
import { defineEventHandler } from "h3";
import { requestWithRetry } from "~/server/utils/requestWithRetry";
import { useCachedFetch } from "~/server/utils/useCachedFetch";

interface ReviewStatsResponse {
  average_rating?: number | null;
  total_reviews?: number | null;
  distribution?: Record<string, number> | null;
}

function resolveApiBase(event: H3Event) {
  const config = useRuntimeConfig(event);
  const base =
    config.reviews?.apiBase || config.public?.reviews?.apiBase || "https://bro-world.org";

  return base.replace(/\/$/, "");
}

export default defineEventHandler(async (event) => {
  const base = resolveApiBase(event);
  const endpoint = `${base}/api/reviews/stats`;

  const ttlSeconds = 60 * 60; // 1 hour cache

  const payload = await useCachedFetch<ReviewStatsResponse>(
    "reviews:stats",
    async () => {
      return await requestWithRetry<ReviewStatsResponse>("GET", endpoint);
    },
    ttlSeconds,
  );

  return payload ?? { average_rating: 0, total_reviews: 0, distribution: null };
});
