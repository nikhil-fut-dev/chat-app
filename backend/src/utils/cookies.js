export const accessCookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 15 * 60 * 1000,
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
