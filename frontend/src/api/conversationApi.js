import API from "./axios";

export const getConversations = async () => {
  const response = await API.get("/conversations");

  return response.data;
};
