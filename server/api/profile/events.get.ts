import { createError, getQuery } from "h3";
import type { H3Event } from "h3";
import { fetchProfileEventsFromSource } from "../../utils/users/api";

function resolveStatusCode(error: unknown): number {
  if (error && typeof error === "object") {
    const status = (error as { statusCode?: number }).statusCode;
    const altStatus = (error as { status?: number }).status;

    if (typeof status === "number") {
      return status;
    }

    if (typeof altStatus === "number") {
      return altStatus;
    }

    const responseStatus = (error as { response?: { status?: number } }).response?.status;

    if (typeof responseStatus === "number") {
      return responseStatus;
    }
  }

  return 500;
}

function resolveErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const dataMessage = (error as { data?: { message?: string } }).data?.message;

    if (typeof dataMessage === "string" && dataMessage.trim()) {
      return dataMessage;
    }
  }

  return error instanceof Error && error.message ? error.message : "Unable to fetch profile events.";
}

async function loadProfileEvents(event: H3Event) {
  const query = getQuery(event);

  return await fetchProfileEventsFromSource(event, query);
}

export default defineEventHandler(async (event) => {
  try {
    return await loadProfileEvents(event);
  } catch (error) {
    console.error("Failed to load profile events", error);

    const message = resolveErrorMessage(error);

    throw createError({
      statusCode: resolveStatusCode(error),
      statusMessage: message,
      message,
      data: {
        message,
      },
    });
  }
});
