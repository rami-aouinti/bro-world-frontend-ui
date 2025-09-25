import { createError, readBody } from "h3";

function buildEndpoint(base: string, path: string) {
  const sanitizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${sanitizedBase}${path}`;
}

export default defineEventHandler(async (event) => {
  const { id } = event.context.params ?? {};

  if (!id || typeof id !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "Post identifier is required.",
    });
  }

  const body = await readBody<Record<string, unknown>>(event);
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const parentCommentId = typeof body?.parentCommentId === "string" ? body.parentCommentId.trim() : "";

  if (!content) {
    throw createError({
      statusCode: 400,
      statusMessage: "Comment content is required.",
    });
  }

  const config = useRuntimeConfig(event);
  const baseEndpoint = config.public.blogApiEndpoint || "http://localhost/public/post";
  const endpoint = buildEndpoint(baseEndpoint, `/${id}/comment`);

  try {
    const response = await $fetch(endpoint, {
      method: "POST",
      body: {
        content,
        parentCommentId: parentCommentId || null,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un commentaire", error);

    throw createError({
      statusCode: 502,
      statusMessage: "Impossible d'ajouter le commentaire.",
      data: {
        message: error instanceof Error ? error.message : String(error ?? ""),
      },
    });
  }
});
