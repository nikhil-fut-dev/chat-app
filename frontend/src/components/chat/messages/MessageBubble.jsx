import { MoreHorizontal } from "lucide-react";
import MessageStatus from "./MessageStatus";

export default function MessageBubble({
  message,
  currentUserId,
  onEdit,
  onDelete,
}) {
  const senderId =
    typeof message.sender === "object" ? message.sender?._id : message.sender;

  const isOwn = senderId?.toString() === currentUserId?.toString();

  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      className={`group flex w-full ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex max-w-[78%] items-end gap-2 sm:max-w-[65%] ${
          isOwn ? "flex-row-reverse" : ""
        }`}
      >
        {/* Avatar for incoming messages */}
        {!isOwn && (
          <div className="mb-1 shrink-0">
            {message.sender?.avatar ? (
              <img
                src={message.sender.avatar}
                alt={message.sender.fullName || "User"}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-400">
                {(message.sender?.fullName || message.sender?.username || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>
        )}

        <div className="relative min-w-0">
          {/* Actions */}
          {isOwn && !message.deleted && (
            <div className="absolute -top-8 right-0 hidden items-center rounded-lg border border-slate-800 bg-slate-900 p-1 shadow-xl group-hover:flex">
              <button
                type="button"
                onClick={() => onEdit?.(message)}
                className="rounded-md px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => onDelete?.(message)}
                className="rounded-md px-2 py-1 text-[11px] text-red-400 hover:bg-red-500/10"
              >
                Delete
              </button>
            </div>
          )}

          <div
            className={[
              "rounded-2xl px-4 py-2.5 shadow-sm",
              isOwn
                ? "rounded-br-md bg-indigo-500 text-white"
                : "rounded-bl-md border border-slate-800 bg-slate-900 text-slate-200",
            ].join(" ")}
          >
            {message.deleted ? (
              <p className="text-sm italic opacity-60">
                This message was deleted
              </p>
            ) : (
              <p className="whitespace-pre-wrap break-words text-sm leading-6">
                {message.text}
              </p>
            )}

            <div
              className={`mt-1.5 flex items-center justify-end gap-1.5 ${
                isOwn ? "text-indigo-200" : "text-slate-600"
              }`}
            >
              {message.edited && !message.deleted && (
                <span className="text-[10px]">edited</span>
              )}

              <span className="text-[10px]">{time}</span>

              {isOwn && <MessageStatus message={message} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
