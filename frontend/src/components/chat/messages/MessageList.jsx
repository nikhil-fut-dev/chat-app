import { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { useSelector } from "react-redux";

import Loader from "../../common/Loader";
import MessageBubble from "./MessageBubble";
import { useSocketContext } from "../../../context/SocketContext";
import { SOCKET_EVENTS } from "../../../socket/socketEvents";

export default function MessageList({
  messages = [],
  loading,
  onEdit,
  onDelete,
}) {
  const bottomRef = useRef(null);

  const { socket, isConnected } = useSocketContext();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  useEffect(() => {
    if (!socket || !isConnected || !user?._id) return;

    messages.forEach((message) => {
      const senderId =
        typeof message.sender === "object"
          ? message.sender?._id
          : message.sender;

      const receiverId =
        typeof message.receiver === "object"
          ? message.receiver?._id
          : message.receiver;

      const isIncoming = senderId?.toString() !== user._id?.toString();

      const belongsToCurrentUser =
        receiverId?.toString() === user._id?.toString();

      if (isIncoming && belongsToCurrentUser && !message.isSeen) {
        socket.emit(SOCKET_EVENTS.MESSAGE_SEEN, {
          messageId: message._id,
          senderId,
        });
      }
    });
  }, [messages, socket, isConnected, user?._id]);

  if (loading) {
    return (
      <div
        className="flex min-h-0 flex-1 items-center justify-center bg-[#f8faf9]"
        role="status"
        aria-label="Loading messages"
      >
        <Loader />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto bg-[#f8faf9] px-5 py-8 text-center">
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-3xl border border-[#e1eee6] bg-white text-[#12866a] shadow-sm">
          <MessageCircle size={31} strokeWidth={1.7} />
        </div>

        <h3 className="mt-5 text-base font-semibold text-[#34443c]">
          No messages yet
        </h3>

        <p className="mt-2 max-w-xs text-sm leading-6 text-[#839089]">
          Your conversation starts here. Send a message to say hello.
        </p>
      </div>
    );
  }

  return (
    <div
      className="chat-message-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-[#f8faf9] px-3 py-4 sm:px-5 sm:py-6 lg:px-6"
      aria-label="Conversation messages"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 sm:gap-4">
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            currentUserId={user?._id}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        <div ref={bottomRef} aria-hidden="true" />
      </div>
    </div>
  );
}
