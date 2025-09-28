<template>
  <div
    ref="panelRef"
    class="alert-panel"
    role="region"
    aria-live="polite"
    aria-label="Notifications"
  >
    <transition-group name="slide-fade" tag="div">
      <v-alert
        v-for="alert in queue"
        :key="alert.id"
        :ref="(el) => setAlertRef(alert.id, el as HTMLElement | null)"
        :type="alert.type"
        :title="alert.title"
        :role="alertRole(alert.type)"
        :aria-live="ariaLive(alert.type)"
        border="start"
        prominent
        density="comfortable"
        tabindex="-1"
        class="alert-panel__item"
      >
        <div class="alert-panel__content">
          <div class="alert-panel__message">{{ alert.message }}</div>
          <div v-if="alert.actions?.length" class="alert-panel__actions">
            <v-btn
              v-for="(action, index) in alert.actions"
              :key="`${alert.id}-action-${index}`"
              variant="tonal"
              size="small"
              class="alert-panel__action"
              @click="handleAction(alert.id, action.onClick)"
            >
              {{ action.label }}
            </v-btn>
          </div>
          <v-btn
            class="alert-panel__close"
            icon
            variant="text"
            size="small"
            :aria-label="$t('common.close')"
            @click="close(alert.id)"
          >
            <Icon name="mdi-close" />
          </v-btn>
        </div>
      </v-alert>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import type { AlertAction, AlertType } from "~/types/alert-panel";
import type { AlertQueueItem } from "~/stores/useAlertPanel";
import { useAlertPanel } from "~/stores/useAlertPanel";

const store = useAlertPanel();
const queue = store.queue;

const panelRef = ref<HTMLElement | null>(null);
const alertRefs = new Map<string, HTMLElement>();
const previousFocus = ref<HTMLElement | null>(null);
const isClient = typeof window !== "undefined";

type AlertRef = HTMLElement | { $el?: HTMLElement | null } | null;

function resolveAlertElement(element: AlertRef) {
  if (!element) {
    return null;
  }

  if (element instanceof HTMLElement) {
    return element;
  }

  if (element.$el instanceof HTMLElement) {
    return element.$el;
  }

  return null;
}

function setAlertRef(id: string, element: AlertRef) {
  const resolved = resolveAlertElement(element);

  if (resolved) {
    alertRefs.set(id, resolved);
    return;
  }

  alertRefs.delete(id);
}

async function focusAlert(id: string) {
  if (!isClient) {
    return;
  }

  await nextTick();

  const element = alertRefs.get(id);

  if (!(element instanceof HTMLElement)) {
    return;
  }

  const activeElement = document.activeElement;

  if (activeElement instanceof HTMLElement) {
    if (!panelRef.value || !panelRef.value.contains(activeElement)) {
      previousFocus.value = activeElement;
    }
  } else {
    previousFocus.value = null;
  }

  element.focus({ preventScroll: true });
}

function alertRole(type: AlertType) {
  return type === "error" || type === "warning" ? "alert" : "status";
}

function ariaLive(type: AlertType) {
  return type === "error" || type === "warning" ? "assertive" : "polite";
}

function close(id: string) {
  store.remove(id);

  nextTick(() => {
    const nextAlert = queue.value[0];

    if (nextAlert) {
      void focusAlert(nextAlert.id);
      return;
    }

    const target = previousFocus.value;

    if (target?.isConnected) {
      target.focus({ preventScroll: true });
    }
  });
}

async function handleAction(id: string, action: AlertAction["onClick"]) {
  try {
    await action();
  } finally {
    void focusAlert(id);
  }
}

watch(
  queue,
  (next: AlertQueueItem[], prev: AlertQueueItem[] = []) => {
    const previousIds = new Set(prev.map((item) => item.id));
    const added = next.find((item) => !previousIds.has(item.id));

    if (added) {
      void focusAlert(added.id);
    }
  },
  { deep: false },
);

onBeforeUnmount(() => {
  alertRefs.clear();
});
</script>

<style scoped>
.alert-panel {
  position: fixed;
  inset-block-start: 80px;
  inset-inline-end: 16px;
  width: min(420px, calc(100vw - 24px));
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-panel__item {
  margin-block: 0 12px;
  box-shadow: var(--v-theme-shadow-2, 0 12px 32px rgba(15, 23, 42, 0.16));
  outline: none;
}

.alert-panel__item:focus-visible {
  outline: 2px solid rgba(var(--v-theme-primary), 0.8);
  outline-offset: 2px;
}

.alert-panel__content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.alert-panel__message {
  flex: 1;
  font-size: 0.95rem;
  line-height: 1.4;
}

.alert-panel__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.alert-panel__close {
  margin-inline-start: auto;
}

@media (max-width: 600px) {
  .alert-panel {
    inset-inline: 12px;
    inset-block-start: 72px;
    width: auto;
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
