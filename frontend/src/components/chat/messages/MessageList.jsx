import { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { useSelector } from "react-redux";

import Loader from "../../common/Loader";
import MessageBubble from "./MessageBubble";

export default function MessageList({ messages, loading, onEdit, onDelete }) {
  const bottomRef = useRef(null);

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
          <MessageCircle size={29} />
        </div>

        <h3 className="mt-5 text-base font-semibold text-slate-300">
          No messages yet
        </h3>

        <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">
          Send a message to start the conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-3">
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            currentUserId={user?._id}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
