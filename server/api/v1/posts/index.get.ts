import { createError, getQuery } from "h3";
import type { PostsListEnvelope } from "../../../utils/posts/types";
import {
  cachePostById,
  cachePostsList,
  getCachedPostsList,
  getPostsListCacheKey,
  normalizeListQuery,
  queueRevalidation,
} from "../../../utils/cache/posts";
import { fetchPostsListFromSource } from "../../../utils/posts/api";
import { getSessionToken } from "../../../utils/auth/session";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const normalizedQuery = normalizeListQuery(query);
  const hasToken = Boolean(getSessionToken(event));
  const visibility = hasToken ? "private" : "public";
  const cacheKey = getPostsListCacheKey(event, normalizedQuery, visibility);

  try {
    const cached = await getCachedPostsList(event, normalizedQuery, visibility);

    if (cached) {
      const cachedResponse: PostsListEnvelope = {
        ...cached.data,
        cachedAt: cached.cachedAt,
        revalidatedAt: null,
        fromCache: true,
      };

      event.waitUntil(
        queueRevalidation(cacheKey, async () => {
          const fresh = await fetchPostsListFromSource(event, normalizedQuery);
          await cachePostsList(event, normalizedQuery, fresh.payload, fresh.visibility);

          await Promise.all(
            (fresh.payload.data ?? []).map(async (post) => {
              if (post?.id) {
                await cachePostById(event, post);
              }
            }),
          );
        }),
      );

      return cachedResponse;
    }

    const fresh = await fetchPostsListFromSource(event, normalizedQuery);
    await cachePostsList(event, normalizedQuery, fresh.payload, fresh.visibility);

    await Promise.all(
      (fresh.payload.data ?? []).map(async (post) => {
        if (post?.id) {
          await cachePostById(event, post);
        }
      }),
    );

    const now = Date.now();

    const response: PostsListEnvelope = {
      ...fresh.payload,
      cachedAt: now,
      revalidatedAt: now,
      fromCache: false,
    };

    return response;
  } catch (error) {
    console.error("Failed to resolve posts list", error);

    throw createError({
      statusCode: 502,
      statusMessage: "Unable to retrieve posts.",
      data: {
        message: error instanceof Error ? error.message : String(error ?? ""),
      },
    });
  }
});
