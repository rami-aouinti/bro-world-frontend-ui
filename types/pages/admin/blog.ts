import type { BlogPost } from "~/lib/mock/blog";

export type AdminPostRaw = BlogPost & { __optimistic?: boolean };

export interface AdminPostRow {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  publishedLabel: string;
  publishedTimestamp: number;
  reactions: number;
  comments: number;
  isOptimistic: boolean;
  publicUrl: string | null;
  raw: AdminPostRaw;
}
