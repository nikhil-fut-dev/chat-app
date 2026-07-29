import { Router } from "express";

import protect from "../middlewares/auth.middleware.js";

import upload from "../middlewares/upload.middleware.js";

import { uploadFile } from "../controllers/upload.controller.js";

const router = Router();

router.post("/", protect, upload.single("file"), uploadFile);

export default router;
