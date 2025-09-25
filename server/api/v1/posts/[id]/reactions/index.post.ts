import { createError, readBody } from "h3";
import { invalidatePostAndLists } from "~/server/utils/cache/posts";
import { postReactionAtSource } from "~/server/utils/posts/api";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params ?? {};
  const trimmedId = typeof id === "string" ? id.trim() : "";

  if (!trimmedId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Post identifier is required.",
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

  try {
    await postReactionAtSource(event, trimmedId, { reactionType });
    await invalidatePostAndLists(event, trimmedId);

    return { success: true };
  } catch (error) {
    console.error(`Failed to react to post ${trimmedId}`, error);

    throw createError({
      statusCode: 502,
      statusMessage: "Unable to record the reaction.",
      data: {
        message: error instanceof Error ? error.message : String(error ?? ""),
      },
    });
  }
});
