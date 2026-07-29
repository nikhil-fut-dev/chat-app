import { SOCKET_EVENTS } from "./socket.constants.js";

import { addUser, removeUser, getOnlineUsers } from "./socket.store.js";

import { registerMessageEvents } from "./message.socket.js";

export const registerSocketEvents = (io, socket) => {
  addUser(socket.user._id, socket.id);

  io.emit(SOCKET_EVENTS.USER_ONLINE, getOnlineUsers());

  registerMessageEvents(io, socket);

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    removeUser(socket.user._id);

    io.emit(SOCKET_EVENTS.USER_OFFLINE, getOnlineUsers());
  });
};
