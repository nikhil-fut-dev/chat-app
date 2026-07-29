import {
  findConversation,
  createConversation,
  updateLastMessage,
} from "../repositories/conversation.repository.js";

import {
  createMessage,
  getMessagesBetweenUsers,
  markMessageDelivered,
  markMessageSeen,
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
