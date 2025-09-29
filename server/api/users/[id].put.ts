import { createError, readBody } from "h3";
import type { AuthUser } from "../../../types/auth";
import { updateUser } from "../../utils/users/storage";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing user identifier",
    });
  }

  const body = await readBody<Partial<AuthUser>>(event);

  try {
    const user = await updateUser(id, body ?? {});

    return {
      data: user,
    };
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("Failed to update user", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Unable to update user",
      data: {
        message: error instanceof Error ? error.message : "Unable to update the user.",
      },
    });
  }
});
