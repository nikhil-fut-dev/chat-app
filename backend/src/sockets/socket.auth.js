import jwt from "jsonwebtoken";

import User from "../models/User.js";

const parseCookies = (cookieHeader = "") => {
  return cookieHeader.split(";").reduce((cookies, cookie) => {
    const [key, ...valueParts] = cookie.trim().split("=");

    if (!key) {
      return cookies;
    }

    cookies[key] = decodeURIComponent(valueParts.join("="));

    return cookies;
  }, {});
};

export const socketAuth = async (socket, next) => {
  try {
    const rawCookie = socket.handshake.headers.cookie;

    if (!rawCookie) {
      return next(new Error("Unauthorized"));
    }

    const cookies = parseCookies(rawCookie);

    const accessToken = cookies.accessToken;

    if (!accessToken) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.id).select(
      "-password -refreshToken",
    );

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;

    next();
  } catch (error) {
    console.error("❌ Socket Auth Error:", error.message);

    next(new Error("Socket authentication failed"));
  }
};
