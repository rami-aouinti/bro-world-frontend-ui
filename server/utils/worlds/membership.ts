import { createError, getRouterParam, readBody } from "h3";
import type { H3Event } from "h3";
import type { WorldMembershipRequestPayload } from "~/types/world-membership";

export interface WorldMembershipEnvelope {
  data: {
    worldId: string;
    status: string;
    role: string;
    isOwner: boolean;
    updatedAt: string;
  };
}

export function normalizeWorldId(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function resolveWorldMembershipRequest(event: H3Event): Promise<string> {
  const paramId = normalizeWorldId(getRouterParam(event, "worldId"));

  if (!paramId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing world identifier",
    });
  }

  const body = await readBody<WorldMembershipRequestPayload | null>(event);
  const bodyId = normalizeWorldId(body?.worldId);

  if (body && !bodyId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid world identifier",
    });
  }

  if (bodyId && bodyId !== paramId) {
    throw createError({
      statusCode: 400,
      statusMessage: "World identifier mismatch",
    });
  }

  return paramId;
}

export function createWorldMembershipEnvelope(worldId: string): WorldMembershipEnvelope {
  return {
    data: {
      worldId,
      status: "active",
      role: "member",
      isOwner: false,
      updatedAt: new Date().toISOString(),
    },
  } satisfies WorldMembershipEnvelope;
}
