import { useDispatch, useSelector } from "react-redux";
import { CheckCheck, MessageCircle } from "lucide-react";
import { setActiveConversation } from "../../store/slices/conversationSlice";

const formatConversationTime = (date) => {
  if (!date) return "";

  const messageDate = new Date(date);

  if (Number.isNaN(messageDate.getTime())) return "";

  const now = new Date();
  const sameDay = messageDate.toDateString() === now.toDateString();

  if (sameDay) {
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return messageDate.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
};

export default function ConversationItem({ conversation }) {
  const dispatch = useDispatch();

  const activeConversation = useSelector(
    (state) => state.conversations.activeConversation,
  );

  const user = conversation?.user;

  const isActive =
    activeConversation?.conversationId === conversation?.conversationId;

  const displayName = user?.fullName || user?.username || "Unknown user";

  const lastMessage =
    typeof conversation?.lastMessage === "string"
      ? conversation.lastMessage
      : conversation?.lastMessage?.content ||
        conversation?.lastMessage?.text ||
        "";

  const handleClick = () => {
    dispatch(setActiveConversation(conversation));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-current={isActive ? "true" : undefined}
      className={[
        "group flex w-full min-w-0 items-center gap-3 rounded-2xl px-3 py-3 text-left",
        "transition-colors duration-150 focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600",
        isActive ? "bg-[#eaf6f1]" : "hover:bg-[#f4f8f6] active:bg-[#edf4f0]",
      ].join(" ")}
    >
      <div className="relative shrink-0">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={displayName}
            className="h-[50px] w-[50px] rounded-full border border-black/[0.04] object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#e7f1ec] text-base font-semibold text-[#28785e]">
            {displayName.charAt(0).toUpperCase() || "U"}
          </div>
        )}

        {user?.isOnline && (
          <span
            className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-[2.5px] border-white bg-emerald-500"
            aria-label="Online"
            title="Online"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <h3
            className={[
              "truncate text-[14px] font-semibold leading-5",
              isActive ? "text-[#176c53]" : "text-[#24312c]",
            ].join(" ")}
          >
            {displayName}
          </h3>

          <span
            className={[
              "shrink-0 text-[10px] leading-4",
              isActive ? "text-[#42836b]" : "text-[#89958f]",
            ].join(" ")}
          >
            {formatConversationTime(conversation?.updatedAt)}
          </span>
        </div>

        <div className="mt-1 flex min-w-0 items-center gap-1.5">
          {lastMessage ? (
            <>
              <CheckCheck
                size={15}
                className="shrink-0 text-[#7b9e8e]"
                aria-hidden="true"
              />
              <p className="truncate text-[12px] leading-5 text-[#78857f]">
                {lastMessage}
              </p>
            </>
          ) : (
            <>
              <MessageCircle
                size={14}
                className="shrink-0 text-[#9aa69f]"
                aria-hidden="true"
              />
              <p className="truncate text-[12px] leading-5 text-[#89958f]">
                Start a conversation
              </p>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
