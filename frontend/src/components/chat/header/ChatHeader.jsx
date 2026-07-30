import { Phone, Search, Video } from "lucide-react";
import { useSelector } from "react-redux";

export default function ChatHeader() {
  const activeConversation = useSelector(
    (state) => state.conversations.activeConversation,
  );

  const user = activeConversation?.user;

  if (!user) {
    return (
      <header className="flex h-[76px] items-center border-b border-slate-800 bg-slate-950 px-5">
        <p className="text-sm text-slate-500">
          Select a conversation to start chatting
        </p>
      </header>
    );
  }

  const displayName = user.fullName || user.username || "Unknown user";

  return (
    <header className="flex h-[76px] items-center justify-between border-b border-slate-800 bg-slate-950 px-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-500/15 text-sm font-semibold text-indigo-300">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          {user.isOnline && (
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-emerald-500" />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-slate-100">
            {displayName}
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            {user.isOnline
              ? "Online"
              : user.lastSeen
                ? `Last seen ${new Date(user.lastSeen).toLocaleString()}`
                : `@${user.username || "user"}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-900 hover:text-slate-200"
          title="Search"
        >
          <Search size={19} />
        </button>

        <button
          type="button"
          className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-900 hover:text-slate-200 sm:flex"
          title="Voice call"
        >
          <Phone size={19} />
        </button>

        <button
          type="button"
          className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-900 hover:text-slate-200 sm:flex"
          title="Video call"
        >
          <Video size={20} />
        </button>
      </div>
    </header>
  );
}
