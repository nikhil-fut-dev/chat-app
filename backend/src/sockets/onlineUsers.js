const onlineUsers = new Map();

export const addUser = (userId, socketId) => {
  const id = userId.toString();

  if (!onlineUsers.has(id)) {
    onlineUsers.set(id, new Set());
  }

  onlineUsers.get(id).add(socketId);
};

export const removeUser = (userId, socketId) => {
  const id = userId.toString();
  const sockets = onlineUsers.get(id);

  if (!sockets) {
    return false;
  }

  sockets.delete(socketId);

  // User offline tabhi hoga jab uska koi socket connected na rahe.
  if (sockets.size === 0) {
    onlineUsers.delete(id);
    return true;
  }

  return false;
};

export const getSocketId = (userId) => {
  const sockets = onlineUsers.get(userId.toString());

  return sockets?.values().next().value;
};

export const getOnlineUsers = () => {
  return [...onlineUsers.keys()];
};
