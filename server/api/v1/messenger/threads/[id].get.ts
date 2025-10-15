import { createError } from "h3";
import { getConversation } from "../../../../utils/messenger/data";

export default defineEventHandler((event) => {
  const id = event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing conversation identifier",
      data: { message: "A conversation identifier is required." },
    });
  }

  const payload = getConversation(id, { initialMessagesLimit: 20 });

  if (!payload) {
    throw createError({
      statusCode: 404,
      statusMessage: "Conversation not found",
      data: { message: "The requested conversation could not be located." },
    });
  }

  return {
    data: {
      ...payload.conversation,
      messages: payload.messages,
    },
  };
});
