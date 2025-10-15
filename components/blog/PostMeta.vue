<template>
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="h-12 w-12 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
        <img
          :src="user.photo ?? defaultAvatar"
          :alt="`${user.firstName} ${user.lastName}`"
          width="48"
          height="48"
          class="h-full w-full object-cover"
          :loading="imageLoadingMode"
          :fetchpriority="imageFetchPriority"
          decoding="async"
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
    <ClientOnly>
      <AuthorActionMenu
        data-test="author-actions"
        :is-authenticated="canRenderAuthUi"
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
      <template #fallback>
        <div
          aria-hidden="true"
          class="flex flex-wrap items-center gap-3 text-sm text-slate-500"
        >
          <span
            class="invisible inline-flex h-10 min-w-[112px] items-center justify-center rounded-full px-4 py-2"
          >
            &nbsp;
          </span>
        </div>
      </template>
    </ClientOnly>
  </header>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import type { BlogUser } from "~/lib/mock/blog";
import { useAuthSession } from "~/stores/auth-session";

const AuthorActionMenu = defineAsyncComponent({
  loader: () => import("~/components/blog/AuthorActionMenu.vue"),
  suspensible: false,
});

const props = withDefaults(
  defineProps<{
    user: BlogUser;
    defaultAvatar: string;
    publishedLabel: string;
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
    preferEagerMediaLoading?: boolean;
  }>(),
  {
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
    preferEagerMediaLoading: false,
  },
);

const emit = defineEmits<{
  (e: "follow"): void;
  (e: "edit", event: Event): void;
  (e: "delete", event: Event): void;
}>();

const auth = useAuthSession();
const canRenderAuthUi = computed(() => auth.isReady.value && auth.isAuthenticated.value);
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
const preferEagerMediaLoading = computed(() => props.preferEagerMediaLoading);
const imageLoadingMode = computed(() => (preferEagerMediaLoading.value ? "eager" : "lazy"));
const imageFetchPriority = computed(() => (preferEagerMediaLoading.value ? "high" : undefined));
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
