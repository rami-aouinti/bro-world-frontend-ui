import type { BlogApiResponse, BlogPost } from "~/lib/mock/blog";

export interface NormalizedPostsListQuery {
  page: number;
  pageSize: number;
  sort: string;
  filter: Record<string, unknown>;
}

export interface PostsListEnvelope extends BlogApiResponse {
  cachedAt: number | null;
  revalidatedAt: number | null;
  fromCache: boolean;
}

export interface PostItemEnvelope {
  data: BlogPost;
  cachedAt: number | null;
  fromCache: boolean;
}

export interface CreatePostPayload {
  content: string;
  title?: string;
  summary?: string;
}

export type UpdatePostPayload = Partial<CreatePostPayload>;

export interface CommentPayload {
  content: string;
  parentCommentId?: string | null;
}

export interface ReactionPayload {
  reactionType: string;
}
