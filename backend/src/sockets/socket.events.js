import { updateUserStatus } from "../repositories/user.repository.js";

import {
  sendMessageService,
  markDeliveredService,
  markSeenService,
  editMessageService,
  deleteMessageService,
} from "../services/message.service.js";

import { addUser, removeUser, getOnlineUsers } from "./onlineUsers.js";

import { randomUUID } from "node:crypto";
import User from "../models/User.js";
import { SOCKET_EVENTS } from "./socket.constants.js";

const activeCalls = new Map();
const userActiveCalls = new Map();

const getUserId = (id) => id?.toString();

const emitCallError = (socket, message) => {
  socket.emit(SOCKET_EVENTS.CALL_ERROR, { message });
};

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
  // Typing Indicator
  // ============================

  socket.on("typing", ({ receiverId }) => {
    try {
      if (!receiverId) return;

      console.log(`⌨️ ${socket.user.username} is typing to ${receiverId}`);

      io.to(receiverId.toString()).emit("user-typing", {
        userId: socket.user._id.toString(),
        username: socket.user.username,
      });
    } catch (error) {
      console.error("Typing Error:", error.message);
    }
  });

  socket.on("stop-typing", ({ receiverId }) => {
    try {
      if (!receiverId) return;

      console.log(`⏹️ ${socket.user.username} stopped typing to ${receiverId}`);

      io.to(receiverId.toString()).emit("user-stop-typing", {
        userId: socket.user._id.toString(),
      });
    } catch (error) {
      console.error("Stop Typing Error:", error.message);
    }
  });

  // Initiate an audio/video call
  socket.on(
    SOCKET_EVENTS.CALL_INITIATE,
    async ({ receiverId, callType } = {}) => {
      try {
        const callerId = getUserId(socket.user._id);
        const targetId = getUserId(receiverId);

        if (!targetId || targetId === callerId) {
          return emitCallError(socket, "Invalid call receiver.");
        }

        if (!["audio", "video"].includes(callType)) {
          return emitCallError(socket, "Invalid call type.");
        }

        if (userActiveCalls.has(callerId)) {
          return emitCallError(socket, "You are already in a call.");
        }

        if (userActiveCalls.has(targetId)) {
          return emitCallError(socket, "The user is busy on another call.");
        }

        const receiver = await User.findById(targetId).select("_id username");

        if (!receiver) {
          return emitCallError(socket, "User not found.");
        }

        // Re-check after the asynchronous database lookup.
        if (userActiveCalls.has(callerId) || userActiveCalls.has(targetId)) {
          return emitCallError(
            socket,
            "One of the users is already in a call.",
          );
        }

        const callId = randomUUID();

        const call = {
          callId,
          callerId,
          receiverId: targetId,
          callerSocketId: socket.id,
          receiverSocketId: null,
          callType,
          status: "ringing",
        };

        activeCalls.set(callId, call);
        userActiveCalls.set(callerId, callId);
        userActiveCalls.set(targetId, callId);

        io.to(targetId).emit(SOCKET_EVENTS.CALL_INCOMING, {
          callId,
          caller: {
            _id: callerId,
            username: socket.user.username,
          },
          callType,
        });

        // Notify the caller that the call is ringing.
        // The frontend needs this callId before it can process CALL_ACCEPTED.
        socket.emit(SOCKET_EVENTS.CALL_RINGING, {
          callId,
          receiver: {
            _id: receiver._id.toString(),
            username: receiver.username,
          },
          callType,
        });
      } catch (error) {
        console.error("Call Initiate Error:", error.message);
        emitCallError(socket, "Could not initiate the call.");
      }
    },
  );

  // Accept an incoming call
  socket.on(SOCKET_EVENTS.CALL_ACCEPT, ({ callId } = {}) => {
    const call = activeCalls.get(callId);
    const userId = getUserId(socket.user._id);

    if (
      !call ||
      call.status !== "ringing" ||
      call.receiverId !== userId ||
      userActiveCalls.get(userId) !== callId
    ) {
      return emitCallError(socket, "This call is no longer available.");
    }

    call.receiverSocketId = socket.id;
    call.status = "accepted";

    io.to(call.callerSocketId).emit(SOCKET_EVENTS.CALL_ACCEPTED, {
      callId,
      callType: call.callType,
    });

    socket.emit(SOCKET_EVENTS.CALL_ACCEPTED, {
      callId,
      callType: call.callType,
    });
  });

  // Reject an incoming call
  socket.on(SOCKET_EVENTS.CALL_REJECT, ({ callId } = {}) => {
    const call = activeCalls.get(callId);
    const userId = getUserId(socket.user._id);

    if (!call || call.receiverId !== userId || call.status !== "ringing") {
      return emitCallError(socket, "This call cannot be rejected.");
    }

    io.to(call.callerSocketId).emit(SOCKET_EVENTS.CALL_REJECTED, {
      callId,
      reason: "rejected",
    });

    activeCalls.delete(callId);
    userActiveCalls.delete(call.callerId);
    userActiveCalls.delete(call.receiverId);
  });

  // Relay WebRTC signaling only between the two call participants
  const relayCallSignal = (eventName, payload = {}) => {
    const { callId, data } = payload;
    const call = activeCalls.get(callId);
    const userId = getUserId(socket.user._id);

    if (!call || call.status !== "accepted") {
      return emitCallError(socket, "Call is not active.");
    }

    let targetSocketId;

    if (userId === call.callerId && socket.id === call.callerSocketId) {
      targetSocketId = call.receiverSocketId;
    } else if (
      userId === call.receiverId &&
      socket.id === call.receiverSocketId
    ) {
      targetSocketId = call.callerSocketId;
    } else {
      return emitCallError(socket, "You are not a participant in this call.");
    }

    if (!data || typeof data !== "object") {
      return emitCallError(socket, "Invalid call signaling data.");
    }

    io.to(targetSocketId).emit(eventName, { callId, data });
  };

  socket.on(SOCKET_EVENTS.CALL_OFFER, (payload) => {
    relayCallSignal(SOCKET_EVENTS.CALL_OFFER, payload);
  });

  socket.on(SOCKET_EVENTS.CALL_ANSWER, (payload) => {
    relayCallSignal(SOCKET_EVENTS.CALL_ANSWER, payload);
  });

  socket.on(SOCKET_EVENTS.CALL_ICE_CANDIDATE, (payload) => {
    relayCallSignal(SOCKET_EVENTS.CALL_ICE_CANDIDATE, payload);
  });

  // End an active call
  socket.on(SOCKET_EVENTS.CALL_END, ({ callId } = {}) => {
    const call = activeCalls.get(callId);
    const userId = getUserId(socket.user._id);

    if (
      !call ||
      (socket.id !== call.callerSocketId &&
        socket.id !== call.receiverSocketId) ||
      (userId !== call.callerId && userId !== call.receiverId)
    ) {
      return emitCallError(socket, "This call cannot be ended.");
    }

    const otherSocketId =
      socket.id === call.callerSocketId
        ? call.receiverSocketId
        : call.callerSocketId;

    if (otherSocketId) {
      io.to(otherSocketId).emit(SOCKET_EVENTS.CALL_ENDED, {
        callId,
        reason: "ended",
      });
    }

    activeCalls.delete(callId);
    userActiveCalls.delete(call.callerId);
    userActiveCalls.delete(call.receiverId);
  });

  // ============================
  // Disconnect
  // ============================

  socket.on("disconnect", async () => {
    try {
      const userId = getUserId(socket.user._id);
      const callId = userActiveCalls.get(userId);
      const call = callId ? activeCalls.get(callId) : null;

      // End a call if its participating socket disconnects.
      if (
        call &&
        (call.callerSocketId === socket.id ||
          call.receiverSocketId === socket.id)
      ) {
        const otherSocketId =
          call.callerSocketId === socket.id
            ? call.receiverSocketId
            : call.callerSocketId;

        if (otherSocketId) {
          io.to(otherSocketId).emit(SOCKET_EVENTS.CALL_ENDED, {
            callId,
            reason: "disconnected",
          });
        }

        activeCalls.delete(callId);
        userActiveCalls.delete(call.callerId);
        userActiveCalls.delete(call.receiverId);
      }

      const isLastSocket = removeUser(socket.user._id, socket.id);

      // Agar user ka doosra socket abhi connected hai,
      // to database ya online users list update nahi karni.
      if (!isLastSocket) {
        console.log(
          `🔌 ${socket.user.username} disconnected one socket; user remains online`,
        );
        return;
      }

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
