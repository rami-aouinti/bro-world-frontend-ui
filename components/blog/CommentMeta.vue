<template>
  <div class="comment-meta">
    <div class="comment-meta__info">
      <img
        :src="user.photo ?? defaultAvatar"
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
    <div
      v-if="isAuthenticated"
      class="comment-meta__actions"
      data-test="comment-actions"
    >
      <template v-if="isAuthor">
        <button
          type="button"
          class="comment-meta__menu-trigger"
          data-test="comment-actions-trigger"
          :aria-expanded="menuOpen ? 'true' : 'false'"
          @click="toggleMenu"
        >
          ⋮
        </button>
        <div
          v-if="menuOpen"
          class="comment-meta__menu"
        >
          <button
            type="button"
            class="comment-meta__menu-item"
            data-test="comment-action-edit"
            @click="$emit('edit', $event)"
          >
            {{ editLabel }}
          </button>
          <button
            type="button"
            class="comment-meta__menu-item"
            data-test="comment-action-delete"
            @click="$emit('delete', $event)"
          >
            {{ deleteLabel }}
          </button>
        </div>
      </template>
      <template v-else>
        <button
          v-if="!isFollowing"
          type="button"
          class="comment-meta__follow"
          data-test="comment-follow-button"
          :disabled="followLoading"
          @click="$emit('follow')"
        >
          <span v-if="followLoading">{{ followLoadingLabel }}</span>
          <span v-else>{{ followLabel }}</span>
        </button>
        <span
          v-else
          class="comment-meta__following"
          data-test="comment-following-chip"
        >
          {{ followingLabel }}
        </span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { BlogUser } from "~/lib/mock/blog";

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
  followingLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
};

defineEmits<{
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
  followingLabel: "Following",
  editLabel: "Edit",
  deleteLabel: "Delete",
});

const menuOpen = ref(false);

const isAuthenticated = computed(() => props.isAuthenticated);
const isAuthor = computed(() => props.isAuthor);
const isFollowing = computed(() => props.isFollowing);
const followLoading = computed(() => props.followLoading);
const followLabel = computed(() => props.followLabel);
const followLoadingLabel = computed(() => props.followLoadingLabel);
const followingLabel = computed(() => props.followingLabel);
const editLabel = computed(() => props.editLabel);
const deleteLabel = computed(() => props.deleteLabel);

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comment-meta__menu-trigger {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  background: transparent;
}

.comment-meta__menu {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.comment-meta__menu-item {
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: var(--radius, var(--ui-radius));
  background: white;
  padding: 0.25rem 0.75rem;
  text-align: left;
}

.comment-meta__follow {
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  background-color: #2563eb;
  color: white;
  border: none;
  font-size: 0.85rem;
}

.comment-meta__following {
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  text-transform: uppercase;
}
</style>
