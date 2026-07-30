import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useSocketContext } from "../context/SocketContext";
import { SOCKET_EVENTS } from "../socket/socketEvents";

import {
  addMessage,
  updateMessage,
  markMessageDelivered,
  markMessageSeen,
} from "../store/slices/messageSlice";

export default function useMessageSocket(receiverId) {
  const dispatch = useDispatch();

  const { socket, isConnected } = useSocketContext();

  const { user } = useSelector((state) => state.auth);

  const [isTyping, setIsTyping] = useState(false);
  const typingIndicatorTimeoutRef = useRef(null);
  useEffect(() => {
    if (!socket || !isConnected || !user?._id) {
      return;
    }

    // ==========================================
    // RECEIVE MESSAGE
    // ==========================================

    const handleReceiveMessage = (message) => {
      if (!message?._id) return;

      const senderId =
        typeof message.sender === "object"
          ? message.sender?._id
          : message.sender;

      if (receiverId && senderId?.toString() === receiverId?.toString()) {
        dispatch(addMessage(message));
      }

      if (message._id && senderId) {
        socket.emit(SOCKET_EVENTS.MESSAGE_DELIVERED, {
          messageId: message._id,
          senderId,
        });
      }
    };

    // ==========================================
    // MESSAGE SENT
    // ==========================================

    const handleMessageSent = (message) => {
      if (!message?._id) return;

      dispatch(addMessage(message));
    };

    // ==========================================
    // MESSAGE DELIVERED
    // ==========================================

    const handleMessageDelivered = (data) => {
      if (!data) return;

      const messageId =
        typeof data === "object" ? data.messageId || data._id : data;

      if (!messageId) return;

      dispatch(markMessageDelivered(messageId));

      if (typeof data === "object" && data._id) {
        dispatch(updateMessage(data));
      }
    };

    // ==========================================
    // MESSAGE SEEN
    // ==========================================

    const handleMessageSeen = (data) => {
      if (!data) return;

      const messageId =
        typeof data === "object" ? data.messageId || data._id : data;

      if (!messageId) return;

      dispatch(markMessageSeen(messageId));

      if (typeof data === "object" && data._id) {
        dispatch(updateMessage(data));
      }
    };

    // ==========================================
    // MESSAGE EDITED
    // ==========================================

    const handleMessageEdited = (message) => {
      if (!message?._id) return;

      dispatch(updateMessage(message));
    };

    // ==========================================
    // MESSAGE DELETED
    // ==========================================

    const handleMessageDeleted = (message) => {
      if (!message?._id) return;

      dispatch(updateMessage(message));
    };

    // ==========================================
    // USER TYPING
    // ==========================================

    const handleUserTyping = (data) => {
      console.log("⌨️ USER TYPING RECEIVED:", data);

      if (!data?.userId || !receiverId) {
        return;
      }

      const typingUserId = String(data.userId);
      const activeReceiverId = String(receiverId);

      console.log("Typing User:", typingUserId);
      console.log("Active Receiver:", activeReceiverId);

      if (typingUserId !== activeReceiverId) {
        return;
      }

      console.log("✅ SETTING isTyping = TRUE");

      setIsTyping(true);

      // Previous auto-hide timer clear
      if (typingIndicatorTimeoutRef.current) {
        clearTimeout(typingIndicatorTimeoutRef.current);
      }

      // Safety fallback
      typingIndicatorTimeoutRef.current = setTimeout(() => {
        console.log("⌛ Typing indicator auto hidden");

        setIsTyping(false);
        typingIndicatorTimeoutRef.current = null;
      }, 2000);
    };

    // ==========================================
    // USER STOPPED TYPING
    // ==========================================

    const handleUserStoppedTyping = (data) => {
      console.log("⏹️ USER STOP TYPING RECEIVED:", data);

      if (!data?.userId || !receiverId) {
        return;
      }

      const typingUserId = String(data.userId);
      const activeReceiverId = String(receiverId);

      if (typingUserId !== activeReceiverId) {
        return;
      }

      console.log("❌ SETTING isTyping = FALSE");

      if (typingIndicatorTimeoutRef.current) {
        clearTimeout(typingIndicatorTimeoutRef.current);
        typingIndicatorTimeoutRef.current = null;
      }

      setIsTyping(false);
    };

    // ==========================================
    // REGISTER SOCKET EVENTS
    // ==========================================

    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);

    socket.on(SOCKET_EVENTS.MESSAGE_SENT, handleMessageSent);

    socket.on(SOCKET_EVENTS.MESSAGE_DELIVERED, handleMessageDelivered);

    socket.on(SOCKET_EVENTS.MESSAGE_SEEN, handleMessageSeen);

    socket.on(SOCKET_EVENTS.MESSAGE_EDITED, handleMessageEdited);

    socket.on(SOCKET_EVENTS.MESSAGE_DELETED, handleMessageDeleted);

    socket.on(SOCKET_EVENTS.USER_TYPING, handleUserTyping);

    socket.on(SOCKET_EVENTS.USER_STOP_TYPING, handleUserStoppedTyping);

    // ==========================================
    // CLEANUP
    // ==========================================

    return () => {
      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
      socket.off(SOCKET_EVENTS.MESSAGE_SENT, handleMessageSent);

      socket.off(SOCKET_EVENTS.MESSAGE_DELIVERED, handleMessageDelivered);
      socket.off(SOCKET_EVENTS.MESSAGE_SEEN, handleMessageSeen);

      socket.off(SOCKET_EVENTS.MESSAGE_EDITED, handleMessageEdited);
      socket.off(SOCKET_EVENTS.MESSAGE_DELETED, handleMessageDeleted);

      socket.off(SOCKET_EVENTS.USER_TYPING, handleUserTyping);
      socket.off(SOCKET_EVENTS.USER_STOP_TYPING, handleUserStoppedTyping);

      if (typingIndicatorTimeoutRef.current) {
        clearTimeout(typingIndicatorTimeoutRef.current);
        typingIndicatorTimeoutRef.current = null;
      }

      setIsTyping(false);
    };
  }, [socket, isConnected, user?._id, receiverId, dispatch]);

  return {
    isTyping,
  };
}
