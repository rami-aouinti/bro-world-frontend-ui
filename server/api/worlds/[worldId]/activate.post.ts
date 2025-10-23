import { createWorldMembershipEnvelope, resolveWorldMembershipRequest } from "~/server/utils/worlds/membership";

export default defineEventHandler(async (event) => {
  const worldId = await resolveWorldMembershipRequest(event);
  return createWorldMembershipEnvelope(worldId);
});
