import {
  Mic,
  MicOff,
  Phone,
  Video,
  VideoOff,
  X,
  Activity,
  Wifi,
} from "lucide-react";

import CallVideo from "./CallVideo";
import RemoteAudio from "./RemoteAudio";

import { useEffect, useRef, useState } from "react";

export default function CallOverlay({
  call,
  callStatus,
  localStream,
  remoteStream,
  isMuted,
  isCameraOff,
  networkQuality,
  onAccept,
  onReject,
  onEnd,
  onToggleMute,
  onToggleCamera,
}) {
  const [previewPosition, setPreviewPosition] = useState(null);
  const dragRef = useRef(null);

  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  const handleOverlayInteraction = () => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    // Incoming call mein Accept/Decline controls visible rahenge.
    if (callStatus !== "incoming") {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    }
  };

  const handlePreviewPointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;

    const rect = event.currentTarget.getBoundingClientRect();

    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };

    setPreviewPosition({
      x: rect.left,
      y: rect.top,
    });

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePreviewPointerMove = (event) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) return;

    const rect = event.currentTarget.getBoundingClientRect();

    const maxX = Math.max(0, window.innerWidth - rect.width);
    const maxY = Math.max(0, window.innerHeight - rect.height);

    setPreviewPosition({
      x: Math.min(maxX, Math.max(0, event.clientX - drag.offsetX)),
      y: Math.min(maxY, Math.max(0, event.clientY - drag.offsetY)),
    });
  };

  const handlePreviewPointerUp = (event) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;

    dragRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (callStatus !== "active") {
      setCallDuration(0);
      return;
    }

    const startedAt = Date.now();
    setCallDuration(0);

    const intervalId = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [callStatus, call?._id]);

  useEffect(() => {
    if (callStatus === "incoming") return;

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 4000);

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [call?.callId, callStatus]);

  if (!call) return null;

  const formatDuration = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  };

  const isIncoming = callStatus === "incoming";
  const isVideo = call.callType === "video";
  const isActive = callStatus === "active";

  const quality = networkQuality?.level || "checking";

  const qualityConfig = {
    checking: {
      label: "Checking network",
      color: "text-slate-300",
      icon: Activity,
    },
    good: {
      label: "Good connection",
      color: "text-emerald-400",
      icon: Wifi,
    },
    fair: {
      label: "Fair connection",
      color: "text-amber-400",
      icon: Wifi,
    },
    poor: {
      label: "Poor connection",
      color: "text-red-400",
      icon: Wifi,
    },
  };

  const currentQuality = qualityConfig[quality] || qualityConfig.checking;

  const QualityIcon = currentQuality.icon;

  const title =
    call.caller?.username || call.receiver?.username || "Chat contact";

  const statusText = isIncoming
    ? `Incoming ${call.callType} call`
    : callStatus === "outgoing"
      ? "Calling..."
      : callStatus === "connecting"
        ? "Connecting..."
        : callStatus === "reconnecting"
          ? "Reconnecting..."
          : isActive
            ? `Connected · ${formatDuration(callDuration)}`
            : call.callType === "video"
              ? "Video call"
              : "Audio call";

  const controlClass =
    "flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";

  return (
    <div
      onPointerDown={handleOverlayInteraction}
      className="fixed inset-0 z-[100] h-[100dvh] w-full overflow-hidden bg-slate-950 text-white"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`${isVideo ? "Video" : "Audio"} call with ${title}`}
    >
      {/* Dedicated playback for audio-only calls */}
      {!isVideo && remoteStream && <RemoteAudio stream={remoteStream} />}

      {/* Full-screen video background */}
      {isVideo && remoteStream ? (
        <div className="absolute inset-0 bg-black">
          <CallVideo
            stream={remoteStream}
            className="h-full w-full object-contain sm:object-contain"
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-950 to-black" />
      )}

      {/* Top information */}

      <header
        className={`absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 bg-gradient-to-b from-black/75 to-transparent px-4 pb-12 pt-4 transition-opacity duration-300 sm:px-6 sm:pt-6 ${
          showControls || isIncoming
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold sm:text-xl">{title}</h2>

          <p className="mt-1 text-sm text-slate-300" aria-live="polite">
            {statusText}
          </p>
          {(isActive || callStatus === "reconnecting") && (
            <div
              className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${currentQuality.color}`}
              aria-live="polite"
              aria-label={currentQuality.label}
            >
              <span className="inline-flex items-center gap-1.5">
                <QualityIcon size={14} />
                {currentQuality.label}
              </span>

              {networkQuality?.latency != null && (
                <span>{networkQuality.latency} ms latency</span>
              )}

              {networkQuality?.packetLoss != null && (
                <span>{networkQuality.packetLoss}% packet loss</span>
              )}
            </div>
          )}
        </div>

        {!isIncoming && (
          <button
            type="button"
            onClick={onEnd}
            aria-label="Close call"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X size={21} />
          </button>
        )}
      </header>

      {/* Waiting / audio-call screen */}
      {(!isVideo || !remoteStream) && (
        <main className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 pb-32 pt-24 text-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-2xl sm:h-36 sm:w-36">
            {isVideo ? (
              <Video size={42} className="text-indigo-300 sm:h-12 sm:w-12" />
            ) : (
              <Phone size={42} className="text-indigo-300 sm:h-12 sm:w-12" />
            )}
          </div>

          <div className="max-w-sm">
            <h3 className="break-words text-xl font-semibold sm:text-2xl">
              {title}
            </h3>
            <p className="mt-2 text-sm text-slate-300 sm:text-base">
              {isIncoming
                ? "Incoming call — accept when you're ready"
                : isActive && !isVideo
                  ? "Audio call connected"
                  : isVideo && isCameraOff
                    ? "Your camera is off"
                    : "Waiting for connection"}
            </p>
          </div>
        </main>
      )}

      {/* Local camera preview */}
      {isVideo && localStream && !isCameraOff && (
        <div
          onPointerDown={handlePreviewPointerDown}
          onPointerMove={handlePreviewPointerMove}
          onPointerUp={handlePreviewPointerUp}
          onPointerCancel={handlePreviewPointerUp}
          style={{
            ...(previewPosition
              ? {
                  left: `${previewPosition.x}px`,
                  top: `${previewPosition.y}px`,
                  right: "auto",
                }
              : {}),
            touchAction: "none",
            userSelect: "none",
            cursor: "grab",
          }}
          className="absolute right-3 top-20 z-20 h-32 w-24 overflow-hidden rounded-2xl border border-white/30 bg-slate-800 shadow-xl sm:right-6 sm:top-24 sm:h-48 sm:w-36"
        >
          <CallVideo
            stream={localStream}
            muted
            className="h-full w-full object-cover"
          />
          <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-2 py-1 text-[10px] sm:text-xs">
            You
          </span>
        </div>
      )}

      {isVideo && localStream && isCameraOff && (
        <div className="absolute right-3 top-20 z-20 flex h-32 w-24 items-center justify-center rounded-2xl border border-white/20 bg-slate-800 shadow-xl sm:right-6 sm:top-24 sm:h-48 sm:w-36">
          <VideoOff size={26} className="text-slate-300" />
        </div>
      )}

      {/* Bottom call controls */}

      <footer
        className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black via-black/85 to-transparent px-4 pb-5 pt-16 transition-opacity duration-300 sm:px-6 sm:pb-8 ${
          showControls || isIncoming
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        {isIncoming ? (
          <div className="mx-auto flex w-full max-w-sm items-center justify-center gap-10">
            <button
              type="button"
              onClick={onReject}
              aria-label="Decline call"
              className="flex min-h-16 min-w-16 flex-col items-center justify-center gap-1 rounded-full bg-red-600 text-white shadow-lg transition hover:bg-red-500 active:scale-95"
            >
              <Phone size={25} className="rotate-[135deg]" />
              <span className="text-[11px] font-medium">Decline</span>
            </button>

            <button
              type="button"
              onClick={onAccept}
              aria-label="Accept call"
              className="flex min-h-16 min-w-16 flex-col items-center justify-center gap-1 rounded-full bg-emerald-500 text-white shadow-lg transition hover:bg-emerald-400 active:scale-95"
            >
              <Phone size={25} />
              <span className="text-[11px] font-medium">Accept</span>
            </button>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-md items-center justify-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
              aria-pressed={isMuted}
              className={`${controlClass} ${
                isMuted
                  ? "bg-white text-slate-900"
                  : "bg-white/15 hover:bg-white/25"
              }`}
            >
              {isMuted ? <MicOff size={23} /> : <Mic size={23} />}
            </button>

            {isVideo && (
              <button
                type="button"
                onClick={onToggleCamera}
                aria-label={isCameraOff ? "Turn camera on" : "Turn camera off"}
                aria-pressed={isCameraOff}
                className={`${controlClass} ${
                  isCameraOff
                    ? "bg-white text-slate-900"
                    : "bg-white/15 hover:bg-white/25"
                }`}
              >
                {isCameraOff ? <VideoOff size={23} /> : <Video size={23} />}
              </button>
            )}

            <button
              type="button"
              onClick={onEnd}
              aria-label="End call"
              className={`${controlClass} h-16 w-16 bg-red-600 hover:bg-red-500`}
            >
              <Phone size={26} className="rotate-[135deg]" />
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
