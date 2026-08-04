import { useEffect, useRef, useState } from "react";
import { Send, Smile } from "lucide-react";

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
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    onStopTyping?.();

    if (!text.trim() || isSending) {
      return;
    }

    const success = await onSend(text);

    if (success !== false) {
      setText("");

      if (editingMessage) {
        onCancelEdit?.();
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <div className="shrink-0 border-t border-slate-800 bg-slate-950 px-4 py-3 sm:px-6 sm:py-4">
      {editingMessage && (
        <div className="mx-auto mb-3 flex max-w-4xl items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-2.5">
          <div>
            <p className="text-xs font-semibold text-indigo-300">
              Editing message
            </p>

            <p className="mt-0.5 max-w-[280px] truncate text-xs text-slate-500">
              {editingMessage.text}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setText("");
              onCancelEdit?.();
            }}
            className="text-xs font-medium text-slate-500 hover:text-slate-200"
          >
            Cancel
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-4xl items-end gap-2"
      >
        <div className="flex min-h-[48px] flex-1 items-end rounded-2xl border border-slate-800 bg-slate-900/70 px-3 transition focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/10">
          <button
            type="button"
            className="mb-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
            title="Emoji"
          >
            <Smile size={19} />
          </button>

          <textarea
            ref={textareaRef}
            value={text}
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
            placeholder={
              editingMessage ? "Edit your message..." : "Write a message..."
            }
            className="max-h-32 min-h-[46px] flex-1 resize-none bg-transparent px-2 py-3 text-sm leading-5 text-slate-200 outline-none placeholder:text-slate-600"
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isSending}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
          title={editingMessage ? "Update message" : "Send message"}
        >
          <Send size={18} />
        </button>
      </form>

      <p className="mx-auto mt-2 hidden max-w-4xl text-[10px] text-slate-700 sm:block">
        Press Enter to send • Shift + Enter for a new line
      </p>
    </div>
  );
}
