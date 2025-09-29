import { createError, readBody } from "h3";
import { invalidatePostAndLists } from "../../../../../utils/cache/posts";
import { addCommentAtSource } from "../../../../../utils/posts/api";

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
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const parentCommentId = typeof body?.parentCommentId === "string" ? body.parentCommentId.trim() : "";

  if (!content) {
    throw createError({
      statusCode: 400,
      statusMessage: "Comment content is required.",
    });
  }

  try {
    await addCommentAtSource(event, trimmedId, {
      content,
      parentCommentId: parentCommentId || null,
    });

    await invalidatePostAndLists(event, trimmedId);

    return { success: true };
  } catch (error) {
    console.error(`Failed to add comment to post ${trimmedId}`, error);

    throw createError({
      statusCode: 502,
      statusMessage: "Unable to add the comment.",
      data: {
        message: error instanceof Error ? error.message : String(error ?? ""),
      },
    });
  }
});
