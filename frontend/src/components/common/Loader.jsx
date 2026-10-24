export default function Loader({ fullScreen = false }) {
  return (
    <div
      className={[
        "flex items-center justify-center",
        fullScreen ? "min-h-screen bg-slate-950" : "py-10",
      ].join(" ")}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
    </div>
  );
}
