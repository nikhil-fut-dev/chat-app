import { useDispatch, useSelector } from "react-redux";
import { setActiveConversation } from "../../store/slices/conversationSlice";

const formatConversationTime = (date) => {
  if (!date) return "";

  const messageDate = new Date(date);

  if (Number.isNaN(messageDate.getTime())) {
    return "";
  }

  return messageDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ConversationItem({ conversation }) {
  const dispatch = useDispatch();

  const activeConversation = useSelector(
    (state) => state.conversations.activeConversation,
  );

  const user = conversation.user;

  const isActive =
    activeConversation?.conversationId === conversation.conversationId;

  const handleClick = () => {
    dispatch(setActiveConversation(conversation));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition",
        isActive ? "bg-indigo-500/10" : "hover:bg-slate-900",
      ].join(" ")}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.fullName || user.username}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-slate-300">
            {user?.fullName?.charAt(0)?.toUpperCase() ||
              user?.username?.charAt(0)?.toUpperCase() ||
              "U"}
          </div>
        )}

        {/* Online */}
        {user?.isOnline && (
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-emerald-500" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={[
              "truncate text-sm font-semibold",
              isActive ? "text-indigo-300" : "text-slate-200",
            ].join(" ")}
          >
            {user?.fullName || user?.username || "Unknown user"}
          </h3>

          <span className="shrink-0 text-[11px] text-slate-600">
            {formatConversationTime(conversation.updatedAt)}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-slate-500">
            {conversation.lastMessage?.text || "Start a conversation"}
          </p>
        </div>
      </div>
    </button>
  );
}
