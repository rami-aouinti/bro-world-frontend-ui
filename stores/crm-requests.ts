import { computed } from "vue";
import { useRuntimeConfig, useState } from "#imports";

import { defineStore } from "~/lib/pinia-shim";
import { crmRequestsMock, type CrmRequestMockEntry } from "~/lib/mock/crm-requests";

export interface CrmProjectRequest {
  id: string;
  projectId: string;
  requesterId: string;
  requesterName: string;
  role?: string | null;
  message?: string | null;
  status: "pending" | "approved" | "declined";
  submittedAt?: string | null;
}

interface ListRequestsOptions {
  force?: boolean;
}

const CACHE_TTL = 45_000;
const MOCK_DELAY = 140;

function wait(delay: number) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

function resolveRuntimeBooleanFlag(flag: unknown): boolean | undefined {
  if (typeof flag === "boolean") {
    return flag;
  }

  if (typeof flag === "number") {
    if (flag === 1) {
      return true;
    }

    if (flag === 0) {
      return false;
    }
  }

  if (typeof flag === "string") {
    const normalized = flag.trim().toLowerCase();

    if (!normalized) {
      return undefined;
    }

    if (["1", "true", "yes", "on"].includes(normalized)) {
      return true;
    }

    if (["0", "false", "no", "off"].includes(normalized)) {
      return false;
    }
  }

  return undefined;
}

function normalizeRequest(candidate: CrmRequestMockEntry): CrmProjectRequest {
  return {
    id: candidate.id,
    projectId: candidate.projectId,
    requesterId: candidate.requesterId,
    requesterName: candidate.requesterName,
    role: candidate.role,
    message: candidate.message,
    status: candidate.status,
    submittedAt: candidate.submittedAt,
  };
}

export const useCrmRequestsStore = defineStore("crm-requests", () => {
  const items = useState<Record<string, CrmProjectRequest[]>>("crm-requests:items", () => ({}));
  const pending = useState<Record<string, boolean>>("crm-requests:pending", () => ({}));
  const error = useState<Record<string, string | null>>("crm-requests:error", () => ({}));
  const processing = useState<Record<string, boolean>>("crm-requests:processing", () => ({}));
  const processError = useState<Record<string, string | null>>(
    "crm-requests:process-error",
    () => ({}),
  );
  const lastFetched = useState<Record<string, number | null>>(
    "crm-requests:last-fetched",
    () => ({}),
  );
  const runtimeConfig = useRuntimeConfig();
  const envMockFlag =
    typeof process !== "undefined" ? process.env?.NUXT_PUBLIC_CRM_REQUESTS_USE_MOCKS : undefined;
  const configMockFlag = resolveRuntimeBooleanFlag(runtimeConfig.public?.crmRequests?.useMocks);
  const globalMockFlag = resolveRuntimeBooleanFlag(runtimeConfig.public?.useMockData);
  const useMockData = ((): boolean => {
    if (typeof envMockFlag !== "undefined") {
      return envMockFlag === "1" || envMockFlag === "true" || envMockFlag === true;
    }

    if (typeof configMockFlag === "boolean") {
      return configMockFlag;
    }

    if (typeof globalMockFlag === "boolean") {
      return globalMockFlag;
    }

    return true;
  })();

  async function listRequests(projectId: string, options: ListRequestsOptions = {}) {
    const trimmedId = projectId?.trim();

    if (!trimmedId) {
      return [] as CrmProjectRequest[];
    }

    if (pending.value[trimmedId]) {
      return items.value[trimmedId] ?? [];
    }

    const now = Date.now();
    const lastFetchedAt = lastFetched.value[trimmedId] ?? null;

    if (!options.force && typeof lastFetchedAt === "number" && now - lastFetchedAt < CACHE_TTL) {
      return items.value[trimmedId] ?? [];
    }

    pending.value = { ...pending.value, [trimmedId]: true };
    error.value = { ...error.value, [trimmedId]: null };

    if (useMockData) {
      try {
        await wait(MOCK_DELAY);
        const requests = crmRequestsMock
          .filter((entry) => entry.projectId === trimmedId)
          .map((entry) => normalizeRequest(entry));

        items.value = {
          ...items.value,
          [trimmedId]: requests,
        };

        lastFetched.value = { ...lastFetched.value, [trimmedId]: now };
        return requests;
      } finally {
        pending.value = { ...pending.value, [trimmedId]: false };
      }
    }

    try {
      await wait(MOCK_DELAY);
      items.value = {
        ...items.value,
        [trimmedId]: [],
      };
      lastFetched.value = { ...lastFetched.value, [trimmedId]: now };
      return [] as CrmProjectRequest[];
    } catch (caughtError) {
      const message =
        (caughtError as { message?: string } | null)?.message?.toString()?.trim() ||
        "Unable to load project requests.";
      error.value = { ...error.value, [trimmedId]: message };
      throw new Error(message);
    } finally {
      pending.value = { ...pending.value, [trimmedId]: false };
    }
  }

  async function updateRequestStatus(
    projectId: string,
    requestId: string,
    status: "approved" | "declined",
  ) {
    const trimmedProjectId = projectId?.trim();
    const trimmedRequestId = requestId?.trim();

    if (!trimmedProjectId || !trimmedRequestId) {
      return;
    }

    const key = `${trimmedProjectId}:${trimmedRequestId}`;
    processing.value = { ...processing.value, [key]: true };
    processError.value = { ...processError.value, [key]: null };

    try {
      if (useMockData) {
        await wait(MOCK_DELAY);
        const existing = items.value[trimmedProjectId] ?? [];
        const updated = existing.map((request) =>
          request.id === trimmedRequestId ? { ...request, status } : request,
        );
        items.value = {
          ...items.value,
          [trimmedProjectId]: updated,
        };
        return;
      }

      await wait(MOCK_DELAY);
    } catch (caughtError) {
      const message =
        (caughtError as { message?: string } | null)?.message?.toString()?.trim() ||
        "Unable to update the request status.";
      processError.value = { ...processError.value, [key]: message };
      throw new Error(message);
    } finally {
      processing.value = { ...processing.value, [key]: false };
    }
  }

  const requests = computed(() => items.value);
  const pendingState = computed(() => pending.value);
  const errorState = computed(() => error.value);
  const processingState = computed(() => processing.value);
  const processErrorState = computed(() => processError.value);

  function getRequests(projectId: string): CrmProjectRequest[] {
    const trimmedId = projectId?.trim();

    if (!trimmedId) {
      return [];
    }

    return requests.value[trimmedId] ?? [];
  }

  function getRequest(projectId: string, requestId: string): CrmProjectRequest | null {
    const trimmedProjectId = projectId?.trim();
    const trimmedRequestId = requestId?.trim();

    if (!trimmedProjectId || !trimmedRequestId) {
      return null;
    }

    const list = requests.value[trimmedProjectId] ?? [];
    return list.find((request) => request.id === trimmedRequestId) ?? null;
  }

  return {
    requests,
    pending: pendingState,
    error: errorState,
    processing: processingState,
    processError: processErrorState,
    listRequests,
    approveRequest: (projectId: string, requestId: string) =>
      updateRequestStatus(projectId, requestId, "approved"),
    declineRequest: (projectId: string, requestId: string) =>
      updateRequestStatus(projectId, requestId, "declined"),
    getRequests,
    getRequest,
  };
});
