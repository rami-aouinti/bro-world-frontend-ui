<template>
  <header class="mx-auto flex flex-wrap items-center gap-6 py-4">
    <div class="flex items-center gap-4">
      <div
        class="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/20 bg-white/10"
      >
        <img
          :src="user.photo ?? defaultAvatar"
          :alt="`${user.firstName} ${user.lastName}`"
          class="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div>
        <p class="text-sm font-medium text-slate-200">{{ user.firstName }} {{ user.lastName }}</p>
        <p class="text-xs text-slate-400">
          {{ publishedLabel }}
        </p>
      </div>
    </div>
    <div
      v-if="isAuthenticated"
      class="ms-auto flex flex-wrap items-center gap-3 text-sm text-slate-200"
      data-test="author-actions"
    >
      <div
        v-if="isAuthor"
        ref="menuContainer"
        class="relative"
      >
        <button
          ref="menuButton"
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-lg text-slate-100 transition-colors duration-200 hover:border-primary/60 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          :aria-haspopup="'menu'"
          :aria-expanded="menuOpen ? 'true' : 'false'"
          :aria-label="actionsAriaLabel"
          data-test="post-actions-trigger"
          @click="toggleMenu"
        >
          <span aria-hidden="true">⋮</span>
        </button>
        <transition name="fade">
          <div
            v-if="menuOpen"
            ref="menuPanel"
            role="menu"
            class="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-white/10 bg-slate-950/90 p-1 shadow-xl backdrop-blur"
            @keydown.stop="handleMenuKeydown"
          >
            <button
              ref="editButton"
              type="button"
              role="menuitem"
              class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-100 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              data-test="post-action-edit"
              @click="handleEdit"
            >
              {{ editLabel }}
            </button>
            <button
              ref="deleteButton"
              type="button"
              role="menuitem"
              class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-200 transition-colors hover:bg-rose-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
              data-test="post-action-delete"
              @click="handleDelete"
            >
              {{ deleteLabel }}
            </button>
          </div>
        </transition>
      </div>
      <button
        v-else-if="!isFollowing"
        type="button"
        class="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
        :aria-label="followAriaLabel"
        :disabled="followLoading"
        data-test="follow-button"
        @click="emitFollow"
      >
        <span v-if="followLoading" class="inline-flex items-center gap-2">
          <span class="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
          <span>{{ followLoadingLabel }}</span>
        </span>
        <span v-else>{{ followLabel }}</span>
      </button>
      <span
        v-else
        class="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-200"
        :aria-label="followingAriaLabel"
        data-test="following-chip"
      >
        {{ followingLabel }}
      </span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { onClickOutside } from "@vueuse/core";
import type { BlogUser } from "~/lib/mock/blog";

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

const menuOpen = ref(false);
const menuContainer = ref<HTMLElement | null>(null);
const menuButton = ref<HTMLButtonElement | null>(null);
const menuPanel = ref<HTMLDivElement | null>(null);
const editButton = ref<HTMLButtonElement | null>(null);
const deleteButton = ref<HTMLButtonElement | null>(null);

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

function emitFollow(event: Event) {
  event.preventDefault();
  emit("follow");
}

function closeMenu() {
  if (!menuOpen.value) {
    return;
  }

  menuOpen.value = false;

  nextTick(() => {
    menuButton.value?.focus();
  });
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value;

  if (menuOpen.value) {
    nextTick(() => {
      editButton.value?.focus();
    });
  }
}

function handleEdit(event: Event) {
  emit("edit", event);
  closeMenu();
}

function handleDelete(event: Event) {
  emit("delete", event);
  closeMenu();
}

function handleMenuKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeMenu();
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusable = [editButton.value, deleteButton.value].filter(
    (element): element is HTMLButtonElement => Boolean(element),
  );

  if (focusable.length === 0) {
    return;
  }

  const currentIndex = focusable.findIndex((element) => element === document.activeElement);

  if (event.shiftKey) {
    event.preventDefault();
    const previousIndex = (currentIndex - 1 + focusable.length) % focusable.length;
    focusable[previousIndex]?.focus();
    return;
  }

  event.preventDefault();
  const nextIndex = (currentIndex + 1) % focusable.length;
  focusable[nextIndex]?.focus();
}

watch(
  () => props.isAuthor,
  () => {
    if (!props.isAuthor) {
      closeMenu();
    }
  },
);

onMounted(() => {
  onClickOutside(menuContainer, () => {
    closeMenu();
  });
});

onUnmounted(() => {
  closeMenu();
});
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
