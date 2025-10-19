<template>
  <div class="kanban-board" role="list" aria-label="Kanban du sprint">
    <CrmKanbanColumn
      v-for="column in columns"
      :key="column.meta.status"
      :meta="column.meta"
      :tasks="column.tasks"
      :dragging-task-id="draggingTaskId"
      @move="handleMove"
      @drag-start="handleDragStart"
      @drag-end="handleDragEnd"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import CrmKanbanColumn from "~/components/crm/kanban/CrmKanbanColumn.vue";
import type { KanbanColumnMeta, KanbanDisplayTask } from "~/components/crm/kanban/types";
import type {
  CrmBoardProject,
  CrmBoardTask,
  CrmBoardTaskPriority,
  CrmBoardTaskStatus,
  CrmBoardUser,
} from "~/stores/crm-board";

const props = defineProps<{
  tasks: CrmBoardTask[];
  projectsById: Record<string, CrmBoardProject>;
  usersById: Record<string, CrmBoardUser>;
}>();

const emit = defineEmits<{
  move: [{ taskId: string; status: CrmBoardTaskStatus; beforeTaskId: string | null }];
}>();

const draggingTaskId = ref<string | null>(null);

const columnMetas: KanbanColumnMeta[] = [
  {
    status: "todo",
    title: "À faire",
    subtitle: "Prêt à être démarré",
    accentColor: "#0ea5e9",
    backgroundColor: "#e0f2fe",
    icon: "mdi:playlist-plus",
  },
  {
    status: "in-progress",
    title: "En cours",
    subtitle: "Tâches actives",
    accentColor: "#f97316",
    backgroundColor: "#ffedd5",
    icon: "mdi:progress-clock",
  },
  {
    status: "review",
    title: "Revue",
    subtitle: "En attente de validation",
    accentColor: "#a855f7",
    backgroundColor: "#f3e8ff",
    icon: "mdi:eye-check-outline",
  },
  {
    status: "done",
    title: "Terminé",
    subtitle: "Tâches finalisées",
    accentColor: "#22c55e",
    backgroundColor: "#dcfce7",
    icon: "mdi:check-circle",
  },
];

function resolvePriorityMeta(priority: CrmBoardTaskPriority) {
  switch (priority) {
    case "Urgent":
      return { color: "#dc2626", text: "#fef2f2" };
    case "High":
      return { color: "#f97316", text: "#fff7ed" };
    case "Medium":
      return { color: "#0284c7", text: "#e0f2fe" };
    case "Low":
    default:
      return { color: "#0f766e", text: "#ecfdf5" };
  }
}

function buildAssignee(user: CrmBoardUser | undefined) {
  if (!user) {
    return {
      name: null,
      initials: null,
      color: null,
    };
  }

  return {
    name: user.name,
    initials: user.initials,
    color: user.avatarColor,
  };
}

function formatDueDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return null;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(timestamp);
}

const columns = computed(() => {
  const grouped: Record<CrmBoardTaskStatus, KanbanDisplayTask[]> = {
    todo: [],
    "in-progress": [],
    review: [],
    done: [],
  };

  for (const task of props.tasks) {
    const project = props.projectsById[task.projectId];
    const assignee = buildAssignee(props.usersById[task.assigneeId ?? ""]);
    const priorityMeta = resolvePriorityMeta(task.priority);
    const dueDateLabel = formatDueDate(task.dueDate ?? null);

    grouped[task.status].push({
      id: task.id,
      title: task.title,
      projectName: project?.name ?? "Projet inconnu",
      projectKey: project?.key ?? "N/A",
      projectColor: project?.color ?? "#94a3b8",
      assigneeName: assignee.name,
      assigneeInitials: assignee.initials,
      assigneeColor: assignee.color,
      status: task.status,
      priority: task.priority,
      priorityColor: priorityMeta.color,
      priorityTextColor: priorityMeta.text,
      dueDateLabel,
      dueDateValue: task.dueDate ?? null,
      description: task.description,
      order: task.order,
      createdAt: task.createdAt,
    });
  }

  for (const status of Object.keys(grouped) as CrmBoardTaskStatus[]) {
    grouped[status].sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return Date.parse(a.createdAt) - Date.parse(b.createdAt);
    });
  }

  return columnMetas.map((meta) => ({
    meta,
    tasks: grouped[meta.status],
  }));
});

function handleMove(payload: { status: CrmBoardTaskStatus; taskId: string; beforeTaskId: string | null }) {
  emit("move", {
    taskId: payload.taskId,
    status: payload.status,
    beforeTaskId: payload.beforeTaskId,
  });
}

function handleDragStart(taskId: string) {
  draggingTaskId.value = taskId;
}

function handleDragEnd() {
  draggingTaskId.value = null;
}
</script>

<style scoped>
.kanban-board {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.5rem;
}

@media (max-width: 1280px) {
  .kanban-board {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .kanban-board {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
