import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSocketContext } from "../context/SocketContext";
import { SOCKET_EVENTS } from "../socket/socketEvents";

const turnUrls = (import.meta.env.VITE_TURN_URLS || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const turnUsername = import.meta.env.VITE_TURN_USERNAME || "";
const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL || "";

const ICE_SERVERS = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    ...(turnUrls.length > 0 && turnUsername && turnCredential
      ? [
          {
            urls: turnUrls,
            username: turnUsername,
            credential: turnCredential,
          },
        ]
      : []),
  ],
};

export default function useCalling() {
  const { socket, isConnected } = useSocketContext();

  const [call, setCall] = useState(null);
  const [callStatus, setCallStatus] = useState("idle");
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const callRef = useRef(null);
  const callStatusRef = useRef("idle");
  const isStartingRef = useRef(false);
  const pendingCandidatesRef = useRef([]);

  // Keep React state and ref synchronized.
  const updateCallStatus = useCallback((status) => {
    callStatusRef.current = status;
    setCallStatus(status);
  }, []);

  // Release media, peer connection and call state.
  const cleanup = useCallback(() => {
    const peer = peerRef.current;

    if (peer) {
      peer.onicecandidate = null;
      peer.ontrack = null;
      peer.onconnectionstatechange = null;
      peer.close();
      peerRef.current = null;
    }

    const stream = localStreamRef.current;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    pendingCandidatesRef.current = [];
    callRef.current = null;
    isStartingRef.current = false;

    setLocalStream(null);
    setRemoteStream(null);
    setCall(null);
    setIsMuted(false);
    setIsCameraOff(false);

    updateCallStatus("idle");
  }, [updateCallStatus]);

  // Request microphone and, for video calls, camera access.
  const getMedia = useCallback(async (type) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Audio/video calling requires HTTPS or localhost.");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video",
    });

    localStreamRef.current = stream;
    setLocalStream(stream);

    return stream;
  }, []);

  // Create the WebRTC connection for the current call.
  const createPeer = useCallback(
    (callId) => {
      if (peerRef.current) {
        peerRef.current.close();
      }

      const peer = new RTCPeerConnection(ICE_SERVERS);
      peerRef.current = peer;

      peer.onicecandidate = (event) => {
        if (!event.candidate || callRef.current?.callId !== callId) {
          return;
        }

        socket.emit(SOCKET_EVENTS.CALL_ICE_CANDIDATE, {
          callId,
          data: event.candidate.toJSON(),
        });
      };

      peer.ontrack = (event) => {
        if (callRef.current?.callId !== callId) return;

        if (event.streams?.[0]) {
          setRemoteStream(event.streams[0]);
        } else {
          setRemoteStream((previous) => {
            const stream = previous || new MediaStream();

            if (
              !stream.getTracks().some((track) => track.id === event.track.id)
            ) {
              stream.addTrack(event.track);
            }

            return stream;
          });
        }
      };

      peer.onconnectionstatechange = () => {
        if (peerRef.current !== peer) return;

        if (peer.connectionState === "connected") {
          updateCallStatus("active");
        }

        if (peer.connectionState === "failed") {
          toast.error("Call connection failed. Please try again.");

          socket.emit(SOCKET_EVENTS.CALL_END, { callId });
          cleanup();
        }
      };

      return peer;
    },
    [socket, cleanup, updateCallStatus],
  );

  // Add queued ICE candidates after the remote description is ready.
  const flushPendingCandidates = useCallback(async (peer) => {
    if (!peer?.remoteDescription) return;

    const candidates = [...pendingCandidatesRef.current];
    pendingCandidatesRef.current = [];

    for (const candidate of candidates) {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("ICE candidate error:", error);
      }
    }
  }, []);

  // Start an outgoing audio or video call.
  const startCall = useCallback(
    async (receiverId, type = "audio") => {
      if (!isConnected) {
        toast.error("Socket is not connected. Please try again.");
        return;
      }

      if (!receiverId || callRef.current || isStartingRef.current) {
        return;
      }

      if (!["audio", "video"].includes(type)) {
        toast.error("Invalid call type.");
        return;
      }

      isStartingRef.current = true;
      updateCallStatus("outgoing");

      try {
        await getMedia(type);

        const nextCall = {
          role: "caller",
          receiverId,
          callType: type,
          callId: null,
        };

        callRef.current = nextCall;
        setCall(nextCall);

        socket.emit(SOCKET_EVENTS.CALL_INITIATE, {
          receiverId,
          callType: type,
        });
      } catch (error) {
        cleanup();

        toast.error(
          error.name === "NotAllowedError"
            ? "Please allow microphone/camera access."
            : error.message || "Could not start the call.",
        );
      } finally {
        isStartingRef.current = false;
      }
    },
    [isConnected, socket, getMedia, cleanup, updateCallStatus],
  );

  // Accept an incoming call.
  const acceptCall = useCallback(async () => {
    const current = callRef.current;

    if (!current?.callId || current.role !== "receiver" || !isConnected) {
      return;
    }

    try {
      const stream = await getMedia(current.callType);

      // Receiver creates its peer before accepting, so it is ready
      // when the caller sends the WebRTC offer.
      const peer = createPeer(current.callId);

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      updateCallStatus("connecting");

      socket.emit(SOCKET_EVENTS.CALL_ACCEPT, {
        callId: current.callId,
      });
    } catch (error) {
      socket.emit(SOCKET_EVENTS.CALL_REJECT, {
        callId: current.callId,
      });

      cleanup();

      toast.error(
        error.name === "NotAllowedError"
          ? "Allow microphone/camera access to answer."
          : error.message || "Could not answer the call.",
      );
    }
  }, [isConnected, socket, getMedia, createPeer, cleanup, updateCallStatus]);

  // Reject an incoming call.
  const rejectCall = useCallback(() => {
    const current = callRef.current;

    if (current?.callId) {
      socket.emit(SOCKET_EVENTS.CALL_REJECT, {
        callId: current.callId,
      });
    }

    cleanup();
  }, [socket, cleanup]);

  // End an outgoing or active call.
  const endCall = useCallback(() => {
    const current = callRef.current;

    if (current?.callId) {
      socket.emit(SOCKET_EVENTS.CALL_END, {
        callId: current.callId,
      });
    }

    cleanup();
  }, [socket, cleanup]);

  // Toggle microphone mute.
  const toggleMute = useCallback(() => {
    const tracks = localStreamRef.current?.getAudioTracks() || [];

    if (!tracks.length) return;

    const nextMuted = tracks[0].enabled;

    tracks.forEach((track) => {
      track.enabled = !nextMuted;
    });

    setIsMuted(nextMuted);
  }, []);

  // Toggle camera on/off.
  const toggleCamera = useCallback(() => {
    const tracks = localStreamRef.current?.getVideoTracks() || [];

    if (!tracks.length) return;

    const nextCameraOff = tracks[0].enabled;

    tracks.forEach((track) => {
      track.enabled = !nextCameraOff;
    });

    setIsCameraOff(nextCameraOff);
  }, []);

  // Register incoming call and WebRTC signaling listeners.
  useEffect(() => {
    const onIncoming = (payload) => {
      if (callRef.current) {
        socket.emit(SOCKET_EVENTS.CALL_REJECT, {
          callId: payload.callId,
        });
        return;
      }

      const incomingCall = {
        role: "receiver",
        callId: payload.callId,
        caller: payload.caller,
        callType: payload.callType,
        receiverId: payload.caller?._id,
      };

      callRef.current = incomingCall;
      setCall(incomingCall);
      updateCallStatus("incoming");
    };

    const onRinging = ({ callId, receiver, callType }) => {
      const current = callRef.current;

      if (!current || current.role !== "caller") return;

      const updatedCall = {
        ...current,
        callId,
        receiver,
        callType,
      };

      callRef.current = updatedCall;
      setCall(updatedCall);
    };

    const onAccepted = async ({ callId }) => {
      const current = callRef.current;

      if (!current || current.callId !== callId) return;

      // Only the caller creates the offer.
      if (current.role !== "caller") return;

      try {
        updateCallStatus("connecting");

        const peer = createPeer(callId);
        const stream = localStreamRef.current;

        if (!stream) {
          throw new Error("Local media is unavailable.");
        }

        stream.getTracks().forEach((track) => {
          peer.addTrack(track, stream);
        });

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket.emit(SOCKET_EVENTS.CALL_OFFER, {
          callId,
          data: peer.localDescription,
        });
      } catch (error) {
        toast.error(error.message || "Could not create call offer.");

        socket.emit(SOCKET_EVENTS.CALL_END, { callId });
        cleanup();
      }
    };

    const onOffer = async ({ callId, data }) => {
      const current = callRef.current;
      const peer = peerRef.current;

      if (
        !current ||
        current.callId !== callId ||
        current.role !== "receiver" ||
        !peer
      ) {
        return;
      }

      try {
        await peer.setRemoteDescription(new RTCSessionDescription(data));

        await flushPendingCandidates(peer);

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit(SOCKET_EVENTS.CALL_ANSWER, {
          callId,
          data: peer.localDescription,
        });
      } catch (error) {
        toast.error(error.message || "Could not answer the call.");

        socket.emit(SOCKET_EVENTS.CALL_END, { callId });
        cleanup();
      }
    };

    const onAnswer = async ({ callId, data }) => {
      const current = callRef.current;
      const peer = peerRef.current;

      if (
        !current ||
        current.callId !== callId ||
        current.role !== "caller" ||
        !peer
      ) {
        return;
      }

      try {
        await peer.setRemoteDescription(new RTCSessionDescription(data));

        await flushPendingCandidates(peer);
      } catch (error) {
        toast.error(error.message || "Could not complete call setup.");

        socket.emit(SOCKET_EVENTS.CALL_END, { callId });
        cleanup();
      }
    };

    const onCandidate = async ({ callId, data }) => {
      const current = callRef.current;
      const peer = peerRef.current;

      if (!current || current.callId !== callId || !peer || !data) {
        return;
      }

      if (!peer.remoteDescription) {
        pendingCandidatesRef.current.push(data);
        return;
      }

      try {
        await peer.addIceCandidate(new RTCIceCandidate(data));
      } catch (error) {
        console.error("ICE candidate error:", error);
      }
    };

    const onRejected = ({ callId }) => {
      if (callRef.current?.callId !== callId) return;

      cleanup();
      toast("Call declined.");
    };

    const onEnded = ({ callId, reason }) => {
      if (callRef.current?.callId !== callId) return;

      cleanup();

      if (reason === "disconnected") {
        toast("The other participant disconnected.");
      } else {
        toast("Call ended.");
      }
    };

    const onError = ({ message }) => {
      toast.error(message || "Calling error.");

      if (callStatusRef.current === "outgoing") {
        cleanup();
      }
    };

    socket.on(SOCKET_EVENTS.CALL_INCOMING, onIncoming);
    socket.on(SOCKET_EVENTS.CALL_RINGING, onRinging);
    socket.on(SOCKET_EVENTS.CALL_ACCEPTED, onAccepted);
    socket.on(SOCKET_EVENTS.CALL_OFFER, onOffer);
    socket.on(SOCKET_EVENTS.CALL_ANSWER, onAnswer);
    socket.on(SOCKET_EVENTS.CALL_ICE_CANDIDATE, onCandidate);
    socket.on(SOCKET_EVENTS.CALL_REJECTED, onRejected);
    socket.on(SOCKET_EVENTS.CALL_ENDED, onEnded);
    socket.on(SOCKET_EVENTS.CALL_ERROR, onError);

    return () => {
      socket.off(SOCKET_EVENTS.CALL_INCOMING, onIncoming);
      socket.off(SOCKET_EVENTS.CALL_RINGING, onRinging);
      socket.off(SOCKET_EVENTS.CALL_ACCEPTED, onAccepted);
      socket.off(SOCKET_EVENTS.CALL_OFFER, onOffer);
      socket.off(SOCKET_EVENTS.CALL_ANSWER, onAnswer);
      socket.off(SOCKET_EVENTS.CALL_ICE_CANDIDATE, onCandidate);
      socket.off(SOCKET_EVENTS.CALL_REJECTED, onRejected);
      socket.off(SOCKET_EVENTS.CALL_ENDED, onEnded);
      socket.off(SOCKET_EVENTS.CALL_ERROR, onError);
    };
  }, [socket, createPeer, cleanup, updateCallStatus, flushPendingCandidates]);

  // Stop local media if the component using this hook unmounts.
  useEffect(() => {
    return () => {
      peerRef.current?.close();

      localStreamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, []);

  return {
    call,
    callStatus,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
  };
}
