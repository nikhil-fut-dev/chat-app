import Conversation from "../models/Conversation.js";

export const findConversation = (senderId, receiverId) =>
  Conversation.findOne({
    participants: {
      $all: [senderId, receiverId],
    },
  });

export const createConversation = (participants) =>
  Conversation.create({
    participants,
  });

export const updateLastMessage = (conversationId, messageId) =>
  Conversation.findByIdAndUpdate(
    conversationId,
    {
      lastMessage: messageId,
      lastMessageAt: new Date(),
    },
    {
      new: true,
    },
  );

export const getUserConversations = (userId) =>
  Conversation.find({
    participants: userId,
  })
    .populate("participants", "fullName username avatar isOnline lastSeen")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "fullName username",
      },
    })
    .sort({
      lastMessageAt: -1,
    });
