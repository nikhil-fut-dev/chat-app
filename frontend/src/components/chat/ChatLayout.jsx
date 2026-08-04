import ChatSidebar from "./ChatSidebar";

export default function ChatLayout({
  children,
  sidebarOpen,
  onOpenSidebar,
  onCloseSidebar,
}) {
  return (
    <main className="fixed inset-0 overflow-hidden bg-slate-950 text-white overscroll-none">
      <div className="relative flex h-full min-h-0 w-full overflow-hidden">
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
        <section className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          {children}
        </section>
      </div>
    </main>
  );
}