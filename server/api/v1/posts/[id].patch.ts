import { createError, readBody } from "h3";
import type { PostItemEnvelope } from "~/server/utils/posts/types";
import {
  cachePostById,
  invalidatePostAndLists,
} from "~/server/utils/cache/posts";
import { fetchPostByIdFromSource, updatePostAtSource } from "~/server/utils/posts/api";
import type { BlogApiResponse, BlogPost } from "~/lib/mock/blog";

function normalizePostResponse(response: unknown): BlogPost | null {
  if (!response || typeof response !== "object") {
    return null;
  }

  const candidate = response as Partial<BlogPost>;

  if (typeof candidate.id === "string") {
    return candidate as BlogPost;
  }

  const listCandidate = response as Partial<BlogApiResponse>;

  if (Array.isArray(listCandidate.data)) {
    const match = listCandidate.data.find((item) => item && typeof item.id === "string");

    if (match) {
      return match as BlogPost;
    }
  }

  return null;
}

export default defineEventHandler(async (event) => {
  const { id } = event.context.params ?? {};
  const trimmedId = typeof id === "string" ? id.trim() : "";

  if (!trimmedId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Post identifier is required.",
    });
  }

  const body = await readBody<Partial<BlogPost>>(event);

  const payload: Record<string, unknown> = {};

  if (typeof body?.title === "string") {
    payload.title = body.title.trim() || undefined;
  }

  if (typeof body?.summary === "string") {
    payload.summary = body.summary.trim() || undefined;
  }

  if (typeof body?.content === "string") {
    const trimmedContent = body.content.trim();

    if (trimmedContent) {
      payload.content = trimmedContent;
    }
  }

  if (Object.keys(payload).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "At least one field is required to update a post.",
    });
  }

  try {
    const response = await updatePostAtSource(event, trimmedId, payload);

    let updatedPost = normalizePostResponse(response);

    if (!updatedPost) {
      updatedPost = await fetchPostByIdFromSource(event, trimmedId);
    }

    await cachePostById(event, updatedPost);
    await invalidatePostAndLists(event, trimmedId);

    const envelope: PostItemEnvelope = {
      data: updatedPost,
      cachedAt: Date.now(),
      fromCache: false,
    };

    return envelope;
  } catch (error) {
    console.error(`Failed to update post ${trimmedId}`, error);

    throw createError({
      statusCode: 502,
      statusMessage: "Unable to update the post.",
      data: {
        message: error instanceof Error ? error.message : String(error ?? ""),
      },
    });
  }
});
