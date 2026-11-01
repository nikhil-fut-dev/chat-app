import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Set JSON Content-Type only for non-FormData requests.
API.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      // Let the browser set multipart/form-data with its boundary.
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    } else if (config.data !== undefined) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh-token")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh(() => {
          resolve(API(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      await API.post("/auth/refresh-token");

      onRefreshed();

      return API(originalRequest);
    } catch (refreshError) {
      refreshSubscribers = [];
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default API;
