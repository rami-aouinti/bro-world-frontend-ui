import { ref } from "vue";
import { defineStore } from "~/lib/pinia-shim";
import type { AlertMessage } from "~/types/alert-panel";

interface AlertQueueItem extends AlertMessage {
  id: string;
  timeout: number | null;
}

type AlertTimer = ReturnType<typeof setTimeout>;

const DEFAULT_TIMEOUT = 5000;

function resolveTimeout(alert: AlertMessage) {
  if (alert.type === "error") {
    return null;
  }

  if (typeof alert.timeout === "number") {
    return alert.timeout;
  }

  return DEFAULT_TIMEOUT;
}

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
}

function normalizeAlert(alert: AlertMessage): AlertQueueItem {
  const timeout = resolveTimeout(alert);

  return {
    id: alert.id ?? generateId(),
    type: alert.type,
    message: alert.message,
    title: alert.title,
    actions: alert.actions,
    timeout,
  };
}

export const useAlertPanel = defineStore("alertPanel", () => {
  const queue = ref<AlertQueueItem[]>([]);
  const timers = new Map<string, AlertTimer>();

  function push(alert: AlertMessage) {
    const item = normalizeAlert(alert);

    queue.value = [item, ...queue.value];

    if (item.timeout && item.timeout > 0) {
      const timer = setTimeout(() => {
        remove(item.id);
      }, item.timeout);

      timers.set(item.id, timer);
    }

    return item.id;
  }

  function remove(id: string) {
    const timer = timers.get(id);

    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }

    queue.value = queue.value.filter((item) => item.id !== id);
  }

  function clear() {
    for (const timer of timers.values()) {
      clearTimeout(timer);
    }

    timers.clear();
    queue.value = [];
  }

  return {
    queue,
    push,
    remove,
    clear,
  };
});

export type { AlertQueueItem };
