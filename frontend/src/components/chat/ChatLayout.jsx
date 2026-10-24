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
  const showSidebar = sidebarOpen || !hasActiveConversation;

  return (
    <main className="h-[100dvh] w-full overflow-hidden bg-[#f5f8f7] text-slate-800">
      <div className="relative flex h-full min-h-0 min-w-0">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && hasActiveConversation && (
          <button
            type="button"
            aria-label="Close conversations menu"
            onClick={onCloseSidebar}
            className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px] lg:hidden"
          />
        )}

        {/* Conversations sidebar */}
        <ChatSidebar isOpen={showSidebar} onClose={onCloseSidebar} />

        {/* Main chat panel */}
        <section
          className={[
            "relative min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white",
            hasActiveConversation ? "flex" : "hidden lg:flex",
          ].join(" ")}
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
