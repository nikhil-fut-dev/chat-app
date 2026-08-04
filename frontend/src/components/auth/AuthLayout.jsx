import { MessageCircle } from "lucide-react";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Branding */}
        <section className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-slate-950 to-cyan-500/10" />

          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/20">
                <MessageCircle size={23} />
              </div>

              <span className="text-xl font-bold tracking-tight">CBNK • Chat-App</span>
            </div>

            <div className="max-w-lg">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-indigo-400">
                Real-time communication
              </p>

              <h1 className="text-5xl font-bold leading-tight">
                Connect.
                <br />
                Chat.
                <br />
                Stay connected.
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
                A modern real-time messaging experience designed for fast,
                private and seamless conversations.
              </p>
            </div>

            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} ChatFlow
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500">
                  <MessageCircle size={21} />
                </div>

                <span className="text-xl font-bold">ChatFlow</span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight">{title}</h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {subtitle}
              </p>
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
