import { computed } from "vue";
import { useRuntimeConfig, useState } from "#imports";

import { defineStore } from "~/lib/pinia-shim";
import { resolveApiFetcher } from "~/lib/api/fetcher";
import { crmTasksMock } from "~/lib/mock/crm-tasks";

export interface CrmTask {
  id: string;
  projectId: string;
  name: string;
  brief?: string | null;
  description?: string | null;
  status?: string | null;
  startDate?: string | null;
  finishDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  __optimistic?: boolean;
}

export interface CrmTaskCreatePayload {
  name: string;
  brief?: string | null;
  description?: string | null;
  status?: string | null;
  startDate?: string | null;
  finishDate?: string | null;
}

interface CrmTasksListResponse {
  data?: unknown;
  message?: string | null;
}

interface CrmTaskResponse {
  data?: unknown;
  message?: string | null;
}

interface ListTasksOptions {
  force?: boolean;
  params?: Record<string, unknown>;
}

const CACHE_TTL = 30_000;
const MOCK_REQUEST_DELAY = 160;

function sanitizeErrorMessage(message: string): string {
  const trimmed = message.trim();

  if (!trimmed) {
    return "";
  }

  const normalized = trimmed.toLowerCase();
  const looksLikeHtml =
    normalized.startsWith("<!doctype html") ||
    normalized.startsWith("<html") ||
    normalized.includes("<body");

  return looksLikeHtml ? "" : trimmed;
}

function ensureString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function normalizeDate(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    const parsed = Date.parse(trimmed);

    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }

    return trimmed;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }

  return null;
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message ?? "";
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object" && error !== null) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string") {
      return message;
    }

    if (Array.isArray(message)) {
      for (const item of message) {
        const extracted = extractErrorMessage(item);
        if (extracted.trim()) {
          return extracted;
        }
      }
    }
  }

  return "";
}

function waitForMockDelay(delay = MOCK_REQUEST_DELAY): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

function normalizeTask(candidate: unknown): CrmTask | null {
  if (typeof candidate !== "object" || candidate === null) {
    return null;
  }

  const input = candidate as Record<string, unknown>;
  const id = ensureString(input.id);
  const projectId = ensureString(input.projectId);
  const name = ensureString(input.name);

  if (!id || !projectId || !name) {
    return null;
  }

  return {
    id,
    projectId,
    name,
    brief: ensureString(input.brief),
    description: ensureString(input.description),
    status: ensureString(input.status),
    startDate: normalizeDate(input.startDate),
    finishDate: normalizeDate(input.finishDate),
    createdAt: normalizeDate(input.createdAt),
    updatedAt: normalizeDate(input.updatedAt),
    __optimistic: Boolean((input.__optimistic as boolean | undefined) ?? false),
  };
}

function buildOptimisticTask(projectId: string, payload: CrmTaskCreatePayload): CrmTask {
  const now = new Date().toISOString();
  const name = ensureString(payload.name) ?? "";

  return {
    id: `temp-${now}-${Math.random().toString(36).slice(2)}`,
    projectId,
    name,
    brief: ensureString(payload.brief),
    description: ensureString(payload.description),
    status: ensureString(payload.status) ?? "todo",
    startDate: normalizeDate(payload.startDate),
    finishDate: normalizeDate(payload.finishDate),
    createdAt: now,
    updatedAt: now,
    __optimistic: true,
  };
}

function generateMockTaskId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildMockTask(projectId: string, payload: CrmTaskCreatePayload): CrmTask {
  const now = new Date().toISOString();
  const name = ensureString(payload.name) ?? "";

  return {
    id: generateMockTaskId(),
    projectId,
    name,
    brief: ensureString(payload.brief),
    description: ensureString(payload.description),
    status: ensureString(payload.status) ?? "todo",
    startDate: normalizeDate(payload.startDate),
    finishDate: normalizeDate(payload.finishDate),
    createdAt: now,
    updatedAt: now,
    __optimistic: false,
  };
}

function loadMockTasks(): CrmTask[] {
  return crmTasksMock.map((entry) => ({
    id: entry.id,
    projectId: entry.projectId,
    name: entry.name,
    brief: entry.brief,
    description: entry.description,
    status: entry.status,
    startDate: normalizeDate(entry.startDate),
    finishDate: normalizeDate(entry.finishDate),
    createdAt: normalizeDate(entry.createdAt),
    updatedAt: normalizeDate(entry.updatedAt),
    __optimistic: false,
  }));
}

function createParamsKey(params: Record<string, unknown> | undefined): string {
  if (!params) {
    return "";
  }

  try {
    const entries = Object.entries(params)
      .map(([key, value]) => [key, typeof value === "string" ? value.trim() : value])
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB, undefined, { sensitivity: "base" }));

    return JSON.stringify(Object.fromEntries(entries));
  } catch {
    return "";
  }
}

export const useCrmTasksStore = defineStore("crm-tasks", () => {
  const items = useState<Record<string, CrmTask[]>>("crm-tasks:items", () => ({}));
  const pending = useState<Record<string, boolean>>("crm-tasks:pending", () => ({}));
  const error = useState<Record<string, string | null>>("crm-tasks:error", () => ({}));
  const creating = useState<Record<string, boolean>>("crm-tasks:creating", () => ({}));
  const createError = useState<Record<string, string | null>>("crm-tasks:create-error", () => ({}));
  const lastFetched = useState<Record<string, number | null>>("crm-tasks:last-fetched", () => ({}));
  const lastParams = useState<Record<string, string | null>>("crm-tasks:last-params", () => ({}));
  const runtimeConfig = useRuntimeConfig();
  const envMockFlag =
    typeof process !== "undefined" ? process.env?.NUXT_PUBLIC_CRM_TASKS_USE_MOCKS : undefined;
  const configMockFlag = runtimeConfig.public?.crmTasks?.useMocks;
  const useMockData = ((): boolean => {
    if (typeof envMockFlag !== "undefined") {
      return envMockFlag === "1" || envMockFlag === "true" || envMockFlag === true;
    }

    if (typeof configMockFlag !== "undefined") {
      if (typeof configMockFlag === "boolean") {
        return configMockFlag;
      }

      if (typeof configMockFlag === "string") {
        const normalized = configMockFlag.trim().toLowerCase();
        return ["1", "true", "yes", "on"].includes(normalized);
      }
    }

    return true;
  })();
  const mockTasks = useState<CrmTask[]>("crm-tasks:mock-data", () => loadMockTasks());

  const tasks = computed(() => items.value);
  const pendingState = computed(() => pending.value);
  const errorState = computed(() => error.value);
  const creatingState = computed(() => creating.value);
  const createErrorState = computed(() => createError.value);

  function setTasks(projectId: string, tasksForProject: CrmTask[]) {
    items.value = {
      ...items.value,
      [projectId]: tasksForProject,
    };
  }

  function upsertTask(task: CrmTask, position = 0) {
    const list = items.value[task.projectId] ? [...items.value[task.projectId]] : [];
    const existingIndex = list.findIndex((item) => item.id === task.id);

    if (existingIndex !== -1) {
      list.splice(existingIndex, 1);
    }

    list.splice(position, 0, task);
    setTasks(task.projectId, list);
  }

  function removeTask(task: CrmTask) {
    const list = items.value[task.projectId] ? [...items.value[task.projectId]] : [];
    const nextList = list.filter((item) => item.id !== task.id);
    setTasks(task.projectId, nextList);
  }

  async function listTasks(projectId: string, options: ListTasksOptions = {}) {
    const trimmedId = projectId?.trim();
    if (!trimmedId) {
      return [] as CrmTask[];
    }

    if (pending.value[trimmedId]) {
      return items.value[trimmedId] ?? [];
    }

    const paramsKey = createParamsKey(options.params);
    const now = Date.now();
    const lastFetchedAt = lastFetched.value[trimmedId] ?? null;
    const lastParamsKey = lastParams.value[trimmedId] ?? null;

    if (
      !options.force &&
      typeof lastFetchedAt === "number" &&
      now - lastFetchedAt < CACHE_TTL &&
      lastParamsKey === paramsKey
    ) {
      return items.value[trimmedId] ?? [];
    }

    pending.value = { ...pending.value, [trimmedId]: true };
    error.value = { ...error.value, [trimmedId]: null };

    if (useMockData) {
      try {
        await waitForMockDelay();
        const tasksForProject = mockTasks.value
          .filter((task) => task.projectId === trimmedId)
          .map((task) => ({ ...task, __optimistic: false }));
        setTasks(trimmedId, tasksForProject);
        lastFetched.value = { ...lastFetched.value, [trimmedId]: now };
        lastParams.value = { ...lastParams.value, [trimmedId]: paramsKey };
        return tasksForProject;
      } finally {
        pending.value = { ...pending.value, [trimmedId]: false };
      }
    }

    const fetcher = resolveApiFetcher();
    const crud = fetcher.crud(`/projects/${trimmedId}/tasks`);

    try {
      const response = await crud.list<CrmTasksListResponse>(options.params);
      const data = Array.isArray(response?.data as unknown[]) ? (response?.data as unknown[]) : [];
      const tasksForProject = data
        .map((candidate) => normalizeTask(candidate))
        .filter((task): task is CrmTask => Boolean(task))
        .map((task) => ({ ...task, __optimistic: false }));
      setTasks(trimmedId, tasksForProject);
      lastFetched.value = { ...lastFetched.value, [trimmedId]: now };
      lastParams.value = { ...lastParams.value, [trimmedId]: paramsKey };
      return tasksForProject;
    } catch (caughtError) {
      const message =
        sanitizeErrorMessage(extractErrorMessage(caughtError)) ||
        sanitizeErrorMessage((caughtError as { message?: string } | null)?.message ?? "") ||
        "Unable to load tasks.";
      error.value = { ...error.value, [trimmedId]: message };
      throw new Error(message);
    } finally {
      pending.value = { ...pending.value, [trimmedId]: false };
    }
  }

  async function createTask(projectId: string, payload: CrmTaskCreatePayload): Promise<CrmTask> {
    const trimmedId = projectId?.trim();
    if (!trimmedId) {
      throw new Error("A project must be selected to create a task.");
    }

    const normalizedName = ensureString(payload.name);
    if (!normalizedName) {
      throw new Error("The task name is required.");
    }

    creating.value = { ...creating.value, [trimmedId]: true };
    createError.value = { ...createError.value, [trimmedId]: null };

    const optimisticTask = buildOptimisticTask(trimmedId, payload);
    upsertTask(optimisticTask);

    if (useMockData) {
      try {
        await waitForMockDelay();
        const mockTask = buildMockTask(trimmedId, payload);
        upsertTask({ ...mockTask, __optimistic: false });
        mockTasks.value = [mockTask, ...mockTasks.value.filter((task) => task.id !== mockTask.id)];
        return mockTask;
      } catch (caughtError) {
        const message =
          sanitizeErrorMessage(extractErrorMessage(caughtError)) || "Unable to create task.";
        createError.value = { ...createError.value, [trimmedId]: message };
        removeTask(optimisticTask);
        throw new Error(message);
      } finally {
        creating.value = { ...creating.value, [trimmedId]: false };
      }
    }

    const fetcher = resolveApiFetcher();
    const crud = fetcher.crud(`/projects/${trimmedId}/tasks`);

    try {
      const response = await crud.create<CrmTaskResponse, CrmTaskCreatePayload>(payload);
      const task = normalizeTask(response?.data);

      if (!task) {
        throw new Error("Invalid task response.");
      }

      const normalizedTask = { ...task, __optimistic: false };
      upsertTask(normalizedTask);
      return normalizedTask;
    } catch (caughtError) {
      const message =
        sanitizeErrorMessage(extractErrorMessage(caughtError)) ||
        sanitizeErrorMessage((caughtError as { message?: string } | null)?.message ?? "") ||
        "Unable to create task.";
      createError.value = { ...createError.value, [trimmedId]: message };
      removeTask(optimisticTask);
      throw new Error(message);
    } finally {
      creating.value = { ...creating.value, [trimmedId]: false };
    }
  }

  function getTasks(projectId: string | null | undefined): CrmTask[] {
    const trimmedId = projectId?.trim();
    if (!trimmedId) {
      return [];
    }

    return items.value[trimmedId] ?? [];
  }

  function getError(projectId: string | null | undefined): string | null {
    const trimmedId = projectId?.trim();
    if (!trimmedId) {
      return null;
    }

    return error.value[trimmedId] ?? null;
  }

  function getCreateError(projectId: string | null | undefined): string | null {
    const trimmedId = projectId?.trim();
    if (!trimmedId) {
      return null;
    }

    return createError.value[trimmedId] ?? null;
  }

  function isPending(projectId: string | null | undefined): boolean {
    const trimmedId = projectId?.trim();
    if (!trimmedId) {
      return false;
    }

    return Boolean(pending.value[trimmedId]);
  }

  function isCreating(projectId: string | null | undefined): boolean {
    const trimmedId = projectId?.trim();
    if (!trimmedId) {
      return false;
    }

    return Boolean(creating.value[trimmedId]);
  }

  function reset(projectId?: string) {
    if (typeof projectId === "string" && projectId.trim()) {
      const trimmedId = projectId.trim();
      const { [trimmedId]: _removedItems, ...restItems } = items.value;
      const { [trimmedId]: _removedPending, ...restPending } = pending.value;
      const { [trimmedId]: _removedError, ...restError } = error.value;
      const { [trimmedId]: _removedCreating, ...restCreating } = creating.value;
      const { [trimmedId]: _removedCreateError, ...restCreateError } = createError.value;
      const { [trimmedId]: _removedFetched, ...restFetched } = lastFetched.value;
      const { [trimmedId]: _removedParams, ...restParams } = lastParams.value;

      items.value = restItems;
      pending.value = restPending;
      error.value = restError;
      creating.value = restCreating;
      createError.value = restCreateError;
      lastFetched.value = restFetched;
      lastParams.value = restParams;
      return;
    }

    items.value = {};
    pending.value = {};
    error.value = {};
    creating.value = {};
    createError.value = {};
    lastFetched.value = {};
    lastParams.value = {};

    if (useMockData) {
      mockTasks.value = loadMockTasks();
    }
  }

  return {
    tasks,
    pending: pendingState,
    error: errorState,
    creating: creatingState,
    createError: createErrorState,
    listTasks,
    createTask,
    getTasks,
    getError,
    getCreateError,
    isPending,
    isCreating,
    reset,
  };
});
