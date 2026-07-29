import { getUserConversations } from "../repositories/conversation.repository.js";

export const getConversationListService = async (userId) => {
  const conversations = await getUserConversations(userId);

  return conversations.map((conversation) => {
    const otherUser = conversation.participants.find(
      (participant) => participant._id.toString() !== userId.toString(),
    );

    return {
      conversationId: conversation._id,

      user: otherUser,

      lastMessage: conversation.lastMessage,

      updatedAt: conversation.lastMessageAt,
    };
  });
};
