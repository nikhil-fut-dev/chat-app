import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import MessageStatus from "./MessageStatus";

export default function MessageBubble({
  message,
  currentUserId,
  onEdit,
  onDelete,
}) {
  const [showActions, setShowActions] = useState(false);

  const pressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);

  const senderId =
    typeof message.sender === "object" ? message.sender?._id : message.sender;

  const isOwn = senderId?.toString() === currentUserId?.toString();

  const senderName =
    typeof message.sender === "object"
      ? message.sender?.fullName || message.sender?.username || "User"
      : "User";

  const avatar =
    typeof message.sender === "object" ? message.sender?.avatar : null;

  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest("[data-message-actions]")) {
        setShowActions(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const cancelLongPress = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const startLongPress = () => {
    if (!isOwn || message.deleted) return;

    cancelLongPress();
    longPressTriggeredRef.current = false;

    pressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      setShowActions(true);

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(30);
      }
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
      }
    };
  }, []);

  const handleContextMenu = (event) => {
    if (!isOwn || message.deleted) return;

    event.preventDefault();
    cancelLongPress();
    setShowActions(true);
  };

  const handleEdit = () => {
    setShowActions(false);
    cancelLongPress();
    onEdit?.(message);
  };

  const handleDelete = () => {
    setShowActions(false);
    cancelLongPress();
    onDelete?.(message);
  };

  return (
    <div
      className={`group flex w-full ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex min-w-0 max-w-[94%] items-end gap-2 sm:max-w-[80%] lg:max-w-[72%] ${
          isOwn ? "flex-row-reverse" : ""
        }`}
      >
        {!isOwn && (
          <div className="mb-1 shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={senderName}
                loading="lazy"
                className="h-7 w-7 rounded-full border border-slate-200 object-cover sm:h-8 sm:w-8"
              />
            ) : (
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100 sm:h-8 sm:w-8"
                aria-label={`${senderName} avatar`}
              >
                {senderName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}

        <div
          className="relative min-w-0 max-w-full"
          data-message-actions
          onPointerDown={startLongPress}
          onPointerUp={cancelLongPress}
          onPointerLeave={cancelLongPress}
          onPointerCancel={cancelLongPress}
          onContextMenu={handleContextMenu}
        >
          {showActions && isOwn && !message.deleted && (
            <div
              role="group"
              aria-label="Message actions"
              className="absolute bottom-full right-0 z-50 mb-2 flex min-w-[172px] items-center gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-200/70"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleEdit}
                className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <Pencil size={14} />
                Edit
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}

          <div
            className={[
              "min-w-0 rounded-2xl px-3.5 py-2.5 sm:px-4",
              "transition-shadow duration-150",
              isOwn
                ? "rounded-br-md bg-emerald-600 text-white shadow-sm shadow-emerald-100"
                : "rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-sm shadow-slate-100/70",
            ].join(" ")}
          >
            {message.deleted ? (
              <p
                className={`text-sm italic ${
                  isOwn ? "text-emerald-100" : "text-slate-400"
                }`}
              >
                This message was deleted
              </p>
            ) : (
              <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-[14px] leading-[1.65] sm:text-sm">
                {message.text}
              </p>
            )}

            <div
              className={`mt-1.5 flex min-h-4 items-center justify-end gap-1.5 ${
                isOwn ? "text-emerald-100" : "text-slate-400"
              }`}
            >
              {message.edited && !message.deleted && (
                <span className="text-[10px] italic">edited</span>
              )}

              <time
                className="text-[10px] tabular-nums"
                dateTime={message.createdAt || undefined}
                title={
                  message.createdAt
                    ? new Date(message.createdAt).toLocaleString()
                    : undefined
                }
              >
                {time}
              </time>

              {isOwn && <MessageStatus message={message} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
