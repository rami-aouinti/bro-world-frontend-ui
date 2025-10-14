<template>
  <article class="post-card">
    <header class="post-card__header">
      <div class="post-card__author">
        <img
          :src="post.user.photo ?? defaultAvatar"
          :alt="`${post.user.firstName} ${post.user.lastName}`"
          width="48"
          height="48"
          class="post-card__avatar"
        />
        <div class="post-card__author-meta">
          <p class="post-card__author-name">{{ post.user.firstName }} {{ post.user.lastName }}</p>
          <p class="post-card__timestamp">
            {{ publishedLabel }}
          </p>
        </div>
      </div>
      <div
        v-if="canRenderAuthorActions"
        class="post-card__actions"
        data-test="author-actions"
      >
        <template v-if="isAuthor">
          <button
            type="button"
            class="post-card__menu-trigger"
            data-test="post-actions-trigger"
            :aria-expanded="actionsMenuOpen ? 'true' : 'false'"
            @click="toggleActionsMenu"
          >
            ⋮
          </button>
          <div
            v-if="actionsMenuOpen"
            class="post-card__menu"
          >
            <button
              type="button"
              data-test="post-action-edit"
              class="post-card__menu-item"
              @click="openEditDialog"
            >
              {{ editLabel }}
            </button>
            <button
              type="button"
              data-test="post-action-delete"
              class="post-card__menu-item"
              @click="openDeleteDialog"
            >
              {{ deleteLabel }}
            </button>
          </div>
        </template>
        <template v-else>
          <button
            v-if="!isFollowing"
            type="button"
            class="post-card__follow"
            data-test="follow-button"
            :disabled="followLoading"
            @click="handleFollow"
          >
            <span v-if="followLoading">{{ followLoadingLabel }}</span>
            <span v-else>{{ followLabel }}</span>
          </button>
          <span
            v-else
            class="post-card__following"
            data-test="following-chip"
          >
            {{ followingLabel }}
          </span>
        </template>
      </div>
    </header>

    <section class="post-card__content">
      <h2 class="post-card__title">{{ post.title }}</h2>
      <p class="post-card__summary">{{ post.summary }}</p>
      <p class="post-card__body">{{ post.content }}</p>
    </section>

    <footer
      class="post-card__footer"
      data-test="post-meta-bar"
    >
      <button
        type="button"
        class="post-card__like"
        data-test="post-like-button"
        @click="toggleLike"
      >
        {{ likeButtonLabel }}
      </button>
    </footer>

    <div
      v-if="editDialogOpen"
      class="post-card__dialog"
      role="dialog"
      aria-modal="true"
      :aria-label="editTitle"
    >
      <form
        class="post-card__form"
        @submit.prevent="submitEdit"
      >
        <label class="post-card__form-field">
          <span>{{ fieldLabels.title }}</span>
          <input
            v-model="editable.title"
            type="text"
          />
        </label>
        <label class="post-card__form-field">
          <span>{{ fieldLabels.summary }}</span>
          <textarea v-model="editable.summary"></textarea>
        </label>
        <label class="post-card__form-field">
          <span>{{ fieldLabels.content }}</span>
          <textarea v-model="editable.content"></textarea>
        </label>
        <div class="post-card__form-actions">
          <button type="submit">{{ saveLabel }}</button>
          <button
            type="button"
            @click="closeEditDialog"
          >
            {{ cancelLabel }}
          </button>
        </div>
      </form>
    </div>

    <div
      v-if="deleteDialogOpen"
      class="post-card__dialog"
      role="dialog"
      aria-modal="true"
      :aria-label="deleteTitle"
    >
      <p class="post-card__dialog-message">
        {{ deleteDescription }}
      </p>
      <div class="post-card__form-actions">
        <button
          type="button"
          @click="confirmDelete"
        >
          {{ deleteConfirmLabel }}
        </button>
        <button
          type="button"
          @click="closeDeleteDialog"
        >
          {{ cancelLabel }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import { toast } from "~/components/content/common/toast";
import { useAuthStore } from "~/composables/useAuthStore";
import { usePostsStore } from "~/composables/usePostsStore";
import type { BlogPost, ReactionType } from "~/lib/mock/blog";

interface ReactionLabels {
  like: string;
  love: string;
  wow: string;
  haha: string;
  sad: string;
  angry: string;
  dislike: string;
}

const props = defineProps<{
  post: BlogPost;
  defaultAvatar: string;
  reactionEmojis: Record<ReactionType, string>;
  reactionLabels: ReactionLabels;
}>();

const { t } = useI18n();
const authStore = useAuthStore();
const postsStore = usePostsStore();

const post = computed(() => props.post);

const isAuthenticated = computed(() => authStore.isAuthenticated.value);
const currentUser = computed(() => authStore.currentUser.value);
const isAuthor = computed(
  () => isAuthenticated.value && currentUser.value?.id === post.value.user.id,
);
const isFollowing = computed(() => Boolean(authStore.following.value?.[post.value.user.id]));
const followLoading = computed(() => Boolean(authStore.followPending.value?.[post.value.user.id]));
const canRenderAuthorActions = computed(() => isAuthenticated.value);

const actionsMenuOpen = ref(false);
const editDialogOpen = ref(false);
const deleteDialogOpen = ref(false);

const editable = reactive({
  title: post.value.title,
  summary: post.value.summary,
  content: post.value.content,
});

watch(
  () => post.value,
  (value) => {
    editable.title = value.title;
    editable.summary = value.summary;
    editable.content = value.content;
  },
  { immediate: true },
);

const publishedLabel = computed(() =>
  t("blog.reactions.posts.publishedOn", {
    date: new Date(post.value.publishedAt).toLocaleDateString(),
  }),
);

const likeButtonLabel = computed(() =>
  post.value.isReacted
    ? t("blog.reactions.posts.unlikeAction")
    : t("blog.reactions.posts.likeAction"),
);

const followLabel = computed(() => t("blog.posts.actions.follow"));
const followLoadingLabel = computed(() => t("blog.posts.actions.following"));
const followingLabel = computed(() => t("blog.posts.actions.following"));
const editLabel = computed(() => t("blog.posts.actions.edit"));
const deleteLabel = computed(() => t("blog.posts.actions.delete"));
const editTitle = computed(() => t("blog.posts.actions.editTitle"));
const editDescription = computed(() => t("blog.posts.actions.editDescription"));
const saveLabel = computed(() => t("blog.posts.actions.save"));
const cancelLabel = computed(() => t("blog.posts.actions.cancel"));
const deleteTitle = computed(() => t("blog.posts.actions.deleteTitle"));
const deleteDescription = computed(() => t("blog.posts.actions.deleteDescription"));
const deleteConfirmLabel = computed(() => t("blog.posts.actions.deleteConfirm"));
const fieldLabels = computed(() => ({
  title: t("blog.posts.actions.fields.title"),
  summary: t("blog.posts.actions.fields.summary"),
  content: t("blog.posts.actions.fields.content"),
}));

function toggleActionsMenu() {
  actionsMenuOpen.value = !actionsMenuOpen.value;
}

async function toggleLike() {
  const action: ReactionType = post.value.isReacted ? "dislike" : "like";
  await postsStore.reactToPost(post.value.id, action);
}

async function handleFollow() {
  if (followLoading.value) {
    return;
  }

  try {
    authStore.resetFollowError();
    await authStore.followAuthor(post.value.user.id);
    toast({
      title: t("blog.posts.actions.followSuccessTitle"),
      description: t("blog.posts.actions.followSuccessDescription", {
        name: `${post.value.user.firstName} ${post.value.user.lastName}`,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    toast({
      title: t("blog.posts.actions.followErrorTitle"),
      description: message || t("blog.posts.actions.followErrorDescription"),
      variant: "destructive",
    });
  }
}

function openEditDialog() {
  actionsMenuOpen.value = false;
  editDialogOpen.value = true;
}

function closeEditDialog() {
  editDialogOpen.value = false;
}

async function submitEdit() {
  try {
    await postsStore.updatePost(post.value.id, {
      title: editable.title,
      summary: editable.summary,
      content: editable.content,
    });
    toast({
      title: t("blog.posts.actions.editSuccessTitle"),
      description: t("blog.posts.actions.editSuccessDescription"),
    });
    closeEditDialog();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    toast({
      title: t("blog.posts.actions.editErrorTitle"),
      description: message || t("blog.posts.actions.editErrorDescription"),
      variant: "destructive",
    });
  }
}

function openDeleteDialog() {
  actionsMenuOpen.value = false;
  deleteDialogOpen.value = true;
}

function closeDeleteDialog() {
  deleteDialogOpen.value = false;
}

async function confirmDelete() {
  try {
    await postsStore.deletePost(post.value.id);
    toast({
      title: t("blog.posts.actions.deleteSuccessTitle"),
      description: t("blog.posts.actions.deleteSuccessDescription"),
    });
    closeDeleteDialog();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    toast({
      title: t("blog.posts.actions.deleteErrorTitle"),
      description: message || t("blog.posts.actions.deleteErrorDescription"),
      variant: "destructive",
    });
  }
}
</script>

<style scoped>
.post-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: var(
    --ui-card-radius,
    calc(var(--radius, var(--ui-radius)) + 8px)
  );
  background-color: white;
  color: #111827;
}

.post-card__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.post-card__author {
  display: flex;
  gap: 0.75rem;
}

.post-card__avatar {
  border-radius: 9999px;
  object-fit: cover;
}

.post-card__author-name {
  font-weight: 600;
  margin: 0;
}

.post-card__timestamp {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
}

.post-card__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.post-card__menu-trigger {
  border: 1px solid rgba(15, 23, 42, 0.1);
  background: transparent;
  border-radius: 9999px;
  width: 2.5rem;
  height: 2.5rem;
}

.post-card__menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.post-card__menu-item {
  border: 1px solid rgba(15, 23, 42, 0.1);
  background: white;
  border-radius: var(
    --ui-surface-radius,
    calc(var(--radius, var(--ui-radius)) + 4px)
  );
  padding: 0.5rem 1rem;
  text-align: left;
}

.post-card__follow {
  border-radius: 9999px;
  padding: 0.5rem 1rem;
  border: none;
  background-color: #2563eb;
  color: white;
  font-weight: 600;
}

.post-card__following {
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 9999px;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.post-card__content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.post-card__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.post-card__summary {
  margin: 0;
  color: #475569;
}

.post-card__body {
  margin: 0;
  white-space: pre-wrap;
}

.post-card__footer {
  display: flex;
  justify-content: flex-start;
}

.post-card__like {
  border: none;
  background: transparent;
  color: #2563eb;
  font-weight: 600;
}

.post-card__dialog {
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: var(
    --ui-card-radius,
    calc(var(--radius, var(--ui-radius)) + 8px)
  );
  padding: 1rem;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-card__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-card__form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.post-card__form-field input,
.post-card__form-field textarea {
  border: 1px solid rgba(15, 23, 42, 0.2);
  border-radius: var(--radius, var(--ui-radius));
  padding: 0.5rem;
}

.post-card__form-actions {
  display: flex;
  gap: 0.75rem;
}
</style>
