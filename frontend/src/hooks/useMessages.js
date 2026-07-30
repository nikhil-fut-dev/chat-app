import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  getMessages,
  editMessage as editMessageApi,
  deleteMessage as deleteMessageApi,
} from "../api/messageApi";

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
  // Socket Receive / Sent
  // ==========================================

  useEffect(() => {
    if (!socket || !isConnected || !receiverId) {
      return;
    }

    // Receiver gets this
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

    // Sender gets this
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

    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);

    socket.on(SOCKET_EVENTS.MESSAGE_SENT, handleMessageSent);

    return () => {
      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);

      socket.off(SOCKET_EVENTS.MESSAGE_SENT, handleMessageSent);
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

    // Socket backend handles actual sending.
    // message-sent event will update Redux.
    dispatch(setMessageSending(false));

    return true;
  };

  // ==========================================
  // Edit Message
  // ==========================================

  const editMessage = async (messageId, text) => {
    try {
      const response = await editMessageApi(messageId, text);

      dispatch(updateMessage(response.data));

      toast.success("Message updated");

      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to edit message.");

      return false;
    }
  };

  // ==========================================
  // Delete Message
  // ==========================================

  const deleteMessage = async (messageId) => {
    try {
      const response = await deleteMessageApi(messageId);

      dispatch(updateMessage(response.data));

      toast.success("Message deleted");

      return true;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to delete message.",
      );

      return false;
    }
  };

  const startTyping = () => {
    if (!socket || !isConnected || !receiverId) {
      return;
    }

    socket.emit(SOCKET_EVENTS.TYPING, {
      receiverId,
    });
  };

  const stopTyping = () => {
    if (!socket || !isConnected || !receiverId) {
      return;
    }

    socket.emit(SOCKET_EVENTS.STOP_TYPING, {
      receiverId,
    });
  };

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
