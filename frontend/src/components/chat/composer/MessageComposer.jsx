import { useCallback, useEffect, useRef, useState } from "react";
import {
  Send,
  Smile,
  X,
  Paperclip,
  Image as ImageIcon,
  Video,
} from "lucide-react";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export default function MessageComposer({
  onSend,
  onSendMedia,
  isSending = false,
  editingMessage = null,
  onCancelEdit,
  onTyping,
  onStopTyping,
}) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [mediaError, setMediaError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const isComposingRef = useRef(false);
  const mountedRef = useRef(true);
  const wasFocusedRef = useRef(false);
  const uploadControllerRef = useRef(null);

  const isBusy = isSending || isUploadingMedia;
  const isVideo = selectedFile?.type.startsWith("video/");

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";

    const maxHeight = 128;
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, []);

  const resetTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "48px";
    textarea.style.overflowY = "hidden";
  }, []);

  const clearSelectedMedia = useCallback(() => {
    setSelectedFile(null);
    setMediaPreview("");
    setMediaError("");
    setUploadProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      uploadControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setMediaPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setMediaPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (!editingMessage) return;

    clearSelectedMedia();

    const nextText = editingMessage.text || "";
    setText(nextText);

    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.focus({ preventScroll: true });
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      resizeTextarea();
    });
  }, [editingMessage, resizeTextarea, clearSelectedMedia]);

  useEffect(() => {
    resizeTextarea();
  }, [text, resizeTextarea]);

  useEffect(() => {
    const handleViewportChange = () => {
      requestAnimationFrame(resizeTextarea);
    };

    window.addEventListener("resize", handleViewportChange);
    window.visualViewport?.addEventListener("resize", handleViewportChange);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.visualViewport?.removeEventListener(
        "resize",
        handleViewportChange,
      );
    };
  }, [resizeTextarea]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    // Permit selecting the same file again after cancelling.
    event.target.value = "";

    if (!file) return;

    if (isBusy) return;

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideoFile = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideoFile) {
      setMediaError(
        "Unsupported file. Choose JPG, PNG, WEBP, GIF, MP4, WEBM or MOV.",
      );
      return;
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      setMediaError("Images cannot exceed 10 MB.");
      return;
    }

    if (isVideoFile && file.size > MAX_VIDEO_SIZE) {
      setMediaError("Videos cannot exceed 100 MB.");
      return;
    }

    setMediaError("");
    setUploadProgress(0);
    setSelectedFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isBusy) return;

    const messageText = text.trim();
    const shouldRestoreFocus =
      wasFocusedRef.current || document.activeElement === textareaRef.current;

    if (selectedFile) {
      if (typeof onSendMedia !== "function") {
        setMediaError(
          "Media sending is not connected yet. Please try again later.",
        );
        return;
      }

      onStopTyping?.();
      setMediaError("");
      setUploadProgress(0);
      setIsUploadingMedia(true);

      const controller = new AbortController();
      uploadControllerRef.current = controller;

      try {
        const success = await onSendMedia({
          file: selectedFile,
          caption: messageText,
          signal: controller.signal,
          onUploadProgress: (progress) => {
            if (mountedRef.current) {
              setUploadProgress(progress);
            }
          },
        });

        if (!mountedRef.current || success === false) return;

        setText("");
        clearSelectedMedia();
        resetTextarea();

        if (shouldRestoreFocus) {
          requestAnimationFrame(() => {
            if (!textareaRef.current || !mountedRef.current) return;

            textareaRef.current.focus({ preventScroll: true });
            wasFocusedRef.current = true;
          });
        }
      } catch (error) {
        if (error?.code !== "ERR_CANCELED" && error?.name !== "AbortError") {
          console.error("Failed to send media:", error);

          if (mountedRef.current) {
            setMediaError(
              error?.response?.data?.message ||
                error?.message ||
                "Could not upload media. Please try again.",
            );
          }
        }
      } finally {
        uploadControllerRef.current = null;

        if (mountedRef.current) {
          setIsUploadingMedia(false);
        }
      }

      return;
    }

    if (!messageText) return;

    onStopTyping?.();

    try {
      const success = await onSend(messageText);

      if (!mountedRef.current || success === false) return;

      setText("");
      resetTextarea();

      if (editingMessage) {
        wasFocusedRef.current = false;
        onCancelEdit?.();
        return;
      }

      if (shouldRestoreFocus) {
        requestAnimationFrame(() => {
          const textarea = textareaRef.current;

          if (!textarea || !mountedRef.current) return;

          textarea.focus({ preventScroll: true });
          wasFocusedRef.current = true;
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing &&
      !isComposingRef.current
    ) {
      event.preventDefault();
      handleSubmit(event);
    }

    if (event.key === "Escape" && editingMessage) {
      setText("");
      resetTextarea();
      wasFocusedRef.current = false;
      onStopTyping?.();
      onCancelEdit?.();
    }
  };

  const handleCancelEdit = () => {
    setText("");
    resetTextarea();
    wasFocusedRef.current = false;
    onStopTyping?.();
    onCancelEdit?.();
  };

  const handleCancelMedia = () => {
    if (isUploadingMedia) {
      uploadControllerRef.current?.abort();
      return;
    }

    clearSelectedMedia();
  };

  return (
    <div className="relative z-10 shrink-0 border-t border-[#e7eee9] bg-white px-2.5 pt-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:px-5 sm:py-4">
      {editingMessage && (
        <div className="mx-auto mb-3 flex max-w-4xl items-center gap-3 rounded-xl border border-[#d7e9df] bg-[#f0f8f3] px-3 py-2.5 sm:px-4">
          <div className="h-8 w-1 shrink-0 rounded-full bg-[#12866a]" />

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#176c53]">
              Editing message
            </p>
            <p className="mt-0.5 truncate text-xs text-[#75857c]">
              {editingMessage.text}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCancelEdit}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#839089] transition hover:bg-[#e0eee5] hover:text-[#34443c]"
            aria-label="Cancel editing"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {selectedFile && mediaPreview && (
        <div className="mx-auto mb-3 max-w-4xl rounded-2xl border border-[#dfe8e2] bg-[#f7faf8] p-3">
          <div className="flex items-start gap-3">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#e7eee9]">
              {isVideo ? (
                <video
                  src={mediaPreview}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  src={mediaPreview}
                  alt="Selected media preview"
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="min-w-0 flex-1 pt-1">
              <p className="truncate text-sm font-semibold text-[#24312c]">
                {selectedFile.name}
              </p>
              <p className="mt-1 text-xs text-[#75857c]">
                {isVideo ? "Video" : "Image"} ·{" "}
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>

              {isUploadingMedia && (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-[#176c53]">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>

                  <div
                    className="h-1.5 overflow-hidden rounded-full bg-[#dfe8e2]"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={uploadProgress}
                  >
                    <div
                      className="h-full rounded-full bg-[#12866a] transition-[width]"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleCancelMedia}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#75857c] hover:bg-[#e7eee9] hover:text-[#24312c]"
              aria-label={
                isUploadingMedia ? "Cancel upload" : "Remove selected media"
              }
              title={
                isUploadingMedia ? "Cancel upload" : "Remove selected media"
              }
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {mediaError && (
        <div
          role="alert"
          className="mx-auto mb-3 flex max-w-4xl items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          <span>{mediaError}</span>
          <button
            type="button"
            onClick={() => setMediaError("")}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-4xl items-end gap-2 sm:gap-3"
      >
        <div className="flex min-h-12 min-w-0 flex-1 items-end rounded-2xl border border-[#dfe8e2] bg-[#f7faf8] px-1.5 transition-colors focus-within:border-[#12866a] focus-within:ring-2 focus-within:ring-[#12866a]/10 sm:px-2">
          <button
            type="button"
            disabled={isBusy || Boolean(editingMessage)}
            onClick={() => fileInputRef.current?.click()}
            className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#75857c] transition hover:bg-[#e7eee9] hover:text-[#12866a] disabled:cursor-not-allowed disabled:opacity-40"
            title="Attach image or video"
            aria-label="Attach image or video"
          >
            <Paperclip size={19} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            onChange={handleFileChange}
            className="hidden"
            tabIndex={-1}
            aria-label="Choose an image or video"
          />

          <button
            type="button"
            disabled
            className="mb-1 hidden h-9 w-9 shrink-0 cursor-not-allowed items-center justify-center rounded-xl text-[#aab5ae] sm:flex"
            title="Emoji picker coming soon"
            aria-label="Emoji picker coming soon"
          >
            <Smile size={19} />
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onFocus={() => {
              wasFocusedRef.current = true;
            }}
            onBlur={() => {
              onStopTyping?.();
            }}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false;
            }}
            onChange={(event) => {
              const value = event.target.value;
              setText(value);

              if (!editingMessage && !selectedFile) {
                if (value.trim()) {
                  onTyping?.();
                } else {
                  onStopTyping?.();
                }
              }
            }}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={5000}
            enterKeyHint="send"
            autoComplete="off"
            aria-label={selectedFile ? "Media caption" : "Message"}
            placeholder={
              editingMessage
                ? "Edit your message..."
                : selectedFile
                  ? "Add a caption..."
                  : "Write a message..."
            }
            className="block min-h-12 max-h-32 min-w-0 flex-1 resize-none overflow-y-hidden bg-transparent px-2 py-3 text-base leading-6 text-[#24312c] outline-none placeholder:text-[#9aa69f] sm:text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={
            isBusy ||
            (!selectedFile && !text.trim()) ||
            (Boolean(selectedFile) && typeof onSendMedia !== "function")
          }
          className="mb-0 flex h-12 w-12 shrink-0 touch-manipulation items-center justify-center rounded-2xl bg-[#12866a] text-white shadow-sm transition duration-150 hover:bg-[#0e7058] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12866a] focus-visible:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:bg-[#e7eee9] disabled:text-[#9aa69f] disabled:shadow-none"
          aria-label={
            isUploadingMedia
              ? `Uploading ${uploadProgress}%`
              : editingMessage
                ? "Update message"
                : "Send message"
          }
          title="Send message"
        >
          {isBusy ? (
            <span
              className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-label="Sending"
            />
          ) : selectedFile ? (
            isVideo ? (
              <Video size={18} />
            ) : (
              <ImageIcon size={18} />
            )
          ) : (
            <Send size={18} className={text.trim() ? "translate-x-px" : ""} />
          )}
        </button>
      </form>

      <p className="mx-auto mt-2 hidden max-w-4xl text-center text-[10px] text-[#9aa69f] sm:block">
        Enter to send <span className="px-1 text-[#c2ccc5]">·</span> Shift +
        Enter for a new line
      </p>
    </div>
  );
}
