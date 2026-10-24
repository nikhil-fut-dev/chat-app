import { useEffect, useRef, useState } from "react";
import { Search, X, UserRound, LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";

import { searchUsers } from "../../../api/userApi";

export default function UserSearchModal({ isOpen, onClose, onSelectUser }) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);

  // Reset search when the modal closes.
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setUsers([]);
      setLoading(false);
      return;
    }

    inputRef.current?.focus();
  }, [isOpen]);

  // Close modal with Escape.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Debounced user search with stale-response protection.
  useEffect(() => {
    const trimmedQuery = query.trim();
    let cancelled = false;

    if (!isOpen || trimmedQuery.length < 2) {
      setUsers([]);
      setLoading(false);

      return () => {
        cancelled = true;
      };
    }

    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const response = await searchUsers(trimmedQuery);

        if (cancelled) return;

        setUsers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        if (cancelled) return;

        setUsers([]);

        toast.error(
          error?.response?.data?.message || "Unable to search users.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, isOpen]);

  if (!isOpen) return null;

  const trimmedQuery = query.trim();

  const handleSelectUser = (user) => {
    onSelectUser(user);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-5 backdrop-blur-[3px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-search-title"
        className="flex max-h-[min(620px,calc(100dvh-40px))] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2
              id="user-search-title"
              className="text-base font-semibold text-slate-800"
            >
              New conversation
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Find people by name or username
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close user search"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <X size={19} />
          </button>
        </div>

        {/* Search input */}
        <div className="shrink-0 px-5 pb-2 pt-4">
          <label htmlFor="user-search-input" className="sr-only">
            Search users by name or username
          </label>

          <div className="relative">
            <Search
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              ref={inputRef}
              id="user-search-input"
              type="search"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />

            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Search results */}
        <div className="min-h-[160px] flex-1 overflow-y-auto overscroll-contain px-3 pb-3 pt-2">
          {loading && (
            <div
              className="flex flex-col items-center justify-center py-10"
              role="status"
              aria-live="polite"
            >
              <LoaderCircle
                size={24}
                className="animate-spin text-emerald-600"
              />

              <p className="mt-3 text-sm text-slate-500">Searching users...</p>
            </div>
          )}

          {!loading && trimmedQuery.length < 2 && (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                <UserRound size={23} className="text-emerald-600" />
              </div>

              <p className="mt-3 text-sm font-medium text-slate-700">
                Find your people
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Type at least 2 characters to search.
              </p>
            </div>
          )}

          {!loading && trimmedQuery.length >= 2 && users.length === 0 && (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <Search size={22} className="text-slate-400" />
              </div>

              <p className="mt-3 text-sm font-medium text-slate-700">
                No users found
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Try another name or username.
              </p>
            </div>
          )}

          {!loading &&
            users.map((user) => {
              const name = user.fullName || user.username || "Unknown user";
              const username = user.username
                ? `@${user.username}`
                : "Chat user";

              return (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => handleSelectUser(user)}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-emerald-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt=""
                        loading="lazy"
                        className="h-11 w-11 rounded-full border border-slate-100 object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {user.isOnline && (
                      <span
                        aria-label="Online"
                        title="Online"
                        className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500"
                      />
                    )}
                  </div>

                  {/* User details */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800 transition group-hover:text-emerald-800">
                      {name}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {username}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-medium text-emerald-700 opacity-0 transition group-hover:opacity-100">
                    Message
                  </span>
                </button>
              );
            })}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-100 px-5 py-3">
          <p className="text-center text-[11px] text-slate-400">
            Select a person to start a conversation
          </p>
        </div>
      </section>
    </div>
  );
}
