import { ArrowLeft, Phone, Search, Video } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { clearActiveConversation } from "../../../store/slices/conversationSlice";

export default function ChatHeader({
  isTyping = false,
  onBack,
  onOpenSidebar,
  onStartCall,
  callStatus = "idle",
}) {
  const dispatch = useDispatch();

  const activeConversation = useSelector(
    (state) => state.conversations.activeConversation,
  );

  const user = activeConversation?.user;
  const isCallBusy = callStatus !== "idle";

  const actionButtonClass =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-95";

  if (!user) {
    return (
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-800 bg-slate-950 px-4 sm:h-[76px] sm:px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <Search size={19} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Chats</h2>
          <p className="text-xs text-slate-500">
            Select a conversation to start chatting
          </p>
        </div>
      </header>
    );
  }

  const displayName = user.fullName || user.username || "Unknown user";

  const lastSeenText = user.lastSeen
    ? new Date(user.lastSeen).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <header className="relative z-10 flex h-16 shrink-0 items-center justify-between gap-1 border-b border-slate-800/90 bg-slate-950 px-2 sm:h-[76px] sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-3">
        <button
          type="button"
          onClick={() => {
            dispatch(clearActiveConversation());
            onBack?.();
          }}
          className={`${actionButtonClass} lg:hidden`}
          aria-label="Back to chats"
          title="Back to chats"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="relative shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              className="h-10 w-10 rounded-full border border-slate-700 object-cover sm:h-11 sm:w-11"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-semibold text-emerald-300 sm:h-11 sm:w-11">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          {user.isOnline && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-white sm:text-[15px]">
            {displayName}
          </h2>

          <div className="mt-1 min-h-4">
            {isTyping ? (
              <p
                className="text-xs font-medium text-emerald-400"
                aria-live="polite"
              >
                typing…
              </p>
            ) : user.isOnline ? (
              <p className="text-xs text-emerald-400">online</p>
            ) : lastSeenText ? (
              <p className="truncate text-xs text-slate-500">
                last seen {lastSeenText}
              </p>
            ) : (
              <p className="truncate text-xs text-slate-500">
                @{user.username || "user"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0 sm:gap-1">
        <button
          type="button"
          disabled
          className={`${actionButtonClass} cursor-not-allowed opacity-40`}
          aria-label="Message search not available yet"
          title="Message search not connected yet"
        >
          <Search size={19} />
        </button>

        <button
          type="button"
          disabled={isCallBusy}
          onClick={() => onStartCall?.(user._id, "audio")}
          className={`${actionButtonClass} ${
            isCallBusy ? "cursor-not-allowed opacity-40" : ""
          }`}
          aria-label="Start voice call"
          title={isCallBusy ? "A call is already in progress" : "Voice call"}
        >
          <Phone size={19} />
        </button>

        <button
          type="button"
          disabled={isCallBusy}
          onClick={() => onStartCall?.(user._id, "video")}
          className={`${actionButtonClass} ${
            isCallBusy ? "cursor-not-allowed opacity-40" : ""
          }`}
          aria-label="Start video call"
          title={isCallBusy ? "A call is already in progress" : "Video call"}
        >
          <Video size={20} />
        </button>
      </div>
    </header>
  );
}
