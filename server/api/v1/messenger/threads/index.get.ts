import { getQuery } from "h3";
import { listConversations } from "../../../../utils/messenger/data";

function parsePositiveInteger(value: unknown, fallback: number): number {
  const parsed = Number.parseInt(typeof value === "string" ? value : "", 10);

  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return fallback;
}

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const limit = parsePositiveInteger(query.limit, 50);
  const offsetRaw = Number.parseInt(typeof query.offset === "string" ? query.offset : "", 10);
  const offset = Number.isFinite(offsetRaw) && offsetRaw > 0 ? offsetRaw : 0;

  const { conversations, total } = listConversations(limit, offset);

  return {
    data: conversations,
    total,
    limit,
    offset,
  };
});
