import dotenv from "dotenv";
dotenv.config();

import http from "http";

import app from "./src/app.js";
import connectDB from "./src/database/connectDB.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();
