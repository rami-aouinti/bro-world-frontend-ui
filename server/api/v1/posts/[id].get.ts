import { createError } from "h3";
import type { PostItemEnvelope } from "../../../utils/posts/types";
import {
  cachePostById,
  getCachedPostById,
  getPostItemCacheKey,
  queueRevalidation,
} from "../../../utils/cache/posts";
import { fetchPostByIdFromSource } from "../../../utils/posts/api";
import { SESSION_COOKIE_SYNC_SKIP_FLAG } from "../../../utils/auth/session";

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
    const cached = await getCachedPostById(event, trimmedId);

    if (cached) {
      const cachedEnvelope: PostItemEnvelope = {
        data: cached.data,
        cachedAt: cached.cachedAt,
        fromCache: true,
      };

      event.waitUntil(
        queueRevalidation(getPostItemCacheKey(event, trimmedId), async () => {
          const context = event.context as { [SESSION_COOKIE_SYNC_SKIP_FLAG]?: boolean };
          context[SESSION_COOKIE_SYNC_SKIP_FLAG] = true;

          try {
            const fresh = await fetchPostByIdFromSource(event, trimmedId);
            await cachePostById(event, fresh);
          } finally {
            delete context[SESSION_COOKIE_SYNC_SKIP_FLAG];
          }
        }),
      );

      return cachedEnvelope;
    }

    const fresh = await fetchPostByIdFromSource(event, trimmedId);
    await cachePostById(event, fresh);

    const now = Date.now();

    const envelope: PostItemEnvelope = {
      data: fresh,
      cachedAt: now,
      fromCache: false,
    };

    return envelope;
  } catch (error) {
    console.error(`Failed to retrieve post ${trimmedId}`, error);

    throw createError({
      statusCode: 502,
      statusMessage: "Unable to retrieve the post.",
      data: {
        message: error instanceof Error ? error.message : String(error ?? ""),
      },
    });
  }
});
