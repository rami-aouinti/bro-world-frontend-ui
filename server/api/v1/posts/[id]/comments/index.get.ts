import { createError } from "h3";
import {
  cachePostComments,
  getCachedPostComments,
  getPostCommentsCacheKey,
  queueRevalidation,
} from "../../../../../utils/cache/posts";
import { fetchPostCommentsFromSource } from "../../../../../utils/posts/api";

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
    const cacheKey = getPostCommentsCacheKey(event, trimmedId);
    const cached = await getCachedPostComments(event, trimmedId);

    if (cached) {
      event.waitUntil(
        queueRevalidation(cacheKey, async () => {
          try {
            const fresh = await fetchPostCommentsFromSource(event, trimmedId);
            await cachePostComments(event, trimmedId, fresh);
          } catch (revalidationError) {
            console.error(
              `Failed to revalidate comments cache for post ${trimmedId}`,
              revalidationError,
            );
          }
        }),
      );

      return cached.data;
    }

    const comments = await fetchPostCommentsFromSource(event, trimmedId);

    try {
      await cachePostComments(event, trimmedId, comments);
    } catch (cacheError) {
      console.error(`Failed to cache comments for post ${trimmedId}`, cacheError);
    }

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
