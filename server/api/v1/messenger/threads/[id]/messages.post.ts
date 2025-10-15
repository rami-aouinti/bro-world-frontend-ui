import { createError, readBody } from "h3";
import type { MessengerAttachment } from "~/types/messenger";
import { addMessageFromCurrentUser } from "../../../../../utils/messenger/data";

interface SendMessageBody {
  content?: string;
  attachments?: MessengerAttachment[];
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

  const body = await readBody<SendMessageBody | null | undefined>(event);
  const content = body?.content?.toString().trim() ?? "";

  if (!content) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid message payload",
      data: { message: "Message content is required." },
    });
  }

  const attachments = Array.isArray(body?.attachments)
    ? (body.attachments as MessengerAttachment[]).map((attachment) => ({ ...attachment }))
    : [];

  const message = addMessageFromCurrentUser(id, content, attachments);

  if (!message) {
    throw createError({
      statusCode: 404,
      statusMessage: "Conversation not found",
      data: { message: "The requested conversation could not be located." },
    });
  }

  return message;
});
