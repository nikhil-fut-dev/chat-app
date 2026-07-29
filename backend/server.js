import http from "http";

import env from "./src/config/env.js";

import app from "./src/app.js";
import connectDB from "./src/database/connectDB.js";
import { initSocket } from "./src/sockets/index.js";

import cloudinary from "./src/config/cloudinary.js";

const PORT = env.PORT;

const server = http.createServer(app);

initSocket(server);

const startServer = async () => {
  try {
    await connectDB();

    try {
      const result = await cloudinary.api.ping();
      console.log("✅ Cloudinary Connected:", result);
    } catch (error) {
      console.error("❌ Cloudinary Connection Failed");
      console.error(error.message);
    }

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();
