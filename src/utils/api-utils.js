import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let errorMessage = "An unexpected error occurred";

    if (error.response) {
      const { status, data } = error.response;
      errorMessage = data.message || errorMessage;

      if (status === 401) {
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      }
    } else if (error.request) {
      errorMessage = "No response received from server";
    }

    return Promise.reject(new Error(errorMessage));
  }
);

const apiUtils = {
  async get(endpoint, config = {}) {
    return apiClient.get(endpoint, config);
  },

  async post(endpoint, data = {}, config = {}) {
    return apiClient.post(endpoint, data, config);
  },

  async patch(endpoint, data = {}, config = {}) {
    return apiClient.patch(endpoint, data, config);
  },

  async delete(endpoint, config = {}) {
    return apiClient.delete(endpoint, config);
  },

  // Utility for file uploads
  async upload(endpoint, file, config = {}) {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(endpoint, formData, {
      ...config,
      headers: {
        ...config.headers,
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Batch request utility
  async batch(requests) {
    return axios.all(requests.map((req) => apiClient.request(req)));
  },

  // Set custom headers
  setHeaders(headers) {
    Object.assign(apiClient.defaults.headers, headers);
  },

  // Clear auth token
  clearAuthToken() {
    localStorage.removeItem("authToken");
    delete apiClient.defaults.headers.Authorization;
  },
};

export default apiUtils;
