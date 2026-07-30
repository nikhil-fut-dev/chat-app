import ChatSidebar from "./ChatSidebar";

export default function ChatLayout({ children }) {
  return (
    <main className="h-screen overflow-hidden bg-slate-950 text-white">
      <div className="flex h-full">
        <ChatSidebar />

        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </main>
  );
}
