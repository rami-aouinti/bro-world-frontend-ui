import { createError } from "h3";
import { fetchUserFromSource } from "../../../utils/users/api";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing user identifier",
      data: { message: "A user identifier is required." },
    });
  }

  try {
    const user = await fetchUserFromSource(event, id);

    return {
      data: user,
    };
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("Failed to proxy user lookup", error);

    throw createError({
      statusCode: 502,
      statusMessage: "Unable to load user",
      data: {
        message: error instanceof Error ? error.message : "Unable to load the user.",
      },
    });
  }
});
