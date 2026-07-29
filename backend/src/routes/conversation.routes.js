import { Router } from "express";

import protect from "../middlewares/auth.middleware.js";

import { getConversations } from "../controllers/conversation.controller.js";

const router = Router();

router.get("/", protect, getConversations);

export default router;
