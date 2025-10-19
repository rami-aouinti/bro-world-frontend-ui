<template>
  <aside class="crm-sidebar" aria-label="Panneau des informations CRM">
    <section class="crm-sidebar__section">
      <header class="crm-sidebar__header">
        <div>
          <h2>Mes projets</h2>
          <p>Vos initiatives actives pour le sprint sélectionné.</p>
        </div>
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi:plus"
          class="text-none font-weight-semibold"
          @click="$emit('create-project')"
        >
          Nouveau projet
        </v-btn>
      </header>

      <div v-if="projects.length === 0" class="crm-sidebar__empty">
        <v-icon icon="mdi:briefcase-outline" size="32" class="mb-3" />
        <p>Aucun projet ne vous est attribué pour l’instant.</p>
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi:plus"
          class="text-none font-weight-semibold"
          @click="$emit('create-project')"
        >
          Créer un projet
        </v-btn>
      </div>
      <ul v-else class="crm-sidebar__project-list">
        <li
          v-for="project in projects"
          :key="project.id"
          class="crm-sidebar__project-item"
        >
          <div class="crm-sidebar__project-avatar" :style="{ backgroundColor: project.color }" aria-hidden="true">
            {{ project.key.slice(0, 2) }}
          </div>
          <div class="crm-sidebar__project-content">
            <p class="crm-sidebar__project-name">{{ project.name }}</p>
            <span class="crm-sidebar__project-key">{{ project.key }}</span>
          </div>
          <span class="crm-sidebar__project-badge">{{ project.taskCount }}</span>
        </li>
      </ul>
    </section>

    <section class="crm-sidebar__section">
      <header class="crm-sidebar__header">
        <div>
          <h2>Derniers tasks</h2>
          <p>Les tâches les plus récemment créées.</p>
        </div>
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi:clipboard-plus"
          class="text-none font-weight-semibold"
          :disabled="projects.length === 0"
          @click="$emit('create-task')"
        >
          Nouveau task
        </v-btn>
      </header>

      <div v-if="recentTasks.length === 0" class="crm-sidebar__empty">
        <v-icon icon="mdi:clipboard-text-outline" size="32" class="mb-3" />
        <p>Aucune tâche récente. Créez-en une pour démarrer votre sprint.</p>
      </div>
      <ul v-else class="crm-sidebar__task-list">
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
            {{ task.assigneeInitials || 'NA' }}
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
    </section>
  </aside>
</template>

<script setup lang="ts">
import type { CrmBoardTaskPriority } from "~/stores/crm-board";

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
  background: white;
  border-radius: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.25);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
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
}

.crm-sidebar__header p {
  margin: 0.3rem 0 0;
  font-size: 0.85rem;
  color: rgb(100 116 139);
}

.crm-sidebar__empty {
  text-align: center;
  color: rgb(100 116 139);
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
  border-radius: 0.9rem;
  display: grid;
  place-items: center;
  color: white;
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
  color: rgb(15 23 42);
}

.crm-sidebar__project-key,
.crm-sidebar__task-meta {
  font-size: 0.8rem;
  color: rgb(100 116 139);
}

.crm-sidebar__project-badge {
  background: rgba(15, 23, 42, 0.08);
  color: rgb(15 23 42);
  font-weight: 600;
  border-radius: 999px;
  padding: 0.25rem 0.8rem;
}

.crm-sidebar__task-priority {
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}
</style>
