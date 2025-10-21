<template>
  <main
    class="py-10"
    aria-labelledby="admin-blog-title"
  >
    <v-container>
      <header
        class="d-flex flex-column flex-lg-row align-lg-center justify-space-between gap-4 mb-6"
      >
        <div>
          <h1
            id="admin-blog-title"
            class="text-h4 text-lg-h3 font-weight-bold mb-2"
          >
            {{ t("admin.blog.title") }}
          </h1>
          <p
            id="admin-blog-subtitle"
            class="text-body-1 text-medium-emphasis mb-0"
          >
            {{ t("admin.blog.subtitle") }}
          </p>
        </div>
        <div class="d-flex flex-wrap gap-3 justify-end">
          <v-btn
            color="primary"
            variant="tonal"
            prepend-icon="mdi:refresh"
            class="text-none"
            :loading="isRefreshing"
            :disabled="isBusy"
            :aria-label="t('admin.blog.actions.refreshAria')"
            @click="handleRefresh"
          >
            <Icon
              name="mdi:refresh"
              class="me-2"
            />
            {{ t("admin.blog.actions.refresh") }}
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="mdi:plus"
            class="text-none"
            :loading="isCreating"
            :aria-label="t('admin.blog.actions.createAria')"
            @click="openCreateDialog"
          >
            <Icon
              name="mdi:plus"
              class="me-2"
            />
            {{ t("admin.blog.actions.create") }}
          </v-btn>
        </div>
      </header>

      <v-alert
        v-if="generalError"
        type="error"
        variant="tonal"
        class="mb-6"
        border="start"
        :title="t('admin.blog.feedback.loadError')"
      >
        {{ generalError }}
      </v-alert>

      <v-progress-linear
        v-if="isRevalidating"
        indeterminate
        color="primary"
        class="mb-4"
        role="status"
        :aria-label="t('admin.blog.actions.refreshAria')"
      />

      <div class="d-flex flex-column flex-md-row align-md-center gap-4 mb-6">
        <v-text-field
          v-model="search"
          :label="t('admin.blog.table.searchLabel')"
          :placeholder="t('admin.blog.table.searchPlaceholder')"
          prepend-inner-icon="mdi:magnify"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
          :aria-label="t('admin.blog.table.searchLabel')"
        />
        <v-select
          v-model="itemsPerPage"
          :items="pageSizeOptions"
          item-title="label"
          item-value="value"
          :label="t('admin.blog.table.itemsPerPageLabel')"
          density="comfortable"
          variant="outlined"
          hide-details
          class="w-100 w-md-25"
        />
      </div>

      <v-data-table
        v-model:sort-by="sortBy"
        :headers="tableHeaders"
        :items="paginatedPosts"
        :items-length="totalItems"
        :loading="isInitialLoading"
        :no-data-text="noDataLabel"
        :items-per-page="itemsPerPage"
        :page="page"
        item-value="id"
        density="comfortable"
        class="rounded-xl elevation-2"
      >
        <template #loading>
          <v-skeleton-loader type="table-row@5" />
        </template>

        <template #[`item.title`]="{ item }">
          <div class="d-flex flex-column gap-1">
            <div class="d-flex align-center gap-2">
              <span class="text-body-1 font-weight-medium text-high-emphasis">{{
                item.title
              }}</span>
              <v-chip
                v-if="item.isOptimistic"
                color="warning"
                size="x-small"
                variant="tonal"
                class="text-uppercase font-weight-medium"
              >
                {{ t("admin.blog.table.optimisticBadge") }}
              </v-chip>
            </div>
            <span class="text-body-2 text-medium-emphasis">{{
              item.summary || t("admin.blog.table.noSummary")
            }}</span>
          </div>
        </template>

        <template #[`item.author`]="{ item }">
          <span class="text-body-2 text-medium-emphasis">{{ item.author }}</span>
        </template>

        <template #[`item.publishedTimestamp`]="{ item }">
          <span class="text-body-2 text-medium-emphasis">{{ item.publishedLabel }}</span>
        </template>

        <template #[`item.reactions`]="{ item }">
          <span class="text-body-2 font-weight-medium">{{ formatNumber(item.reactions) }}</span>
        </template>

        <template #[`item.comments`]="{ item }">
          <span class="text-body-2 font-weight-medium">{{ formatNumber(item.comments) }}</span>
        </template>

        <template #[`item.actions`]="{ item }">
          <div class="d-flex justify-end gap-1">
            <v-btn
              variant="text"
              color="primary"
              icon="mdi:eye-outline"
              :aria-label="t('admin.blog.table.previewAria', { title: item.title })"
              @click="openPreview(item)"
            >
              <Icon name="mdi:eye-outline" />
            </v-btn>
            <v-btn
              variant="text"
              color="primary"
              icon="mdi:pencil-outline"
              :loading="isUpdating(item.id)"
              :disabled="isUpdating(item.id) || isDeleting(item.id)"
              :aria-label="t('admin.blog.table.editAria', { title: item.title })"
              @click="openEditDialog(item)"
            >
              <Icon name="mdi:pencil-outline" />
            </v-btn>
            <v-btn
              variant="text"
              color="error"
              icon="mdi:delete-outline"
              :loading="isDeleting(item.id)"
              :disabled="isUpdating(item.id) || isDeleting(item.id)"
              :aria-label="t('admin.blog.table.deleteAria', { title: item.title })"
              @click="confirmDelete(item)"
            >
              <Icon name="mdi:delete-outline" />
            </v-btn>
            <v-btn
              v-if="item.publicUrl"
              variant="text"
              color="primary"
              icon="mdi:open-in-new"
              :href="item.publicUrl"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="t('admin.blog.table.viewAria', { title: item.title })"
            >
              <Icon name="mdi:open-in-new" />
            </v-btn>
          </div>
        </template>

        <template #bottom>
          <v-divider />
          <div
            class="d-flex flex-column flex-sm-row align-sm-center justify-space-between px-4 py-3 gap-4"
          >
            <div class="text-body-2 text-medium-emphasis">
              {{ t("admin.blog.table.results", { count: formatNumber(totalItems) }) }}
            </div>
            <v-pagination
              v-model="page"
              :length="totalPages"
              :total-visible="5"
              density="comfortable"
              variant="tonal"
            />
          </div>
        </template>
      </v-data-table>
    </v-container>

    <v-dialog
      v-model="createDialog"
      max-width="720"
      aria-labelledby="create-dialog-title"
    >
      <SidebarCard
        class="text-card-foreground"
        glow
      >
        <v-card-title
          id="create-dialog-title"
          class="text-h6 font-weight-semibold"
        >
          {{ t("admin.blog.dialogs.create.title") }}
        </v-card-title>
        <v-card-text>
          <v-alert
            v-if="createErrorMessage"
            type="error"
            variant="tonal"
            density="comfortable"
            class="mb-4"
          >
            {{ createErrorMessage }}
          </v-alert>
          <BlogPostForm
            ref="createFormRef"
            v-model="createFormModel"
            :labels="blogFormLabels"
            :content-rules="[contentRule]"
            :disabled="isCreating"
            @submit="submitCreate"
          />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            variant="text"
            @click="closeCreateDialog"
            >{{ t("admin.blog.dialogs.delete.cancel") }}</v-btn
          >
          <v-btn
            color="primary"
            variant="flat"
            :loading="isCreating"
            :disabled="isCreating"
            @click="submitCreate"
          >
            {{ t("admin.blog.dialogs.create.submit") }}
          </v-btn>
        </v-card-actions>
      </SidebarCard>
    </v-dialog>

    <v-dialog
      v-model="editDialog"
      max-width="720"
      aria-labelledby="edit-dialog-title"
    >
      <SidebarCard
        class="text-card-foreground"
        glow
      >
        <v-card-title
          id="edit-dialog-title"
          class="text-h6 font-weight-semibold"
        >
          {{ t("admin.blog.dialogs.edit.title") }}
        </v-card-title>
        <v-card-text>
          <v-alert
            v-if="editError"
            type="error"
            variant="tonal"
            density="comfortable"
            class="mb-4"
          >
            {{ editError }}
          </v-alert>
          <BlogPostForm
            ref="editFormRef"
            v-model="editFormModel"
            :labels="blogFormLabels"
            :content-rules="[contentRule]"
            :disabled="currentEditLoading"
            @submit="submitEdit"
          />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            variant="text"
            @click="closeEditDialog"
            >{{ t("admin.blog.dialogs.delete.cancel") }}</v-btn
          >
          <v-btn
            color="primary"
            variant="flat"
            :loading="currentEditLoading"
            :disabled="!hasEditChanges || currentEditLoading"
            @click="submitEdit"
          >
            {{ t("admin.blog.dialogs.edit.submit") }}
          </v-btn>
        </v-card-actions>
      </SidebarCard>
    </v-dialog>

    <v-dialog
      v-model="deleteDialog"
      max-width="480"
      aria-labelledby="delete-dialog-title"
    >
      <SidebarCard
        class="text-card-foreground"
        glow
      >
        <v-card-title
          id="delete-dialog-title"
          class="text-h6 font-weight-semibold"
        >
          {{ t("admin.blog.dialogs.delete.title") }}
        </v-card-title>
        <v-card-text>
          <p class="text-body-2 text-medium-emphasis mb-4">
            {{ t("admin.blog.dialogs.delete.description") }}
          </p>
          <v-alert
            v-if="deleteError"
            type="error"
            variant="tonal"
            density="comfortable"
          >
            {{ deleteError }}
          </v-alert>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            variant="text"
            @click="closeDeleteDialog"
            >{{ t("admin.blog.dialogs.delete.cancel") }}</v-btn
          >
          <v-btn
            color="error"
            variant="flat"
            :loading="currentDeleteLoading"
            :disabled="currentDeleteLoading"
            @click="submitDelete"
          >
            {{ t("admin.blog.dialogs.delete.confirm") }}
          </v-btn>
        </v-card-actions>
      </SidebarCard>
    </v-dialog>

    <v-dialog
      v-model="previewDialog"
      max-width="720"
      aria-labelledby="preview-dialog-title"
    >
      <SidebarCard
        class="text-card-foreground"
        glow
      >
        <v-card-title
          id="preview-dialog-title"
          class="text-h6 font-weight-semibold"
        >
          {{ t("admin.blog.dialogs.preview.title") }}
        </v-card-title>
        <v-card-text v-if="previewPost">
          <div class="mb-4">
            <h3 class="text-subtitle-1 font-weight-semibold mb-1">{{ previewPost.title }}</h3>
            <p class="text-body-2 text-medium-emphasis mb-0">{{ previewPost.author }}</p>
            <p class="text-caption text-disabled mt-1 mb-0">{{ previewPost.publishedLabel }}</p>
          </div>
          <section class="mb-4">
            <h4 class="text-subtitle-2 font-weight-medium mb-1">
              {{ t("admin.blog.dialogs.preview.summaryLabel") }}
            </h4>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ previewPost.summary || t("admin.blog.table.noSummary") }}
            </p>
          </section>
          <section>
            <h4 class="text-subtitle-2 font-weight-medium mb-1">
              {{ t("admin.blog.dialogs.preview.contentLabel") }}
            </h4>
            <p class="text-body-2 text-medium-emphasis whitespace-pre-line mb-0">
              {{ previewPost.content }}
            </p>
          </section>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            variant="text"
            @click="previewDialog = false"
            >{{ t("admin.blog.dialogs.delete.cancel") }}</v-btn
          >
          <v-btn
            v-if="previewPost?.publicUrl"
            color="primary"
            variant="text"
            :href="previewPost.publicUrl"
            target="_blank"
            rel="noopener noreferrer"
            prepend-icon="mdi:open-in-new"
          >
            {{ t("admin.blog.dialogs.preview.openPublic") }}
          </v-btn>
        </v-card-actions>
      </SidebarCard>
    </v-dialog>

    <v-snackbar
      v-model="snackbar.visible"
      :color="snackbar.color"
      timeout="4000"
      variant="tonal"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { callOnce } from "#app";
import { usePostsStore } from "~/composables/usePostsStore";
import type { BlogPost } from "~/lib/mock/blog";
import type { BlogPostFormValue } from "~/types/forms/blog";
import type { AdminPostRaw, AdminPostRow } from "~/types/pages/admin/blog";

import { useLocaleNamespaces } from "~/composables/useLocaleNamespaces";

const BlogPostForm = defineAsyncComponent({
  loader: () => import("~/components/forms/BlogPostForm.vue"),
  suspensible: false,
});

const { t, locale } = useI18n();
await useLocaleNamespaces(["admin"]);
const pageDescription = computed(() => t("admin.blog.subtitle"));

definePageMeta({
  middleware: ["auth", "admin"],
  showRightWidgets: false,
});
useSeoMeta(() => ({
  description: pageDescription.value,
}));
const numberFormatter = computed(() => new Intl.NumberFormat(locale.value));
const dateFormatter = computed(
  () =>
    new Intl.DateTimeFormat(locale.value, {
      dateStyle: "medium",
      timeStyle: "short",
    }),
);

useHead(() => ({
  title: t("admin.blog.metaTitle"),
}));

const postsStore = usePostsStore();
const posts = postsStore.posts;
const pending = postsStore.pending;
const isRevalidating = postsStore.isRevalidating;
const creatingState = postsStore.creating;
const createError = postsStore.createError;
const updatingState = postsStore.updating;
const deletingState = postsStore.deleting;
const generalError = postsStore.error;

await callOnce("admin:blog:posts:fetch", () => postsStore.fetchPosts());

const search = ref("");
const itemsPerPage = ref(10);
const page = ref(1);
const sortBy = ref([{ key: "publishedTimestamp", order: "desc" as const }]);
const pageSizeValues = [5, 10, 15, 25];
const pageSizeOptions = computed(() =>
  pageSizeValues.map((value) => ({
    label: formatNumber(value),
    value,
  })),
);

const tableHeaders = computed(() => [
  { title: t("admin.blog.table.headers.title"), key: "title", sortable: true },
  { title: t("admin.blog.table.headers.author"), key: "author", sortable: true },
  { title: t("admin.blog.table.headers.publishedAt"), key: "publishedTimestamp", sortable: true },
  {
    title: t("admin.blog.table.headers.reactions"),
    key: "reactions",
    sortable: true,
    align: "end",
  },
  { title: t("admin.blog.table.headers.comments"), key: "comments", sortable: true, align: "end" },
  { title: t("admin.blog.table.headers.actions"), key: "actions", sortable: false, align: "end" },
]);

function toTimestamp(value?: string | null) {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function resolveAuthor(post: BlogPost) {
  const segments = [post.user?.firstName, post.user?.lastName].filter(Boolean);
  if (segments.length) {
    return segments.join(" ");
  }

  if (post.user?.username) {
    return post.user.username;
  }

  return t("admin.blog.table.unknownAuthor");
}

function formatNumber(value: number | null | undefined) {
  return numberFormatter.value.format(value ?? 0);
}

const tableItems = computed<AdminPostRow[]>(() => {
  return posts.value.map((post) => {
    const author = resolveAuthor(post);
    const publishedTimestamp = toTimestamp(post.publishedAt);
    const publishedLabel = publishedTimestamp
      ? dateFormatter.value.format(new Date(publishedTimestamp))
      : t("admin.blog.table.notPublished");

    const publicUrl = post.url ? post.url : null;

    return {
      id: post.id,
      title: post.title?.trim() || t("admin.blog.table.untitled"),
      summary: post.summary?.trim() || "",
      content: post.content ?? "",
      author,
      publishedLabel,
      publishedTimestamp,
      reactions: post.reactions_count ?? 0,
      comments: post.totalComments ?? 0,
      isOptimistic: Boolean((post as AdminPostRaw).__optimistic),
      publicUrl,
      raw: post as AdminPostRaw,
    };
  });
});

const filteredPosts = computed(() => {
  const query = search.value.trim().toLowerCase();

  if (!query) {
    return tableItems.value;
  }

  return tableItems.value.filter((item) => {
    return [item.title, item.summary, item.content, item.author]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });
});

const sortedPosts = computed(() => {
  const items = [...filteredPosts.value];
  const [currentSort] = sortBy.value;

  if (!currentSort) {
    return items;
  }

  const { key, order } = currentSort;
  const direction = order === "desc" ? -1 : 1;

  return items.sort((a, b) => {
    const first = (a as Record<string, unknown>)[key];
    const second = (b as Record<string, unknown>)[key];

    if (typeof first === "number" && typeof second === "number") {
      return (first - second) * direction;
    }

    const firstString = String(first ?? "").toLowerCase();
    const secondString = String(second ?? "").toLowerCase();

    if (firstString < secondString) {
      return -1 * direction;
    }

    if (firstString > secondString) {
      return 1 * direction;
    }

    return 0;
  });
});

const totalItems = computed(() => sortedPosts.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)));

const paginatedPosts = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value;
  return sortedPosts.value.slice(start, start + itemsPerPage.value);
});

watch([totalItems, itemsPerPage], () => {
  if (page.value > totalPages.value) {
    page.value = totalPages.value;
  }

  if (page.value < 1) {
    page.value = 1;
  }
});

const hasPostsLoaded = computed(() => posts.value.length > 0);
const isInitialLoading = computed(() => pending.value && !hasPostsLoaded.value);
const isBusy = computed(() => pending.value || isRevalidating.value);
const isRefreshing = computed(() => isRevalidating.value);
const isCreating = computed(() => creatingState.value);

const createDialog = ref(false);

const createForm = reactive({
  title: "",
  summary: "",
  content: "",
});
const createFormRef = ref();
const createFormModel = computed<BlogPostFormValue>({
  get: () => ({
    title: createForm.title,
    summary: createForm.summary,
    content: createForm.content,
  }),
  set: (value) => {
    createForm.title = value.title;
    createForm.summary = value.summary;
    createForm.content = value.content;
  },
});
const localCreateError = ref<string | null>(null);
const createErrorMessage = computed(() => localCreateError.value ?? createError.value);

const editDialog = ref(false);
const editForm = reactive({
  id: "",
  title: "",
  summary: "",
  content: "",
});
const editFormRef = ref();
const editFormModel = computed<BlogPostFormValue>({
  get: () => ({
    title: editForm.title,
    summary: editForm.summary,
    content: editForm.content,
  }),
  set: (value) => {
    editForm.title = value.title;
    editForm.summary = value.summary;
    editForm.content = value.content;
  },
});
const editError = ref<string | null>(null);
const editingOriginal = ref<(BlogPost & { __optimistic?: boolean }) | null>(null);

const deleteDialog = ref(false);
const deleteError = ref<string | null>(null);
const deletingPost = ref<AdminPostRow | null>(null);

const previewDialog = ref(false);
const previewPost = ref<AdminPostRow | null>(null);

const snackbar = reactive({
  visible: false,
  message: "",
  color: "success" as "success" | "error",
});

function setSnackbar(message: string, color: "success" | "error" = "success") {
  snackbar.message = message;
  snackbar.color = color;
  snackbar.visible = true;
}

function contentRule(value: string) {
  return value?.trim() ? true : t("admin.blog.validation.contentRequired");
}

const blogFormLabels = computed(() => ({
  title: t("admin.blog.dialogs.form.titleLabel"),
  summary: t("admin.blog.dialogs.form.summaryLabel"),
  content: t("admin.blog.dialogs.form.contentLabel"),
}));

function openCreateDialog() {
  resetCreateForm();
  createDialog.value = true;
}

function closeCreateDialog() {
  createDialog.value = false;
}

function resetCreateForm() {
  createForm.title = "";
  createForm.summary = "";
  createForm.content = "";
  localCreateError.value = null;
  createFormRef.value?.resetValidation?.();
}

async function submitCreate() {
  localCreateError.value = null;
  const content = createForm.content.trim();

  if (!content) {
    localCreateError.value = t("admin.blog.validation.contentRequired");
    return;
  }

  try {
    await postsStore.createPost({
      title: createForm.title,
      summary: createForm.summary,
      content,
    });
    setSnackbar(t("admin.blog.feedback.created"));
    closeCreateDialog();
    resetCreateForm();
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : t("admin.blog.feedback.actionError");
    localCreateError.value = message;
    setSnackbar(message, "error");
  }
}

function openEditDialog(item: AdminPostRow) {
  const post = item.raw;
  editingOriginal.value = post;
  editForm.id = post.id;
  editForm.title = post.title ?? "";
  editForm.summary = post.summary ?? "";
  editForm.content = post.content ?? "";
  editDialog.value = true;
  editError.value = null;
}

function closeEditDialog() {
  editDialog.value = false;
  editingOriginal.value = null;
  editFormRef.value?.resetValidation?.();
}

const currentEditLoading = computed(() =>
  editForm.id ? Boolean(updatingState.value?.[editForm.id]) : false,
);

const hasEditChanges = computed(() => {
  if (!editingOriginal.value) {
    return false;
  }

  return (
    editingOriginal.value.title !== editForm.title ||
    editingOriginal.value.summary !== editForm.summary ||
    editingOriginal.value.content !== editForm.content
  );
});

async function submitEdit() {
  if (!editForm.id) {
    return;
  }

  editError.value = null;

  try {
    if (!hasEditChanges.value) {
      closeEditDialog();
      return;
    }

    await postsStore.updatePost(editForm.id, {
      title: editForm.title,
      summary: editForm.summary,
      content: editForm.content,
    });
    setSnackbar(t("admin.blog.feedback.updated"));
    closeEditDialog();
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : t("admin.blog.feedback.actionError");
    editError.value = message;
    setSnackbar(message, "error");
  }
}

function confirmDelete(item: AdminPostRow) {
  deletingPost.value = item;
  deleteError.value = null;
  deleteDialog.value = true;
}

function closeDeleteDialog() {
  deleteDialog.value = false;
  deletingPost.value = null;
}

const currentDeleteLoading = computed(() =>
  deletingPost.value ? Boolean(deletingState.value?.[deletingPost.value.id]) : false,
);

async function submitDelete() {
  const post = deletingPost.value;

  if (!post) {
    return;
  }

  deleteError.value = null;

  try {
    await postsStore.deletePost(post.id);
    closeDeleteDialog();
    setSnackbar(t("admin.blog.feedback.deleted"));
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : t("admin.blog.feedback.actionError");
    deleteError.value = message;
    setSnackbar(message, "error");
  }
}

function isUpdating(id: string) {
  return Boolean(updatingState.value?.[id]);
}

function isDeleting(id: string) {
  return Boolean(deletingState.value?.[id]);
}

function openPreview(item: AdminPostRow) {
  previewPost.value = item;
  previewDialog.value = true;
}

watch(
  () => createDialog.value,
  (isOpen, wasOpen) => {
    if (!isOpen && wasOpen) {
      resetCreateForm();
      localCreateError.value = null;
    }
  },
);

watch(
  () => editDialog.value,
  (isOpen, wasOpen) => {
    if (!isOpen && wasOpen) {
      editError.value = null;
      editingOriginal.value = null;
    }
  },
);

watch(
  () => deleteDialog.value,
  (isOpen, wasOpen) => {
    if (!isOpen && wasOpen) {
      deleteError.value = null;
      deletingPost.value = null;
    }
  },
);

watch(
  () => posts.value,
  (list) => {
    if (editingOriginal.value) {
      const updated = list.find((post) => post.id === editingOriginal.value?.id);

      if (updated) {
        editingOriginal.value = updated;
        editForm.title = updated.title ?? "";
        editForm.summary = updated.summary ?? "";
        editForm.content = updated.content ?? "";
      }
    }

    if (previewPost.value) {
      const refreshed = tableItems.value.find((item) => item.id === previewPost.value?.id);

      if (refreshed) {
        previewPost.value = refreshed;
      }
    }
  },
  { deep: true },
);

async function handleRefresh() {
  try {
    await postsStore.fetchPosts({ force: true });
    setSnackbar(t("admin.blog.actions.refreshSuccess"));
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : t("admin.blog.feedback.actionError");
    setSnackbar(message, "error");
  }
}

const noDataText = computed(() =>
  filteredPosts.value.length === 0 && search.value
    ? t("admin.blog.table.emptySearch")
    : t("admin.blog.table.empty"),
);

const noDataLabel = computed(() => noDataText.value);

watch(search, () => {
  page.value = 1;
});
</script>

<style scoped src="~/assets/styles/pages/admin/blog/index.scss" lang="scss"></style>
