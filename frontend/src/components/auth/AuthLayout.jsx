import { MessageCircle, ShieldCheck, Zap } from "lucide-react";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <main className="min-h-screen bg-[#f7f9f8] text-[#17211f]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[0.95fr_1.05fr]">
        {/* Branding panel */}
        <section className="relative hidden overflow-hidden bg-[#edf6f1] lg:flex">
          <div className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -right-24 h-[480px] w-[480px] rounded-full bg-teal-100/80 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-16">
            <Brand />

            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/75 px-3.5 py-2 text-xs font-semibold tracking-wide text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                YOUR SPACE TO CONNECT
              </div>

              <h1 className="text-5xl font-semibold leading-[1.14] tracking-tight text-[#173d32] xl:text-6xl">
                Conversations
                <br />
                that bring us
                <br />
                <span className="text-[#138568]">closer.</span>
              </h1>

              <p className="mt-6 max-w-md text-base leading-8 text-[#687b73]">
                A calmer, simpler way to stay in touch. Share messages, connect
                in real time and make every conversation count.
              </p>

              <div className="mt-10 grid max-w-md grid-cols-2 gap-3">
                <Feature
                  icon={<MessageCircle size={19} />}
                  title="Real-time chat"
                  description="Stay in the moment"
                />
                <Feature
                  icon={<ShieldCheck size={19} />}
                  title="Private sessions"
                  description="Secure sign-in"
                />
              </div>
            </div>

            <p className="text-xs text-[#84938c]">
              © {new Date().getFullYear()} CBNK Chat-App. Made for meaningful
              conversations.
            </p>
          </div>
        </section>

        {/* Authentication form */}
        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12 xl:px-16">
          <div className="w-full max-w-[420px]">
            <div className="mb-10 lg:hidden">
              <Brand />
            </div>

            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#12866a]">
                <Zap size={16} />
                Welcome to CBNK
              </div>

              <h2 className="text-3xl font-semibold tracking-tight text-[#17211f] sm:text-[34px]">
                {title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#73817c] sm:text-[15px]">
                {subtitle}
              </p>
            </div>

            {children}

            <p className="mt-8 text-center text-xs leading-5 text-[#94a09a]">
              By continuing, you agree to use CBNK Chat-App responsibly.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#12866a] text-white shadow-sm shadow-emerald-900/10">
        <MessageCircle size={23} strokeWidth={2.2} />
      </div>

      <div>
        <p className="text-[17px] font-bold tracking-tight text-[#173d32]">
          CBNK <span className="font-medium text-[#12866a]">Chat-App</span>
        </p>
        <p className="mt-0.5 text-[11px] font-medium tracking-wide text-[#84938c]">
          EVERY CONVERSATION MATTERS
        </p>
      </div>
    </div>
  );
}

function Feature({ icon, title, description }) {
  return (
    <div className="rounded-2xl border border-white/90 bg-white/70 p-4 shadow-sm shadow-emerald-950/[0.02]">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#e0f3e9] text-[#12866a]">
        {icon}
      </div>
      <p className="text-sm font-semibold text-[#234a3d]">{title}</p>
      <p className="mt-1 text-xs text-[#84938c]">{description}</p>
    </div>
  );
}
