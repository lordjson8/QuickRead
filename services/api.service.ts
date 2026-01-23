import axios, { AxiosError } from "axios";
import storageService from "./storage.service";
import { authStore } from "@/store/auth.store";

export const baseURL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const access_token = await storageService.getItem("access");

    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    console.log("original", originalRequest?._retry);

    if (error.response?.status === 401 && originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await storageService.getItem("refresh");

        const response = await axios.post(`${baseURL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access, refresh } = response.data;
        await authStore.getState().setTokens(access, refresh);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
        
      } catch (error) {
        await authStore.getState().logout();
        return Promise.reject(error);
      }
    }
    throw error;
  }
);

export default api;
