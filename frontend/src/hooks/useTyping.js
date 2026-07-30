import { useEffect, useRef, useState } from "react";
import { useSocketContext } from "../context/SocketContext";
import { SOCKET_EVENTS } from "../socket/socketEvents";

export default function useTyping(receiverId) {
  const { socket, isConnected } = useSocketContext();

  const [isTyping, setIsTyping] = useState(false);

  const typingTimeoutRef = useRef(null);

  // ==========================================
  // RECEIVE TYPING EVENT
  // ==========================================

  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = (data) => {
      if (data?.userId?.toString() === receiverId?.toString()) {
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = (data) => {
      if (data?.userId?.toString() === receiverId?.toString()) {
        setIsTyping(false);
      }
    };

    socket.on(SOCKET_EVENTS.USER_TYPING, handleUserTyping);

    socket.on(SOCKET_EVENTS.USER_STOP_TYPING, handleUserStopTyping);

    return () => {
      socket.off(SOCKET_EVENTS.USER_TYPING, handleUserTyping);

      socket.off(SOCKET_EVENTS.USER_STOP_TYPING, handleUserStopTyping);
    };
  }, [socket, receiverId]);

  // ==========================================
  // SEND TYPING EVENT
  // ==========================================

  const startTyping = () => {
    if (!socket || !isConnected || !receiverId) {
      return;
    }

    socket.emit(SOCKET_EVENTS.TYPING, {
      receiverId,
    });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1500);
  };

  // ==========================================
  // SEND STOP TYPING EVENT
  // ==========================================

  const stopTyping = () => {
    if (!socket || !isConnected || !receiverId) {
      return;
    }

    socket.emit(SOCKET_EVENTS.STOP_TYPING, {
      receiverId,
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = null;
  };

  // Cleanup
  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return {
    isTyping,
    startTyping,
    stopTyping,
  };
}
