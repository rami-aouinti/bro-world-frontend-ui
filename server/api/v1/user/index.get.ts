import { createError } from "h3";
import { fetchUsersListFromSource } from "../../../utils/users/api";

export default defineEventHandler(async (event) => {
  try {
    return await fetchUsersListFromSource(event);
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("Failed to proxy users list", error);

    throw createError({
      statusCode: 502,
      statusMessage: "Unable to load users",
      data: {
        message: error instanceof Error ? error.message : "Unable to retrieve users.",
      },
    });
  }
});
