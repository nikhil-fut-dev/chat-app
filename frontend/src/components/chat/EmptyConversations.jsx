import { MessageCircle } from "lucide-react";

export default function EmptyConversations() {
  return (
    <div className="flex h-full min-h-[300px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-slate-500">
        <MessageCircle size={25} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-300">
        No conversations yet
      </h3>

      <p className="mt-1 max-w-[220px] text-xs leading-5 text-slate-600">
        Start a new conversation to see your chats here.
      </p>
    </div>
  );
}
