import { createError, readBody } from "h3";

function buildEndpoint(base: string, path: string) {
  const sanitizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${sanitizedBase}${path}`;
}

export default defineEventHandler(async (event) => {
  const { id, commentId } = event.context.params ?? {};

  if (!id || typeof id !== "string" || !commentId || typeof commentId !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "Post and comment identifiers are required.",
    });
  }

  const body = await readBody<Record<string, unknown>>(event);
  const reactionType = typeof body?.reactionType === "string" ? body.reactionType.trim() : "";

  if (!reactionType) {
    throw createError({
      statusCode: 400,
      statusMessage: "Reaction type is required.",
    });
  }

  const config = useRuntimeConfig(event);
  const baseEndpoint = config.public.blogApiEndpoint || "http://localhost/public/post";
  const endpoint = buildEndpoint(baseEndpoint, `/${id}/comment/${commentId}/reaction`);

  try {
    const response = await $fetch(endpoint, {
      method: "POST",
      body: {
        reactionType,
        type: reactionType,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("Erreur lors de la réaction au commentaire", error);

    throw createError({
      statusCode: 502,
      statusMessage: "Impossible d'enregistrer la réaction du commentaire.",
      data: {
        message: error instanceof Error ? error.message : String(error ?? ""),
      },
    });
  }
});
