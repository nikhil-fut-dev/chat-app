import { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text || "");

      requestAnimationFrame(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.focus();
        textarea.setSelectionRange(
          textarea.value.length,
          textarea.value.length,
        );
        resizeTextarea();
      });
    }
  }, [editingMessage]);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";

    const maxHeight = 128;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  const resetTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.overflowY = "hidden";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const messageText = text.trim();

    if (!messageText || isSending) return;

    onStopTyping?.();

    try {
      const success = await onSend(messageText);

      if (success !== false) {
        setText("");
        resetTextarea();

        if (editingMessage) {
          onCancelEdit?.();
        }
      }
    } catch (error) {
      // Preserve the draft if sending fails.
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      handleSubmit(event);
    }

    if (event.key === "Escape" && editingMessage) {
      setText("");
      resetTextarea();
      onCancelEdit?.();
    }
  };

  const handleCancelEdit = () => {
    setText("");
    resetTextarea();
    onStopTyping?.();
    onCancelEdit?.();
  };

  return (
    <div className="shrink-0 border-t border-slate-800/80 bg-slate-950 px-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-3 sm:px-5 sm:py-4">
      {editingMessage && (
        <div className="mx-auto mb-3 flex max-w-4xl items-center gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.07] px-3 py-2.5 sm:px-4">
          <div className="h-8 w-1 shrink-0 rounded-full bg-indigo-400" />

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-indigo-300">
              Editing message
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-400">
              {editingMessage.text}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCancelEdit}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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
        <div className="flex min-h-12 min-w-0 flex-1 items-end rounded-2xl border border-slate-800 bg-slate-900/80 px-1.5 transition-colors focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/10 sm:px-2">
          <button
            type="button"
            disabled
            className="mb-1 flex h-9 w-9 shrink-0 cursor-not-allowed items-center justify-center rounded-xl text-slate-600"
            title="Emoji picker coming soon"
            aria-label="Emoji picker coming soon"
          >
            <Smile size={19} />
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(event) => {
              const value = event.target.value;

              setText(value);
              resizeTextarea();

              if (!editingMessage) {
                if (value.trim()) {
                  onTyping?.();
                } else {
                  onStopTyping?.();
                }
              }
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!text.trim()) {
                onStopTyping?.();
              }
            }}
            rows={1}
            maxLength={5000}
            enterKeyHint="send"
            aria-label="Message"
            placeholder={
              editingMessage ? "Edit your message..." : "Write a message..."
            }
            className="block max-h-32 min-h-12 min-w-0 flex-1 resize-none overflow-y-hidden bg-transparent px-2 py-3 text-base leading-6 text-slate-100 outline-none placeholder:text-slate-500 sm:text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isSending}
          className="mb-0 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition duration-150 hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
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

      <p className="mx-auto mt-2 hidden max-w-4xl text-center text-[10px] text-slate-600 sm:block">
        Enter to send <span className="px-1 text-slate-700">·</span> Shift +
        Enter for a new line
      </p>
    </div>
  );
}
