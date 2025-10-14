<template>
  <teleport to="body">
    <transition name="fade-scale">
      <div
        v-if="modelValue"
        class="login-dialog__overlay"
        aria-modal="true"
        role="dialog"
        :aria-label="title"
        @keydown="handleKeydown"
        @click="handleOverlayClick"
      >
        <div
          ref="dialogRef"
          class="login-dialog__content"
          tabindex="-1"
          @click.stop
        >
          <header class="login-dialog__header">
            <div class="login-dialog__title-group">
              <h2 class="login-dialog__title">{{ title }}</h2>
              <p
                v-if="description"
                class="login-dialog__description"
              >
                {{ description }}
              </p>
            </div>
            <button
              type="button"
              class="login-dialog__close"
              :aria-label="closeLabel"
              @click="emitClose"
            >
              <span
                aria-hidden="true"
                class="mdi mdi-close"
              />
            </button>
          </header>
          <div class="login-dialog__body">
            <AuthLoginForm variant="compact" />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  modelValue: boolean;
  title: string;
  description?: string;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
  (event: "close"): void;
}>();

const { t } = useI18n();

const AuthLoginForm = defineAsyncComponent({
  loader: () => import("~/components/auth/LoginForm.vue"),
  suspensible: false,
});

const dialogRef = ref<HTMLDivElement | null>(null);
const closeLabel = computed(() => {
  const label = t("common.close");

  return label === "common.close" ? "Close" : label;
});

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      nextTick(() => {
        dialogRef.value?.focus({ preventScroll: true });
      });
    }
  },
);

function emitClose() {
  emit("update:modelValue", false);
  emit("close");
}

function handleOverlayClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emitClose();
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

.login-dialog__overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(2, 6, 23, 0.75);
  backdrop-filter: blur(8px);
}

.login-dialog__content {
  width: 100%;
  max-width: 420px;
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.92));
  color: rgb(241 245 249);
  box-shadow: 0 25px 80px -20px rgba(15, 23, 42, 0.75);
  padding: 1.75rem;
  outline: none;
}

.login-dialog__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.login-dialog__title-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.login-dialog__title {
  font-size: 1.5rem;
  font-weight: 700;
}

.login-dialog__description {
  font-size: 0.95rem;
  color: rgb(148 163 184);
}

.login-dialog__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.6);
  color: inherit;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

.login-dialog__close:hover {
  transform: translateY(-1px);
  border-color: rgba(236, 72, 153, 0.45);
  background: rgba(236, 72, 153, 0.12);
}

.login-dialog__close:focus-visible {
  outline: 2px solid rgba(236, 72, 153, 0.75);
  outline-offset: 2px;
}

.login-dialog__body {
  margin-top: 1.5rem;
}
</style>
