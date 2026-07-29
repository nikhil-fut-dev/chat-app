import jwt from "jsonwebtoken";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

import { findSafeUserById } from "../repositories/user.repository.js";

const protect = asyncHandler(async (req, res, next) => {
  let token = null;

  // 1. Read token from cookies
  if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  // 2. Read token from Authorization Header
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Access token is required");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired access token");
  }

  const user = await findSafeUserById(decoded.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  req.user = user;

  next();
});

export default protect;
