import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

import { useSocketContext } from "../context/SocketContext";
import { SOCKET_EVENTS } from "../socket/socketEvents";

import { updateUserOnlineStatus } from "../store/slices/conversationSlice";

export default function useOnlineStatus() {
  const dispatch = useDispatch();

  const { socket, isConnected } = useSocketContext();

  const previousOnlineUsersRef = useRef([]);

  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }

    const handleOnlineUsers = (onlineUserIds) => {
      if (!Array.isArray(onlineUserIds)) {
        return;
      }

      console.log("🟢 ONLINE USERS:", onlineUserIds);

      const currentOnlineUsers = onlineUserIds.map((id) => id.toString());

      const previousOnlineUsers = previousOnlineUsersRef.current;

      // Newly online users
      currentOnlineUsers.forEach((userId) => {
        dispatch(
          updateUserOnlineStatus({
            userId,
            isOnline: true,
          }),
        );
      });

      // Newly offline users
      previousOnlineUsers.forEach((userId) => {
        if (!currentOnlineUsers.includes(userId)) {
          dispatch(
            updateUserOnlineStatus({
              userId,
              isOnline: false,
            }),
          );
        }
      });

      previousOnlineUsersRef.current = currentOnlineUsers;
    };

    socket.on(SOCKET_EVENTS.ONLINE_USERS, handleOnlineUsers);

    return () => {
      socket.off(SOCKET_EVENTS.ONLINE_USERS, handleOnlineUsers);
    };
  }, [socket, isConnected, dispatch]);
}
