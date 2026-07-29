import {
  findConversation,
  createConversation,
  updateLastMessage,
} from "../repositories/conversation.repository.js";

import ApiError from "../utils/ApiError.js";

import {
  createMessage,
  getMessagesBetweenUsers,
  markMessageDelivered,
  markMessageSeen,
  findMessageById,
  editMessage,
  deleteMessage,
} from "../repositories/message.repository.js";

export const sendMessageService = async ({ senderId, receiverId, text }) => {
  let conversation = await findConversation(senderId, receiverId);

  if (!conversation) {
    conversation = await createConversation([senderId, receiverId]);
  }

  const message = await createMessage({
    conversation: conversation._id,
    sender: senderId,
    receiver: receiverId,
    text,
  });

  await updateLastMessage(conversation._id, message._id);

  return message;
};

export const getMessagesService = async (senderId, receiverId) => {
  return await getMessagesBetweenUsers(senderId, receiverId);
};

export const markDeliveredService = async (messageId) => {
  return await markMessageDelivered(messageId);
};

export const markSeenService = async (messageId) => {
  return await markMessageSeen(messageId);
};

export const editMessageService = async (messageId, userId, text) => {
  const message = await findMessageById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  if (message.sender.toString() !== userId.toString()) {
    throw new ApiError(403, "You can edit only your own message");
  }

  return await editMessage(messageId, text);
};

export const deleteMessageService = async (messageId, userId) => {
  const message = await findMessageById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  if (message.sender.toString() !== userId.toString()) {
    throw new ApiError(403, "You can delete only your own message");
  }

  return await deleteMessage(messageId);
};
