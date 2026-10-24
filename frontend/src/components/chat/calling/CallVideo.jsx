import { useEffect, useRef } from "react";

export default function CallVideo({ stream, muted = false, className = "" }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    video.srcObject = stream || null;

    if (!stream) return;

    let cancelled = false;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        if (!cancelled && error?.name !== "AbortError") {
          console.warn("Call video playback could not start:", error);
        }
      }
    };

    playVideo();

    return () => {
      cancelled = true;

      if (video.srcObject === stream) {
        video.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={className}
      style={{ WebkitTransform: "translateZ(0)" }}
    />
  );
}
