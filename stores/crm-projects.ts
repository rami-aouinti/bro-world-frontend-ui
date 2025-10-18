import { computed } from "vue";
import { useRuntimeConfig, useState } from "#imports";
import { defineStore } from "~/lib/pinia-shim";
import { resolveApiFetcher } from "~/lib/api/fetcher";
import { crmProjectsMock } from "~/lib/mock/crm-projects";

export interface CrmProject {
  id: string;
  name: string;
  description?: string | null;
  status?: string | null;
  stage?: string | null;
  priority?: string | null;
  pipeline?: string | null;
  ownerId?: string | null;
  ownerName?: string | null;
  clientName?: string | null;
  budget?: number | null;
  probability?: number | null;
  startDate?: string | null;
  dueDate?: string | null;
  finishDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  tags?: string[] | null;
  __optimistic?: boolean;
}

export interface CrmProjectCreatePayload {
  name: string;
  description?: string | null;
  status?: string | null;
  stage?: string | null;
  priority?: string | null;
  pipeline?: string | null;
  ownerId?: string | null;
  ownerName?: string | null;
  clientName?: string | null;
  budget?: number | null;
  probability?: number | null;
  startDate?: string | null;
  dueDate?: string | null;
  finishDate?: string | null;
  tags?: string[] | null;
}

interface CrmProjectsListMeta {
  total?: number | null;
  page?: number | null;
  pageSize?: number | null;
  perPage?: number | null;
  limit?: number | null;
}

interface CrmProjectsListResponse {
  data?: unknown;
  meta?: CrmProjectsListMeta | null;
  count?: number | null;
  total?: number | null;
  message?: string | null;
}

interface CrmProjectResponse {
  data?: unknown;
  message?: string | null;
}

interface ListProjectsOptions {
  force?: boolean;
  params?: Record<string, unknown>;
}

const CACHE_TTL = 60_000;
const HTML_TAG_PATTERN = /<\/?[a-z][^>]*>/i;
const MOCK_REQUEST_DELAY = 180;

function sanitizeErrorMessage(message: string): string {
  const trimmed = message.trim();

  if (!trimmed) {
    return "";
  }

  const normalized = trimmed.toLowerCase();
  const looksLikeHtml =
    normalized.startsWith("<!doctype html") ||
    normalized.startsWith("<html") ||
    normalized.includes("<body") ||
    HTML_TAG_PATTERN.test(trimmed);

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

function ensureNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function ensureStringArray(value: unknown): string[] | null {
  if (Array.isArray(value)) {
    const result = value
      .filter((item): item is string => typeof item === "string")
      .map((item) => ensureString(item))
      .filter((item): item is string => typeof item === "string");

    return result.length > 0 ? result : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    const result = trimmed
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    return result.length > 0 ? result : null;
  }

  return null;
}

function normalizeDate(value: unknown): string | null {
  if (typeof value === "string") {
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

  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }

  return null;
}

function resolveBooleanFlag(value: unknown, defaultValue: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) {
      return true;
    }

    if (value === 0) {
      return false;
    }
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "") {
      return defaultValue;
    }

    if (["1", "true", "yes", "on"].includes(normalized)) {
      return true;
    }

    if (["0", "false", "no", "off"].includes(normalized)) {
      return false;
    }
  }

  return defaultValue;
}

function extractErrorMessage(error: unknown): string {
  if (!error) {
    return "";
  }

  if (typeof error === "string") {
    return sanitizeErrorMessage(error);
  }

  if (error instanceof Error) {
    return sanitizeErrorMessage(error.message ?? "");
  }

  if (Array.isArray(error)) {
    for (const candidate of error) {
      const message = extractErrorMessage(candidate);
      if (message) {
        return message;
      }
    }
  }

  if (typeof error === "object") {
    const value = error as {
      message?: unknown;
      error?: unknown;
      errors?: unknown;
      data?: { message?: unknown } | null;
      response?: { data?: { message?: unknown } | null } | null;
    };

    const candidates: unknown[] = [
      value.message,
      value.error,
      value.data?.message,
      value.response?.data?.message,
      value.errors,
    ];

    for (const candidate of candidates) {
      const message = extractErrorMessage(candidate);
      if (message) {
        return message;
      }
    }
  }

  return "";
}

function normalizeProject(candidate: unknown): CrmProject | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const value = candidate as Record<string, unknown>;
  const id =
    ensureString(value.id) ??
    ensureString(value.uuid) ??
    ensureString(value.slug) ??
    ensureString(value.key);
  const name = ensureString(value.name) ?? ensureString(value.title);

  if (!id || !name) {
    return null;
  }

  const project: CrmProject = {
    id,
    name,
    description: ensureString(value.description),
    status: ensureString(value.status ?? value.state),
    stage: ensureString(value.stage ?? value.phase),
    priority: ensureString(value.priority),
    pipeline: ensureString(value.pipeline ?? value.pipelineId ?? value.pipeline_id),
    ownerId:
      ensureString(value.ownerId ?? value.owner_id ?? value.assigneeId ?? value.assignee_id) ??
      null,
    ownerName: ensureString(value.ownerName ?? value.owner_name),
    clientName: ensureString(value.clientName ?? value.client_name),
    budget: ensureNumber(value.budget ?? value.amount ?? value.value),
    probability: ensureNumber(value.probability ?? value.probabilityScore),
    startDate: normalizeDate(value.startDate ?? value.start_date ?? value.openedAt),
    dueDate: normalizeDate(value.dueDate ?? value.due_date ?? value.expectedCloseDate),
    finishDate: normalizeDate(
      value.finishDate ??
        value.finish_date ??
        value.closeDate ??
        value.close_date ??
        value.completedAt ??
        value.completed_at,
    ),
    createdAt: normalizeDate(value.createdAt ?? value.created_at ?? value.createdOn),
    updatedAt: normalizeDate(value.updatedAt ?? value.updated_at ?? value.modifiedOn),
    tags: ensureStringArray(value.tags ?? value.labels ?? value.categories),
    __optimistic: Boolean((value as CrmProject).__optimistic),
  };

  return project;
}

function createParamsKey(params?: Record<string, unknown>): string {
  if (!params) {
    return "";
  }

  try {
    const entries = Object.keys(params)
      .sort()
      .map((key) => [key, (params as Record<string, unknown>)[key]] as const);

    return JSON.stringify(Object.fromEntries(entries));
  } catch {
    return "";
  }
}

function buildOptimisticProject(payload: CrmProjectCreatePayload): CrmProject {
  const now = new Date().toISOString();
  const tags = ensureStringArray(payload.tags ?? null);

  return {
    id: `temp-${now}-${Math.random().toString(36).slice(2)}`,
    name: payload.name.trim(),
    description: ensureString(payload.description),
    status: ensureString(payload.status),
    stage: ensureString(payload.stage),
    priority: ensureString(payload.priority),
    pipeline: ensureString(payload.pipeline),
    ownerId: ensureString(payload.ownerId),
    ownerName: ensureString(payload.ownerName),
    clientName: ensureString(payload.clientName),
    budget: ensureNumber(payload.budget),
    probability: ensureNumber(payload.probability),
    startDate: normalizeDate(payload.startDate),
    dueDate: normalizeDate(payload.dueDate),
    finishDate: normalizeDate(payload.finishDate),
    createdAt: now,
    updatedAt: now,
    tags,
    __optimistic: true,
  };
}

function generateMockProjectId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function waitForMockDelay(delay = MOCK_REQUEST_DELAY): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

function buildMockProject(payload: CrmProjectCreatePayload): CrmProject {
  const now = new Date().toISOString();
  const tags = ensureStringArray(payload.tags ?? null);
  const name = ensureString(payload.name) ?? "";

  return {
    id: generateMockProjectId(),
    name,
    description: ensureString(payload.description),
    status: ensureString(payload.status),
    stage: ensureString(payload.stage),
    priority: ensureString(payload.priority),
    pipeline: ensureString(payload.pipeline),
    ownerId: ensureString(payload.ownerId),
    ownerName: ensureString(payload.ownerName),
    clientName: ensureString(payload.clientName),
    budget: ensureNumber(payload.budget),
    probability: ensureNumber(payload.probability),
    startDate: normalizeDate(payload.startDate),
    dueDate: normalizeDate(payload.dueDate),
    finishDate: normalizeDate(payload.finishDate),
    createdAt: now,
    updatedAt: now,
    tags,
    __optimistic: false,
  };
}

function loadMockProjects(): CrmProject[] {
  return crmProjectsMock
    .map((project) => normalizeProject(project))
    .filter((project): project is CrmProject => Boolean(project))
    .map((project) => ({ ...project, __optimistic: false }));
}

function updateMetaState(
  response: CrmProjectsListResponse | null,
  fallbackTotal: number,
): { total: number | null; meta: { page?: number; pageSize?: number } | null } {
  const resolvedTotal =
    ensureNumber(response?.meta?.total) ??
    ensureNumber(response?.meta?.count) ??
    ensureNumber(response?.total) ??
    ensureNumber(response?.count) ??
    fallbackTotal;

  const page =
    ensureNumber(response?.meta?.page) ??
    ensureNumber((response?.meta as Record<string, unknown> | null)?.currentPage) ??
    ensureNumber((response?.meta as Record<string, unknown> | null)?.current_page) ??
    null;

  const pageSize =
    ensureNumber(response?.meta?.pageSize) ??
    ensureNumber(response?.meta?.perPage) ??
    ensureNumber(response?.meta?.per_page) ??
    ensureNumber(response?.meta?.limit) ??
    null;

  const meta =
    page || pageSize ? { page: page ?? undefined, pageSize: pageSize ?? undefined } : null;

  return { total: resolvedTotal, meta };
}

export const useCrmProjectsStore = defineStore("crm-projects", () => {
  const items = useState<Record<string, CrmProject>>("crm-projects:items", () => ({}));
  const listIds = useState<string[]>("crm-projects:list-ids", () => []);
  const pending = useState<boolean>("crm-projects:pending", () => false);
  const error = useState<string | null>("crm-projects:error", () => null);
  const creating = useState<boolean>("crm-projects:creating", () => false);
  const createError = useState<string | null>("crm-projects:create-error", () => null);
  const lastFetched = useState<number | null>("crm-projects:last-fetched", () => null);
  const lastParamsKey = useState<string | null>("crm-projects:last-params", () => null);
  const total = useState<number | null>("crm-projects:total", () => null);
  const meta = useState<{ page?: number; pageSize?: number } | null>(
    "crm-projects:meta",
    () => null,
  );
  const runtimeConfig = useRuntimeConfig();
  const envMockFlag =
    typeof process !== "undefined" ? process.env?.NUXT_PUBLIC_CRM_PROJECTS_USE_MOCKS : undefined;
  const configMockFlag = runtimeConfig.public?.crmProjects?.useMocks;
  const useMockData = resolveBooleanFlag(
    typeof envMockFlag !== "undefined" ? envMockFlag : configMockFlag,
    true,
  );
  const mockProjects = useState<CrmProject[]>("crm-projects:mock-data", () => loadMockProjects());

  const projects = computed(() =>
    listIds.value
      .map((id) => items.value[id])
      .filter((project): project is CrmProject => Boolean(project)),
  );

  const isEmpty = computed(() => projects.value.length === 0);

  function setProjectsFromResponse(response: CrmProjectsListResponse) {
    const data = Array.isArray((response?.data as unknown[] | null) ?? [])
      ? (response.data as unknown[])
      : [];

    const nextItems: Record<string, CrmProject> = {};
    const nextIds: string[] = [];

    for (const candidate of data) {
      const project = normalizeProject(candidate);
      if (!project) {
        continue;
      }

      nextItems[project.id] = { ...project, __optimistic: false };
      nextIds.push(project.id);
    }

    items.value = nextItems;
    listIds.value = nextIds;

    const { total: resolvedTotal, meta: resolvedMeta } = updateMetaState(response, nextIds.length);
    total.value = resolvedTotal;
    meta.value = resolvedMeta;
  }

  function upsertProject(project: CrmProject, position?: number) {
    const index = listIds.value.indexOf(project.id);

    if (index !== -1) {
      listIds.value.splice(index, 1);
    }

    if (typeof position === "number" && position >= 0) {
      listIds.value.splice(position, 0, project.id);
    } else {
      listIds.value.unshift(project.id);
    }

    items.value = {
      ...items.value,
      [project.id]: project,
    };
  }

  function removeProject(id: string) {
    const index = listIds.value.indexOf(id);

    if (index !== -1) {
      listIds.value.splice(index, 1);
    }

    if (items.value[id]) {
      const { [id]: _removed, ...rest } = items.value;
      items.value = rest;
    }
  }

  function replaceProject(oldId: string, project: CrmProject) {
    const index = listIds.value.indexOf(oldId);
    removeProject(oldId);
    upsertProject(project, index >= 0 ? index : 0);
  }

  async function listProjects(options: ListProjectsOptions = {}) {
    if (pending.value) {
      return projects.value;
    }

    const paramsKey = createParamsKey(options.params);
    const now = Date.now();

    if (
      !options.force &&
      lastFetched.value &&
      now - lastFetched.value < CACHE_TTL &&
      lastParamsKey.value === paramsKey
    ) {
      return projects.value;
    }

    pending.value = true;
    error.value = null;

    if (useMockData) {
      try {
        await waitForMockDelay();
        const data = mockProjects.value.map((project) => ({ ...project, __optimistic: false }));
        setProjectsFromResponse({ data });
        lastFetched.value = now;
        lastParamsKey.value = paramsKey;
        return projects.value;
      } finally {
        pending.value = false;
      }
    }

    const fetcher = resolveApiFetcher();
    const crud = fetcher.crud("/projects");

    try {
      const response = await crud.list<CrmProjectsListResponse>(options.params);
      setProjectsFromResponse(response ?? { data: [] });
      lastFetched.value = now;
      lastParamsKey.value = paramsKey;
      return projects.value;
    } catch (caughtError) {
      const message =
        extractErrorMessage(caughtError) ||
        sanitizeErrorMessage((caughtError as { message?: string } | null)?.message ?? "") ||
        "Unable to load projects.";

      error.value = message;
      throw new Error(message);
    } finally {
      pending.value = false;
    }
  }

  async function createProject(payload: CrmProjectCreatePayload) {
    const trimmedName = ensureString(payload?.name);

    if (!trimmedName) {
      const message = "A project name is required.";
      createError.value = message;
      throw new Error(message);
    }

    creating.value = true;
    createError.value = null;

    const optimisticProject = buildOptimisticProject({ ...payload, name: trimmedName });
    upsertProject(optimisticProject);

    try {
      if (useMockData) {
        await waitForMockDelay();
        const mockProject = buildMockProject({ ...payload, name: trimmedName });
        mockProjects.value = [
          { ...mockProject, __optimistic: false },
          ...mockProjects.value.filter((project) => project.id !== mockProject.id),
        ];
        replaceProject(optimisticProject.id, { ...mockProject, __optimistic: false });
        total.value = mockProjects.value.length;
        return mockProject;
      }

      const fetcher = resolveApiFetcher();
      const crud = fetcher.crud("/projects");
      const response = await crud.create<CrmProjectResponse, CrmProjectCreatePayload>(payload);
      const project = normalizeProject(response?.data);

      if (!project) {
        throw new Error("Invalid project response.");
      }

      const normalizedProject = { ...project, __optimistic: false };
      replaceProject(optimisticProject.id, normalizedProject);

      if (typeof total.value === "number") {
        total.value += 1;
      }

      return normalizedProject;
    } catch (caughtError) {
      const message =
        extractErrorMessage(caughtError) ||
        sanitizeErrorMessage((caughtError as { message?: string } | null)?.message ?? "") ||
        "Unable to create project.";

      createError.value = message;
      removeProject(optimisticProject.id);
      throw new Error(message);
    } finally {
      creating.value = false;
    }
  }

  function getProject(id: string): CrmProject | null {
    const trimmed = id?.trim();
    if (!trimmed) {
      return null;
    }

    return items.value[trimmed] ?? null;
  }

  function reset() {
    items.value = {};
    listIds.value = [];
    pending.value = false;
    error.value = null;
    creating.value = false;
    createError.value = null;
    lastFetched.value = null;
    lastParamsKey.value = null;
    total.value = null;
    meta.value = null;
    if (useMockData) {
      mockProjects.value = loadMockProjects();
    }
  }

  return {
    projects,
    isEmpty,
    pending,
    error,
    creating,
    createError,
    total,
    meta,
    listProjects,
    createProject,
    getProject,
    reset,
  };
});
