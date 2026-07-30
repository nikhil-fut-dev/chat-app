import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import { searchUsers } from "../repositories/user.repository.js";

export const getMyProfile = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, "Profile fetched successfully", req.user));
});

export const searchUsersController = asyncHandler(async (req, res) => {
  const query = req.query.q?.trim();

  if (!query || query.length < 2) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Users fetched successfully", []));
  }

  const users = await searchUsers(query, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Users fetched successfully", users));
});
