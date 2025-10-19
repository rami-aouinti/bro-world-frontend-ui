<template>
  <div
    v-if="isUserAuthenticated"
    :class="variantClasses.wrapper"
    v-bind="$attrs"
  >
    <div
      v-if="isAuthor"
      ref="menuContainer"
      class="relative"
    >
      <button
        ref="menuButton"
        type="button"
        :class="variantClasses.menuButton"
        :aria-haspopup="'menu'"
        :aria-expanded="menuOpen ? 'true' : 'false'"
        :aria-label="actionsAriaLabel"
        :data-test="menuTriggerTestId"
        @click="toggleMenu"
      >
        <span aria-hidden="true">⋮</span>
      </button>
      <transition name="fade">
        <div
          v-if="menuOpen"
          ref="menuPanel"
          role="menu"
          :class="variantClasses.menuPanel"
          @keydown.stop="handleMenuKeydown"
        >
          <button
            ref="editButton"
            type="button"
            role="menuitem"
            :class="variantClasses.editButton"
            :data-test="editButtonTestId"
            :aria-label="editLabel"
            @click="handleEdit"
          >
            <AppIcon
              :name="MENU_ICONS.edit"
              :size="variantClasses.iconSize"
              :class="variantClasses.editIcon"
            />
            <span :class="variantClasses.menuItemLabel">{{ editLabel }}</span>
          </button>
          <button
            ref="deleteButton"
            type="button"
            role="menuitem"
            :class="variantClasses.deleteButton"
            :data-test="deleteButtonTestId"
            :aria-label="deleteLabel"
            @click="handleDelete"
          >
            <AppIcon
              :name="MENU_ICONS.delete"
              :size="variantClasses.iconSize"
              :class="variantClasses.deleteIcon"
            />
            <span :class="variantClasses.menuItemLabel">{{ deleteLabel }}</span>
          </button>
        </div>
      </transition>
    </div>
    <v-btn
      v-else-if="!isFollowing"
      variant="text"
      color="primary"
      :aria-label="followAriaLabel"
      :disabled="followLoading"
      :data-test="followButtonTestId"
      @click="emitFollow"
    >
      <span
        v-if="followLoading"
        :class="variantClasses.followLoadingWrapper"
      >
        <span
          :class="variantClasses.spinner"
          aria-hidden="true"
        />
        <span>{{ followLoadingLabel }}</span>
      </span>
      <span v-else>{{ followLabel }}</span>
    </v-btn>
    <span
      v-else
      :class="variantClasses.followingChip"
      :aria-label="followingAriaLabel"
      :data-test="followingChipTestId"
    >
      {{ followingLabel }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { onClickOutside } from "@vueuse/core";
import { useI18n } from "vue-i18n";

import AppIcon from "~/components/layout/AppIcon.vue";
import { useAuthSession } from "~/stores/auth-session";

type Variant = "post" | "comment";

const VARIANT_CONFIG: Record<
  Variant,
  {
    wrapper: string;
    menuButton: string;
    menuPanel: string;
    editButton: string;
    deleteButton: string;
    menuItemLabel: string;
    editIcon: string;
    deleteIcon: string;
    iconSize: number;
    followButton: string;
    followLoadingWrapper: string;
    spinner: string;
    followingChip: string;
    defaults: {
      menuTriggerTestId: string;
      editButtonTestId: string;
      deleteButtonTestId: string;
      followButtonTestId: string;
      followingChipTestId: string;
    };
  }
> = {
  post: {
    wrapper: "flex flex-wrap items-center gap-3 text-sm text-muted-foreground",
    menuButton:
      "inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-lg text-muted-foreground transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    menuPanel:
      "absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-border/60 bg-popover/95 p-2 text-popover-foreground shadow-2xl backdrop-blur-sm ring-1 ring-black/5",
    editButton:
      "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-popover-foreground transition-colors duration-200 hover:bg-muted/70 focus-visible:bg-muted/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    deleteButton:
      "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-destructive transition-colors duration-200 hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive",
    menuItemLabel: "flex-1",
    editIcon:
      "shrink-0 text-base text-muted-foreground transition-colors duration-200 group-hover:text-primary group-focus-visible:text-primary",
    deleteIcon:
      "shrink-0 text-base text-destructive transition-colors duration-200 group-hover:text-destructive group-focus-visible:text-destructive",
    iconSize: 18,
    followButton:
      "inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60",
    followLoadingWrapper: "inline-flex items-center gap-2",
    spinner:
      "h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground",
    followingChip:
      "inline-flex items-center justify-center rounded-full border border-border bg-muted px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
    defaults: {
      menuTriggerTestId: "post-actions-trigger",
      editButtonTestId: "post-action-edit",
      deleteButtonTestId: "post-action-delete",
      followButtonTestId: "follow-button",
      followingChipTestId: "following-chip",
    },
  },
  comment: {
    wrapper: "flex flex-wrap items-center gap-2 text-xs text-muted-foreground",
    menuButton:
      "inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-base text-muted-foreground transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    menuPanel:
      "absolute right-0 z-20 mt-2 w-44 rounded-2xl border border-border/60 bg-popover/95 p-1.5 text-popover-foreground shadow-xl backdrop-blur-sm ring-1 ring-black/5",
    editButton:
      "group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-popover-foreground transition-colors duration-200 hover:bg-muted/70 focus-visible:bg-muted/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    deleteButton:
      "group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-destructive transition-colors duration-200 hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive",
    menuItemLabel: "flex-1",
    editIcon:
      "shrink-0 text-sm text-muted-foreground transition-colors duration-200 group-hover:text-primary group-focus-visible:text-primary",
    deleteIcon:
      "shrink-0 text-sm text-destructive transition-colors duration-200 group-hover:text-destructive group-focus-visible:text-destructive",
    iconSize: 16,
    followButton:
      "inline-flex items-center justify-center rounded-full bg-primary px-3 py-1.5 font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60",
    followLoadingWrapper: "inline-flex items-center gap-2",
    spinner:
      "h-2.5 w-2.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground",
    followingChip:
      "inline-flex items-center justify-center rounded-full border border-border bg-muted px-3 py-1.5 font-medium uppercase tracking-wide text-muted-foreground",
    defaults: {
      menuTriggerTestId: "comment-actions-trigger",
      editButtonTestId: "comment-action-edit",
      deleteButtonTestId: "comment-action-delete",
      followButtonTestId: "comment-follow-button",
      followingChipTestId: "comment-following-chip",
    },
  },
};

const props = withDefaults(
  defineProps<{
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
    variant?: Variant;
    menuTriggerTestId?: string;
    editButtonTestId?: string;
    deleteButtonTestId?: string;
    followButtonTestId?: string;
    followingChipTestId?: string;
  }>(),
  {
    isAuthor: false,
    isFollowing: false,
    followLoading: false,
    variant: "post",
  },
);

const MENU_ICONS = {
  edit: "mdi:pencil-outline",
  delete: "mdi:trash-can-outline",
} as const;

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

const { t } = useI18n();

const auth = useAuthSession();
const isUserAuthenticated = computed(() => {
  if (typeof props.isAuthenticated === "boolean") {
    return props.isAuthenticated;
  }

  return auth.isReady.value && auth.isAuthenticated.value;
});
const isAuthor = computed(() => props.isAuthor);
const isFollowing = computed(() => props.isFollowing);
const followLoading = computed(() => props.followLoading);
const followLabel = computed(() => props.followLabel ?? t("blog.posts.actions.follow"));
const followLoadingLabel = computed(
  () => props.followLoadingLabel ?? t("blog.posts.actions.following"),
);
const followAriaLabel = computed(() => props.followAriaLabel ?? t("blog.posts.actions.follow"));
const followingLabel = computed(() => props.followingLabel ?? t("blog.posts.actions.following"));
const followingAriaLabel = computed(
  () => props.followingAriaLabel ?? t("blog.posts.actions.following"),
);
const actionsAriaLabel = computed(() => props.actionsAriaLabel ?? t("blog.posts.actions.openMenu"));
const editLabel = computed(() => props.editLabel ?? t("blog.posts.actions.edit"));
const deleteLabel = computed(() => props.deleteLabel ?? t("blog.posts.actions.delete"));

const menuTriggerTestId = computed(
  () => props.menuTriggerTestId ?? VARIANT_CONFIG[props.variant].defaults.menuTriggerTestId,
);
const editButtonTestId = computed(
  () => props.editButtonTestId ?? VARIANT_CONFIG[props.variant].defaults.editButtonTestId,
);
const deleteButtonTestId = computed(
  () => props.deleteButtonTestId ?? VARIANT_CONFIG[props.variant].defaults.deleteButtonTestId,
);
const followButtonTestId = computed(
  () => props.followButtonTestId ?? VARIANT_CONFIG[props.variant].defaults.followButtonTestId,
);
const followingChipTestId = computed(
  () => props.followingChipTestId ?? VARIANT_CONFIG[props.variant].defaults.followingChipTestId,
);

const variantClasses = computed(() => VARIANT_CONFIG[props.variant]);

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
