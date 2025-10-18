import { computed } from "vue";
import { useState, useNuxtApp } from "#imports";
import { defineStore } from "~/lib/pinia-shim";
import { resolveApiFetcher } from "~/lib/api/fetcher";
import type {
  Folder,
  MediaFile,
  MediaListResponse,
  MediaSortOption,
  MediaViewMode,
  TrashItem,
  TrashListResponse,
} from "~/types/media";

interface FetchOptions {
  force?: boolean;
  cursor?: string | null;
}

interface UploadTask {
  id: string;
  file: File;
  folderId: string | null;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string | null;
}

interface MovePayload {
  folderIds?: string[];
  fileIds?: string[];
  destinationId: string | null;
}

interface DeletePayload {
  folderIds?: string[];
  fileIds?: string[];
}

interface RestorePayload {
  folderIds?: string[];
  fileIds?: string[];
}

const ROOT_KEY = "root";
const MEDIA_API_BASE = "/media/v1";

function getKey(folderId: string | null | undefined, isTrash: boolean) {
  return `${folderId ?? ROOT_KEY}:${isTrash ? "trash" : "default"}`;
}

function createUploadTask(file: File, folderId: string | null): UploadTask {
  const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    id,
    file,
    folderId,
    progress: 0,
    status: "pending",
  };
}

export const useMediaStore = defineStore("media", () => {
  const cwd = useState<string | null>("media-cwd", () => null);
  const view = useState<MediaViewMode>("media-view", () => "grid");
  const folders = useState<Record<string, Folder[]>>("media-folders", () => ({}));
  const files = useState<Record<string, MediaFile[]>>("media-files", () => ({}));
  const cursors = useState<Record<string, string | null>>("media-cursors", () => ({}));
  const fetching = useState<Record<string, boolean>>("media-fetching", () => ({}));
  const lastFetchedAt = useState<Record<string, number>>("media-fetched-at", () => ({}));
  const selection = useState<string[]>("media-selection", () => []);
  const selectedType = useState<"file" | "folder" | null>("media-selection-type", () => null);
  const trashMode = useState<boolean>("media-trash-mode", () => false);
  const sort = useState<MediaSortOption>("media-sort", () => ({ field: "updatedAt", direction: "desc" }));
  const error = useState<string | null>("media-error", () => null);
  const preview = useState<MediaFile | null>("media-preview", () => null);
  const uploadQueue = useState<UploadTask[]>("media-upload-queue", () => []);
  const trashItems = useState<Record<string, TrashItem[]>>("media-trash-items", () => ({}));

  const isLoading = computed(() => {
    const key = getKey(cwd.value, trashMode.value);
    return Boolean(fetching.value[key]);
  });

  const currentFolders = computed(() => {
    const key = getKey(cwd.value, false);
    return folders.value[key] ?? [];
  });

  const currentFiles = computed(() => {
    const key = getKey(cwd.value, trashMode.value);
    if (trashMode.value) {
      return [];
    }
    return files.value[key] ?? [];
  });

  const currentTrashItems = computed(() => {
    const key = getKey(cwd.value, true);
    return trashItems.value[key] ?? [];
  });

  function setSelection(ids: string[], type: "file" | "folder" | null) {
    selection.value = [...new Set(ids)];
    selectedType.value = selection.value.length > 0 ? type : null;
  }

  function toggleSelection(id: string, type: "file" | "folder") {
    const index = selection.value.indexOf(id);
    if (index === -1) {
      setSelection([...selection.value, id], type);
    } else {
      const next = [...selection.value];
      next.splice(index, 1);
      setSelection(next, next.length > 0 ? type : null);
    }
  }

  function clearSelection() {
    setSelection([], null);
  }

  function setCurrentFolder(id: string | null) {
    cwd.value = id;
    clearSelection();
  }

  function setViewMode(mode: MediaViewMode) {
    view.value = mode;
  }

  function setTrashMode(enabled: boolean) {
    trashMode.value = enabled;
    clearSelection();
  }

  function setPreview(file: MediaFile | null) {
    preview.value = file;
  }

  function upsertFolder(parentId: string | null, folder: Folder) {
    const key = getKey(parentId, false);
    const list = folders.value[key] ?? [];
    const index = list.findIndex((item) => item.id === folder.id);
    const next = index === -1 ? [...list, folder] : [...list.slice(0, index), folder, ...list.slice(index + 1)];
    folders.value = { ...folders.value, [key]: next };
  }

  function removeFolderFromState(folderId: string) {
    const keys = Object.keys(folders.value);
    const next: Record<string, Folder[]> = {};

    for (const key of keys) {
      next[key] = folders.value[key].filter((folder) => folder.id !== folderId);
    }

    folders.value = next;
  }

  function upsertFile(folderId: string | null, file: MediaFile) {
    const key = getKey(folderId, false);
    const list = files.value[key] ?? [];
    const index = list.findIndex((item) => item.id === file.id);
    const next = index === -1 ? [...list, file] : [...list.slice(0, index), file, ...list.slice(index + 1)];
    files.value = { ...files.value, [key]: next };
  }

  function removeFileFromState(fileId: string) {
    const next: Record<string, MediaFile[]> = {};

    for (const [key, list] of Object.entries(files.value)) {
      next[key] = list.filter((file) => file.id !== fileId);
    }

    files.value = next;
  }

  function setTrashItems(folderId: string | null, items: TrashItem[]) {
    const key = getKey(folderId, true);
    trashItems.value = { ...trashItems.value, [key]: [...items] };
  }

  function mergeTrashItems(folderId: string | null, items: TrashItem[]) {
    const key = getKey(folderId, true);
    const list = trashItems.value[key] ?? [];
    const mapped = new Map<string, TrashItem>();

    for (const item of [...list, ...items]) {
      mapped.set(`${item.type}:${item.id}`, item);
    }

    trashItems.value = { ...trashItems.value, [key]: Array.from(mapped.values()) };
  }

  async function fetchFolders(parentId: string | null, options: FetchOptions = {}) {
    const key = getKey(parentId, false);
    if (!options.force && folders.value[key] && (lastFetchedAt.value[key] ?? 0) > Date.now() - 30000) {
      return folders.value[key];
    }

    fetching.value = { ...fetching.value, [key]: true };
    error.value = null;

    try {
      const api = resolveApiFetcher();
      const response = await api<Folder[]>(`${MEDIA_API_BASE}/folders`, {
        params: parentId ? { parentId } : {},
      });

      folders.value = { ...folders.value, [key]: Array.isArray(response) ? response : [] };
      lastFetchedAt.value = { ...lastFetchedAt.value, [key]: Date.now() };
      return folders.value[key];
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err ?? "");
      error.value = message;
      throw err;
    } finally {
      fetching.value = { ...fetching.value, [key]: false };
    }
  }

  async function fetchFiles(folderId: string | null, options: FetchOptions = {}) {
    if (trashMode.value) {
      return [];
    }

    const key = getKey(folderId, false);

    if (!options.force && files.value[key] && !options.cursor) {
      return files.value[key];
    }

    fetching.value = { ...fetching.value, [key]: true };
    error.value = null;

    try {
      const api = resolveApiFetcher();
      const params: Record<string, unknown> = {};

      if (folderId) {
        params.folderId = folderId;
      }

      if (options.cursor) {
        params.cursor = options.cursor;
      }

      const response = await api<MediaListResponse>(`${MEDIA_API_BASE}/files`, { params });
      const items = Array.isArray(response?.items) ? response.items : [];

      files.value = {
        ...files.value,
        [key]: options.cursor ? [...(files.value[key] ?? []), ...items] : items,
      };
      cursors.value = { ...cursors.value, [key]: response?.nextCursor ?? null };
      lastFetchedAt.value = { ...lastFetchedAt.value, [key]: Date.now() };

      return files.value[key];
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err ?? "");
      error.value = message;
      throw err;
    } finally {
      fetching.value = { ...fetching.value, [key]: false };
    }
  }

  async function fetchTrash(folderId: string | null, options: FetchOptions = {}) {
    const key = getKey(folderId, true);

    if (!options.force && trashItems.value[key] && !options.cursor) {
      return trashItems.value[key];
    }

    fetching.value = { ...fetching.value, [key]: true };
    error.value = null;

    try {
      const api = resolveApiFetcher();
      const params: Record<string, unknown> = {};

      if (folderId) {
        params.folderId = folderId;
      }

      if (options.cursor) {
        params.cursor = options.cursor;
      }

      const response = await api<TrashListResponse>(`${MEDIA_API_BASE}/trash`, { params });
      const items = Array.isArray(response?.items) ? response.items : [];

      if (options.cursor) {
        mergeTrashItems(folderId, items);
      } else {
        setTrashItems(folderId, items);
      }

      cursors.value = { ...cursors.value, [key]: response?.nextCursor ?? null };
      lastFetchedAt.value = { ...lastFetchedAt.value, [key]: Date.now() };

      return trashItems.value[key];
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err ?? "");
      error.value = message;
      throw err;
    } finally {
      fetching.value = { ...fetching.value, [key]: false };
    }
  }

  async function loadCurrent(options: FetchOptions = {}) {
    const folderId = cwd.value;

    if (trashMode.value) {
      await fetchTrash(folderId, options);
    } else {
      await Promise.all([fetchFolders(folderId, options), fetchFiles(folderId, options)]);
    }
  }

  async function createFolder(payload: { name: string; parentId?: string | null }) {
    const api = resolveApiFetcher();
    const body = { name: payload.name, parentId: payload.parentId ?? cwd.value };
    const response = await api<Folder>(`${MEDIA_API_BASE}/folders`, {
      method: "POST",
      body,
    });

    if (response) {
      upsertFolder(response.parentId ?? null, response);
    }

    return response;
  }

  async function renameFolder(id: string, name: string) {
    const api = resolveApiFetcher();
    const response = await api<Folder>(`${MEDIA_API_BASE}/folders/${id}`, {
      method: "PATCH",
      body: { name },
    });

    if (response) {
      upsertFolder(response.parentId ?? null, response);
    }

    return response;
  }

  async function moveEntities(payload: MovePayload) {
    const api = resolveApiFetcher();
    const destinationId = payload.destinationId ?? null;
    const requests: Promise<unknown>[] = [];

    for (const folderId of payload.folderIds ?? []) {
      requests.push(
        api(`${MEDIA_API_BASE}/folders/${folderId}`, {
          method: "PATCH",
          body: { parentId: destinationId },
        }),
      );
    }

    for (const fileId of payload.fileIds ?? []) {
      requests.push(
        api(`${MEDIA_API_BASE}/files/${fileId}`, {
          method: "PATCH",
          body: { folderId: destinationId },
        }),
      );
    }

    await Promise.all(requests);
    await loadCurrent({ force: true });
  }

  async function renameFile(id: string, name: string) {
    const api = resolveApiFetcher();
    const response = await api<MediaFile>(`${MEDIA_API_BASE}/files/${id}`, {
      method: "PATCH",
      body: { name },
    });

    if (response) {
      upsertFile(response.folderId ?? null, response);
    }

    return response;
  }

  async function softDeleteEntities(payload: DeletePayload) {
    const api = resolveApiFetcher();
    const requests: Promise<unknown>[] = [];

    for (const folderId of payload.folderIds ?? []) {
      requests.push(
        api(`${MEDIA_API_BASE}/folders/${folderId}`, {
          method: "DELETE",
        }),
      );
    }

    for (const fileId of payload.fileIds ?? []) {
      requests.push(
        api(`${MEDIA_API_BASE}/files/${fileId}`, {
          method: "DELETE",
        }),
      );
    }

    await Promise.all(requests);

    for (const folderId of payload.folderIds ?? []) {
      removeFolderFromState(folderId);
    }

    for (const fileId of payload.fileIds ?? []) {
      removeFileFromState(fileId);
    }

    clearSelection();
  }

  async function restoreEntities(payload: RestorePayload) {
    const api = resolveApiFetcher();
    const requests: Promise<unknown>[] = [];

    for (const folderId of payload.folderIds ?? []) {
      requests.push(
        api(`${MEDIA_API_BASE}/folders/${folderId}/restore`, {
          method: "POST",
        }),
      );
    }

    for (const fileId of payload.fileIds ?? []) {
      requests.push(
        api(`${MEDIA_API_BASE}/files/${fileId}/restore`, {
          method: "POST",
        }),
      );
    }

    await Promise.all(requests);
    await loadCurrent({ force: true });
  }

  async function purgeEntities(payload: DeletePayload) {
    const api = resolveApiFetcher();
    const requests: Promise<unknown>[] = [];

    for (const folderId of payload.folderIds ?? []) {
      requests.push(
        api(`${MEDIA_API_BASE}/trash/folders/${folderId}`, {
          method: "DELETE",
        }),
      );
    }

    for (const fileId of payload.fileIds ?? []) {
      requests.push(
        api(`${MEDIA_API_BASE}/trash/files/${fileId}`, {
          method: "DELETE",
        }),
      );
    }

    await Promise.all(requests);
    await loadCurrent({ force: true });
  }

  async function uploadFiles(filesInput: File[] | FileList, folderId: string | null = cwd.value) {
    const list: File[] = Array.from(filesInput as File[]);

    if (list.length === 0) {
      return [];
    }

    const tasks = list.map((file) => createUploadTask(file, folderId));
    uploadQueue.value = [...uploadQueue.value, ...tasks];

    const api = resolveApiFetcher();
    const nuxtApp = useNuxtApp();
    const completed: MediaFile[] = [];

    await Promise.all(
      tasks.map(async (task) => {
        task.status = "uploading";

        const formData = new FormData();
        formData.append("file", task.file);

        if (task.folderId) {
          formData.append("folderId", task.folderId);
        }

        try {
          const response = await api<MediaFile>(`${MEDIA_API_BASE}/files`, {
            method: "POST",
            body: formData,
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress(event) {
              if (event.total) {
                task.progress = Math.round((event.loaded / event.total) * 100);
              }
            },
          });

          if (response) {
            completed.push(response);
            task.status = "success";
            task.progress = 100;
            upsertFile(response.folderId ?? null, response);
          }
        } catch (err) {
          task.status = "error";
          task.error = err instanceof Error ? err.message : String(err ?? "");
          nuxtApp?.$emit?.("media:upload-error", { task, error: task.error });
        }
      }),
    );

    uploadQueue.value = uploadQueue.value.filter((task) => task.status === "uploading");

    return completed;
  }

  async function fetchMore() {
    const key = getKey(cwd.value, trashMode.value);
    const cursor = cursors.value[key];

    if (!cursor) {
      return;
    }

    await (trashMode.value
      ? fetchTrash(cwd.value, { cursor })
      : fetchFiles(cwd.value, { cursor }));
  }

  return {
    cwd,
    view,
    folders,
    files,
    selection,
    trashMode,
    sort,
    isLoading,
    error,
    preview,
    uploadQueue,
    currentFolders,
    currentFiles,
    currentTrashItems,
    cursors,
    loadCurrent,
    fetchFolders,
    fetchFiles,
    fetchTrash,
    fetchMore,
    setCurrentFolder,
    setViewMode,
    setTrashMode,
    setSelection,
    toggleSelection,
    clearSelection,
    setPreview,
    createFolder,
    renameFolder,
    renameFile,
    moveEntities,
    softDeleteEntities,
    restoreEntities,
    purgeEntities,
    uploadFiles,
  };
});

export type { UploadTask };
