import Message from "../models/Message.js";

export const createMessage = (data) => Message.create(data);

export const getConversationMessages = (conversationId) =>
  Message.find({
    conversation: conversationId,
  })
    .populate("sender", "fullName username avatar")
    .sort({
      createdAt: 1,
    });

export const getMessagesBetweenUsers = async (senderId, receiverId) => {
  return Message.find({
    $or: [
      {
        sender: senderId,
        receiver: receiverId,
      },
      {
        sender: receiverId,
        receiver: senderId,
      },
    ],
  })
    .populate("sender", "fullName username avatar")
    .populate("receiver", "fullName username avatar")
    .sort({
      createdAt: 1,
    });
};

export const markMessageDelivered = (messageId) =>
  Message.findByIdAndUpdate(
    messageId,
    {
      isDelivered: true,
    },
    {
      new: true,
    },
  );

export const markMessageSeen = (messageId) =>
  Message.findByIdAndUpdate(
    messageId,
    {
      isSeen: true,
    },
    {
      new: true,
    },
  );
