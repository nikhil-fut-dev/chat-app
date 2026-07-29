import { Server } from "socket.io";

import { socketAuth } from "./socket.auth.js";

import { registerSocketEvents } from "./socket.events.js";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`🟢 ${socket.user.username} connected`);

    registerSocketEvents(io, socket);
  });

  return io;
};
