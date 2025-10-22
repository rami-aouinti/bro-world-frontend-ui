export type WorldMembershipStatus = "none" | "pending" | "active" | "denied";

export type WorldMembershipRole = "owner" | "admin" | "moderator" | "member" | "guest" | "viewer";

export interface WorldMembership {
  worldId: string;
  status: WorldMembershipStatus;
  role: WorldMembershipRole;
  isOwner: boolean;
  updatedAt: string | null;
}

export interface WorldMembershipResponse {
  data?: unknown;
}

export interface WorldMembershipRequestPayload {
  worldId: string;
}
