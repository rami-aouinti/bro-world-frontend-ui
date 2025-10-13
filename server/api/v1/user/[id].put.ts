import { createError, readBody } from "h3";
import type { AuthUser } from "~/types/auth";
import { updateUserThroughApi } from "../../../utils/users/api";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing user identifier",
      data: { message: "A user identifier is required." },
    });
  }

  const body = await readBody<Partial<AuthUser>>(event);

  try {
    const user = await updateUserThroughApi(event, id, body ?? {});

    return {
      data: user,
    };
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("Failed to proxy user update", error);

    throw createError({
      statusCode: 502,
      statusMessage: "Unable to update user",
      data: {
        message: error instanceof Error ? error.message : "Unable to update the user.",
      },
    });
  }
});
