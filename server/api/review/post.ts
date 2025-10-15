import type { H3Event } from "h3";
import { createError, defineEventHandler, readBody } from "h3";
import { requestWithRetry } from "~/server/utils/requestWithRetry";
import { getSessionToken, withAuthHeaders } from "~/server/utils/auth/session";

interface SubmitReviewBody {
  rating?: number;
}

function resolveApiBase(event: H3Event) {
  const config = useRuntimeConfig(event);
  const base =
    config.reviews?.apiBase || config.public?.reviews?.apiBase || "https://bro-world.org";

  return base.replace(/\/$/, "");
}

export default defineEventHandler(async (event) => {
  const token = getSessionToken(event);

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
      data: { message: "You need to sign in to submit a rating." },
    });
  }

  const body = await readBody<SubmitReviewBody>(event);
  const value = typeof body?.rating === "number" ? body.rating : Number(body?.rating ?? 0);

  if (!Number.isFinite(value) || value <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid rating",
      data: { message: "Please provide a valid rating." },
    });
  }

  const base = resolveApiBase(event);
  const endpoint = `${base}/api/v1/review`;

  return await requestWithRetry("POST", endpoint, {
    body: { rating: value },
    headers: withAuthHeaders(event, { "Content-Type": "application/json" }),
  });
});
