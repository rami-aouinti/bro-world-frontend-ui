import { createError } from "h3";
import type { H3Event } from "h3";
import type { FetchError } from "ofetch";
import { withQuery } from "ufo";
import type {
  CommentPayload,
  CreatePostPayload,
  NormalizedPostsListQuery,
  ReactionPayload,
  UpdatePostPayload,
} from "./types";
import {
  type BlogApiResponse,
  type BlogCommentWithReplies,
  type BlogPost,
  blogSampleResponse,
} from "../../../lib/mock/blog";
import { clearAuthSession, getSessionToken, withAuthHeaders } from "../auth/session";

type PostsVisibility = "public" | "private";

interface PostsListSourceResult {
  payload: BlogApiResponse;
  visibility: PostsVisibility;
}

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

function resolvePostEndpoint(event: H3Event, visibility: PostsVisibility): string {
  const config = useRuntimeConfig(event);
  const publicEndpoint = config.public.blogApiEndpoint || "https://blog.bro-world.org/public/post";
  const privateEndpoint =
    config.public.blogPrivateApiEndpoint || "https://blog.bro-world.org/v1/platform/post";

  return visibility === "private" ? privateEndpoint : publicEndpoint;
}

function deriveCommentEndpoint(baseEndpoint: string | undefined): string | undefined {
  if (!baseEndpoint) {
    return undefined;
  }

  if (/\/comment\/?$/.test(baseEndpoint)) {
    return baseEndpoint;
  }

  if (/\/post\/?$/.test(baseEndpoint)) {
    return baseEndpoint.replace(/post\/?$/, "comment");
  }

  return `${baseEndpoint.replace(/\/$/, "")}/comment`;
}

function resolveCommentEndpoint(event: H3Event, visibility: PostsVisibility): string {
  const config = useRuntimeConfig(event);
  const publicEndpoint =
    config.public.blogCommentApiEndpoint ||
    deriveCommentEndpoint(config.public.blogApiEndpoint) ||
    "https://blog.bro-world.org/public/comment";
  const privateEndpoint =
    config.public.blogPrivateCommentApiEndpoint ||
    deriveCommentEndpoint(config.public.blogPrivateApiEndpoint) ||
    "https://blog.bro-world.org/v1/platform/comment";

  return visibility === "private" ? privateEndpoint : publicEndpoint;
}

function resolveBaseEndpoint(event: H3Event): string {
  const token = getSessionToken(event);
  return resolvePostEndpoint(event, token ? "private" : "public");
}

function requireAuthToken(event: H3Event): string {
  const token = getSessionToken(event);

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required.",
    });
  }

  return token;
}

function buildHeaders(event: H3Event, includeAuth: boolean) {
  const baseHeaders: Record<string, string> = {
    Accept: "application/json",
  };

  return includeAuth ? withAuthHeaders(event, baseHeaders) : baseHeaders;
}

function isFetchError(error: unknown): error is FetchError<unknown> {
  return (
    Boolean(error) && typeof error === "object" && "response" in (error as Record<string, unknown>)
  );
}

function isAuthorizationError(error: unknown): boolean {
  if (!isFetchError(error)) {
    return false;
  }

  const status = error.response?.status ?? 0;
  return status === 401 || status === 403;
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
): Promise<PostsListSourceResult> {
  const token = getSessionToken(event);
  const publicEndpoint = withQuery(
    joinEndpoint(resolvePostEndpoint(event, "public")),
    buildListQuery(params),
  );

  if (token) {
    const privateEndpoint = withQuery(
      joinEndpoint(resolvePostEndpoint(event, "private")),
      buildListQuery(params),
    );

    try {
      const response = await $fetch<BlogApiResponse>(privateEndpoint, {
        method: "GET",
        headers: buildHeaders(event, true),
      });

      if (!response || !Array.isArray(response.data)) {
        throw createError({
          statusCode: 502,
          statusMessage: "Invalid posts list response.",
        });
      }

      return { payload: response, visibility: "private" };
    } catch (error) {
      if (!isAuthorizationError(error)) {
        throw error;
      }

      clearAuthSession(event);
    }
  }

  try {
    const fallbackResponse = await $fetch<BlogApiResponse>(publicEndpoint, {
      method: "GET",
      headers: buildHeaders(event, false),
    });

    if (!fallbackResponse || !Array.isArray(fallbackResponse.data)) {
      throw createError({
        statusCode: 502,
        statusMessage: "Invalid posts list response.",
      });
    }

    return { payload: fallbackResponse, visibility: "public" };
  } catch (error) {
    console.error("Falling back to mock posts list", error);
    return { payload: blogSampleResponse, visibility: "public" };
  }
}

export async function fetchPostByIdFromSource(event: H3Event, postId: string): Promise<BlogPost> {
  const base = resolveBaseEndpoint(event);
  const endpoint = joinEndpoint(base, postId);

  const token = getSessionToken(event);

  const response = await $fetch<BlogPost>(endpoint, {
    method: "GET",
    headers: buildHeaders(event, Boolean(token)),
  });

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
    headers: withAuthHeaders(event, {
      "Content-Type": "application/json",
    }),
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
    headers: withAuthHeaders(event, {
      "Content-Type": "application/json",
    }),
  });
}

export async function deletePostAtSource(event: H3Event, postId: string): Promise<unknown> {
  const base = resolveBaseEndpoint(event);
  const endpoint = joinEndpoint(base, postId);

  return $fetch(endpoint, {
    method: "DELETE",
    headers: withAuthHeaders(event),
  });
}

export async function postReactionAtSource(
  event: H3Event,
  postId: string,
  payload: ReactionPayload,
): Promise<unknown> {
  requireAuthToken(event);

  const base = resolvePostEndpoint(event, "private");
  const action = payload.reactionType?.toLowerCase() === "dislike" ? "dislike" : "like";
  const endpoint = joinEndpoint(base, postId, action);
  const body =
    action === "like"
      ? {
          reactionType: payload.reactionType,
          type: payload.reactionType,
        }
      : undefined;

  return $fetch(endpoint, {
    method: "POST",
    ...(body ? { body } : {}),
    headers:
      action === "like"
        ? withAuthHeaders(event, { "Content-Type": "application/json" })
        : withAuthHeaders(event),
  });
}

export async function addCommentAtSource(
  event: H3Event,
  postId: string,
  payload: CommentPayload,
): Promise<unknown> {
  requireAuthToken(event);

  const postBase = resolvePostEndpoint(event, "private");
  const commentBase = resolveCommentEndpoint(event, "private");
  const parentId =
    typeof payload.parentCommentId === "string" ? payload.parentCommentId.trim() : "";
  const endpoint = parentId
    ? joinEndpoint(commentBase, parentId, "comment")
    : joinEndpoint(postBase, postId, "comment");

  return $fetch(endpoint, {
    method: "POST",
    body: {
      content: payload.content,
    },
    headers: withAuthHeaders(event, {
      "Content-Type": "application/json",
    }),
  });
}

export async function reactToCommentAtSource(
  event: H3Event,
  _postId: string,
  commentId: string,
  payload: ReactionPayload,
): Promise<unknown> {
  requireAuthToken(event);

  const base = resolveCommentEndpoint(event, "private");
  const action = payload.reactionType?.toLowerCase() === "dislike" ? "dislike" : "like";
  const endpoint = joinEndpoint(base, commentId, action);
  const body =
    action === "like"
      ? {
          reactionType: payload.reactionType,
          type: payload.reactionType,
        }
      : undefined;

  return $fetch(endpoint, {
    method: "POST",
    ...(body ? { body } : {}),
    headers:
      action === "like"
        ? withAuthHeaders(event, { "Content-Type": "application/json" })
        : withAuthHeaders(event),
  });
}

function unwrapCommentsPayload(payload: unknown): BlogCommentWithReplies[] | null {
  if (Array.isArray(payload)) {
    return payload as BlogCommentWithReplies[];
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const container = payload as Record<string, unknown>;
  const possibleKeys = ["comments", "data", "result", "results", "items"];

  for (const key of possibleKeys) {
    if (key in container) {
      const nested = unwrapCommentsPayload(container[key]);

      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

export async function fetchPostCommentsFromSource(
  event: H3Event,
  postId: string,
): Promise<BlogCommentWithReplies[]> {
  async function requestComments(
    visibility: PostsVisibility,
    includeAuth: boolean,
  ): Promise<BlogCommentWithReplies[]> {
    const base = resolvePostEndpoint(event, visibility);
    const endpoint = joinEndpoint(base, postId, "comments");

    const response = await $fetch<unknown>(endpoint, {
      method: "GET",
      headers: buildHeaders(event, includeAuth),
    });

    const comments = unwrapCommentsPayload(response);

    if (!comments) {
      throw createError({
        statusCode: 502,
        statusMessage: "Invalid comments response.",
      });
    }

    return comments;
  }

  const token = getSessionToken(event);

  if (token) {
    try {
      return await requestComments("private", true);
    } catch (error) {
      if (!isAuthorizationError(error)) {
        throw error;
      }

      clearAuthSession(event);
    }
  }

  return await requestComments("public", false);
}
