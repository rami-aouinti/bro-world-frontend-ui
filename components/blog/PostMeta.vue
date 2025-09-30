<template>
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="h-12 w-12 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
        <img
          :src="user.photo ?? defaultAvatar"
          :alt="`${user.firstName} ${user.lastName}`"
          class="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div class="space-y-1">
        <p class="text-sm font-semibold leading-tight text-foreground">
          {{ user.firstName }} {{ user.lastName }}
        </p>
        <p class="text-xs text-slate-500">
          {{ publishedLabel }}
        </p>
      </div>
    </div>
    <AuthorActionMenu
      data-test="author-actions"
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
      variant="post"
      @follow="emit('follow')"
      @edit="(event) => emit('edit', event)"
      @delete="(event) => emit('delete', event)"
    />
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import AuthorActionMenu from "~/components/blog/AuthorActionMenu.vue";
import type { BlogUser } from "~/lib/mock/blog";
import {useAuthSession} from "~/stores/auth-session";

const props = withDefaults(
  defineProps<{
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
  }>(),
  {
    isAuthenticated: false,
    isAuthor: false,
    isFollowing: false,
    followLoading: false,
    followLabel: "Follow",
    followLoadingLabel: "Following",
    followAriaLabel: "Follow author",
    followingLabel: "Following",
    followingAriaLabel: "Already following",
    actionsAriaLabel: "Open post actions",
    editLabel: "Edit",
    deleteLabel: "Delete",
  },
);

const emit = defineEmits<{
  (e: "follow"): void;
  (e: "edit", event: Event): void;
  (e: "delete", event: Event): void;
}>();

const auth = useAuthSession()
const isAuthenticated = computed(() => auth.isAuthenticated.value)
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
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
