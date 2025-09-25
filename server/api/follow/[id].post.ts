import { createError } from "h3";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params ?? {};

  if (!id || typeof id !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "Author identifier is required.",
    });
  }

  await new Promise((resolve) => {
    setTimeout(resolve, 50);
  });

  return {
    success: true,
  };
});
