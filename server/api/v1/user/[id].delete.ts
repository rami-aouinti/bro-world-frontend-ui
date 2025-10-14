import { createError } from "h3";
import { deleteUserThroughApi } from "../../../utils/users/api";

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
    await deleteUserThroughApi(event, id);

    return { success: true };
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("Failed to proxy user removal", error);

    throw createError({
      statusCode: 502,
      statusMessage: "Unable to delete user",
      data: {
        message: error instanceof Error ? error.message : "Unable to delete the user.",
      },
    });
  }
});
