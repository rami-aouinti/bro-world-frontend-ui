import { createError, readBody } from "h3";
import { markConversationRead } from "../../../../../utils/messenger/data";

interface ReadBody {
  lastMessageId?: string;
}

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing conversation identifier",
      data: { message: "A conversation identifier is required." },
    });
  }

  const body = await readBody<ReadBody | null | undefined>(event);
  const lastMessageId = typeof body?.lastMessageId === "string" && body.lastMessageId.trim()
    ? body.lastMessageId
    : null;

  const updated = markConversationRead(id, lastMessageId);

  if (!updated) {
    throw createError({
      statusCode: 404,
      statusMessage: "Conversation not found",
      data: { message: "The requested conversation could not be located." },
    });
  }

  return { success: true };
});
