import { useEffect, useRef } from "react";

export default function RemoteAudio({ stream }) {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.srcObject = stream || null;

    if (!stream) return;

    let cancelled = false;

    const playAudio = async () => {
      try {
        await audio.play();
      } catch (error) {
        if (!cancelled && error?.name !== "AbortError") {
          console.warn("Remote audio playback could not start:", error);
        }
      }
    };

    playAudio();

    return () => {
      cancelled = true;
      audio.pause();

      if (audio.srcObject === stream) {
        audio.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <audio
      ref={audioRef}
      autoPlay
      playsInline
      className="sr-only"
      aria-label="Remote call audio"
    />
  );
}
