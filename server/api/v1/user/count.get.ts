import { createError } from "h3";
import { fetchUsersCountFromSource } from "../../../utils/users/api";

export default defineEventHandler(async (event) => {
  try {
    return await fetchUsersCountFromSource(event);
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("Failed to proxy users count", error);

    throw createError({
      statusCode: 502,
      statusMessage: "Unable to load user count",
      data: {
        message: error instanceof Error ? error.message : "Unable to retrieve the user count.",
      },
    });
  }
});
