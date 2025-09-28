import { createError } from "h3";
import { removeUser } from "~/server/utils/users/storage";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing user identifier",
    });
  }

  try {
    await removeUser(id);

    return { success: true };
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("Failed to delete user", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Unable to delete user",
      data: {
        message: error instanceof Error ? error.message : "Unable to delete the user.",
      },
    });
  }
});
