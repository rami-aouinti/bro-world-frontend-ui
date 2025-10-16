import { createError } from "h3";
import { fetchCurrentProfileFromSource } from "../../utils/users/api";

export default defineEventHandler(async (event) => {
  try {
    return await fetchCurrentProfileFromSource(event);
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("Failed to proxy profile", error);

    throw createError({
      statusCode: 502,
      statusMessage: "Unable to load profile",
      data: {
        message: error instanceof Error ? error.message : "Unable to retrieve profile.",
      },
    });
  }
});
