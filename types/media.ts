export type FileKind = "image" | "video" | "doc" | "audio" | "other";

export interface Folder {
  id: string;
  ownerId: string;
  name: string;
  parentId?: string | null;
  path: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface MediaThumbnailSizes {
  small?: string;
  medium?: string;
  large?: string;
  video?: string;
}

export interface MediaFile {
  id: string;
  ownerId: string;
  folderId?: string | null;
  name: string;
  ext: string;
  mime: string;
  size: number;
  kind: FileKind;
  width?: number;
  height?: number;
  durationSec?: number;
  storagePath: string;
  thumbnails?: MediaThumbnailSizes;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface TrashItem<T = Folder | MediaFile> {
  id: string;
  type: "folder" | "file";
  item: T;
  deletedAt: string;
}

export type MediaViewMode = "grid" | "list";

export type MediaSortField = "name" | "updatedAt" | "size";

export type MediaSortDirection = "asc" | "desc";

export interface MediaSortOption {
  field: MediaSortField;
  direction: MediaSortDirection;
}

export interface MediaListResponse {
  items: MediaFile[];
  nextCursor?: string | null;
}

export interface TrashListResponse {
  items: TrashItem[];
  nextCursor?: string | null;
}
