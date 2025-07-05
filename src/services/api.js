import axios from "axios";
import storage from "../utils/storage";
import { STORAGE_KEYS } from "../utils/constants";
import { toast } from "react-toastify";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5009/api/v1",
  //   withCredentials: true,
});

// Request interceptor – attach token
api.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.log("askcasncjanscasn", error);

    const status = error.response?.status;
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "An unexpected error occurred";

    switch (status) {
      case 401:
        toast.error("Unauthorized. Please login again.");
        storage.removeToken();
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        window.location.href = "/auth/login";
        break;
      case 403:
        toast.error("Access denied.");
        break;
      // case 500:
      //   toast.error("Server error. Please try again later.");
      //   break;
      default:
        toast.error(message);
    }

    return Promise.reject(new Error(message));
  }
);

// API methods
const apiService = {
  async get(endpoint, config = {}) {
    return api.get(endpoint, config);
  },

  async post(endpoint, data = {}, config = {}) {
    console.log(endpoint, data);
    return api.post(endpoint, data, config);
  },

  async patch(endpoint, data = {}, config = {}) {
    return api.patch(endpoint, data, config);
  },

  async put(endpoint, data = {}, config = {}) {
    return api.put(endpoint, data, config);
  },

  async delete(endpoint, config = {}) {
    return api.delete(endpoint, config);
  },

  async upload(endpoint, file, config = {}) {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(endpoint, formData, {
      ...config,
      headers: {
        ...config.headers,
        "Content-Type": "multipart/form-data",
      },
    });
  },

  async batch(requests) {
    return axios.all(requests.map((req) => api.request(req)));
  },

  setHeaders(headers) {
    Object.assign(api.defaults.headers, headers);
  },

  clearAuth() {
    storage.removeToken();
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    delete api.defaults.headers.Authorization;
  },
};

export default apiService;
