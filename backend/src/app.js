import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import env from "./config/env.js";

import ApiResponse from "./utils/ApiResponse.js";
import notFound from "./middlewares/notFound.middleware.js";
import errorHandler from "./middlewares/error.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import messageRoutes from "./routes/message.routes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, "Real-Time Chat Backend Running Successfully"));
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/conversations", conversationRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/messages", messageRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
