import ApiError from "../utils/ApiError.js";
import {
  findByEmail,
  findByUsername,
  createUser,
  updateUser,
  findSafeUserById,
  findUserWithPassword,
} from "../repositories/user.repository.js";

import { hashPassword, comparePassword } from "../utils/password.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

export const registerService = async (userData) => {
  const { fullName, username, email, password } = userData;

  const emailExists = await findByEmail(email);

  if (emailExists) {
    throw new ApiError(409, "Email already exists");
  }

  const usernameExists = await findByUsername(username);

  if (usernameExists) {
    throw new ApiError(409, "Username already exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = await createUser({
    fullName,
    username,
    email,
    password: hashedPassword,
  });

  const accessToken = generateAccessToken({
    id: user._id,
  });

  const refreshToken = generateRefreshToken({
    id: user._id,
  });

  await updateUser(user._id, {
    refreshToken,
  });

  const safeUser = await findSafeUserById(user._id);

  return {
    user: safeUser,
    accessToken,
    refreshToken,
  };
};

export const loginService = async ({ email, password }) => {
  const user = await findUserWithPassword(email);

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordCorrect = await comparePassword(password, user.password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = generateAccessToken({
    id: user._id,
  });

  const refreshToken = generateRefreshToken({
    id: user._id,
  });

  await updateUser(user._id, {
    refreshToken,
  });

  const safeUser = await findSafeUserById(user._id);

  return {
    user: safeUser,
    accessToken,
    refreshToken,
  };
};

export const logoutService = async (userId) => {
  await updateUser(userId, {
    refreshToken: "",
  });
};

export const refreshTokenService = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  const decoded = verifyRefreshToken(refreshToken);

  const user = await findUserByRefreshToken(refreshToken);

  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const accessToken = generateAccessToken({
    id: user._id,
  });

  return accessToken;
};
