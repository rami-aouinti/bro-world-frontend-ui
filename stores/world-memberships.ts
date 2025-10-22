import { computed } from "vue";
import { useState } from "#imports";
import { defineStore } from "~/lib/pinia-shim";
import { resolveApiFetcher } from "~/lib/api/fetcher";
import type { SiteSettings } from "~/types/settings";
import type {
  WorldMembership,
  WorldMembershipRequestPayload,
  WorldMembershipResponse,
  WorldMembershipRole,
  WorldMembershipStatus,
} from "~/types/world-membership";

type MembershipDictionary = Record<string, WorldMembership>;
type MembershipFlagDictionary = Record<string, boolean>;

interface MembershipApiPayload {
  worldId?: string | null;
  status?: string | null;
  role?: string | null;
  updatedAt?: string | null;
}

function normalizeWorldId(worldId: string | null | undefined): string | null {
  if (typeof worldId !== "string") {
    return null;
  }

  const trimmed = worldId.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function createDefaultMembership(worldId: string): WorldMembership {
  return {
    worldId,
    status: "none",
    role: "viewer",
    isOwner: false,
    updatedAt: null,
  } satisfies WorldMembership;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }

  return null;
}

function normalizeStatus(status: unknown, fallback: WorldMembershipStatus = "none"): WorldMembershipStatus {
  if (typeof status === "string") {
    const normalized = status.trim().toLowerCase();

    switch (normalized) {
      case "active":
      case "approved":
      case "accepted":
      case "member":
      case "joined":
        return "active";
      case "pending":
      case "requested":
      case "waiting":
        return "pending";
      case "denied":
      case "rejected":
      case "revoked":
        return "denied";
      case "none":
      case "invited":
      case "unknown":
      case "":
        return "none";
      default:
        return fallback;
    }
  }

  return fallback;
}

function normalizeRole(role: unknown, fallback: WorldMembershipRole = "viewer"): WorldMembershipRole {
  if (typeof role === "string") {
    const normalized = role.trim().toLowerCase();

    switch (normalized) {
      case "owner":
      case "creator":
        return "owner";
      case "admin":
      case "administrator":
        return "admin";
      case "moderator":
      case "mod":
        return "moderator";
      case "member":
      case "participant":
        return "member";
      case "guest":
        return "guest";
      case "viewer":
      case "observer":
        return "viewer";
      default:
        return fallback;
    }
  }

  return fallback;
}

function resolveApiPayload(response: unknown): MembershipApiPayload | null {
  const payload = toRecord(response);

  if (!payload) {
    return null;
  }

  if (payload.membership) {
    const membership = toRecord(payload.membership);

    if (membership) {
      return {
        worldId: membership.worldId as string | null | undefined,
        status: membership.status as string | null | undefined,
        role: membership.role as string | null | undefined,
        updatedAt: membership.updatedAt as string | null | undefined,
      } satisfies MembershipApiPayload;
    }
  }

  if (payload.data) {
    const nested = resolveApiPayload(payload.data);

    if (nested) {
      return nested;
    }
  }

  return {
    worldId: payload.worldId as string | null | undefined,
    status: payload.status as string | null | undefined,
    role: payload.role as string | null | undefined,
    updatedAt: payload.updatedAt as string | null | undefined,
  } satisfies MembershipApiPayload;
}

function normalizeMembership(
  payload: MembershipApiPayload | null,
  fallbackWorldId: string,
  current: WorldMembership | null,
): WorldMembership {
  if (!payload) {
    return current ?? createDefaultMembership(fallbackWorldId);
  }

  const worldId = normalizeWorldId(payload.worldId) ?? fallbackWorldId;
  const previous = current ?? createDefaultMembership(worldId);
  const resolvedRole = normalizeRole(payload.role, previous.role);
  const resolvedStatus = normalizeStatus(payload.status, previous.status);

  return {
    ...previous,
    worldId,
    role: resolvedRole,
    status: resolvedStatus,
    isOwner: previous.isOwner || resolvedRole === "owner",
    updatedAt: typeof payload.updatedAt === "string" ? payload.updatedAt : previous.updatedAt,
  } satisfies WorldMembership;
}

function applyPendingFlag(dictionary: MembershipFlagDictionary, key: string, value: boolean) {
  const next = { ...dictionary };

  if (value) {
    next[key] = true;
  } else {
    delete next[key];
  }

  return next;
}

export const useWorldMemberships = defineStore("worldMemberships", () => {
  const membershipState = useState<MembershipDictionary>("world-memberships", () => ({}));
  const activationPendingState = useState<MembershipFlagDictionary>(
    "world-memberships-activating",
    () => ({}),
  );
  const enteringPendingState = useState<MembershipFlagDictionary>(
    "world-memberships-entering",
    () => ({}),
  );
  const activeWorldIdsState = useState<string[]>("world-memberships-active", () => []);

  const memberships = computed(() => membershipState.value);
  const activeWorldIds = computed(() => activeWorldIdsState.value);

  function getMembership(worldId: string): WorldMembership {
    const key = normalizeWorldId(worldId);

    if (!key) {
      return createDefaultMembership("");
    }

    return membershipState.value[key] ?? createDefaultMembership(key);
  }

  function setMembership(worldId: string, update: Partial<WorldMembership>): WorldMembership {
    const key = normalizeWorldId(worldId);

    if (!key) {
      throw new Error("A valid world identifier is required to update membership data.");
    }

    const current = membershipState.value[key] ?? createDefaultMembership(key);
    const normalized = normalizeMembership(
      {
        worldId: key,
        status: update.status ?? current.status,
        role: update.role ?? current.role,
        updatedAt: update.updatedAt ?? current.updatedAt,
      },
      key,
      {
        ...current,
        isOwner: typeof update.isOwner === "boolean" ? update.isOwner : current.isOwner,
      },
    );

    membershipState.value = {
      ...membershipState.value,
      [key]: {
        ...normalized,
        status: update.status ? normalizeStatus(update.status, normalized.status) : normalized.status,
        role: update.role ? normalizeRole(update.role, normalized.role) : normalized.role,
        isOwner:
          typeof update.isOwner === "boolean"
            ? update.isOwner
            : normalized.isOwner || normalized.role === "owner",
      },
    } satisfies MembershipDictionary;

    return membershipState.value[key];
  }

  function applyMembershipResponse(worldId: string, response: unknown): WorldMembership {
    const key = normalizeWorldId(worldId);

    if (!key) {
      throw new Error("A world identifier is required.");
    }

    const payload = resolveApiPayload(response);
    const current = membershipState.value[key] ?? createDefaultMembership(key);
    const normalized = normalizeMembership(payload, key, current);

    membershipState.value = {
      ...membershipState.value,
      [key]: normalized,
    } satisfies MembershipDictionary;

    return normalized;
  }

  function markActive(worldId: string | null | undefined) {
    const key = normalizeWorldId(worldId);

    if (!key) {
      activeWorldIdsState.value = [];
      return;
    }

    activeWorldIdsState.value = [key];
  }

  function syncFromSiteSettings(settings: SiteSettings | null | undefined) {
    const worlds = settings?.worlds ?? [];

    if (!worlds.length) {
      activeWorldIdsState.value = [];
      return;
    }

    const normalizedEntries = worlds
      .map((world) => {
        const id = normalizeWorldId(world.id);
        return id ? ([id, world] as const) : null;
      })
      .filter((entry): entry is readonly [string, SiteSettings["worlds"][number]] => entry !== null);

    const worldById = new Map(normalizedEntries);
    const activeId = normalizeWorldId(settings?.activeWorldId);

    if (activeId && worldById.has(activeId)) {
      activeWorldIdsState.value = [activeId];
      return;
    }

    const [firstEntry] = normalizedEntries;
    activeWorldIdsState.value = firstEntry ? [firstEntry[0]] : [];
  }

  function isActivating(worldId: string): boolean {
    const key = normalizeWorldId(worldId);
    return Boolean(key && activationPendingState.value[key]);
  }

  function isEntering(worldId: string): boolean {
    const key = normalizeWorldId(worldId);
    return Boolean(key && enteringPendingState.value[key]);
  }

  async function activateWorld(worldId: string) {
    const key = normalizeWorldId(worldId);

    if (!key) {
      throw new Error("A world identifier is required to activate a membership.");
    }

    activationPendingState.value = applyPendingFlag(activationPendingState.value, key, true);

    const api = resolveApiFetcher();

    try {
      const response = await api<WorldMembershipResponse>(`/worlds/${encodeURIComponent(key)}/activate`, {
        method: "POST",
        data: { worldId: key } satisfies WorldMembershipRequestPayload,
      });

      const membership = applyMembershipResponse(key, response);
      markActive(key);
      return membership;
    } finally {
      activationPendingState.value = applyPendingFlag(activationPendingState.value, key, false);
    }
  }

  async function enterWorld(worldId: string) {
    const key = normalizeWorldId(worldId);

    if (!key) {
      throw new Error("A world identifier is required to enter a world.");
    }

    enteringPendingState.value = applyPendingFlag(enteringPendingState.value, key, true);

    const api = resolveApiFetcher();

    try {
      const response = await api<WorldMembershipResponse>(`/worlds/${encodeURIComponent(key)}/enter`, {
        method: "POST",
        data: { worldId: key } satisfies WorldMembershipRequestPayload,
      });

      if (response) {
        applyMembershipResponse(key, response);
      }
    } finally {
      enteringPendingState.value = applyPendingFlag(enteringPendingState.value, key, false);
    }
  }

  return {
    memberships,
    activeWorldIds,
    getMembership,
    setMembership,
    applyMembershipResponse,
    markActive,
    syncFromSiteSettings,
    isActivating,
    isEntering,
    activateWorld,
    enterWorld,
  };
});

export type { WorldMembership, WorldMembershipStatus, WorldMembershipRole };
