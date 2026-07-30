import { Link } from "react-router-dom";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-slate-400">
          <FileQuestion size={30} />
        </div>

        <p className="text-sm font-semibold text-indigo-400">404</p>

        <h1 className="mt-2 text-3xl font-bold">Page not found</h1>

        <p className="mt-3 text-sm text-slate-500">
          The page you're looking for doesn't exist.
        </p>

        <Link
          to="/chat"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400"
        >
          <ArrowLeft size={17} />
          Back to chat
        </Link>
      </div>
    </main>
  );
}
