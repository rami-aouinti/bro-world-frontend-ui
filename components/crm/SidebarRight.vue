<template>
  <SidebarCard
    class="text-card-foreground px-3 py-2"
    glow
  >
    <header class="crm-sidebar__header">
      <div>
        <h2>{{ t("pages.crm.sidebar.projects.title") }}</h2>
      </div>
      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi:plus"
        class="text-none font-weight-semibold"
        @click="$emit('create-project')"
      >
        {{ t("pages.crm.sidebar.projects.actions.new") }}
      </v-btn>
    </header>

    <div
      v-if="projects.length === 0"
      class="crm-sidebar__empty"
    >
      <v-icon
        icon="mdi:briefcase-outline"
        size="32"
        class="mb-3"
      />
      <p>{{ t("pages.crm.sidebar.projects.empty.description") }}</p>
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi:plus"
        class="text-none font-weight-semibold"
        @click="$emit('create-project')"
      >
        {{ t("pages.crm.sidebar.projects.actions.create") }}
      </v-btn>
    </div>
    <ul
      v-else
      class="crm-sidebar__project-list"
    >
      <li
        v-for="project in projects"
        :key="project.id"
        class="crm-sidebar__project-item"
      >
        <div
          class="crm-sidebar__project-avatar"
          :style="{ backgroundColor: project.color }"
          aria-hidden="true"
        >
          {{ project.key.slice(0, 2) }}
        </div>
        <div class="crm-sidebar__project-content">
          <p class="crm-sidebar__project-name">{{ project.name }}</p>
          <span class="crm-sidebar__project-key">{{ project.key }}</span>
        </div>
        <span class="crm-sidebar__project-badge">{{ project.taskCount }}</span>
      </li>
    </ul>
  </SidebarCard>

  <SidebarCard
    class="text-card-foreground px-3 py-2"
    glow
  >
    <header class="crm-sidebar__header">
      <div>
        <h2>{{ t("pages.crm.sidebar.tasks.title") }}</h2>
      </div>
      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi:clipboard-plus"
        class="text-none font-weight-semibold"
        :disabled="projects.length === 0"
        @click="$emit('create-task')"
      >
        {{ t("pages.crm.sidebar.tasks.actions.new") }}
      </v-btn>
    </header>

    <div
      v-if="recentTasks.length === 0"
      class="crm-sidebar__empty"
    >
      <v-icon
        icon="mdi:clipboard-text-outline"
        size="32"
        class="mb-3"
      />
      <p>{{ t("pages.crm.sidebar.tasks.empty.description") }}</p>
    </div>
    <ul
      v-else
      class="crm-sidebar__task-list"
    >
      <li
        v-for="task in recentTasks"
        :key="task.id"
        class="crm-sidebar__task-item"
      >
        <div
          class="crm-sidebar__task-avatar"
          :style="{ backgroundColor: task.assigneeColor || '#475569' }"
          aria-hidden="true"
        >
          {{ task.assigneeInitials || "NA" }}
        </div>
        <div class="crm-sidebar__task-content">
          <p class="crm-sidebar__task-title">{{ task.title }}</p>
          <span class="crm-sidebar__task-meta">
            {{ task.projectName }}
            <span v-if="task.dueDateLabel"> • {{ task.dueDateLabel }}</span>
          </span>
        </div>
        <span
          class="crm-sidebar__task-priority"
          :style="{ backgroundColor: task.priorityColor, color: task.priorityTextColor }"
        >
          {{ task.priority }}
        </span>
      </li>
    </ul>
  </SidebarCard>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import type { CrmBoardTaskPriority } from "~/stores/crm-board";
import SidebarCard from "~/components/layout/SidebarCard.vue";

type ProjectSummary = {
  id: string;
  name: string;
  key: string;
  color: string;
  taskCount: number;
};

type RecentTask = {
  id: string;
  title: string;
  projectName: string;
  dueDateLabel: string | null;
  priority: CrmBoardTaskPriority;
  priorityColor: string;
  priorityTextColor: string;
  assigneeInitials: string | null;
  assigneeColor: string | null;
};

const props = defineProps<{
  projects: ProjectSummary[];
  recentTasks: RecentTask[];
}>();

const emits = defineEmits<{
  "create-project": [];
  "create-task": [];
}>();

const { t } = useI18n();
</script>

<style scoped>
.crm-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 340px;
}

.crm-sidebar__section {
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.12), transparent 45%),
    rgba(var(--v-theme-surface), 0.9);
  border-radius: var(--ui-radius-lg);
  border: 1px solid rgba(var(--v-theme-outline-variant), 0.35);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: 0 18px 40px -24px rgba(var(--v-theme-shadow), 0.4);
}

.crm-sidebar__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.crm-sidebar__header h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.crm-sidebar__header p {
  margin: 0.3rem 0 0;
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), 0.65);
}

.crm-sidebar__empty {
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.65);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.crm-sidebar__project-list,
.crm-sidebar__task-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.crm-sidebar__project-item,
.crm-sidebar__task-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.crm-sidebar__project-avatar,
.crm-sidebar__task-avatar {
  width: 2.6rem;
  height: 2.6rem;
  border-radius: var(--ui-radius-md);
  display: grid;
  place-items: center;
  color: rgb(var(--v-theme-on-secondary));
  font-weight: 700;
  font-size: 0.95rem;
}

.crm-sidebar__project-content,
.crm-sidebar__task-content {
  flex: 1;
  min-width: 0;
}

.crm-sidebar__project-name,
.crm-sidebar__task-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.crm-sidebar__project-key,
.crm-sidebar__task-meta {
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.65);
}

.crm-sidebar__project-badge {
  background: rgba(var(--v-theme-secondary), 0.16);
  color: rgb(var(--v-theme-on-secondary));
  font-weight: 600;
  border-radius: var(--ui-radius-pill);
  padding: 0.25rem 0.8rem;
}

.crm-sidebar__task-priority {
  padding: 0.25rem 0.6rem;
  border-radius: var(--ui-radius-pill);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}
</style>
