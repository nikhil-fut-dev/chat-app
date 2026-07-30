import API from "./axios";

export const getMyProfile = async () => {
  const response = await API.get("/users/me");

  return response.data;
};

export const searchUsers = async (query) => {
  const response = await API.get("/users/search", {
    params: {
      q: query,
    },
  });

  return response.data;
};
