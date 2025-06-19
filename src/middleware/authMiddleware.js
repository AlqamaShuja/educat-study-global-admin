// middleware/authMiddleware.js

import axios from "axios";
import { getToken, removeToken } from "../utils/storage";
import { toast } from "react-toastify";

export const attachAuthInterceptor = (axiosInstance, navigate) => {
  // Request interceptor to attach token
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle auth errors
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;

      if (status === 401 || status === 403) {
        toast.error("Session expired. Please log in again.");
        removeToken();
        navigate("/login");
      }

      return Promise.reject(error);
    }
  );
};
