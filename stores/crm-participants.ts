import { computed } from "vue";
import { useRuntimeConfig, useState } from "#imports";

import { defineStore } from "~/lib/pinia-shim";
import { crmParticipantsMock, type CrmParticipantMockEntry } from "~/lib/mock/crm-participants";

export interface CrmParticipant {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
  tasksCount?: number | null;
  joinedAt?: string | null;
}

interface ListParticipantsOptions {
  force?: boolean;
}

const CACHE_TTL = 30_000;
const MOCK_DELAY = 120;

function wait(delay: number) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

function normalizeParticipant(candidate: CrmParticipantMockEntry): CrmParticipant {
  return {
    id: candidate.id,
    projectId: candidate.projectId,
    userId: candidate.userId,
    name: candidate.name,
    role: candidate.role,
    email: candidate.email,
    phone: candidate.phone ?? null,
    tasksCount: typeof candidate.tasksCount === "number" ? candidate.tasksCount : null,
    joinedAt: candidate.joinedAt,
  };
}

export const useCrmParticipantsStore = defineStore("crm-participants", () => {
  const items = useState<Record<string, CrmParticipant[]>>("crm-participants:items", () => ({}));
  const pending = useState<Record<string, boolean>>("crm-participants:pending", () => ({}));
  const error = useState<Record<string, string | null>>("crm-participants:error", () => ({}));
  const removing = useState<Record<string, boolean>>("crm-participants:removing", () => ({}));
  const removeError = useState<Record<string, string | null>>("crm-participants:remove-error", () => ({}));
  const lastFetched = useState<Record<string, number | null>>("crm-participants:last-fetched", () => ({}));
  const runtimeConfig = useRuntimeConfig();
  const envMockFlag =
    typeof process !== "undefined" ? process.env?.NUXT_PUBLIC_CRM_PARTICIPANTS_USE_MOCKS : undefined;
  const configMockFlag = runtimeConfig.public?.crmParticipants?.useMocks;
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

  async function listParticipants(projectId: string, options: ListParticipantsOptions = {}) {
    const trimmedId = projectId?.trim();

    if (!trimmedId) {
      return [] as CrmParticipant[];
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
        const participants = crmParticipantsMock
          .filter((entry) => entry.projectId === trimmedId)
          .map((entry) => normalizeParticipant(entry));

        items.value = {
          ...items.value,
          [trimmedId]: participants,
        };

        lastFetched.value = { ...lastFetched.value, [trimmedId]: now };
        return participants;
      } finally {
        pending.value = { ...pending.value, [trimmedId]: false };
      }
    }

    try {
      // Placeholder for real API integration
      await wait(MOCK_DELAY);
      items.value = {
        ...items.value,
        [trimmedId]: [],
      };
      lastFetched.value = { ...lastFetched.value, [trimmedId]: now };
      return [] as CrmParticipant[];
    } catch (caughtError) {
      const message =
        (caughtError as { message?: string } | null)?.message?.toString()?.trim() ||
        "Unable to load project participants.";
      error.value = { ...error.value, [trimmedId]: message };
      throw new Error(message);
    } finally {
      pending.value = { ...pending.value, [trimmedId]: false };
    }
  }

  async function removeParticipant(projectId: string, userId: string) {
    const trimmedProjectId = projectId?.trim();
    const trimmedUserId = userId?.trim();

    if (!trimmedProjectId || !trimmedUserId) {
      return;
    }

    const key = `${trimmedProjectId}:${trimmedUserId}`;
    removing.value = { ...removing.value, [key]: true };
    removeError.value = { ...removeError.value, [key]: null };

    try {
      if (useMockData) {
        await wait(MOCK_DELAY);
        const existing = items.value[trimmedProjectId] ?? [];
        const updated = existing.filter((participant) => participant.userId !== trimmedUserId);
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
        "Unable to update project participants.";
      removeError.value = { ...removeError.value, [key]: message };
      throw new Error(message);
    } finally {
      removing.value = { ...removing.value, [key]: false };
    }
  }

  async function leaveProject(projectId: string, userId: string) {
    await removeParticipant(projectId, userId);
  }

  const participants = computed(() => items.value);
  const pendingState = computed(() => pending.value);
  const errorState = computed(() => error.value);
  const removingState = computed(() => removing.value);
  const removeErrorState = computed(() => removeError.value);

  function getParticipants(projectId: string): CrmParticipant[] {
    const trimmedId = projectId?.trim();
    if (!trimmedId) {
      return [];
    }

    return participants.value[trimmedId] ?? [];
  }

  function getParticipant(projectId: string, userId: string | null | undefined): CrmParticipant | null {
    const trimmedId = projectId?.trim();
    const trimmedUserId = userId?.trim();

    if (!trimmedId || !trimmedUserId) {
      return null;
    }

    const participantsForProject = participants.value[trimmedId] ?? [];
    return participantsForProject.find((participant) => participant.userId === trimmedUserId) ?? null;
  }

  return {
    participants,
    pending: pendingState,
    error: errorState,
    removing: removingState,
    removeError: removeErrorState,
    listParticipants,
    removeParticipant,
    leaveProject,
    getParticipants,
    getParticipant,
  };
});
