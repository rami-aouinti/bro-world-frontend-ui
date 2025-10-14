<template>
  <teleport to="body">
    <transition name="fade-scale">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur"
        aria-modal="true"
        role="dialog"
        :aria-label="title"
        @keydown="handleKeydown"
      >
        <div
          ref="dialogRef"
          class="w-full max-w-2xl border border-white/10 bg-slate-950/95 p-6 text-left text-slate-100 shadow-xl"
          style="border-radius: var(--ui-card-radius, calc(var(--radius, var(--ui-radius)) + 8px))"
          tabindex="-1"
        >
          <header class="space-y-1">
            <h2 class="text-xl font-semibold">{{ title }}</h2>
            <p class="text-sm text-slate-400">{{ description }}</p>
          </header>
          <form
            class="mt-6 space-y-5"
            @submit.prevent="handleSubmit"
          >
            <label class="flex flex-col gap-2 text-sm">
              <span class="font-medium text-slate-200">{{
                t("blog.posts.actions.fields.title")
              }}</span>
              <input
                ref="titleRef"
                v-model="editForm.title"
                type="text"
                class="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label class="flex flex-col gap-2 text-sm">
              <span class="font-medium text-slate-200">{{
                t("blog.posts.actions.fields.summary")
              }}</span>
              <textarea
                v-model="editForm.summary"
                class="min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label class="flex flex-col gap-2 text-sm">
              <span class="font-medium text-slate-200">{{
                t("blog.posts.actions.fields.content")
              }}</span>
              <textarea
                v-model="editForm.content"
                class="min-h-[180px] w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <div class="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-white/30 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                @click="emitClose"
              >
                {{ cancelLabel }}
              </button>
              <button
                type="submit"
                class="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="saveLoading"
              >
                <span
                  v-if="saveLoading"
                  class="inline-flex items-center gap-2"
                >
                  <span
                    class="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    aria-hidden="true"
                  />
                  <span>{{ saveLabel }}</span>
                </span>
                <span v-else>{{ saveLabel }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, toRef } from "vue";

import { useI18n } from "vue-i18n";

import { usePostEditing } from "~/composables/usePostEditing";
import type { BlogPost } from "~/lib/mock/blog";

const props = defineProps<{
  post: BlogPost;
  title: string;
  description: string;
  saveLabel: string;
  cancelLabel: string;
}>();

const emit = defineEmits<{
  (event: "close"): void;
  (event: "saved"): void;
}>();

const { t } = useI18n();

const dialogRef = ref<HTMLDivElement | null>(null);
const titleRef = ref<HTMLInputElement | null>(null);
const isVisible = ref(true);

const { editForm, saveLoading, handleSaveEdit, syncFormFromPost } = usePostEditing(
  toRef(props, "post"),
);

onMounted(() => {
  syncFormFromPost();

  nextTick(() => {
    titleRef.value?.focus();
  });
});

function emitClose() {
  if (!isVisible.value) {
    return;
  }

  isVisible.value = false;
  emit("close");
}

async function handleSubmit() {
  const success = await handleSaveEdit();

  if (success) {
    isVisible.value = false;
    emit("saved");
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
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
