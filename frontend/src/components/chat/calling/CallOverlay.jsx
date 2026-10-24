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
import { useEffect, useRef, useState } from "react";

import CallVideo from "./CallVideo";
import RemoteAudio from "./RemoteAudio";

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
  const [callDuration, setCallDuration] = useState(0);

  const isIncoming = callStatus === "incoming";
  const isVideo = call?.callType === "video";
  const isActive = callStatus === "active";

  const handleOverlayInteraction = () => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    if (callStatus !== "incoming") {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    }
  };

  useEffect(() => {
    if (callStatus === "incoming") {
      setShowControls(true);
      return;
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 4000);

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [call?.callId, callStatus]);

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
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      if (dragRef.current) {
        dragRef.current = null;
      }
    };
  }, []);

  if (!call) return null;

  const formatDuration = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const quality = networkQuality?.level || "checking";

  const qualityConfig = {
    checking: {
      label: "Checking network",
      color: "text-slate-500",
      icon: Activity,
    },
    good: {
      label: "Good connection",
      color: "text-emerald-700",
      icon: Wifi,
    },
    fair: {
      label: "Fair connection",
      color: "text-amber-700",
      icon: Wifi,
    },
    poor: {
      label: "Poor connection",
      color: "text-red-600",
      icon: Wifi,
    },
  };

  const currentQuality = qualityConfig[quality] || qualityConfig.checking;
  const QualityIcon = currentQuality.icon;

  const title =
    call.caller?.username || call.receiver?.username || "Chat contact";

  const statusText = isIncoming
    ? `Incoming ${call.callType || "audio"} call`
    : callStatus === "outgoing"
      ? "Calling..."
      : callStatus === "connecting"
        ? "Connecting..."
        : callStatus === "reconnecting"
          ? "Reconnecting..."
          : isActive
            ? `Connected · ${formatDuration(callDuration)}`
            : isVideo
              ? "Video call"
              : "Audio call";

  const controlClass =
    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 sm:h-14 sm:w-14";

  const handlePreviewPointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;

    const rect = event.currentTarget.getBoundingClientRect();

    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };

    setPreviewPosition({ x: rect.left, y: rect.top });

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

  return (
    <div
      onPointerDown={handleOverlayInteraction}
      className="fixed inset-0 z-[100] h-[100dvh] w-full overflow-hidden bg-slate-50 text-slate-800"
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
      {!isVideo && remoteStream && <RemoteAudio stream={remoteStream} />}

      {/* Remote video stays fullscreen without a light overlay */}
      {isVideo && remoteStream ? (
        <div className="absolute inset-0 bg-black">
          <CallVideo
            stream={remoteStream}
            className="h-full w-full object-contain"
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/70 to-slate-100" />
      )}

      {/* Contact information */}
      <header
        className={`absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 px-4 pb-8 pt-4 transition-opacity duration-300 sm:px-6 sm:pt-6 ${
          isVideo && remoteStream
            ? "bg-gradient-to-b from-black/70 to-transparent text-white"
            : "border-b border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-xl"
        } ${
          showControls || isIncoming
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold sm:text-xl">{title}</h2>

          <p
            className={`mt-1 text-sm ${
              isVideo && remoteStream ? "text-white/80" : "text-slate-500"
            }`}
            aria-live="polite"
          >
            {statusText}
          </p>

          {(isActive || callStatus === "reconnecting") && (
            <div
              className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${
                isVideo && remoteStream ? "text-white" : currentQuality.color
              }`}
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
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isVideo && remoteStream
                ? "bg-white/15 text-white hover:bg-white/25"
                : "border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-100"
            }`}
          >
            <X size={20} />
          </button>
        )}
      </header>

      {/* Audio-call and waiting screen */}
      {(!isVideo || !remoteStream) && (
        <main className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 pb-28 pt-28 text-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-emerald-100 bg-white shadow-xl shadow-emerald-100/60 sm:h-36 sm:w-36">
            {isVideo ? (
              <Video size={42} className="text-emerald-600 sm:h-12 sm:w-12" />
            ) : (
              <Phone size={42} className="text-emerald-600 sm:h-12 sm:w-12" />
            )}
          </div>

          <div className="max-w-sm">
            <h3 className="break-words text-xl font-semibold text-slate-800 sm:text-2xl">
              {title}
            </h3>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              {isIncoming
                ? "Incoming call — accept when you're ready"
                : isActive && !isVideo
                  ? "Audio call connected"
                  : isVideo && isCameraOff
                    ? "Your camera is off"
                    : callStatus === "reconnecting"
                      ? "Trying to restore the connection..."
                      : "Waiting for connection"}
            </p>
          </div>
        </main>
      )}

      {/* Draggable local video preview */}
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
          className={`absolute right-3 top-20 z-20 h-32 w-24 overflow-hidden rounded-2xl border shadow-xl sm:right-6 sm:top-24 sm:h-48 sm:w-36 ${
            remoteStream
              ? "border-white/70 bg-slate-900"
              : "border-slate-200 bg-white"
          }`}
        >
          <CallVideo
            stream={localStream}
            muted
            className="h-full w-full object-cover"
          />

          <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-2 py-1 text-[10px] text-white sm:text-xs">
            You
          </span>
        </div>
      )}

      {isVideo && localStream && isCameraOff && (
        <div
          className={`absolute right-3 top-20 z-20 flex h-32 w-24 items-center justify-center rounded-2xl border shadow-xl sm:right-6 sm:top-24 sm:h-48 sm:w-36 ${
            remoteStream
              ? "border-white/40 bg-slate-900/90"
              : "border-slate-200 bg-white"
          }`}
        >
          <VideoOff
            size={26}
            className={remoteStream ? "text-white" : "text-slate-400"}
          />
        </div>
      )}

      {/* Bottom controls */}
      <footer
        className={`absolute inset-x-0 bottom-0 z-30 px-4 pb-5 pt-12 transition-opacity duration-300 sm:px-6 sm:pb-8 ${
          isVideo && remoteStream
            ? "bg-gradient-to-t from-black/75 via-black/30 to-transparent"
            : "border-t border-slate-200/70 bg-white/90 shadow-[0_-8px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl"
        } ${
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
              className="flex min-h-16 min-w-16 flex-col items-center justify-center gap-1 rounded-full bg-red-500 text-white shadow-lg shadow-red-200 transition hover:bg-red-600 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <Phone size={24} className="rotate-[135deg]" />
              <span className="text-[11px] font-medium">Decline</span>
            </button>

            <button
              type="button"
              onClick={onAccept}
              aria-label="Accept call"
              className="flex min-h-16 min-w-16 flex-col items-center justify-center gap-1 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Phone size={24} />
              <span className="text-[11px] font-medium">Accept</span>
            </button>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-md items-center justify-center gap-3 sm:gap-6">
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
              aria-pressed={isMuted}
              className={`${controlClass} ${
                isMuted
                  ? "bg-amber-100 text-amber-800 ring-1 ring-amber-200 hover:bg-amber-200"
                  : isVideo && remoteStream
                    ? "bg-white/20 text-white hover:bg-white/30"
                    : "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100"
              }`}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            {isVideo && (
              <button
                type="button"
                onClick={onToggleCamera}
                aria-label={isCameraOff ? "Turn camera on" : "Turn camera off"}
                aria-pressed={isCameraOff}
                className={`${controlClass} ${
                  isCameraOff
                    ? "bg-amber-100 text-amber-800 ring-1 ring-amber-200 hover:bg-amber-200"
                    : isVideo && remoteStream
                      ? "bg-white/20 text-white hover:bg-white/30"
                      : "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100"
                }`}
              >
                {isCameraOff ? <VideoOff size={22} /> : <Video size={22} />}
              </button>
            )}

            <button
              type="button"
              onClick={onEnd}
              aria-label="End call"
              className={`${controlClass} !h-16 !w-16 bg-red-500 text-white shadow-lg shadow-red-200 hover:bg-red-600 focus-visible:ring-red-400`}
            >
              <Phone size={25} className="rotate-[135deg]" />
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
