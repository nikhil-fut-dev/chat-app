import { Server } from "socket.io";

import { socketAuth } from "./socket.auth.js";
import { registerSocketEvents } from "./socket.events.js";
import env from "../config/env.js";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on("connection", async (socket) => {
    await registerSocketEvents(io, socket);
  });

  return io;
};
