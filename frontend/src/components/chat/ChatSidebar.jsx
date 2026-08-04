import { useEffect, useState } from "react";
import { MessageCircle, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import UserSearchModal from "./search/UserSearchModal";
import ConversationList from "./ConversationList";

import { getConversations } from "../../api/conversationApi";

import {
  setConversations,
  setConversationLoading,
  setConversationError,
  setActiveConversation,
} from "../../store/slices/conversationSlice";

export default function ChatSidebar({ isOpen = false, onClose = () => {} }) {
  const dispatch = useDispatch();

  const [showUserSearch, setShowUserSearch] = useState(false);

  const { conversations, isLoading } = useSelector(
    (state) => state.conversations,
  );

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        dispatch(setConversationLoading(true));
        dispatch(setConversationError(null));

        const response = await getConversations();

        dispatch(setConversations(response.data || []));
      } catch (error) {
        const message =
          error?.response?.data?.message || "Unable to load conversations.";

        dispatch(setConversationError(message));

        toast.error(message);
      } finally {
        dispatch(setConversationLoading(false));
      }
    };

    fetchConversations();
  }, [dispatch]);

  const handleSelectUser = (user) => {
    if (!user?._id) {
      toast.error("Unable to open this user.");
      return;
    }

    /*
     * This is a temporary conversation.
     *
     * Backend will create the real Conversation document
     * when the first message is sent.
     */
    const temporaryConversation = {
      conversationId: `new-${user._id}`,
      user,
      lastMessage: null,
      updatedAt: null,
    };

    dispatch(setActiveConversation(temporaryConversation));

    setShowUserSearch(false);

    onClose();
  };

  return (
    <>
      <aside
        className={`
    fixed inset-y-0 left-0 z-50
    flex h-full w-[min(360px,88vw)] min-w-0 flex-col
    border-r border-slate-800 bg-slate-950
    transition-transform duration-300 ease-in-out

    ${isOpen ? "translate-x-0" : "-translate-x-full"}

    lg:static
    lg:z-auto
    lg:h-full
    lg:w-[360px]
    lg:translate-x-0
  `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
              <MessageCircle size={20} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight text-slate-100">
                CBNK • Chat-App
              </h1>

              <p className="text-xs text-slate-500">Messages</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowUserSearch(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-900 hover:text-indigo-400"
            title="New conversation"
            aria-label="New conversation"
          >
            <Plus size={19} />
          </button>
        </div>

        {/* Conversation heading */}
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Conversations
          </h2>

          <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-500">
            {conversations.length}
          </span>
        </div>

        {/* Conversation list */}
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          <ConversationList conversations={conversations} loading={isLoading} />
        </div>
      </aside>

      {/* New conversation modal */}
      <UserSearchModal
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onSelectUser={handleSelectUser}
      />
    </>
  );
}
