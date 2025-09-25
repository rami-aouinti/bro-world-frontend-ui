import { createError } from "h3";
import { invalidatePostAndLists } from "~/server/utils/cache/posts";
import { deletePostAtSource } from "~/server/utils/posts/api";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params ?? {};
  const trimmedId = typeof id === "string" ? id.trim() : "";

  if (!trimmedId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Post identifier is required.",
    });
  }

  try {
    await deletePostAtSource(event, trimmedId);
    await invalidatePostAndLists(event, trimmedId);

    return { success: true };
  } catch (error) {
    console.error(`Failed to delete post ${trimmedId}`, error);

    throw createError({
      statusCode: 502,
      statusMessage: "Unable to delete the post.",
      data: {
        message: error instanceof Error ? error.message : String(error ?? ""),
      },
    });
  }
});
