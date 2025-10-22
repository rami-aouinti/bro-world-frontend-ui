<template>
  <MediaLayout>
    <template #tree>
      <MediaTree
        :items="treeItems"
        :active-id="mediaStore.cwd"
        :loading="mediaStore.isLoading"
        @select="handleTreeSelect"
        @context="handleFolderContext($event.id, $event.event)"
      />
    </template>

    <template #toolbar>
      <MediaToolbar
        :view="mediaStore.view"
        :trash-mode="mediaStore.trashMode"
        :loading="mediaStore.isLoading"
        @create-folder="openCreateFolder"
        @upload="openUpload"
        @toggle-trash="handleToolbarToggleTrash"
        @change-view="mediaStore.setViewMode"
        @refresh="handleToolbarRefresh"
      />
    </template>

    <template #breadcrumbs>
      <MediaBreadcrumbs
        :items="breadcrumbs"
        @navigate="handleTreeSelect"
      />
    </template>

    <div
      class="media-content"
      role="region"
      :aria-busy="mediaStore.isLoading"
    >
      <template v-if="mediaStore.trashMode">
        <VTable
          density="comfortable"
          class="mb-6"
        >
          <thead>
            <tr>
              <th>{{ t("media.trash.name") }}</th>
              <th>{{ t("media.trash.type") }}</th>
              <th>{{ t("media.trash.deletedAt") }}</th>
              <th class="text-end">{{ t("media.trash.actions") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in trashItems"
              :key="`${item.type}-${item.id}`"
            >
              <td>{{ item.item.name }}</td>
              <td>{{ t(item.type === "file" ? "media.trash.file" : "media.trash.folder") }}</td>
              <td>{{ new Date(item.deletedAt).toLocaleString() }}</td>
              <td class="text-end">
                <VBtn
                  size="small"
                  variant="text"
                  @click="restoreTrashItem(item)"
                >
                  {{ t("media.actions.restore") }}
                </VBtn>
                <VBtn
                  size="small"
                  color="error"
                  variant="text"
                  @click="purgeTrashItem(item)"
                >
                  {{ t("media.actions.deleteForever") }}
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>
      </template>
      <template v-else>
        <MediaGrid
          v-if="mediaStore.view === 'grid'"
          :items="mediaStore.currentFiles"
          :selection="mediaStore.selection"
          :loading="mediaStore.isLoading"
          @select="handleFileSelect"
          @open="openPreview"
          @context="handleContext($event, 'file')"
        />
        <MediaList
          v-else
          :items="mediaStore.currentFiles"
          :selection="mediaStore.selection"
          :loading="mediaStore.isLoading"
          @select="handleFileSelect"
          @open="openPreview"
          @context="handleContext($event, 'file')"
        />
      </template>
    </div>
  </MediaLayout>

  <UploadDialog
    v-model="uploadDialogOpen"
    :tasks="uploadTasks"
    @upload="handleUpload"
  />

  <RenameDialog
    v-model="renameState.open"
    :value="renameState.value"
    :loading="renameLoading"
    :title-key="
      renameState.type === 'create-folder' ? 'media.createFolder.title' : 'media.rename.title'
    "
    @save="handleRename"
  />

  <DeleteDialog
    v-model="deleteState.open"
    :title-key="deleteState.titleKey"
    :description-key="deleteState.descriptionKey"
    @confirm="handleDelete"
  />

  <MoveDialog
    v-model="moveState.open"
    :options="moveOptions"
    :loading="moveState.loading"
    :current-folder-id="mediaStore.cwd"
    @confirm="handleMove"
  />

  <PreviewDrawer
    :model-value="previewOpen"
    :file="mediaStore.preview"
    @update:model-value="(value) => (!value ? closePreview() : null)"
    @download="downloadFile"
  />

  <ContextMenu
    v-model="contextMenuState.open"
    :x="contextMenuState.x"
    :y="contextMenuState.y"
    :items="contextMenuItems"
    @select="handleContextAction"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import MediaLayout from "~/components/media/MediaLayout.vue";
import MediaToolbar from "~/components/media/MediaToolbar.vue";
import MediaTree, { type MediaTreeItem } from "~/components/media/MediaTree.vue";
import MediaGrid from "~/components/media/MediaGrid.vue";
import MediaList from "~/components/media/MediaList.vue";
import MediaBreadcrumbs, {
  type MediaBreadcrumbItem,
} from "~/components/media/MediaBreadcrumbs.vue";
import UploadDialog from "~/components/media/UploadDialog.vue";
import RenameDialog from "~/components/media/RenameDialog.vue";
import DeleteDialog from "~/components/media/DeleteDialog.vue";
import MoveDialog, { type MoveOption } from "~/components/media/MoveDialog.vue";
import PreviewDrawer from "~/components/media/PreviewDrawer.vue";
import ContextMenu, { type ContextMenuItem } from "~/components/media/ContextMenu.vue";
import { useMediaStore } from "~/stores/useMediaStore";
import type { Folder, MediaFile, TrashItem } from "~/types/media";

const mediaStore = useMediaStore();
const { t } = useI18n();

const uploadDialogOpen = ref(false);
const renameState = reactive({
  open: false,
  id: null as string | null,
  type: "file" as "file" | "folder" | "create-folder",
  value: "",
});
const renameLoading = ref(false);
const deleteState = reactive({
  open: false,
  mode: "soft" as "soft" | "purge",
  titleKey: "media.delete.title",
  descriptionKey: "media.delete.description",
});
const moveState = reactive({
  open: false,
  loading: false,
});
const contextMenuState = reactive({
  open: false,
  x: 0,
  y: 0,
  targetId: null as string | null,
  targetType: null as "file" | "folder" | null,
});

const uploadTasks = computed(() => mediaStore.uploadQueue);

const allFolders = computed(() => {
  const map = new Map<string, Folder>();
  for (const list of Object.values(mediaStore.folders)) {
    for (const folder of list) {
      map.set(folder.id, folder);
    }
  }
  return map;
});

const breadcrumbs = computed<MediaBreadcrumbItem[]>(() => {
  const trail: MediaBreadcrumbItem[] = [];
  let currentId = mediaStore.cwd;
  const visited = new Set<string>();

  while (currentId) {
    if (visited.has(currentId)) {
      break;
    }

    const folder = allFolders.value.get(currentId);

    if (!folder) {
      break;
    }

    trail.unshift({ id: folder.id, label: folder.name });
    visited.add(currentId);
    currentId = folder.parentId ?? null;
  }

  return trail;
});

function buildTree(childrenByParent: Map<string | null, MediaTreeItem[]>, parentId: string | null) {
  const children = childrenByParent.get(parentId) ?? [];
  return children
    .map((child) => ({
      ...child,
      children: buildTree(childrenByParent, child.id),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

const treeItems = computed<MediaTreeItem[]>(() => {
  const childrenByParent = new Map<string | null, MediaTreeItem[]>();

  for (const folder of allFolders.value.values()) {
    if (!childrenByParent.has(folder.id)) {
      childrenByParent.set(folder.id, []);
    }
  }

  for (const folder of allFolders.value.values()) {
    const parentId = folder.parentId ?? null;
    if (!childrenByParent.has(parentId)) {
      childrenByParent.set(parentId, []);
    }
    childrenByParent.get(parentId)!.push({
      id: folder.id,
      name: folder.name,
    });
  }

  return buildTree(childrenByParent, null);
});

const moveOptions = computed<MoveOption[]>(() => {
  const options: MoveOption[] = [{ id: null, label: t("media.move.rootOption") }];

  for (const folder of allFolders.value.values()) {
    options.push({
      id: folder.id,
      label: folder.name,
      disabled: folder.id === contextMenuState.targetId,
    });
  }

  return options.sort((a, b) => a.label.localeCompare(b.label));
});

const contextMenuItems = computed<ContextMenuItem[]>(() => {
  if (!contextMenuState.targetType) {
    return [];
  }

  if (mediaStore.trashMode) {
    return [
      { value: "restore", labelKey: "media.actions.restore", icon: "mdi-restore" },
      {
        value: "purge",
        labelKey: "media.actions.deleteForever",
        icon: "mdi-delete-forever",
        danger: true,
      },
    ];
  }

  return [
    { value: "open", labelKey: "media.actions.open", icon: "mdi-open-in-new" },
    { value: "rename", labelKey: "media.actions.rename", icon: "mdi-pencil" },
    { value: "move", labelKey: "media.actions.move", icon: "mdi-folder-move" },
    { value: "delete", labelKey: "media.actions.delete", icon: "mdi-delete", danger: true },
  ];
});

const previewOpen = computed(() => Boolean(mediaStore.preview));
const trashItems = computed(() => mediaStore.currentTrashItems);

onMounted(() => {
  mediaStore.loadCurrent({ force: true });
  mediaStore.fetchFolders(null, { force: true });
});

watch(
  () => mediaStore.cwd,
  (folderId) => {
    mediaStore.loadCurrent({ force: true });
    if (folderId) {
      mediaStore.fetchFolders(folderId, { force: true }).catch(() => {});
    }
  },
);

function handleTreeSelect(folderId: string | null) {
  mediaStore.setCurrentFolder(folderId);
}

function openUpload() {
  uploadDialogOpen.value = true;
}

function handleUpload(files: File[]) {
  mediaStore.uploadFiles(files);
}

function openCreateFolder() {
  renameState.open = true;
  renameState.id = null;
  renameState.type = "create-folder";
  renameState.value = "";
}

function openRename(type: "file" | "folder", id: string, value: string) {
  renameState.open = true;
  renameState.id = id;
  renameState.type = type;
  renameState.value = value;
}

async function handleRename(value: string) {
  renameLoading.value = true;

  try {
    if (renameState.type === "create-folder") {
      await mediaStore.createFolder({ name: value, parentId: mediaStore.cwd });
    } else if (renameState.type === "folder" && renameState.id) {
      await mediaStore.renameFolder(renameState.id, value);
    } else if (renameState.type === "file" && renameState.id) {
      await mediaStore.renameFile(renameState.id, value);
    }
  } finally {
    renameLoading.value = false;
    renameState.open = false;
  }
}

function openDelete(mode: "soft" | "purge" = "soft") {
  deleteState.open = true;
  deleteState.mode = mode;
  deleteState.titleKey = mode === "purge" ? "media.delete.purgeTitle" : "media.delete.title";
  deleteState.descriptionKey =
    mode === "purge" ? "media.delete.purgeDescription" : "media.delete.description";
}

async function handleDelete() {
  if (deleteState.mode === "purge") {
    await mediaStore.purgeEntities({
      fileIds:
        contextMenuState.targetType === "file" && contextMenuState.targetId
          ? [contextMenuState.targetId]
          : [],
      folderIds:
        contextMenuState.targetType === "folder" && contextMenuState.targetId
          ? [contextMenuState.targetId]
          : [],
    });
  } else {
    await mediaStore.softDeleteEntities({
      fileIds:
        contextMenuState.targetType === "file" && contextMenuState.targetId
          ? [contextMenuState.targetId]
          : [],
      folderIds:
        contextMenuState.targetType === "folder" && contextMenuState.targetId
          ? [contextMenuState.targetId]
          : [],
    });
  }

  deleteState.open = false;
}

function openMove() {
  moveState.open = true;
}

async function handleMove(destination: string | null) {
  moveState.loading = true;
  await mediaStore.moveEntities({
    destinationId: destination,
    fileIds:
      contextMenuState.targetType === "file" && contextMenuState.targetId
        ? [contextMenuState.targetId]
        : [],
    folderIds:
      contextMenuState.targetType === "folder" && contextMenuState.targetId
        ? [contextMenuState.targetId]
        : [],
  });
  moveState.loading = false;
  moveState.open = false;
}

function openPreview(file: MediaFile) {
  mediaStore.setPreview(file);
}

function closePreview() {
  mediaStore.setPreview(null);
}

function downloadFile(file: MediaFile) {
  const url = `/media/v1/files/${file.id}/download`;
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener");
  }
}

function handleContext(payload: { id: string | null; event: MouseEvent }, type: "file" | "folder") {
  if (!payload.id) {
    return;
  }

  contextMenuState.open = true;
  contextMenuState.x = payload.event.clientX;
  contextMenuState.y = payload.event.clientY;
  contextMenuState.targetId = payload.id;
  contextMenuState.targetType = type;
}

function handleContextAction(action: string) {
  switch (action) {
    case "open":
      if (contextMenuState.targetType === "file" && contextMenuState.targetId) {
        const file = mediaStore.currentFiles.find((item) => item.id === contextMenuState.targetId);
        if (file) {
          openPreview(file);
        }
      } else if (contextMenuState.targetType === "folder" && contextMenuState.targetId) {
        mediaStore.setCurrentFolder(contextMenuState.targetId);
      }
      break;
    case "rename":
      if (contextMenuState.targetType === "file" && contextMenuState.targetId) {
        const file = mediaStore.currentFiles.find((item) => item.id === contextMenuState.targetId);
        if (file) {
          openRename("file", file.id, file.name);
        }
      } else if (contextMenuState.targetType === "folder" && contextMenuState.targetId) {
        const folder = allFolders.value.get(contextMenuState.targetId);
        if (folder) {
          openRename("folder", folder.id, folder.name);
        }
      }
      break;
    case "delete":
      openDelete("soft");
      break;
    case "purge":
      openDelete("purge");
      break;
    case "restore":
      if (contextMenuState.targetType === "file" && contextMenuState.targetId) {
        mediaStore.restoreEntities({ fileIds: [contextMenuState.targetId] });
      } else if (contextMenuState.targetType === "folder" && contextMenuState.targetId) {
        mediaStore.restoreEntities({ folderIds: [contextMenuState.targetId] });
      }
      break;
    case "move":
      openMove();
      break;
    case "open-folder":
      if (contextMenuState.targetType === "folder" && contextMenuState.targetId) {
        mediaStore.setCurrentFolder(contextMenuState.targetId);
      }
      break;
  }
  contextMenuState.open = false;
}

function handleFileSelect(id: string, _shift = false, _ctrl = false) {
  mediaStore.toggleSelection(id, "file");
}

function handleFolderContext(folderId: string | null, event: MouseEvent) {
  if (!folderId) {
    return;
  }

  handleContext({ id: folderId, event }, "folder");
}

function handleToolbarToggleTrash() {
  mediaStore.setTrashMode(!mediaStore.trashMode);
  mediaStore.loadCurrent({ force: true });
}

function handleToolbarRefresh() {
  mediaStore.loadCurrent({ force: true });
}

async function restoreTrashItem(item: TrashItem) {
  if (item.type === "file") {
    await mediaStore.restoreEntities({ fileIds: [item.id] });
  } else {
    await mediaStore.restoreEntities({ folderIds: [item.id] });
  }
}

async function purgeTrashItem(item: TrashItem) {
  if (item.type === "file") {
    await mediaStore.purgeEntities({ fileIds: [item.id] });
  } else {
    await mediaStore.purgeEntities({ folderIds: [item.id] });
  }
}
</script>

