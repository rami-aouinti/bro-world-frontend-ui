import { createError } from "h3";
import type { H3Event } from "h3";
import { withQuery } from "ufo";
import type {
  CommentPayload,
  CreatePostPayload,
  NormalizedPostsListQuery,
  ReactionPayload,
  UpdatePostPayload,
} from "~/server/utils/posts/types";
import type { BlogApiResponse, BlogPost } from "~/lib/mock/blog";

function sanitizeBaseEndpoint(rawEndpoint: string): string {
  return rawEndpoint.replace(/\/$/, "");
}

function joinEndpoint(base: string, ...segments: (string | number)[]): string {
  const cleanedSegments = segments
    .map((segment) => String(segment).trim())
    .map((segment) => segment.replace(/^\/+|\/+$/g, ""))
    .filter((segment) => segment.length > 0);

  if (cleanedSegments.length === 0) {
    return sanitizeBaseEndpoint(base);
  }

  return [sanitizeBaseEndpoint(base), ...cleanedSegments].join("/");
}

function resolveBaseEndpoint(event: H3Event): string {
  const config = useRuntimeConfig(event);
  return config.public.blogApiEndpoint || "http://localhost/public/post";
}

function buildListQuery(params: NormalizedPostsListQuery) {
  const query: Record<string, string | number> = {
    page: params.page,
    limit: params.pageSize,
  };

  if (params.sort) {
    query.sort = params.sort;
  }

  if (Object.keys(params.filter).length > 0) {
    query.filter = JSON.stringify(params.filter);
  }

  return query;
}

export async function fetchPostsListFromSource(
  event: H3Event,
  params: NormalizedPostsListQuery,
): Promise<BlogApiResponse> {
  const base = resolveBaseEndpoint(event);
  const endpoint = withQuery(joinEndpoint(base), buildListQuery(params));

  const response = await $fetch<BlogApiResponse>(endpoint, { method: "GET" });

  if (!response || !Array.isArray(response.data)) {
    throw createError({
      statusCode: 502,
      statusMessage: "Invalid posts list response.",
    });
  }

  return response;
}

export async function fetchPostByIdFromSource(event: H3Event, postId: string): Promise<BlogPost> {
  const base = resolveBaseEndpoint(event);
  const endpoint = joinEndpoint(base, postId);

  const response = await $fetch<BlogPost>(endpoint, { method: "GET" });

  if (!response || typeof response !== "object" || !("id" in response)) {
    throw createError({
      statusCode: 502,
      statusMessage: "Invalid post response.",
    });
  }

  return response;
}

export async function createPostAtSource(
  event: H3Event,
  payload: CreatePostPayload,
): Promise<BlogPost | BlogApiResponse> {
  const base = resolveBaseEndpoint(event);
  const endpoint = joinEndpoint(base);

  return $fetch(endpoint, {
    method: "POST",
    body: payload,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function updatePostAtSource(
  event: H3Event,
  postId: string,
  payload: UpdatePostPayload,
): Promise<BlogPost | BlogApiResponse> {
  const base = resolveBaseEndpoint(event);
  const endpoint = joinEndpoint(base, postId);

  return $fetch(endpoint, {
    method: "PATCH",
    body: payload,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function deletePostAtSource(event: H3Event, postId: string): Promise<unknown> {
  const base = resolveBaseEndpoint(event);
  const endpoint = joinEndpoint(base, postId);

  return $fetch(endpoint, { method: "DELETE" });
}

export async function postReactionAtSource(
  event: H3Event,
  postId: string,
  payload: ReactionPayload,
): Promise<unknown> {
  const base = resolveBaseEndpoint(event);
  const endpoint = joinEndpoint(base, postId, "reaction");

  return $fetch(endpoint, {
    method: "POST",
    body: {
      reactionType: payload.reactionType,
      type: payload.reactionType,
    },
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function addCommentAtSource(
  event: H3Event,
  postId: string,
  payload: CommentPayload,
): Promise<unknown> {
  const base = resolveBaseEndpoint(event);
  const endpoint = joinEndpoint(base, postId, "comment");

  return $fetch(endpoint, {
    method: "POST",
    body: {
      content: payload.content,
      parentCommentId: payload.parentCommentId ?? null,
    },
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function reactToCommentAtSource(
  event: H3Event,
  postId: string,
  commentId: string,
  payload: ReactionPayload,
): Promise<unknown> {
  const base = resolveBaseEndpoint(event);
  const endpoint = joinEndpoint(base, postId, "comment", commentId, "reaction");

  return $fetch(endpoint, {
    method: "POST",
    body: {
      reactionType: payload.reactionType,
      type: payload.reactionType,
    },
    headers: {
      "Content-Type": "application/json",
    },
  });
}
