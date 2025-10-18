import { createError, getQuery } from "h3";
import type { H3Event } from "h3";
import {
  resolveErrorMessage,
  resolveErrorStatusCode,
  sanitizeErrorStack,
} from "../../utils/errors";
import { fetchProfileEventsFromSource } from "../../utils/users/api";

async function loadProfileEvents(event: H3Event) {
  const query = getQuery(event);

  return await fetchProfileEventsFromSource(event, query);
}

export default defineEventHandler(async (event) => {
  try {
    return await loadProfileEvents(event);
  } catch (error) {
    console.error("Failed to load profile events", error);

    const message = resolveErrorMessage(error, "Unable to fetch profile events.");

    throw sanitizeErrorStack(
      createError({
        statusCode: resolveErrorStatusCode(error),
        statusMessage: message,
        message,
        data: {
          message,
        },
      }),
    );
  }
});
