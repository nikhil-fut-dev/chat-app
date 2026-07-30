import { createContext, useContext, useEffect, useState } from "react";

import { useSelector } from "react-redux";

import { socket } from "../socket/socket";
import { SOCKET_EVENTS } from "../socket/socketEvents";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthenticated, isInitializing } = useSelector(
    (state) => state.auth,
  );

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Auth state abhi initialize ho raha hai
    if (isInitializing) {
      return;
    }

    // User logged out hai
    if (!isAuthenticated) {
      if (socket.connected) {
        socket.disconnect();
      }

      setIsConnected(false);
      return;
    }

    const handleConnect = () => {
      console.log("🟢 Socket connected:", socket.id);
      setIsConnected(true);
    };

    const handleDisconnect = (reason) => {
      console.log("🔴 Socket disconnected:", reason);
      setIsConnected(false);
    };

    const handleConnectError = (error) => {
      console.error("❌ Socket connection error:", error.message);

      setIsConnected(false);
    };

    socket.on(SOCKET_EVENTS.CONNECT, handleConnect);

    socket.on(SOCKET_EVENTS.DISCONNECT, handleDisconnect);

    socket.on(SOCKET_EVENTS.CONNECT_ERROR, handleConnectError);

    // Existing connection ko avoid karo
    if (!socket.connected) {
      console.log("🔌 Connecting socket...");
      socket.connect();
    }

    return () => {
      socket.off(SOCKET_EVENTS.CONNECT, handleConnect);

      socket.off(SOCKET_EVENTS.DISCONNECT, handleDisconnect);

      socket.off(SOCKET_EVENTS.CONNECT_ERROR, handleConnectError);
    };
  }, [isAuthenticated, isInitializing]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocketContext must be used inside SocketProvider");
  }

  return context;
}
