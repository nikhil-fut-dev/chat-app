import { useEffect, useRef, useState } from "react";
import { Download, Expand, Pencil, Trash2, X } from "lucide-react";
import MessageStatus from "./MessageStatus";

export default function MessageBubble({
  message,
  currentUserId,
  onEdit,
  onDelete,
}) {
  const [showActions, setShowActions] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);

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

  const attachments = Array.isArray(message.attachments)
    ? message.attachments
    : [];

  const isImageMessage = message.messageType === "image";
  const isVideoMessage = message.messageType === "video";

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

  // Close the full-screen media preview with Escape.
  useEffect(() => {
    if (!previewMedia) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setPreviewMedia(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewMedia]);

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

  const renderMedia = (attachment, index) => {
    if (!attachment?.url) return null;

    const mediaType =
      attachment.resourceType === "video" ||
      attachment.mimeType?.startsWith("video/") ||
      (isVideoMessage && !attachment.mimeType?.startsWith("image/"))
        ? "video"
        : isImageMessage || attachment.mimeType?.startsWith("image/")
          ? "image"
          : null;

    if (!mediaType) return null;

    const fileName =
      attachment.fileName ||
      `${mediaType}-${message._id || index}.${
        mediaType === "video" ? "mp4" : "jpg"
      }`;

    return (
      <div
        key={attachment.publicId || attachment.url || index}
        className="mb-2 min-w-0 overflow-hidden rounded-xl"
      >
        {mediaType === "image" ? (
          <button
            type="button"
            onClick={() =>
              setPreviewMedia({
                url: attachment.url,
                type: "image",
                fileName,
              })
            }
            className="group/media relative block max-w-full overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Open image preview"
          >
            <img
              src={attachment.url}
              alt={attachment.fileName || "Shared image"}
              loading="lazy"
              className="max-h-[360px] w-auto max-w-full rounded-xl object-contain sm:max-h-[440px]"
            />

            <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover/media:bg-black/15 group-hover/media:opacity-100">
              <Expand size={26} />
            </span>
          </button>
        ) : (
          <video
            src={attachment.url}
            controls
            playsInline
            preload="metadata"
            className="max-h-[360px] w-full rounded-xl bg-black sm:max-h-[440px]"
            aria-label="Shared video"
          >
            Your browser does not support video playback.
          </video>
        )}

        <div
          className={`flex items-center justify-between gap-3 px-1 pt-2 text-xs ${
            isOwn ? "text-emerald-100" : "text-slate-500"
          }`}
        >
          <span className="min-w-0 truncate">
            {attachment.fileName || (mediaType === "image" ? "Image" : "Video")}
          </span>

          <a
            href={attachment.url}
            download={fileName}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-lg px-2 transition hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label={`Download ${fileName}`}
          >
            <Download size={15} />
            Download
          </a>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className={`group flex w-full ${
          isOwn ? "justify-end" : "justify-start"
        }`}
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
                <>
                  {attachments.map((attachment, index) =>
                    renderMedia(attachment, index),
                  )}

                  {message.text && (
                    <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-[14px] leading-[1.65] sm:text-sm">
                      {message.text}
                    </p>
                  )}
                </>
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

      {previewMedia && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Media preview"
          onClick={() => setPreviewMedia(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewMedia(null)}
            className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close media preview"
          >
            <X size={24} />
          </button>

          {previewMedia.type === "image" ? (
            <img
              src={previewMedia.url}
              alt={previewMedia.fileName || "Image preview"}
              onClick={(event) => event.stopPropagation()}
              className="max-h-[88vh] max-w-full object-contain"
            />
          ) : (
            <video
              src={previewMedia.url}
              controls
              autoPlay
              playsInline
              onClick={(event) => event.stopPropagation()}
              className="max-h-[88vh] max-w-full"
            />
          )}
        </div>
      )}
    </>
  );
}
