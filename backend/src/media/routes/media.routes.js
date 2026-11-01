import { Router } from "express";
import protect from "../../middlewares/auth.middleware.js";
import { uploadMediaFile } from "../middlewares/mediaUpload.middleware.js";
import { sendMediaMessage } from "../controllers/media.controller.js";

const router = Router();

router.post("/messages", protect, uploadMediaFile, sendMediaMessage);

export default router;
