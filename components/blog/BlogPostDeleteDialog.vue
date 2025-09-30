<template>
  <teleport to="body">
    <transition name="fade-scale">
      <div
          v-if="isVisible"
          class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur"
          role="alertdialog"
          :aria-label="title"
          aria-modal="true"
          @keydown="handleKeydown"
      >
        <div
            ref="dialogRef"
            class="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950/95 p-6 text-left text-slate-100 shadow-xl"
            tabindex="-1"
        >
          <header class="space-y-2">
            <h2 class="text-xl font-semibold text-rose-200">{{ title }}</h2>
            <p class="text-sm text-slate-400">{{ description }}</p>
          </header>
          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
                type="button"
                class="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-white/30 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                @click="emitClose"
            >
              {{ cancelLabel }}
            </button>
            <button
                type="button"
                class="inline-flex items-center justify-center rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="deleteLoading"
                @click="handleDelete"
            >
              <span v-if="deleteLoading" class="inline-flex items-center gap-2">
                <span class="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                <span>{{ confirmLabel }}</span>
              </span>
              <span v-else>{{ confirmLabel }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, toRef } from "vue";

import { usePostEditing } from "~/composables/usePostEditing";
import type { BlogPost } from "~/lib/mock/blog";

const props = defineProps<{
  post: BlogPost;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
}>();

const emit = defineEmits<{
  (event: "close"): void;
  (event: "deleted"): void;
}>();

const dialogRef = ref<HTMLDivElement | null>(null);
const isVisible = ref(true);

const { deleteLoading, handleDeletePost } = usePostEditing(toRef(props, "post"));

onMounted(() => {
  nextTick(() => {
    dialogRef.value?.focus();
  });
});

function emitClose() {
  if (!isVisible.value) {
    return;
  }

  isVisible.value = false;
  emit("close");
}

async function handleDelete() {
  const success = await handleDeletePost();

  if (success) {
    isVisible.value = false;
    emit("deleted");
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    event.preventDefault();
    emitClose();
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const container = dialogRef.value;

  if (!container) {
    return;
  }

  const focusable = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
  );

  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement as HTMLElement | null;

  if (event.shiftKey) {
    if (active === first || !active) {
      event.preventDefault();
      last.focus();
    }

    return;
  }

  if (active === last) {
    event.preventDefault();
    first.focus();
  }
}
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
