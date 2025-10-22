import { computed, reactive } from "vue";
import { defineStore } from "~/lib/pinia-shim";
import { resolveApiFetcher } from "~/lib/api/fetcher";
import type { SiteSettings } from "~/types/settings";

export type WorldMembershipStatus = "active" | "pending" | "rejected" | "revoked";

export interface WorldMembership {
  worldId: string;
  status: WorldMembershipStatus;
  createdAt: string;
  updatedAt: string;
}

function nowISOString(): string {
  return new Date().toISOString();
}

function normalizeTimestamp(value: unknown, fallback: string): string {
  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed) {
      const parsed = Date.parse(trimmed);

      if (!Number.isNaN(parsed)) {
        return new Date(parsed).toISOString();
      }
    }
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }

  return fallback;
}

function isMembershipStatus(value: unknown): value is WorldMembershipStatus {
  return value === "active" || value === "pending" || value === "rejected" || value === "revoked";
}

export const useWorldMembershipsStore = defineStore("world-memberships", () => {
  const memberships = reactive<Record<string, WorldMembership>>({});

  function upsertMembership(
    worldId: string,
    payload: Partial<Omit<WorldMembership, "worldId">> & { status?: WorldMembershipStatus },
  ): WorldMembership {
    if (!worldId) {
      throw new Error("World identifier is required to update membership.");
    }

    const existing = memberships[worldId] ?? null;
    const now = nowISOString();
    const createdAt = normalizeTimestamp(payload.createdAt, existing?.createdAt ?? now);
    const updatedAt = normalizeTimestamp(payload.updatedAt, now);
    const status = payload.status ?? existing?.status ?? "pending";

    const membership: WorldMembership = {
      worldId,
      status,
      createdAt,
      updatedAt,
    };

    memberships[worldId] = membership;

    return membership;
  }

  function markStatus(worldId: string, status: WorldMembershipStatus): WorldMembership {
    return upsertMembership(worldId, { status, updatedAt: nowISOString() });
  }

  function removeMembership(worldId: string) {
    if (worldId in memberships) {
      delete memberships[worldId];
    }
  }

  async function activateWorld(worldId: string) {
    if (!worldId) {
      return;
    }

    const previous = memberships[worldId] ?? null;
    const pending = markStatus(worldId, "pending");

    try {
      const api = resolveApiFetcher();
      const response = await api<
        | (WorldMembership & { data?: WorldMembership })
        | { data?: WorldMembership }
        | WorldMembership
        | null
      >(`/worlds/${encodeURIComponent(worldId)}/activate`, {
        method: "POST",
      });

      const payload =
        response && typeof response === "object" && "data" in response && response.data
          ? response.data
          : response;
      const status = isMembershipStatus((payload as WorldMembership | null)?.status)
        ? (payload as WorldMembership).status
        : "active";
      const createdAt = normalizeTimestamp((payload as WorldMembership | null)?.createdAt, pending.createdAt);
      const updatedAt = normalizeTimestamp((payload as WorldMembership | null)?.updatedAt, nowISOString());

      upsertMembership(worldId, { status, createdAt, updatedAt });
    } catch (error) {
      if (previous) {
        memberships[worldId] = { ...previous, updatedAt: nowISOString() };
      } else {
        upsertMembership(worldId, { status: "rejected" });
      }

      throw error;
    }
  }

  function markActive(worldId: string) {
    markStatus(worldId, "active");
  }

  function markRevoked(worldId: string) {
    markStatus(worldId, "revoked");
  }

  function syncFromSiteSettings(settings: SiteSettings | null | undefined) {
    const worlds = settings?.worlds ?? [];
    const allowedWorldIds = new Set(worlds.map((world) => world.id).filter((id): id is string => Boolean(id)));

    for (const worldId of Object.keys(memberships)) {
      if (!allowedWorldIds.has(worldId)) {
        removeMembership(worldId);
      }
    }

    const activeWorldId = settings?.activeWorldId;

    if (typeof activeWorldId === "string" && activeWorldId && allowedWorldIds.has(activeWorldId)) {
      markActive(activeWorldId);
    }
  }

  const activeMemberships = computed(() =>
    Object.values(memberships).filter((membership) => membership.status === "active"),
  );
  const activeWorldIds = computed(() => activeMemberships.value.map((membership) => membership.worldId));

  return {
    memberships,
    activeMemberships,
    activeWorldIds,
    activateWorld,
    markActive,
    markRevoked,
    syncFromSiteSettings,
    upsertMembership,
    removeMembership,
  };
});
