import { MoreHorizontal } from "lucide-react";

export default function TypingIndicator({ username = "Someone" }) {
  return (
    <div className="px-4 pb-2 sm:px-6">
      <div className="mx-auto flex max-w-4xl items-center gap-2">
        <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.3s]" />

            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.15s]" />

            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500" />
          </div>

          <span className="text-xs text-slate-500">
            {username} is typing...
          </span>
        </div>
      </div>
    </div>
  );
}
