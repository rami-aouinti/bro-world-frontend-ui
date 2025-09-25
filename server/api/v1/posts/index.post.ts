import { createError, readBody } from "h3";
import type { PostItemEnvelope } from "~/server/utils/posts/types";
import { cachePostById, invalidatePostsList } from "~/server/utils/cache/posts";
import { createPostAtSource } from "~/server/utils/posts/api";
import type { BlogApiResponse, BlogPost } from "~/lib/mock/blog";

function normalizeCreatedPost(response: unknown): BlogPost | null {
  if (!response || typeof response !== "object") {
    return null;
  }

  const candidate = response as Partial<BlogPost>;

  if (typeof candidate.id === "string") {
    return candidate as BlogPost;
  }

  const listCandidate = response as Partial<BlogApiResponse>;

  if (Array.isArray(listCandidate.data) && listCandidate.data.length > 0) {
    const [first] = listCandidate.data;

    if (first && typeof first.id === "string") {
      return first as BlogPost;
    }
  }

  return null;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<BlogPost>>(event);
  const trimmedContent = typeof body?.content === "string" ? body.content.trim() : "";

  if (!trimmedContent) {
    throw createError({
      statusCode: 400,
      statusMessage: "Post content is required.",
    });
  }

  try {
    const response = await createPostAtSource(event, {
      title: typeof body?.title === "string" ? body.title.trim() || undefined : undefined,
      summary: typeof body?.summary === "string" ? body.summary.trim() || undefined : undefined,
      content: trimmedContent,
    });

    const createdPost = normalizeCreatedPost(response);

    if (createdPost) {
      await cachePostById(event, createdPost);
    }

    await invalidatePostsList(event);

    if (!createdPost) {
      throw createError({
        statusCode: 502,
        statusMessage: "Invalid create post response.",
      });
    }

    const envelope: PostItemEnvelope = {
      data: createdPost,
      cachedAt: Date.now(),
      fromCache: false,
    };

    return envelope;
  } catch (error) {
    console.error("Failed to create post", error);

    throw createError({
      statusCode: 502,
      statusMessage: "Unable to create the post.",
      data: {
        message: error instanceof Error ? error.message : String(error ?? ""),
      },
    });
  }
});
