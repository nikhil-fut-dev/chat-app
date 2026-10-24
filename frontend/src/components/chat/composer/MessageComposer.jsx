import { useCallback, useEffect, useRef, useState } from "react";
import { Send, Smile, X } from "lucide-react";

export default function MessageComposer({
  onSend,
  isSending = false,
  editingMessage = null,
  onCancelEdit,
  onTyping,
  onStopTyping,
}) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);
  const isComposingRef = useRef(false);
  const mountedRef = useRef(true);
  const wasFocusedRef = useRef(false);

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

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!editingMessage) return;

    const nextText = editingMessage.text || "";
    setText(nextText);

    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.focus({ preventScroll: true });
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      resizeTextarea();
    });
  }, [editingMessage, resizeTextarea]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    resizeTextarea();
  }, [text, resizeTextarea]);

  // Keep the composer dimensions correct when the mobile viewport changes.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const visualViewport = window.visualViewport;

    const handleViewportChange = () => {
      requestAnimationFrame(resizeTextarea);
    };

    window.addEventListener("resize", handleViewportChange);
    visualViewport?.addEventListener("resize", handleViewportChange);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      visualViewport?.removeEventListener("resize", handleViewportChange);
    };
  }, [resizeTextarea]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const messageText = text.trim();

    if (!messageText || isSending) return;

    const shouldRestoreFocus =
      wasFocusedRef.current || document.activeElement === textareaRef.current;

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

      // Restore focus after React updates the cleared textarea.
      // This helps keep the mobile keyboard available for the next message.
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#839089] transition hover:bg-[#e0eee5] hover:text-[#34443c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12866a]"
            aria-label="Cancel editing"
            title="Cancel editing"
          >
            <X size={17} />
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
            disabled
            className="mb-1 flex h-9 w-9 shrink-0 cursor-not-allowed items-center justify-center rounded-xl text-[#aab5ae]"
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

              if (!editingMessage) {
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
            aria-label="Message"
            placeholder={
              editingMessage ? "Edit your message..." : "Write a message..."
            }
            className="block min-h-12 max-h-32 min-w-0 flex-1 resize-none overflow-y-hidden bg-transparent px-2 py-3 text-base leading-6 text-[#24312c] outline-none placeholder:text-[#9aa69f] sm:text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isSending}
          className="mb-0 flex h-12 w-12 shrink-0 touch-manipulation items-center justify-center rounded-2xl bg-[#12866a] text-white shadow-sm transition duration-150 hover:bg-[#0e7058] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12866a] focus-visible:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:bg-[#e7eee9] disabled:text-[#9aa69f] disabled:shadow-none"
          aria-label={editingMessage ? "Update message" : "Send message"}
          title={editingMessage ? "Update message" : "Send message"}
        >
          {isSending ? (
            <span
              className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-label="Sending"
            />
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
