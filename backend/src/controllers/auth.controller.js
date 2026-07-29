import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  registerService,
  loginService,
  logoutService,
  refreshTokenService,
} from "../services/auth.service.js";

import { accessCookieOptions, refreshCookieOptions } from "../utils/cookies.js";

export const register = asyncHandler(async (req, res) => {
  const result = await registerService(req.body);

  res
    .cookie("accessToken", result.accessToken, accessCookieOptions)
    .cookie("refreshToken", result.refreshToken, refreshCookieOptions)
    .status(201)
    .json(
      new ApiResponse(201, "User registered successfully", {
        user: result.user,
      }),
    );
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginService(req.body);

  res
    .cookie("accessToken", result.accessToken, accessCookieOptions)
    .cookie("refreshToken", result.refreshToken, refreshCookieOptions)
    .status(200)
    .json(
      new ApiResponse(200, "Login successful", {
        user: result.user,
      }),
    );
});

export const logout = asyncHandler(async (req, res) => {
  await logoutService(req.user._id);

  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .status(200)
    .json(new ApiResponse(200, "Logout successful"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  const accessToken = await refreshTokenService(refreshToken);

  res
    .cookie("accessToken", accessToken, accessCookieOptions)
    .status(200)
    .json(new ApiResponse(200, "Access token refreshed"));
});
