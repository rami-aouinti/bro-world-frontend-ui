import { createError } from "h3";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params ?? {};

  if (!id || typeof id !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "Post identifier is required.",
    });
  }

  await new Promise((resolve) => {
    setTimeout(resolve, 80);
  });

  return {
    success: true,
  };
});
