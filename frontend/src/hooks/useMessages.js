import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { getMessages } from "../api/messageApi";

import {
  setMessages,
  addMessage,
  updateMessage,
  setMessageLoading,
  setMessageSending,
  setMessageError,
} from "../store/slices/messageSlice";

import { useSocketContext } from "../context/SocketContext";
import { SOCKET_EVENTS } from "../socket/socketEvents";

export default function useMessages(receiverId) {
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const dispatch = useDispatch();

  const { socket, isConnected } = useSocketContext();

  const { messages, isLoading, isSending, error } = useSelector(
    (state) => state.messages,
  );

  const currentUser = useSelector((state) => state.auth.user);

  // ==========================================
  // Fetch Messages
  // ==========================================

  const fetchMessages = useCallback(async () => {
    if (!receiverId) {
      dispatch(setMessages([]));
      return;
    }

    try {
      dispatch(setMessageLoading(true));

      const response = await getMessages(receiverId);

      dispatch(setMessages(response.data || []));
    } catch (error) {
      const message =
        error?.response?.data?.message || "Unable to load messages.";

      dispatch(setMessageError(message));

      toast.error(message);
    } finally {
      dispatch(setMessageLoading(false));
    }
  }, [dispatch, receiverId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // ==========================================
  // Socket Receive / Send / Edit / Delete
  // ==========================================

  useEffect(() => {
    if (!socket || !isConnected || !receiverId) {
      return;
    }

    // ========================================
    // Receive Message
    // ========================================

    const handleReceiveMessage = (message) => {
      const senderId =
        typeof message.sender === "object"
          ? message.sender?._id
          : message.sender;

      const messageReceiverId =
        typeof message.receiver === "object"
          ? message.receiver?._id
          : message.receiver;

      const isCurrentConversation =
        (senderId?.toString() === receiverId?.toString() &&
          messageReceiverId?.toString() === currentUser?._id?.toString()) ||
        (senderId?.toString() === currentUser?._id?.toString() &&
          messageReceiverId?.toString() === receiverId?.toString());

      if (!isCurrentConversation) {
        return;
      }

      dispatch(addMessage(message));
    };

    // ========================================
    // Message Sent
    // ========================================

    const handleMessageSent = (message) => {
      const messageReceiverId =
        typeof message.receiver === "object"
          ? message.receiver?._id
          : message.receiver;

      if (messageReceiverId?.toString() !== receiverId?.toString()) {
        return;
      }

      dispatch(addMessage(message));
    };

    // ========================================
    // Message Edited - REAL TIME
    // ========================================

    const handleMessageEdited = (message) => {
      console.log("✏️ MESSAGE EDITED RECEIVED:", message);

      const senderId =
        typeof message.sender === "object"
          ? message.sender?._id
          : message.sender;

      const messageReceiverId =
        typeof message.receiver === "object"
          ? message.receiver?._id
          : message.receiver;

      const isCurrentConversation =
        (senderId?.toString() === receiverId?.toString() &&
          messageReceiverId?.toString() === currentUser?._id?.toString()) ||
        (senderId?.toString() === currentUser?._id?.toString() &&
          messageReceiverId?.toString() === receiverId?.toString());

      if (!isCurrentConversation) {
        return;
      }

      dispatch(updateMessage(message));
    };

    // ========================================
    // Message Deleted - REAL TIME
    // ========================================

    const handleMessageDeleted = (message) => {
      console.log("🗑️ MESSAGE DELETED RECEIVED:", message);

      const senderId =
        typeof message.sender === "object"
          ? message.sender?._id
          : message.sender;

      const messageReceiverId =
        typeof message.receiver === "object"
          ? message.receiver?._id
          : message.receiver;

      const isCurrentConversation =
        (senderId?.toString() === receiverId?.toString() &&
          messageReceiverId?.toString() === currentUser?._id?.toString()) ||
        (senderId?.toString() === currentUser?._id?.toString() &&
          messageReceiverId?.toString() === receiverId?.toString());

      if (!isCurrentConversation) {
        return;
      }

      dispatch(updateMessage(message));
    };

    // ========================================
    // Message Error
    // ========================================

    const handleMessageError = (error) => {
      console.error("❌ MESSAGE SOCKET ERROR:", error);

      toast.error(error?.message || "Something went wrong.");
    };

    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);

    socket.on(SOCKET_EVENTS.MESSAGE_SENT, handleMessageSent);

    socket.on(SOCKET_EVENTS.MESSAGE_EDITED, handleMessageEdited);

    socket.on(SOCKET_EVENTS.MESSAGE_DELETED, handleMessageDeleted);

    socket.on(SOCKET_EVENTS.MESSAGE_ERROR, handleMessageError);

    return () => {
      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);

      socket.off(SOCKET_EVENTS.MESSAGE_SENT, handleMessageSent);

      socket.off(SOCKET_EVENTS.MESSAGE_EDITED, handleMessageEdited);

      socket.off(SOCKET_EVENTS.MESSAGE_DELETED, handleMessageDeleted);

      socket.off(SOCKET_EVENTS.MESSAGE_ERROR, handleMessageError);
    };
  }, [socket, isConnected, receiverId, currentUser?._id, dispatch]);

  // ==========================================
  // Send Message - Socket
  // ==========================================

  const sendMessage = async (text) => {
    if (!receiverId || !text?.trim() || !socket || !isConnected) {
      return false;
    }

    dispatch(setMessageSending(true));

    socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
      receiverId,
      text: text.trim(),
    });

    dispatch(setMessageSending(false));

    return true;
  };

  // ==========================================
  // Edit Message - REAL TIME SOCKET
  // ==========================================

  const editMessage = async (messageId, text) => {
    if (!messageId || !text?.trim() || !socket || !isConnected) {
      return false;
    }

    console.log("✏️ Sending EDIT MESSAGE:", messageId);

    socket.emit(SOCKET_EVENTS.EDIT_MESSAGE, {
      messageId,
      text: text.trim(),
    });

    return true;
  };

  // ==========================================
  // Delete Message - REAL TIME SOCKET
  // ==========================================

  const deleteMessage = async (messageId) => {
    if (!messageId || !socket || !isConnected) {
      return false;
    }

    console.log("🗑️ Sending DELETE MESSAGE:", messageId);

    socket.emit(SOCKET_EVENTS.DELETE_MESSAGE, {
      messageId,
    });

    return true;
  };

  // ==========================================
  // Typing Indicator
  // ==========================================

  const startTyping = () => {
    if (!socket || !isConnected || !receiverId) {
      return;
    }

    if (!isTypingRef.current) {
      console.log("📤 Sending TYPING event");

      socket.emit(SOCKET_EVENTS.TYPING, {
        receiverId,
      });

      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (!socket || !isConnected || !receiverId) {
        return;
      }

      console.log("📤 Sending STOP TYPING event");

      socket.emit(SOCKET_EVENTS.STOP_TYPING, {
        receiverId,
      });

      isTypingRef.current = false;
      typingTimeoutRef.current = null;
    }, 1000);
  };

  const stopTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (socket && isConnected && receiverId && isTypingRef.current) {
      socket.emit(SOCKET_EVENTS.STOP_TYPING, {
        receiverId,
      });
    }

    isTypingRef.current = false;
  };

  // ==========================================
  // Cleanup Typing
  // ==========================================

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    isLoading,
    isSending,
    error,
    isConnected,

    fetchMessages,
    sendMessage,
    editMessage,
    deleteMessage,

    startTyping,
    stopTyping,
  };
}
