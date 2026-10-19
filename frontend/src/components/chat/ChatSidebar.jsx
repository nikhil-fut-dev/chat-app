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
          // Mobile: complete home screen, not a drawer
          "fixed inset-0 z-50 flex h-[100dvh] w-full min-w-0 flex-col",
          "overflow-hidden bg-slate-950 text-white",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",

          // Desktop: retain the sidebar layout
          "lg:relative lg:inset-auto lg:z-auto lg:h-full lg:w-[360px]",
          "lg:shrink-0 lg:translate-x-0 lg:border-r lg:border-slate-800/80",
        ].join(" ")}
      >
        {/* Mobile home header */}
        <header className="relative shrink-0 border-b border-slate-800/70 px-4 pb-4 pt-[max(16px,env(safe-area-inset-top))] sm:px-5 lg:pb-3">
          <div className="flex min-h-12 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-950/30">
                <MessageCircle size={23} />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold tracking-tight text-white">
                  CBNK Chat
                </h1>
                <p className="mt-0.5 text-xs text-slate-500">Stay connected</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
              <button
                type="button"
                onClick={() => {
                  setShowSearch((value) => !value);
                  setSearchText("");
                  setShowMenu(false);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
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
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-label="Start a new chat"
                title="New chat"
              >
                <Plus size={23} />
              </button>

              <button
                type="button"
                onClick={() => setShowMenu((value) => !value)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-label="More options"
                aria-expanded={showMenu}
                title="More options"
              >
                <MoreVertical size={21} />
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
              <div className="absolute right-3 top-[76px] z-50 w-52 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 py-1 shadow-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    toast("Profile screen is not connected yet.");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-800"
                >
                  <CircleUserRound size={17} />
                  Profile
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    toast("Settings screen is not connected yet.");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-800"
                >
                  <Settings size={17} />
                  Settings
                </button>
              </div>
            </>
          )}

          {showSearch && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-3 focus-within:border-emerald-500/60">
              <Search size={18} className="shrink-0 text-slate-500" />

              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search chats or messages..."
                aria-label="Search conversations"
                className="h-12 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                autoFocus
              />

              {searchText && (
                <button
                  type="button"
                  onClick={() => setSearchText("")}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </header>

        {/* Account welcome section */}
        <div className="mx-4 mt-4 flex shrink-0 items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3 sm:mx-5 lg:mt-3 lg:border-0 lg:bg-transparent lg:p-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-500/20 bg-emerald-500/10 text-sm font-semibold text-emerald-300">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              avatarLetter
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-100">
              {displayName}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Your conversations</p>
          </div>

          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Online
          </span>
        </div>

        {/* Home page section heading */}
        <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-6 lg:pt-5">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-white">
              {activeTab === "calls" ? "Calls" : "Messages"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {activeTab === "calls"
                ? "Your recent calls"
                : "Your recent conversations"}
            </p>
          </div>

          {activeTab === "chats" && (
            <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400">
              {filteredConversations.length}{" "}
              {filteredConversations.length === 1 ? "chat" : "chats"}
            </span>
          )}
        </div>

        {/* Scrollable home content */}
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 pb-4 sm:px-4 lg:px-2">
          {activeTab === "calls" ? (
            <div className="flex h-full min-h-48 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-slate-500">
                <Phone size={27} strokeWidth={1.6} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-200">
                Calls are coming soon
              </h3>

              <p className="mt-2 max-w-[260px] text-xs leading-5 text-slate-500">
                Voice and video calling will be available in a future update.
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div
                className="h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400"
                role="status"
                aria-label="Loading conversations"
              />
            </div>
          ) : error && conversations.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-10 text-center">
              <p className="text-sm font-medium text-slate-300">
                Could not load chats
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700"
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
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-slate-500">
                {searchText ? (
                  <Search size={26} strokeWidth={1.6} />
                ) : (
                  <MessageCircle size={27} strokeWidth={1.6} />
                )}
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-200">
                {searchText ? "No chats found" : "Welcome to CBNK Chat"}
              </h3>

              <p className="mt-2 max-w-[260px] text-sm leading-6 text-slate-500">
                {searchText
                  ? "Try another name or username."
                  : "Start a conversation with someone to see your chats here."}
              </p>

              {!searchText && (
                <button
                  type="button"
                  onClick={() => setShowUserSearch(true)}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  <Plus size={18} />
                  Start a conversation
                </button>
              )}
            </div>
          )}
        </div>

        {/* Fixed mobile bottom navigation */}
        <nav className="grid shrink-0 grid-cols-2 border-t border-slate-800/80 bg-slate-950 px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 lg:hidden">
          <button
            type="button"
            onClick={() => handleTabChange("chats")}
            className={[
              "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold transition",
              activeTab === "chats"
                ? "bg-emerald-500/10 text-emerald-300"
                : "text-slate-500 hover:text-slate-200",
            ].join(" ")}
            aria-pressed={activeTab === "chats"}
          >
            <span className="relative">
              <MessageCircle size={21} />
              {conversations.length > 0 && (
                <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-slate-950">
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
                ? "bg-emerald-500/10 text-emerald-300"
                : "text-slate-500 hover:text-slate-200",
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
