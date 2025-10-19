<template>
  <main class="crm-index" aria-labelledby="crm-index-heading">
    <v-container fluid class="py-10 px-6 px-md-10">
      <header class="crm-index__header">
        <div class="crm-index__header-text">
          <h1 id="crm-index-heading">CRM — Index</h1>
          <p>
            Visualisez vos tâches de sprint, organisez-les par statut et accédez rapidement à vos projets.
          </p>
        </div>
        <div class="crm-index__header-actions">
          <v-select
            :model-value="activeSprintId"
            :items="sprintSelectItems"
            label="Sprint"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="comfortable"
            color="primary"
            prepend-inner-icon="mdi:flag-checkered"
            class="crm-index__sprint-select"
            @update:model-value="handleSprintChange"
          />
          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="mdi:clipboard-plus"
            class="text-none font-weight-semibold"
            :disabled="projectOptionsForTasks.length === 0"
            @click="openTaskDialog"
          >
            Nouveau task
          </v-btn>
          <v-btn
            variant="tonal"
            color="primary"
            class="text-none font-weight-semibold"
            :prepend-icon="showInlineSidebar ? 'mdi:eye-off-outline' : 'mdi:view-sidebar'"
            @click="handleToggleSidebar"
          >
            {{ showInlineSidebar ? 'Masquer panneau' : 'Afficher panneau' }}
          </v-btn>
        </div>
      </header>

      <section class="crm-index__content">
        <CrmKanbanBoard
          class="crm-index__board"
          :tasks="kanbanTasks"
          :projects-by-id="projectMap"
          :users-by-id="userMap"
          @move="handleMoveTask"
        />

        <SidebarRight
          v-if="showInlineSidebar"
          class="crm-index__sidebar"
          :projects="projectSummaries"
          :recent-tasks="recentTaskSummaries"
          @create-project="openProjectDialog"
          @create-task="openTaskDialog"
        />
      </section>
    </v-container>

    <v-navigation-drawer
      v-model="isSidebarDrawerOpen"
      location="right"
      temporary
      width="360"
      scrim
    >
      <SidebarRight
        :projects="projectSummaries"
        :recent-tasks="recentTaskSummaries"
        @create-project="openProjectDialog"
        @create-task="openTaskDialog"
      />
    </v-navigation-drawer>

    <NewProjectDialog
      v-model="isProjectDialogOpen"
      :loading="isCreatingProject"
      :error="projectError"
      @submit="handleCreateProject"
    />
    <NewTaskDialog
      v-model="isTaskDialogOpen"
      :projects="projectOptionsForTasks"
      :sprints="sprintOptionsForDialog"
      :users="userOptionsForDialog"
      :default-project-id="defaultTaskProjectId"
      :default-sprint-id="activeSprintId"
      :loading="isCreatingTask"
      :error="taskError"
      @submit="handleCreateTask"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useDisplay } from "vuetify";

import CrmKanbanBoard from "~/components/crm/kanban/CrmKanbanBoard.vue";
import SidebarRight from "~/components/crm/SidebarRight.vue";
import NewProjectDialog from "~/components/crm/dialogs/NewProjectDialog.vue";
import NewTaskDialog from "~/components/crm/dialogs/NewTaskDialog.vue";
import {
  useCrmBoardStore,
  type CrmBoardProject,
  type CrmBoardTaskPriority,
  type CrmBoardTaskStatus,
  type CrmBoardUser,
} from "~/stores/crm-board";

const board = useCrmBoardStore();
const display = useDisplay();

const isSidebarVisible = ref(true);
const isSidebarDrawerOpen = ref(false);
const isProjectDialogOpen = ref(false);
const isTaskDialogOpen = ref(false);
const isCreatingProject = ref(false);
const isCreatingTask = ref(false);
const projectError = ref<string | null>(null);
const taskError = ref<string | null>(null);

const activeSprintId = computed(() => board.activeSprintId.value);
const kanbanTasks = computed(() => board.tasksForActiveSprint.value);
const projectMap = computed(() => board.projectsById.value);
const userMap = computed(() => board.usersById.value);

const sprintSelectItems = computed(() =>
  board.sprints.value.map((sprint) => ({
    label: sprint.name,
    value: sprint.id,
  })),
);

const projectSummaries = computed(() =>
  board.projectsForCurrentUser.value.map((project) => ({
    id: project.id,
    name: project.name,
    key: project.key || project.name.slice(0, 3).toUpperCase(),
    color: project.color || "#64748b",
    taskCount: board.taskCountForProjectInSprint(project.id, activeSprintId.value),
  })),
);

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

function formatDueDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return null;
  }
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(timestamp);
}

const recentTaskSummaries = computed(() => {
  const tasks = board.recentTasks.value.slice(0, 6);
  return tasks.map((task) => {
    const project = projectMap.value[task.projectId] as CrmBoardProject | undefined;
    const assignee = userMap.value[task.assigneeId ?? ""] as CrmBoardUser | undefined;
    const priorityMeta = resolvePriorityMeta(task.priority);
    return {
      id: task.id,
      title: task.title,
      projectName: project?.name ?? "Projet inconnu",
      dueDateLabel: formatDueDate(task.dueDate ?? null),
      priority: task.priority,
      priorityColor: priorityMeta.color,
      priorityTextColor: priorityMeta.text,
      assigneeInitials: assignee?.initials ?? null,
      assigneeColor: assignee?.avatarColor ?? null,
    };
  });
});

const projectOptionsForTasks = computed(() =>
  board.projectsForCurrentUser.value.map((project) => ({
    id: project.id,
    name: project.name,
    key: project.key || project.name.slice(0, 3).toUpperCase(),
  })),
);

const sprintOptionsForDialog = computed(() =>
  board.sprints.value.map((sprint) => ({
    id: sprint.id,
    name: sprint.name,
  })),
);

const userOptionsForDialog = computed(() =>
  board.users.value.map((user) => ({
    id: user.id,
    name: user.name,
    initials: user.initials,
  })),
);

const defaultTaskProjectId = computed(() => projectOptionsForTasks.value[0]?.id ?? null);

const showInlineSidebar = computed(() => display.mdAndUp.value && isSidebarVisible.value);

watch(
  () => display.mdAndUp.value,
  (isDesktop) => {
    if (isDesktop) {
      isSidebarDrawerOpen.value = false;
    }
  },
);

function handleToggleSidebar() {
  if (display.mdAndUp.value) {
    isSidebarVisible.value = !isSidebarVisible.value;
  } else {
    isSidebarDrawerOpen.value = true;
  }
}

function handleSprintChange(sprintId: string) {
  if (sprintId) {
    board.setActiveSprint(sprintId);
  }
}

function handleMoveTask(payload: { taskId: string; status: CrmBoardTaskStatus; beforeTaskId: string | null }) {
  board.moveTask(payload.taskId, payload.status, payload.beforeTaskId);
}

function openProjectDialog() {
  projectError.value = null;
  isProjectDialogOpen.value = true;
}

function openTaskDialog() {
  taskError.value = null;
  if (!projectOptionsForTasks.value.length) {
    openProjectDialog();
    return;
  }
  isTaskDialogOpen.value = true;
}

async function handleCreateProject(payload: { name: string; key: string; color: string }) {
  projectError.value = null;
  isCreatingProject.value = true;
  try {
    board.createProject(payload);
    isProjectDialogOpen.value = false;
  } catch (error) {
    projectError.value = error instanceof Error ? error.message : String(error ?? "");
  } finally {
    isCreatingProject.value = false;
  }
}

async function handleCreateTask(payload: {
  title: string;
  description?: string;
  projectId: string;
  sprintId: string;
  priority: CrmBoardTaskPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
}) {
  taskError.value = null;
  isCreatingTask.value = true;
  try {
    board.createTask(payload);
    isTaskDialogOpen.value = false;
    isSidebarDrawerOpen.value = false;
  } catch (error) {
    taskError.value = error instanceof Error ? error.message : String(error ?? "");
  } finally {
    isCreatingTask.value = false;
  }
}
</script>

<style scoped>
.crm-index {
  min-height: 100vh;
  background: linear-gradient(180deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 0.7) 100%);
}

.crm-index__header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

@media (min-width: 960px) {
  .crm-index__header {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }
}

.crm-index__header-text h1 {
  margin: 0 0 0.5rem;
  font-size: clamp(2rem, 3vw, 2.6rem);
  font-weight: 700;
  color: rgb(15 23 42);
}

.crm-index__header-text p {
  margin: 0;
  max-width: 560px;
  color: rgb(71 85 105);
  font-size: 1rem;
}

.crm-index__header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: flex-start;
}

.crm-index__sprint-select {
  min-width: 200px;
}

.crm-index__content {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.crm-index__board {
  flex: 1;
}

.crm-index__sidebar {
  flex-shrink: 0;
}

@media (max-width: 1280px) {
  .crm-index__content {
    flex-direction: column;
  }
}
</style>
