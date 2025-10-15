import { createError, getQuery } from "h3";
import { getConversationMessages } from "../../../../../utils/messenger/data";

function parseLimit(value: unknown): number {
  const parsed = Number.parseInt(typeof value === "string" ? value : "", 10);

  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return 50;
}

export default defineEventHandler((event) => {
  const id = event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing conversation identifier",
      data: { message: "A conversation identifier is required." },
    });
  }

  const query = getQuery(event);
  const limit = parseLimit(query.limit);
  const before = typeof query.before === "string" && query.before.trim() ? query.before : null;

  const result = getConversationMessages(id, limit, before);

  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: "Conversation not found",
      data: { message: "The requested conversation could not be located." },
    });
  }

  return {
    data: result.messages,
    hasMore: result.hasMore,
    nextBefore: result.nextBefore,
  };
});
