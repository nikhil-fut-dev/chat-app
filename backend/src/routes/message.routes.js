import { Router } from "express";

import protect from "../middlewares/auth.middleware.js";

import {
  sendMessage,
  getMessages,
  markDelivered,
  markSeen,
  editMessage,
  deleteMessage,
} from "../controllers/message.controller.js";

const router = Router();

router.post("/", protect, sendMessage);

router.get("/:receiverId", protect, getMessages);

router.patch("/:messageId/delivered", protect, markDelivered);

router.patch("/:messageId/seen", protect, markSeen);

router.put("/:id", protect, editMessage);

router.delete("/:id", protect, deleteMessage);

export default router;
