import { useEffect, useState } from "react";
import { Search, X, UserRound, LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";

import { searchUsers } from "../../../api/userApi";

export default function UserSearchModal({ isOpen, onClose, onSelectUser }) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setUsers([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const response = await searchUsers(query.trim());

        setUsers(response.data || []);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Unable to search users.",
        );
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">
              New conversation
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Search by name or username
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-900 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users..."
              className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[360px] min-h-[120px] overflow-y-auto px-3 py-3">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <LoaderCircle
                size={22}
                className="animate-spin text-indigo-400"
              />
            </div>
          )}

          {!loading && query.trim().length < 2 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <UserRound size={26} className="text-slate-700" />

              <p className="mt-3 text-sm text-slate-500">
                Type at least 2 characters
              </p>
            </div>
          )}

          {!loading && query.trim().length >= 2 && users.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-500">No users found</p>
            </div>
          )}

          {!loading &&
            users.map((user) => {
              const name = user.fullName || user.username || "Unknown user";

              return (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => onSelectUser(user)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-900"
                >
                  <div className="relative shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={name}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-semibold text-indigo-300">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {user.isOnline && (
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-emerald-500" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-200">
                      {name}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      @{user.username}
                    </p>
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
