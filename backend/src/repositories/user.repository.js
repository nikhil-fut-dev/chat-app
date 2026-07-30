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

export const updateUserStatus = (id, status) =>
  User.findByIdAndUpdate(
    id,
    {
      isOnline: status,
      lastSeen: status ? null : new Date(),
    },
    {
      returnDocument: "after",
    },
  );

export const searchUsers = (query, currentUserId) =>
  User.find({
    _id: { $ne: currentUserId },
    $or: [
      {
        username: {
          $regex: query,
          $options: "i",
        },
      },
      {
        fullName: {
          $regex: query,
          $options: "i",
        },
      },
    ],
  })
    .select("_id fullName username avatar isOnline lastSeen")
    .limit(20);
