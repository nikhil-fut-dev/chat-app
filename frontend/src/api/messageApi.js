import API from "./axios";

export const getMessages = async (receiverId) => {
  const response = await API.get(`/messages/${receiverId}`);

  return response.data;
};

export const sendMessage = async ({ receiverId, text }) => {
  const response = await API.post("/messages", {
    receiverId,
    text,
  });

  return response.data;
};

export const markMessageDelivered = async (messageId) => {
  const response = await API.patch(`/messages/${messageId}/delivered`);

  return response.data;
};

export const markMessageSeen = async (messageId) => {
  const response = await API.patch(`/messages/${messageId}/seen`);

  return response.data;
};

export const editMessage = async (messageId, text) => {
  const response = await API.put(`/messages/${messageId}`, {
    text,
  });

  return response.data;
};

export const deleteMessage = async (messageId) => {
  const response = await API.delete(`/messages/${messageId}`);

  return response.data;
};
