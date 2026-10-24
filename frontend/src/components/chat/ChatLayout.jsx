import { useEffect } from "react";
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

  useEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;

    const updateAppHeight = () => {
      // Use the visible viewport height when the mobile keyboard opens.
      const height = viewport?.height || window.innerHeight;

      root.style.setProperty("--app-height", `${height}px`);
    };

    updateAppHeight();

    window.addEventListener("resize", updateAppHeight);
    window.addEventListener("orientationchange", updateAppHeight);
    viewport?.addEventListener("resize", updateAppHeight);

    return () => {
      window.removeEventListener("resize", updateAppHeight);
      window.removeEventListener("orientationchange", updateAppHeight);
      viewport?.removeEventListener("resize", updateAppHeight);
      root.style.removeProperty("--app-height");
    };
  }, []);

  return (
    <main
      className="w-full overflow-hidden bg-[#f5f8f7] text-slate-800"
      style={{ height: "var(--app-height, 100dvh)" }}
    >
      <div className="relative flex h-full min-h-0 min-w-0 overflow-hidden">
        {sidebarOpen && hasActiveConversation && (
          <button
            type="button"
            aria-label="Close conversations menu"
            onClick={onCloseSidebar}
            className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px] lg:hidden"
          />
        )}

        <ChatSidebar isOpen={showSidebar} onClose={onCloseSidebar} />

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
