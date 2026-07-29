import {
  sendMessageService,
  getMessagesService,
  markDeliveredService,
  markSeenService,
} from "../services/message.service.js";

import { getSocketId } from "./socket.store.js";

import { SOCKET_EVENTS } from "./socket.constants.js";

export const registerMessageEvents = (io, socket) => {
  socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (data) => {
    try {
      const message = await sendMessageService({
        senderId: socket.user._id,
        receiverId: data.receiverId,
        text: data.text,
      });

      const receiverSocket = getSocketId(data.receiverId);

      if (receiverSocket) {
        io.to(receiverSocket).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message);
      }

      socket.emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message);
    } catch (error) {
      socket.emit("error", error.message);
    }
  });

  socket.on(SOCKET_EVENTS.TYPING, ({ receiverId }) => {
    const receiverSocket = getSocketId(receiverId);

    if (receiverSocket) {
      io.to(receiverSocket).emit(SOCKET_EVENTS.USER_TYPING, {
        userId: socket.user._id,
        username: socket.user.username,
      });
    }
  });

  socket.on(SOCKET_EVENTS.STOP_TYPING, ({ receiverId }) => {
    const receiverSocket = getSocketId(receiverId);

    if (receiverSocket) {
      io.to(receiverSocket).emit(SOCKET_EVENTS.USER_STOPPED_TYPING, {
        userId: socket.user._id,
      });
    }
  });

  socket.on(SOCKET_EVENTS.DELIVER_MESSAGE, async ({ messageId, senderId }) => {
    const message = await markDeliveredService(messageId);

    const senderSocket = getSocketId(senderId);

    if (senderSocket) {
      io.to(senderSocket).emit(SOCKET_EVENTS.MESSAGE_DELIVERED, message);
    }
  });

  socket.on(SOCKET_EVENTS.SEEN_MESSAGE, async ({ messageId, senderId }) => {
    const message = await markSeenService(messageId);

    const senderSocket = getSocketId(senderId);

    if (senderSocket) {
      io.to(senderSocket).emit(SOCKET_EVENTS.MESSAGE_SEEN, message);
    }
  });

  socket.on("receive_message", (message) => {
    socket.emit("deliver_message", {
      messageId: message._id,
      senderId: message.sender,
    });
  });

  socket.emit("seen_message", {
    messageId: message._id,
    senderId: message.sender,
  });

  socket.on("message_delivered", (message) => {
    console.log("Delivered", message);
  });

  socket.on("message_seen", (message) => {
    console.log("Seen", message);
  });

  socket.on(SOCKET_EVENTS.GET_MESSAGES, async (receiverId) => {
    try {
      const messages = await getMessagesService(socket.user._id, receiverId);

      socket.emit(SOCKET_EVENTS.MESSAGE_HISTORY, messages);
    } catch (error) {
      socket.emit("error", error.message);
    }
  });
};
