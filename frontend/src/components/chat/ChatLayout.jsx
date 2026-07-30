import ChatSidebar from "./ChatSidebar";

export default function ChatLayout({
  children,
  sidebarOpen,
  onOpenSidebar,
  onCloseSidebar,
}) {
  return (
    <main className="h-[100dvh] overflow-hidden bg-slate-950 text-white">
      <div className="relative flex h-full min-w-0">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close conversations"
            onClick={onCloseSidebar}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
          />
        )}

        {/* Sidebar */}
        <ChatSidebar isOpen={sidebarOpen} onClose={onCloseSidebar} />

        {/* Main Chat Area */}
        {/* Main Chat Area */}
        <section className="relative min-w-0 flex-1">
          {/* Mobile: Open conversations */}
          <button
            type="button"
            onClick={onOpenSidebar}
            className="fixed left-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/95 text-slate-300 shadow-lg backdrop-blur transition hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Open conversations"
            title="Conversations"
          >
            <span className="text-lg leading-none">☰</span>
          </button>

          {children}
        </section>
      </div>
    </main>
  );
}
