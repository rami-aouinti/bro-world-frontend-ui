import { createError, readBody } from "h3";
import type { AuthUser } from "~/types/auth";
import { createUser } from "~/server/utils/users/storage";

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<AuthUser>>(event);

  try {
    const user = await createUser(body ?? {});

    return {
      data: user,
    };
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("Failed to create user", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Unable to create user",
      data: {
        message: error instanceof Error ? error.message : "Unable to create the user.",
      },
    });
  }
});
