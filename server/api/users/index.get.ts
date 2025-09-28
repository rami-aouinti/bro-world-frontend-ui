import { createError } from "h3";
import { listUsers } from "~/server/utils/users/storage";

export default defineEventHandler(async () => {
  try {
    const users = await listUsers();

    return {
      data: users,
      count: users.length,
    };
  } catch (error) {
    console.error("Failed to list users", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Unable to list users",
      data: {
        message: error instanceof Error ? error.message : "Unable to retrieve users.",
      },
    });
  }
});
