import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import MessageStatus from "./MessageStatus";

export default function MessageBubble({
  message,
  currentUserId,
  onEdit,
  onDelete,
}) {
  const [showActions, setShowActions] = useState(false);

  const senderId =
    typeof message.sender === "object" ? message.sender?._id : message.sender;

  const isOwn = senderId?.toString() === currentUserId?.toString();

  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const handleEdit = () => {
    setShowActions(false);
    onEdit?.(message);
  };

  const handleDelete = () => {
    setShowActions(false);
    onDelete?.(message);
  };

  return (
    <div
      className={`group flex w-full ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex max-w-[88%] items-end gap-2 sm:max-w-[65%] ${
          isOwn ? "flex-row-reverse" : ""
        }`}
      >
        {/* =========================================
            Incoming Message Avatar
        ========================================== */}
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
          {/* =========================================
              Message Actions
          ========================================== */}
          {isOwn && !message.deleted && (
            <>
              {/* -----------------------------------------
                  Desktop Actions
                  Visible on hover
              ------------------------------------------ */}
              <div className="absolute -top-8 right-0 z-20 hidden items-center rounded-lg border border-slate-800 bg-slate-900 p-1 shadow-xl sm:group-hover:flex">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="rounded-md px-2 py-1 text-[11px] font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-md px-2 py-1 text-[11px] font-medium text-red-400 transition hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>

              {/* -----------------------------------------
                  Mobile More Button
              ------------------------------------------ */}
              <button
                type="button"
                onClick={() => setShowActions((prev) => !prev)}
                className="absolute -top-8 right-0 z-30 flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 shadow-lg transition hover:bg-slate-800 hover:text-white sm:hidden"
                aria-label="Message actions"
                title="Message actions"
              >
                <MoreHorizontal size={16} />
              </button>

              {/* -----------------------------------------
                  Mobile Actions Menu
              ------------------------------------------ */}
              {showActions && (
                <div className="absolute -top-8 right-8 z-40 flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1 shadow-xl sm:hidden">
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="rounded-md px-2.5 py-1 text-[11px] font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-md px-2.5 py-1 text-[11px] font-medium text-red-400 transition hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              )}
            </>
          )}

          {/* =========================================
              Message Bubble
          ========================================== */}
          <div
            className={[
              "rounded-2xl px-4 py-2.5 shadow-sm",
              isOwn
                ? "rounded-br-md bg-indigo-500 text-white"
                : "rounded-bl-md border border-slate-800 bg-slate-900 text-slate-200",
            ].join(" ")}
          >
            {/* Message Text */}
            {message.deleted ? (
              <p className="text-sm italic opacity-60">
                This message was deleted
              </p>
            ) : (
              <p className="whitespace-pre-wrap break-words text-sm leading-6">
                {message.text}
              </p>
            )}

            {/* =========================================
                Message Meta
            ========================================== */}
            <div
              className={`mt-1.5 flex items-center justify-end gap-1.5 ${
                isOwn ? "text-indigo-200" : "text-slate-600"
              }`}
            >
              {/* Edited Label */}
              {message.edited && !message.deleted && (
                <span className="text-[10px]">edited</span>
              )}

              {/* Time */}
              <span className="text-[10px]">{time}</span>

              {/* Message Status */}
              {isOwn && <MessageStatus message={message} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
