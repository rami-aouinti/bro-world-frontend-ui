<template>
  <section
    class="kanban-column"
    :class="{ 'kanban-column--active': isDragOver }"
    :aria-labelledby="columnLabelId"
    role="list"
    :style="{ '--kanban-column-accent': meta.backgroundColor }"
    @dragover.prevent="handleDragOver"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <header class="kanban-column__header">
      <div class="kanban-column__title">
        <div
          class="kanban-column__icon"
          :style="{ backgroundColor: meta.accentColor }"
          aria-hidden="true"
        >
          <v-icon
            :icon="meta.icon"
            size="20"
          />
        </div>
        <div>
          <h3 :id="columnLabelId">{{ meta.title }}</h3>
          <p>{{ meta.subtitle }}</p>
        </div>
      </div>
      <span class="kanban-column__badge">{{ tasks.length }}</span>
    </header>

    <ul class="kanban-column__list">
      <li
        v-for="task in tasks"
        :key="task.id"
        class="kanban-card"
        :class="{ 'kanban-card--dragging': draggingTaskId === task.id }"
        :data-task-id="task.id"
        role="listitem"
        tabindex="0"
        draggable="true"
        :aria-grabbed="draggingTaskId === task.id"
        @dragstart="handleDragStart($event, task.id)"
        @dragend="handleDragEnd"
      >
        <div class="kanban-card__header">
          <span
            class="kanban-card__priority"
            :style="{
              backgroundColor: task.priorityColor,
              color: task.priorityTextColor,
            }"
          >
            {{ task.priority }}
          </span>
          <span
            class="kanban-card__project"
            :style="{ color: task.projectColor }"
          >
            {{ task.projectKey }}
          </span>
        </div>
        <h4 class="kanban-card__title">{{ task.title }}</h4>
        <p class="kanban-card__subtitle">
          {{ task.projectName }}
        </p>
        <div class="kanban-card__footer">
          <div class="kanban-card__assignee">
            <div
              v-if="task.assigneeInitials"
              class="kanban-card__avatar"
              :style="{ backgroundColor: task.assigneeColor || 'rgb(var(--v-theme-secondary))' }"
              aria-hidden="true"
            >
              {{ task.assigneeInitials }}
            </div>
            <span class="kanban-card__assignee-name">
              {{ task.assigneeName || "Non assigné" }}
            </span>
          </div>
          <span
            v-if="task.dueDateLabel"
            class="kanban-card__due-date"
          >
            <v-icon
              icon="mdi:calendar"
              size="16"
              class="me-1"
            />
            {{ task.dueDateLabel }}
          </span>
        </div>
      </li>
    </ul>

    <div
      v-if="tasks.length === 0"
      class="kanban-column__empty"
    >
      <p>Déposez des tâches ici ou créez-en une nouvelle.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import { CRM_KANBAN_DRAG_TYPE } from "~/components/crm/kanban/constants";
import type { KanbanColumnMeta, KanbanDisplayTask } from "~/components/crm/kanban/types";

const props = defineProps<{
  meta: KanbanColumnMeta;
  tasks: KanbanDisplayTask[];
  draggingTaskId: string | null;
}>();

const emit = defineEmits<{
  move: [{ status: KanbanColumnMeta["status"]; taskId: string; beforeTaskId: string | null }];
  dragStart: [taskId: string];
  dragEnd: [];
}>();

const isDragOver = ref(false);
const columnLabelId = computed(() => `kanban-column-${props.meta.status}`);

function resetDragState() {
  isDragOver.value = false;
}

function handleDragStart(event: DragEvent, taskId: string) {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(CRM_KANBAN_DRAG_TYPE, taskId);
  }
  emit("dragStart", taskId);
}

function handleDragEnd(event: DragEvent) {
  event.dataTransfer?.clearData();
  emit("dragEnd");
  resetDragState();
}

function handleDragOver(event: DragEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
}

function handleDragEnter(event: DragEvent) {
  if (event.dataTransfer?.types.includes(CRM_KANBAN_DRAG_TYPE)) {
    isDragOver.value = true;
  }
}

function handleDragLeave(event: DragEvent) {
  const related = event.relatedTarget as HTMLElement | null;
  const current = event.currentTarget as HTMLElement | null;
  if (current && related && current.contains(related)) {
    return;
  }
  resetDragState();
}

function findNextTaskId(element: HTMLElement | null): string | null {
  let cursor = element?.nextElementSibling as HTMLElement | null;
  while (cursor) {
    const taskId = cursor.dataset.taskId;
    if (taskId) {
      return taskId;
    }
    cursor = cursor.nextElementSibling as HTMLElement | null;
  }
  return null;
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  const taskId = event.dataTransfer?.getData(CRM_KANBAN_DRAG_TYPE) ?? "";
  if (!taskId) {
    resetDragState();
    return;
  }

  const targetElement = (event.target as HTMLElement | null)?.closest<HTMLElement>(
    "[data-task-id]",
  );
  let beforeTaskId: string | null = null;

  if (targetElement) {
    const rect = targetElement.getBoundingClientRect();
    const middle = rect.top + rect.height / 2;
    if (event.clientY < middle) {
      beforeTaskId = targetElement.dataset.taskId ?? null;
    } else {
      beforeTaskId = findNextTaskId(targetElement);
    }
  }

  emit("move", { status: props.meta.status, taskId, beforeTaskId });
  resetDragState();
}
</script>

<style scoped>
.kanban-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background:
    linear-gradient(
      135deg,
      var(--kanban-column-accent, rgba(var(--v-theme-primary), 0.12)),
      transparent 55%
    ),
    rgba(var(--v-theme-surface), 0.88);
  border: 1px solid rgba(var(--v-theme-outline-variant), 0.35);
  border-radius: var(--ui-radius-lg);
  padding: 1.25rem;
  min-height: 420px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
  box-shadow: 0 18px 40px -26px rgba(var(--v-theme-shadow), 0.45);
}

.kanban-column--active {
  border-color: rgba(var(--v-theme-primary), 0.45);
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.18);
  transform: translateY(-2px);
}

.kanban-column__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.kanban-column__title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.kanban-column__title h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.kanban-column__title p {
  margin: 0.125rem 0 0;
  color: rgba(var(--v-theme-on-surface), 0.65);
  font-size: 0.85rem;
}

.kanban-column__icon {
  width: 2rem;
  height: 2rem;
  border-radius: var(--ui-radius-md);
  display: grid;
  place-items: center;
  color: rgb(var(--v-theme-on-primary));
}

.kanban-column__badge {
  background: rgba(var(--v-theme-secondary), 0.18);
  color: rgb(var(--v-theme-on-surface));
  font-weight: 600;
  border-radius: var(--ui-radius-pill);
  padding: 0.25rem 0.75rem;
  min-width: 2.25rem;
  text-align: center;
}

.kanban-column__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.kanban-card {
  background: rgba(var(--v-theme-surface), 0.95);
  border-radius: var(--ui-radius-md);
  border: 1px solid rgba(var(--v-theme-outline-variant), 0.35);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  cursor: grab;
  box-shadow: 0 12px 28px -18px rgba(var(--v-theme-shadow), 0.42);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.kanban-card:focus-visible {
  outline: var(--ui-focus);
  outline-offset: 3px;
}

.kanban-card:active {
  cursor: grabbing;
}

.kanban-card--dragging {
  opacity: 0.4;
}

.kanban-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.kanban-card__priority {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.6rem;
  border-radius: var(--ui-radius-pill);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.kanban-card__project {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.kanban-card__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.kanban-card__subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), 0.65);
}

.kanban-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.kanban-card__assignee {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.kanban-card__avatar {
  width: 2rem;
  height: 2rem;
  border-radius: var(--ui-radius-pill);
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
  display: grid;
  place-items: center;
}

.kanban-card__assignee-name {
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), 0.78);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.kanban-card__due-date {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}

.kanban-column__empty {
  border: 1px dashed rgba(var(--v-theme-outline), 0.45);
  border-radius: var(--ui-radius-md);
  padding: 1.5rem;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.65);
  font-size: 0.9rem;
}
</style>
