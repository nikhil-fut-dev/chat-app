import { Router } from "express";

import protect from "../middlewares/auth.middleware.js";

import {
  getMyProfile,
  searchUsersController,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/me", protect, getMyProfile);

router.get("/search", protect, searchUsersController);

export default router;
