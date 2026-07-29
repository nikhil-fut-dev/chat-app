const onlineUsers = new Map();

export const addUser = (userId, socketId) => {
  onlineUsers.set(userId.toString(), socketId);
};

export const removeUser = (userId) => {
  onlineUsers.delete(userId.toString());
};

export const getSocketId = (userId) => {
  return onlineUsers.get(userId.toString());
};

export const getOnlineUsers = () => {
  return [...onlineUsers.keys()];
};
