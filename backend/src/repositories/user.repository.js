import User from "../models/User.js";

export const findByEmail = (email) => User.findOne({ email });

export const findByUsername = (username) => User.findOne({ username });

export const createUser = (data) => User.create(data);

export const findById = (id) => User.findById(id);

export const updateUser = (id, data) =>
  User.findByIdAndUpdate(id, data, { new: true });

export const findSafeUserById = (id) =>
  User.findById(id).select("-password -refreshToken -__v");

export const findUserWithPassword = (email) => User.findOne({ email });

export const findUserByRefreshToken = (refreshToken) =>
  User.findOne({ refreshToken });
