import { useEffect, useMemo, useState } from "react";
import {
  MessageCircle,
  Plus,
  Search,
  MoreVertical,
  Phone,
  Settings,
  CircleUserRound,
  X,
  ChevronRight,
} from "lucide-react";
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
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("chats");

  const {
    conversations = [],
    isLoading,
    error,
  } = useSelector((state) => state.conversations);

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    let cancelled = false;

    const fetchConversations = async () => {
      try {
        dispatch(setConversationLoading(true));
        dispatch(setConversationError(null));

        const response = await getConversations();

        if (!cancelled) {
          dispatch(setConversations(response.data || []));
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err?.response?.data?.message || "Unable to load conversations.";

          dispatch(setConversationError(message));
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          dispatch(setConversationLoading(false));
        }
      }
    };

    fetchConversations();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const filteredConversations = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) return conversations;

    return conversations.filter((conversation) => {
      const name =
        conversation.user?.fullName || conversation.user?.username || "";

      const username = conversation.user?.username || "";

      const lastMessage =
        typeof conversation.lastMessage === "string"
          ? conversation.lastMessage
          : conversation.lastMessage?.content ||
            conversation.lastMessage?.text ||
            "";

      return `${name} ${username} ${lastMessage}`.toLowerCase().includes(query);
    });
  }, [conversations, searchText]);

  const handleSelectUser = (selectedUser) => {
    if (!selectedUser?._id) {
      toast.error("Unable to open this user.");
      return;
    }

    const existingConversation = conversations.find(
      (conversation) =>
        conversation.user?._id?.toString() === selectedUser._id.toString(),
    );

    dispatch(
      setActiveConversation(
        existingConversation || {
          conversationId: `new-${selectedUser._id}`,
          user: selectedUser,
          lastMessage: null,
          updatedAt: null,
        },
      ),
    );

    setShowUserSearch(false);
    setShowSearch(false);
    setSearchText("");
    onClose();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowMenu(false);
  };

  const displayName = user?.fullName || user?.username || "Your account";

  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <>
      <aside
        className={[
          "fixed inset-0 z-50 flex h-[100dvh] w-full min-w-0 flex-col",
          "overflow-hidden border-r border-[#e6ede9] bg-white text-[#24312c]",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:relative lg:inset-auto lg:z-auto lg:h-full lg:w-[360px]",
          "lg:shrink-0 lg:translate-x-0",
        ].join(" ")}
      >
        {/* Brand and actions */}
        <header className="relative shrink-0 border-b border-[#edf1ee] px-4 pb-4 pt-[max(16px,env(safe-area-inset-top))] sm:px-5 lg:pb-4">
          <div className="flex min-h-12 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#12866a] text-white shadow-sm shadow-emerald-900/10">
                <MessageCircle size={23} strokeWidth={2.2} />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-[19px] font-bold tracking-tight text-[#17211f]">
                  CBNK Chat
                </h1>
                <p className="mt-0.5 text-xs text-[#839089]">Stay connected</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setShowSearch((value) => !value);
                  setSearchText("");
                  setShowMenu(false);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[#718078] transition hover:bg-[#f1f6f3] hover:text-[#176c53] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12866a]"
                aria-label={showSearch ? "Close chat search" : "Search chats"}
                title="Search chats"
              >
                {showSearch ? <X size={20} /> : <Search size={20} />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowUserSearch(true);
                  setShowMenu(false);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf6f1] text-[#12866a] transition hover:bg-[#dcefe6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12866a]"
                aria-label="Start a new chat"
                title="New chat"
              >
                <Plus size={22} />
              </button>

              <button
                type="button"
                onClick={() => setShowMenu((value) => !value)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[#718078] transition hover:bg-[#f1f6f3] hover:text-[#176c53] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12866a]"
                aria-label="More options"
                aria-expanded={showMenu}
                title="More options"
              >
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {showMenu && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setShowMenu(false)}
              />

              <div className="absolute right-3 top-[76px] z-50 w-56 overflow-hidden rounded-2xl border border-[#e5ece8] bg-white p-1.5 shadow-xl shadow-slate-900/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    toast("Profile screen is not connected yet.");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#34443c] transition hover:bg-[#f3f7f4]"
                >
                  <CircleUserRound size={18} className="text-[#78877f]" />
                  <span className="flex-1">Profile</span>
                  <ChevronRight size={15} className="text-[#a0aaa4]" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    toast("Settings screen is not connected yet.");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#34443c] transition hover:bg-[#f3f7f4]"
                >
                  <Settings size={18} className="text-[#78877f]" />
                  <span className="flex-1">Settings</span>
                  <ChevronRight size={15} className="text-[#a0aaa4]" />
                </button>
              </div>
            </>
          )}

          {showSearch && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#dce7e1] bg-[#f7faf8] px-3 transition focus-within:border-[#12866a] focus-within:ring-2 focus-within:ring-[#12866a]/10">
              <Search size={17} className="shrink-0 text-[#839089]" />

              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search chats or messages..."
                aria-label="Search conversations"
                className="h-11 min-w-0 flex-1 bg-transparent text-sm text-[#24312c] outline-none placeholder:text-[#9aa69f]"
                autoFocus
              />

              {searchText && (
                <button
                  type="button"
                  onClick={() => setSearchText("")}
                  className="rounded-lg p-1.5 text-[#89958f] hover:bg-[#eaf1ec] hover:text-[#34443c]"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </header>

        {/* Section heading */}
        <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-6 lg:pt-5">
          <div>
            <h2 className="text-[17px] font-bold tracking-tight text-[#24312c]">
              {activeTab === "calls" ? "Calls" : "Messages"}
            </h2>
            <p className="mt-1 text-xs text-[#89958f]">
              {activeTab === "calls"
                ? "Your recent calls"
                : "Your recent conversations"}
            </p>
          </div>

          {activeTab === "chats" && (
            <span className="rounded-full bg-[#f0f5f2] px-3 py-1.5 text-[11px] font-semibold text-[#66766d]">
              {filteredConversations.length}{" "}
              {filteredConversations.length === 1 ? "chat" : "chats"}
            </span>
          )}
        </div>

        {/* Conversation list */}
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 pb-4 sm:px-4 lg:px-2">
          {activeTab === "calls" ? (
            <div className="flex h-full min-h-48 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#e5eee8] bg-[#f5f9f6] text-[#839b8e]">
                <Phone size={26} strokeWidth={1.7} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-[#34443c]">
                Call history
              </h3>

              <p className="mt-2 max-w-[260px] text-xs leading-5 text-[#839089]">
                Your voice and video calls can be started from a conversation.
                Recent call history is not connected here yet.
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div
                className="h-7 w-7 animate-spin rounded-full border-2 border-[#dce8e1] border-t-[#12866a]"
                role="status"
                aria-label="Loading conversations"
              />
            </div>
          ) : error && conversations.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff3f0] text-[#c56b57]">
                <MessageCircle size={22} />
              </div>

              <p className="mt-3 text-sm font-semibold text-[#34443c]">
                Could not load chats
              </p>

              <p className="mt-2 text-xs leading-5 text-[#839089]">{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 rounded-xl bg-[#12866a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0e7058] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12866a] focus-visible:ring-offset-2"
              >
                Retry
              </button>
            </div>
          ) : filteredConversations.length > 0 ? (
            <ConversationList
              conversations={filteredConversations}
              loading={false}
            />
          ) : (
            <div className="flex flex-col items-center px-5 py-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#e5eee8] bg-[#f5f9f6] text-[#839b8e]">
                {searchText ? (
                  <Search size={25} strokeWidth={1.7} />
                ) : (
                  <MessageCircle size={27} strokeWidth={1.7} />
                )}
              </div>

              <h3 className="mt-4 text-base font-semibold text-[#34443c]">
                {searchText ? "No chats found" : "Welcome to CBNK Chat"}
              </h3>

              <p className="mt-2 max-w-[260px] text-sm leading-6 text-[#839089]">
                {searchText
                  ? "Try another name or username."
                  : "Start a conversation with someone to see your chats here."}
              </p>

              {!searchText && (
                <button
                  type="button"
                  onClick={() => setShowUserSearch(true)}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#12866a] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0e7058] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12866a] focus-visible:ring-offset-2"
                >
                  <Plus size={18} />
                  Start a conversation
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mobile bottom navigation */}
        <nav className="grid shrink-0 grid-cols-2 border-t border-[#e7eee9] bg-white px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 lg:hidden">
          <button
            type="button"
            onClick={() => handleTabChange("chats")}
            className={[
              "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold transition",
              activeTab === "chats"
                ? "bg-[#eaf6f1] text-[#12866a]"
                : "text-[#839089] hover:bg-[#f5f8f6] hover:text-[#34443c]",
            ].join(" ")}
            aria-pressed={activeTab === "chats"}
          >
            <span className="relative">
              <MessageCircle size={21} />
              {conversations.length > 0 && (
                <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#12866a] px-1 text-[9px] font-bold text-white">
                  {conversations.length > 99 ? "99+" : conversations.length}
                </span>
              )}
            </span>
            Chats
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("calls")}
            className={[
              "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold transition",
              activeTab === "calls"
                ? "bg-[#eaf6f1] text-[#12866a]"
                : "text-[#839089] hover:bg-[#f5f8f6] hover:text-[#34443c]",
            ].join(" ")}
            aria-pressed={activeTab === "calls"}
          >
            <Phone size={21} />
            Calls
          </button>
        </nav>
      </aside>

      <UserSearchModal
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onSelectUser={handleSelectUser}
      />
    </>
  );
}
