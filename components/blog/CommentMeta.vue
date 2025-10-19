<template>
  <div class="comment-meta">
    <div class="comment-meta__info">
      <img
        :src="avatarSrc"
        :alt="`${user.firstName} ${user.lastName}`"
        width="40"
        height="40"
        loading="lazy"
        decoding="async"
        fetchpriority="low"
        class="comment-meta__avatar"
      />
      <div class="comment-meta__text">
        <p class="comment-meta__name">{{ user.firstName }} {{ user.lastName }}</p>
        <p class="comment-meta__published">
          {{ publishedLabel }}
        </p>
      </div>
    </div>
    <ClientOnly>
      <AuthorActionMenu
        data-test="comment-actions"
        :is-authenticated="isAuthenticated"
        :is-author="isAuthor"
        :is-following="isFollowing"
        :follow-loading="followLoading"
        :follow-label="followLabel"
        :follow-loading-label="followLoadingLabel"
        :follow-aria-label="followAriaLabel"
        :following-label="followingLabel"
        :following-aria-label="followingAriaLabel"
        :actions-aria-label="actionsAriaLabel"
        :edit-label="editLabel"
        :delete-label="deleteLabel"
        variant="comment"
        @follow="emit('follow')"
        @edit="(event) => emit('edit', event)"
        @delete="(event) => emit('delete', event)"
      />
      <template #fallback>
        <div
          aria-hidden="true"
          class="comment-meta__actions"
        >
          <span class="comment-meta__actions-placeholder">&nbsp;</span>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { BlogUser } from "~/lib/mock/blog";
import { optimizeAvatarUrl } from "~/lib/images/avatar";
import AuthorActionMenu from "~/components/blog/AuthorActionMenu.vue";

type CommentMetaProps = {
  user: BlogUser;
  defaultAvatar: string;
  publishedLabel: string;
  isAuthenticated?: boolean;
  isAuthor?: boolean;
  isFollowing?: boolean;
  followLoading?: boolean;
  followLabel?: string;
  followLoadingLabel?: string;
  followAriaLabel?: string;
  followingLabel?: string;
  followingAriaLabel?: string;
  actionsAriaLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
};

const emit = defineEmits<{
  (e: "edit", event: Event): void;
  (e: "delete", event: Event): void;
  (e: "follow"): void;
}>();

const props = withDefaults(defineProps<CommentMetaProps>(), {
  isAuthenticated: false,
  isAuthor: false,
  isFollowing: false,
  followLoading: false,
  followLabel: "Follow",
  followLoadingLabel: "Following",
  followAriaLabel: undefined,
  followingLabel: "Following",
  followingAriaLabel: undefined,
  actionsAriaLabel: undefined,
  editLabel: "Edit",
  deleteLabel: "Delete",
});

const isAuthenticated = computed(() => props.isAuthenticated);
const isAuthor = computed(() => props.isAuthor);
const isFollowing = computed(() => props.isFollowing);
const followLoading = computed(() => props.followLoading);
const followLabel = computed(() => props.followLabel);
const followLoadingLabel = computed(() => props.followLoadingLabel);
const followAriaLabel = computed(() => props.followAriaLabel);
const followingLabel = computed(() => props.followingLabel);
const followingAriaLabel = computed(() => props.followingAriaLabel);
const actionsAriaLabel = computed(() => props.actionsAriaLabel);
const editLabel = computed(() => props.editLabel);
const deleteLabel = computed(() => props.deleteLabel);
const avatarSize = 40;
const avatarSrc = computed(
  () => optimizeAvatarUrl(props.user.photo ?? null, avatarSize) ?? props.defaultAvatar,
);
</script>

<style scoped>
.comment-meta {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
}

.comment-meta__info {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.comment-meta__avatar {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  object-fit: cover;
}

.comment-meta__name {
  margin: 0;
  font-weight: 600;
  font-size: 0.95rem;
}

.comment-meta__published {
  margin: 0;
  font-size: 0.75rem;
  color: #64748b;
}

.comment-meta__actions {
  min-height: 2rem;
}

.comment-meta__actions-placeholder {
  display: inline-flex;
  min-width: 80px;
  align-items: center;
  justify-content: center;
}
</style>
