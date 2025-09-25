import { createError, readBody } from "h3";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const endpoint = config.public.blogApiEndpoint || "http://localhost/public/post";

  const body = await readBody<Record<string, unknown>>(event);
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (!content) {
    throw createError({
      statusCode: 400,
      statusMessage: "Post content is required.",
    });
  }

  try {
    const response = await $fetch(endpoint, {
      method: "POST",
      body: {
        ...body,
        content,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("Erreur lors de la création de la publication", error);

    throw createError({
      statusCode: 502,
      statusMessage: "Impossible de créer la publication.",
      data: {
        message: error instanceof Error ? error.message : String(error ?? ""),
      },
    });
  }
});
