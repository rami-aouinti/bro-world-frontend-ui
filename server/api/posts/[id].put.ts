import { createError, readBody } from "h3";

interface UpdatePayload {
  title?: string;
  summary?: string;
  content?: string;
}

export default defineEventHandler(async (event) => {
  const { id } = event.context.params ?? {};

  if (!id || typeof id !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "Post identifier is required.",
    });
  }

  const body = await readBody<UpdatePayload>(event);

  if (!body || Object.values(body).every((value) => typeof value !== "string" || !value.trim())) {
    throw createError({
      statusCode: 400,
      statusMessage: "At least one field is required to update the post.",
    });
  }

  await new Promise((resolve) => {
    setTimeout(resolve, 80);
  });

  return {
    success: true,
  };
});
