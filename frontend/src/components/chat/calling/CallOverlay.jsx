import { Mic, MicOff, Phone, Video, VideoOff, X } from "lucide-react";
import CallVideo from "./CallVideo";

export default function CallOverlay({
  call,
  callStatus,
  localStream,
  remoteStream,
  isMuted,
  isCameraOff,
  onAccept,
  onReject,
  onEnd,
  onToggleMute,
  onToggleCamera,
}) {
  if (!call) return null;

  const isIncoming = callStatus === "incoming";
  const isVideo = call.callType === "video";
  const title =
    call.caller?.username || call.receiver?.username || "Chat contact";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="font-semibold text-white">{title}</h2>
            <p className="mt-1 text-sm capitalize text-slate-400">
              {isIncoming
                ? `Incoming ${call.callType} call`
                : callStatus === "outgoing"
                  ? "Calling..."
                  : callStatus === "connecting"
                    ? "Connecting..."
                    : callStatus === "active"
                      ? "Connected"
                      : call.callType}
            </p>
          </div>

          {!isIncoming && (
            <button
              type="button"
              onClick={onEnd}
              aria-label="End call"
              className="rounded-full bg-red-600 p-3 text-white hover:bg-red-500"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="relative min-h-64 bg-black">
          {isVideo && remoteStream ? (
            <CallVideo
              stream={remoteStream}
              className="h-full max-h-[65vh] min-h-64 w-full object-contain"
            />
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-300">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                {isVideo ? <Video size={32} /> : <Phone size={32} />}
              </div>
              <p className="text-sm">
                {isIncoming
                  ? "Waiting for your response"
                  : callStatus === "active"
                    ? "Audio call connected"
                    : "Waiting for connection"}
              </p>
            </div>
          )}

          {isVideo && localStream && (
            <div className="absolute bottom-4 right-4 h-28 w-40 overflow-hidden rounded-xl border border-white/20 bg-slate-800 sm:h-36 sm:w-48">
              <CallVideo
                stream={localStream}
                muted
                className="h-full w-full object-cover"
              />
              {isCameraOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-xs text-white">
                  Camera off
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 px-5 py-6">
          {isIncoming ? (
            <>
              <button
                type="button"
                onClick={onReject}
                className="flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 font-medium text-white hover:bg-red-500"
              >
                <Phone size={18} className="rotate-[135deg]" />
                Decline
              </button>

              <button
                type="button"
                onClick={onAccept}
                className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-500"
              >
                <Phone size={18} />
                Accept
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onToggleMute}
                aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
                className="rounded-full bg-slate-700 p-3 text-white hover:bg-slate-600"
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              {isVideo && (
                <button
                  type="button"
                  onClick={onToggleCamera}
                  aria-label={
                    isCameraOff ? "Turn camera on" : "Turn camera off"
                  }
                  className="rounded-full bg-slate-700 p-3 text-white hover:bg-slate-600"
                >
                  {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
                </button>
              )}

              <button
                type="button"
                onClick={onEnd}
                aria-label="End call"
                className="rounded-full bg-red-600 p-4 text-white hover:bg-red-500"
              >
                <Phone size={22} className="rotate-[135deg]" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
