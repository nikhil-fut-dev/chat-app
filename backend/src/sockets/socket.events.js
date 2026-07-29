import { updateUserStatus } from "../repositories/user.repository.js";

import {
  sendMessageService,
  markDeliveredService,
  markSeenService,
  editMessageService,
  deleteMessageService,
} from "../services/message.service.js";

import { addUser, removeUser, getOnlineUsers } from "./onlineUsers.js";

export const registerSocketEvents = async (io, socket) => {
  // Join personal room
  socket.join(socket.user._id.toString());

  // Add user to online users map
  addUser(socket.user._id, socket.id);

  // Update database
  await updateUserStatus(socket.user._id, true);

  // Broadcast online users
  io.emit("online-users", getOnlineUsers());

  console.log(`🟢 ${socket.user.username} connected`);

  // ============================
  // Send Message
  // ============================

  socket.on("send-message", async (data) => {
    try {
      const { receiverId, text } = data;

      const message = await sendMessageService({
        senderId: socket.user._id,
        receiverId,
        text,
      });

      // Sender
      socket.emit("message-sent", message);

      // Receiver
      io.to(receiverId.toString()).emit("receive-message", message);
    } catch (error) {
      socket.emit("message-error", {
        message: error.message,
      });
    }
  });

  // ============================
  // Typing
  // ============================

  socket.on("typing", ({ receiverId }) => {
    io.to(receiverId.toString()).emit("user-typing", {
      userId: socket.user._id,
      username: socket.user.username,
    });
  });

  socket.on("stop-typing", ({ receiverId }) => {
    io.to(receiverId.toString()).emit("user-stop-typing", {
      userId: socket.user._id,
    });
  });

  // ============================
  // Disconnect
  // ============================

  socket.on("disconnect", async () => {
    try {
      removeUser(socket.user._id);

      await updateUserStatus(socket.user._id, false);

      io.emit("online-users", getOnlineUsers());

      console.log(`🔴 ${socket.user.username} disconnected`);
    } catch (error) {
      console.error("Socket Disconnect Error:", error.message);
    }
  });

  // ============================
  // Message Delivered
  // ============================

  socket.on("message-delivered", async ({ messageId, senderId }) => {
    try {
      const message = await markDeliveredService(messageId);

      io.to(senderId.toString()).emit("message-delivered", {
        messageId: message._id,
      });
    } catch (error) {
      socket.emit("message-error", {
        message: error.message,
      });
    }
  });

  // ============================
  // Message Seen
  // ============================

  socket.on("message-seen", async ({ messageId, senderId }) => {
    try {
      const message = await markSeenService(messageId);

      io.to(senderId.toString()).emit("message-seen", {
        messageId: message._id,
      });
    } catch (error) {
      socket.emit("message-error", {
        message: error.message,
      });
    }
  });

  // Edit Message
  socket.on("edit-message", async ({ messageId, text }) => {
    try {
      const message = await editMessageService(
        messageId,
        socket.user._id,
        text,
      );

      io.to(message.sender.toString()).emit("message-edited", message);
      io.to(message.receiver.toString()).emit("message-edited", message);
    } catch (error) {
      socket.emit("message-error", {
        message: error.message,
      });
    }
  });

  // Delete Message
  socket.on("delete-message", async ({ messageId }) => {
    try {
      const message = await deleteMessageService(messageId, socket.user._id);

      io.to(message.sender.toString()).emit("message-deleted", message);
      io.to(message.receiver.toString()).emit("message-deleted", message);
    } catch (error) {
      socket.emit("message-error", {
        message: error.message,
      });
    }
  });
};
