import { createError, readBody } from "h3";
import { invalidatePostAndLists } from "~/server/utils/cache/posts";
import { reactToCommentAtSource } from "~/server/utils/posts/api";

export default defineEventHandler(async (event) => {
  const { id, commentId } = event.context.params ?? {};
  const trimmedPostId = typeof id === "string" ? id.trim() : "";
  const trimmedCommentId = typeof commentId === "string" ? commentId.trim() : "";

  if (!trimmedPostId || !trimmedCommentId) {
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

  try {
    await reactToCommentAtSource(event, trimmedPostId, trimmedCommentId, { reactionType });
    await invalidatePostAndLists(event, trimmedPostId);

    return { success: true };
  } catch (error) {
    console.error(
      `Failed to react to comment ${trimmedCommentId} on post ${trimmedPostId}`,
      error,
    );

    throw createError({
      statusCode: 502,
      statusMessage: "Unable to record the reaction.",
      data: {
        message: error instanceof Error ? error.message : String(error ?? ""),
      },
    });
  }
});
