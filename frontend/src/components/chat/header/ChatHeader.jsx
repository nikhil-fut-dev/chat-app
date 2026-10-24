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
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#687970] transition hover:bg-[#eef5f0] hover:text-[#176c53] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12866a] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40";

  if (!user) {
    return (
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[#e7eee9] bg-white px-4 sm:h-[76px] sm:px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf6f1] text-[#12866a]">
          <Search size={19} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[#24312c]">Chats</h2>
          <p className="text-xs text-[#839089]">
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
    <header className="relative z-10 flex h-16 shrink-0 items-center justify-between gap-1 border-b border-[#e7eee9] bg-white px-2 sm:h-[76px] sm:px-4">
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
              className="h-10 w-10 rounded-full border border-[#e3ebe6] object-cover sm:h-11 sm:w-11"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e4f2e9] text-sm font-semibold text-[#28785e] sm:h-11 sm:w-11">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          {user.isOnline && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-[#24312c] sm:text-[15px]">
            {displayName}
          </h2>

          <div className="mt-1 min-h-4">
            {isTyping ? (
              <p
                className="text-xs font-medium text-[#12866a]"
                aria-live="polite"
              >
                typing…
              </p>
            ) : user.isOnline ? (
              <p className="text-xs text-[#12866a]">online</p>
            ) : lastSeenText ? (
              <p className="truncate text-xs text-[#839089]">
                last seen {lastSeenText}
              </p>
            ) : (
              <p className="truncate text-xs text-[#839089]">
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
          className={actionButtonClass}
          aria-label="Start voice call"
          title={isCallBusy ? "A call is already in progress" : "Voice call"}
        >
          <Phone size={19} />
        </button>

        <button
          type="button"
          disabled={isCallBusy}
          onClick={() => onStartCall?.(user._id, "video")}
          className={actionButtonClass}
          aria-label="Start video call"
          title={isCallBusy ? "A call is already in progress" : "Video call"}
        >
          <Video size={20} />
        </button>
      </div>
    </header>
  );
}
