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

  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  // ==========================================
  // Close menu when clicking outside
  // ==========================================

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

  // ==========================================
  // Long Press
  // ==========================================

  const startLongPress = () => {
    if (!isOwn || message.deleted) {
      return;
    }

    longPressTriggeredRef.current = false;

    pressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      setShowActions(true);

      // Small vibration on supported mobile devices
      if (navigator.vibrate) {
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

  // ==========================================
  // Right Click - Desktop
  // ==========================================

  const handleContextMenu = (event) => {
    if (!isOwn || message.deleted) {
      return;
    }

    event.preventDefault();

    cancelLongPress();
    setShowActions(true);
  };

  // ==========================================
  // Edit
  // ==========================================

  const handleEdit = () => {
    setShowActions(false);
    cancelLongPress();

    onEdit?.(message);
  };

  // ==========================================
  // Delete
  // ==========================================

  const handleDelete = () => {
    setShowActions(false);
    cancelLongPress();

    onDelete?.(message);
  };

  return (
    <div className={`flex w-full ${isOwn ? "justify-end" : "justify-start"}`}>
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

        {/* Message */}
        <div
          className="relative min-w-0"
          data-message-actions
          onPointerDown={startLongPress}
          onPointerUp={cancelLongPress}
          onPointerLeave={cancelLongPress}
          onPointerCancel={cancelLongPress}
          onContextMenu={handleContextMenu}
        >
          {/* ==========================================
              Edit / Delete Menu
          ========================================== */}

          {showActions && isOwn && !message.deleted && (
            <div
              className={`absolute z-50 ${
                isOwn ? "right-0" : "left-0"
              } bottom-full mb-2 flex items-center overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-1 shadow-2xl`}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleEdit}
                className="rounded-lg px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white active:bg-slate-700"
              >
                Edit
              </button>

              <div className="h-5 w-px bg-slate-700" />

              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10 active:bg-red-500/20"
              >
                Delete
              </button>
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={[
              "rounded-2xl px-4 py-2.5 shadow-sm",
              "select-none touch-manipulation",
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
