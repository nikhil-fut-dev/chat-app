import { Router } from "express";

import protect from "../middlewares/auth.middleware.js";

import { getMyProfile } from "../controllers/user.controller.js";

const router = Router();

router.get("/me", protect, getMyProfile);

export default router;
