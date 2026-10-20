import { useEffect, useRef } from "react";

export default function RemoteAudio({ stream }) {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.srcObject = stream || null;

    if (!stream) return;

    const playAudio = async () => {
      try {
        await audio.play();
      } catch (error) {
        console.warn("Remote audio playback failed:", error);
      }
    };

    playAudio();

    return () => {
      audio.pause();
      audio.srcObject = null;
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
