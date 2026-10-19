import { useEffect, useRef, useState } from "react";
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

  // Long press for mobile
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

  const cancelLongPress = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
      }
    };
  }, []);

  // Right-click for desktop
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
    <div className={`flex w-full ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex min-w-0 max-w-[92%] items-end gap-2 sm:max-w-[78%] lg:max-w-[70%] ${
          isOwn ? "flex-row-reverse" : ""
        }`}
      >
        {/* Incoming user avatar */}
        {!isOwn && (
          <div className="mb-1 shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={senderName}
                loading="lazy"
                className="h-7 w-7 rounded-full border border-slate-700/70 object-cover sm:h-8 sm:w-8"
              />
            ) : (
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-300 sm:h-8 sm:w-8"
                aria-label={`${senderName} avatar`}
              >
                {senderName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}

        {/* Message and actions */}
        <div
          className="relative min-w-0 max-w-full"
          data-message-actions
          onPointerDown={startLongPress}
          onPointerUp={cancelLongPress}
          onPointerLeave={cancelLongPress}
          onPointerCancel={cancelLongPress}
          onContextMenu={handleContextMenu}
        >
          {/* Edit / Delete menu */}
          {showActions && isOwn && !message.deleted && (
            <div
              className="absolute bottom-full right-0 z-50 mb-2 flex min-w-[150px] items-center rounded-xl border border-slate-700/80 bg-slate-900 p-1.5 shadow-xl shadow-black/30"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleEdit}
                className="min-h-10 flex-1 rounded-lg px-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="min-h-10 flex-1 rounded-lg px-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Delete
              </button>
            </div>
          )}

          {/* Message bubble */}
          <div
            className={[
              "min-w-0 rounded-2xl px-3.5 py-2.5 sm:px-4",
              "shadow-sm transition-colors duration-150",
              isOwn
                ? "rounded-br-md bg-indigo-600 text-white"
                : "rounded-bl-md border border-slate-800/90 bg-slate-900 text-slate-100",
            ].join(" ")}
          >
            {message.deleted ? (
              <p className="text-sm italic text-slate-400">
                This message was deleted
              </p>
            ) : (
              <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-[14px] leading-[1.65] sm:text-sm">
                {message.text}
              </p>
            )}

            <div
              className={`mt-1.5 flex min-h-3.5 items-center justify-end gap-1.5 ${
                isOwn ? "text-indigo-200" : "text-slate-500"
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
