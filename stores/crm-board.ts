import { computed } from "vue";
import { useState } from "#imports";

import { defineStore } from "~/lib/pinia-shim";
import {
  crmBoardCurrentUserId,
  crmBoardProjectsMock,
  crmBoardSprintsMock,
  crmBoardTasksMock,
  crmBoardUsersMock,
  type CrmBoardProjectMockEntry,
  type CrmBoardSprintMockEntry,
  type CrmBoardTaskMockEntry,
  type CrmBoardTaskPriority as MockTaskPriority,
  type CrmBoardTaskStatus as MockTaskStatus,
  type CrmBoardUserMockEntry,
} from "~/lib/mock/crm-board";

export type CrmBoardTaskStatus = MockTaskStatus;
export type CrmBoardTaskPriority = MockTaskPriority;

export interface CrmBoardUser extends CrmBoardUserMockEntry {}

export interface CrmBoardProject extends CrmBoardProjectMockEntry {}

export interface CrmBoardSprint extends CrmBoardSprintMockEntry {}

export interface CrmBoardTask extends CrmBoardTaskMockEntry {}

export interface CreateProjectPayload {
  name: string;
  key: string;
  color: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  projectId: string;
  sprintId: string;
  assigneeId?: string | null;
  priority: CrmBoardTaskPriority;
  dueDate?: string | null;
}

function normalizeHexColor(candidate: string): string {
  const value = (candidate ?? "").trim();
  if (!value) {
    throw new Error("La couleur du projet est requise.");
  }

  const prefixed = value.startsWith("#") ? value : `#${value}`;
  const hex = prefixed.toUpperCase();
  if (!/^#([0-9A-F]{6}|[0-9A-F]{3})$/.test(hex)) {
    throw new Error("Le format de la couleur doit être un code hexadécimal valide.");
  }

  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }

  return hex;
}

function normalizeProjectKey(candidate: string): string {
  const value = (candidate ?? "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6);
  if (value.length < 2) {
    throw new Error("La clé projet doit comporter entre 2 et 6 lettres.");
  }
  return value;
}

function ensureNonEmpty(value: string | null | undefined, message: string): string {
  if (typeof value !== "string") {
    throw new Error(message);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(message);
  }
  return trimmed;
}

function toIsoDate(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const timestamp = Date.parse(trimmed);
  if (!Number.isNaN(timestamp)) {
    return new Date(timestamp).toISOString();
  }
  return trimmed;
}

function generateProjectId(): string {
  return `crm-prj-${Math.random().toString(36).slice(2, 8)}`;
}

function generateTaskId(): string {
  return `crm-task-${Math.random().toString(36).slice(2, 10)}`;
}

export const useCrmBoardStore = defineStore("crm-board", () => {
  const usersState = useState<CrmBoardUser[]>("crm-board:users", () => [...crmBoardUsersMock]);
  const projectsState = useState<CrmBoardProject[]>("crm-board:projects", () => [...crmBoardProjectsMock]);
  const sprintsState = useState<CrmBoardSprint[]>("crm-board:sprints", () => [...crmBoardSprintsMock]);
  const tasksState = useState<CrmBoardTask[]>("crm-board:tasks", () => [...crmBoardTasksMock]);
  const currentUserIdState = useState<string | null>("crm-board:current-user-id", () => crmBoardCurrentUserId);
  const activeSprintIdState = useState<string | null>("crm-board:active-sprint-id", () => {
    const activeSprint = crmBoardSprintsMock.find((sprint) => sprint.isActive);
    return activeSprint?.id ?? crmBoardSprintsMock[0]?.id ?? null;
  });

  const users = computed(() => usersState.value);
  const projects = computed(() => projectsState.value);
  const sprints = computed(() => sprintsState.value);
  const tasks = computed(() => tasksState.value);
  const activeSprintId = computed(() => activeSprintIdState.value);
  const currentUser = computed(() => {
    const id = currentUserIdState.value;
    return usersState.value.find((user) => user.id === id) ?? null;
  });

  const projectsById = computed(() =>
    projectsState.value.reduce<Record<string, CrmBoardProject>>((accumulator, project) => {
      accumulator[project.id] = project;
      return accumulator;
    }, {}),
  );

  const usersById = computed(() =>
    usersState.value.reduce<Record<string, CrmBoardUser>>((accumulator, user) => {
      accumulator[user.id] = user;
      return accumulator;
    }, {}),
  );

  const tasksForActiveSprint = computed(() => {
    const sprintId = activeSprintIdState.value;
    if (!sprintId) {
      return [] as CrmBoardTask[];
    }
    return tasksState.value.filter((task) => task.sprintId === sprintId);
  });

  const projectsForCurrentUser = computed(() => {
    const userId = currentUserIdState.value;
    if (!userId) {
      return [] as CrmBoardProject[];
    }
    return projectsState.value
      .filter((project) => project.ownerId === userId)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  });

  const recentTasks = computed(() => {
    const tasksCopy = [...tasksState.value];
    tasksCopy.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    return tasksCopy;
  });

  function setActiveSprint(sprintId: string) {
    const trimmed = sprintId?.trim();
    if (!trimmed) {
      return;
    }
    const exists = sprintsState.value.some((sprint) => sprint.id === trimmed);
    if (exists) {
      activeSprintIdState.value = trimmed;
    }
  }

  function moveTask(taskId: string, status: CrmBoardTaskStatus, beforeTaskId: string | null = null): boolean {
    const sprintId = activeSprintIdState.value;
    if (!sprintId) {
      return false;
    }

    const tasksCopy = tasksState.value.map((task) => ({ ...task }));
    const taskIndex = tasksCopy.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) {
      return false;
    }

    const task = tasksCopy[taskIndex];
    if (task.sprintId !== sprintId) {
      return false;
    }

    const previousStatus = task.status;

    const sprintTasks = tasksCopy.filter((candidate) => candidate.sprintId === sprintId && candidate.id !== taskId);

    const previousColumn = sprintTasks
      .filter((candidate) => candidate.status === previousStatus)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    previousColumn.forEach((candidate, index) => {
      candidate.order = index + 1;
    });

    const targetColumn = sprintTasks
      .filter((candidate) => candidate.status === status)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    let insertIndex = targetColumn.length;
    if (beforeTaskId) {
      const index = targetColumn.findIndex((candidate) => candidate.id === beforeTaskId);
      if (index !== -1) {
        insertIndex = index;
      }
    }

    targetColumn.splice(insertIndex, 0, { ...task, status });
    targetColumn.forEach((candidate, index) => {
      candidate.order = index + 1;
    });

    const unchangedColumns = sprintTasks
      .filter((candidate) => candidate.status !== previousStatus && candidate.status !== status)
      .map((candidate) => ({ ...candidate }));

    const updatedSprintTasks = [
      ...unchangedColumns,
      ...(previousStatus !== status ? previousColumn : []),
      ...targetColumn,
    ];
    const otherSprintTasks = tasksCopy.filter((candidate) => candidate.sprintId !== sprintId);

    tasksState.value = [...otherSprintTasks, ...updatedSprintTasks];
    return true;
  }

  function createProject(payload: CreateProjectPayload): CrmBoardProject {
    const name = ensureNonEmpty(payload.name, "Le nom du projet est requis.");
    const key = normalizeProjectKey(payload.key);
    const color = normalizeHexColor(payload.color);
    const ownerId = currentUserIdState.value;
    if (!ownerId) {
      throw new Error("Aucun utilisateur connecté n'a été identifié.");
    }

    const now = new Date().toISOString();
    const project: CrmBoardProject = {
      id: generateProjectId(),
      name,
      key,
      color,
      ownerId,
      createdAt: now,
    };

    projectsState.value = [project, ...projectsState.value];
    return project;
  }

  function createTask(payload: CreateTaskPayload): CrmBoardTask {
    const title = ensureNonEmpty(payload.title, "Le titre de la tâche est requis.");
    const projectId = ensureNonEmpty(payload.projectId, "Le projet est requis.");
    const sprintId = ensureNonEmpty(payload.sprintId, "Le sprint est requis.");

    const projectExists = projectsState.value.some((project) => project.id === projectId);
    if (!projectExists) {
      throw new Error("Le projet sélectionné est introuvable.");
    }

    const sprintExists = sprintsState.value.some((sprint) => sprint.id === sprintId);
    if (!sprintExists) {
      throw new Error("Le sprint sélectionné est introuvable.");
    }

    const dueDate = toIsoDate(payload.dueDate ?? null);
    const normalizedAssignee = payload.assigneeId?.trim() || undefined;
    const normalizedPriority = payload.priority ?? "Medium";
    const description = (payload.description ?? "").trim() || undefined;

    const columnTasks = tasksState.value
      .filter((task) => task.sprintId === sprintId && task.status === "todo")
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const shiftedColumn = columnTasks.map((task) => ({ ...task, order: task.order + 1 }));

    const now = new Date().toISOString();
    const task: CrmBoardTask = {
      id: generateTaskId(),
      title,
      description,
      projectId,
      sprintId,
      assigneeId: normalizedAssignee,
      status: "todo",
      priority: normalizedPriority,
      dueDate,
      createdAt: now,
      order: 1,
    };

    const remainingTasks = tasksState.value.filter(
      (existing) => existing.sprintId !== sprintId || existing.status !== "todo",
    );

    tasksState.value = [...remainingTasks, ...shiftedColumn, task];

    if (activeSprintIdState.value !== sprintId) {
      activeSprintIdState.value = sprintId;
    }

    return task;
  }

  function taskCountForProjectInSprint(projectId: string, sprintId: string | null): number {
    if (!sprintId) {
      return 0;
    }
    return tasksState.value.filter(
      (task) => task.projectId === projectId && task.sprintId === sprintId,
    ).length;
  }

  return {
    users,
    usersById,
    projects,
    projectsById,
    projectsForCurrentUser,
    sprints,
    tasks,
    tasksForActiveSprint,
    activeSprintId,
    currentUser,
    recentTasks,
    setActiveSprint,
    moveTask,
    createProject,
    createTask,
    taskCountForProjectInSprint,
  };
});
