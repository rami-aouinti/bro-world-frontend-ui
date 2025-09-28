import { createError } from "h3";
import { fetchPostCommentsFromSource } from "~/server/utils/posts/api";

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
    const comments = await fetchPostCommentsFromSource(event, trimmedId);

    return comments;
  } catch (error) {
    console.error(`Failed to fetch comments for post ${trimmedId}`, error);

    throw createError({
      statusCode: 502,
      statusMessage: "Unable to load comments.",
      data: {
        message: error instanceof Error ? error.message : String(error ?? ""),
      },
    });
  }
});
