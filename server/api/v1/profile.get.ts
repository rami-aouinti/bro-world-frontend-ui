import { createError } from "h3";
import { resolveErrorMessage, resolveErrorStatusCode, sanitizeErrorStack } from "../../utils/errors";
import { fetchCurrentProfileFromSource } from "../../utils/users/api";

export default defineEventHandler(async (event) => {
  try {
    return await fetchCurrentProfileFromSource(event);
  } catch (error) {
    console.error("Failed to proxy profile", error);

    const statusCode = resolveErrorStatusCode(error, 502);
    const message = resolveErrorMessage(error, "Unable to retrieve profile.");
    const statusMessage = statusCode === 502 ? "Unable to load profile" : message;

    throw sanitizeErrorStack(
      createError({
        statusCode,
        statusMessage,
        message,
        data: message ? { message } : undefined,
      }),
    );
  }
});
