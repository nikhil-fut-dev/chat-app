import { Server } from "socket.io";
import { socketAuth } from "./socket.auth.js";
import { registerSocketEvents } from "./socket.events.js";
import env from "../config/env.js";

let ioInstance = null;

export const getIO = () => ioInstance;

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  ioInstance = io;

  io.use(socketAuth);

  io.on("connection", async (socket) => {
    await registerSocketEvents(io, socket);
  });

  return io;
};
