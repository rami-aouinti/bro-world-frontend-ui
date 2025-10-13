import { createError, readBody } from "h3";
import type { AuthUser } from "~/types/auth";
import { createUserThroughApi } from "../../../utils/users/api";

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<AuthUser>>(event);

  try {
    const user = await createUserThroughApi(event, body ?? {});

    return {
      data: user,
    };
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("Failed to proxy user creation", error);

    throw createError({
      statusCode: 502,
      statusMessage: "Unable to create user",
      data: {
        message: error instanceof Error ? error.message : "Unable to create the user.",
      },
    });
  }
});
