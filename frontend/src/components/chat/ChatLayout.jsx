import { useSelector } from "react-redux";
import ChatSidebar from "./ChatSidebar";

export default function ChatLayout({
  children,
  sidebarOpen = false,
  onCloseSidebar = () => {},
}) {
  const activeConversation = useSelector(
    (state) => state.conversations.activeConversation,
  );

  const hasActiveConversation = Boolean(activeConversation);

  // Mobile: show chat list before a conversation is selected.
  // After selection, show the chat panel.
  // Desktop: keep both panels available.
  const showSidebar = sidebarOpen || !hasActiveConversation;

  return (
    <main className="h-[100dvh] w-full overflow-hidden bg-slate-950 text-white">
      <div className="relative flex h-full min-h-0 min-w-0">
        {sidebarOpen && hasActiveConversation && (
          <button
            type="button"
            aria-label="Close conversations"
            onClick={onCloseSidebar}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
          />
        )}

        <ChatSidebar isOpen={showSidebar} onClose={onCloseSidebar} />

        <section
          className={[
            "min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-950",
            hasActiveConversation ? "flex" : "hidden lg:flex",
          ].join(" ")}
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
        </section>
      </div>
    </main>
  );
}
