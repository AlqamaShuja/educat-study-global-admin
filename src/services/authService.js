import api from "./api";
import storage from "../utils/storage";

const authService = {
  /**
   * Log in a user
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} - User object
   * @throws {Error} - If login fails
   */
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      console.log("API Response:", response); // Debug log
      const { token, user } = response; // Adjusted for api.js returning response.data
      if (!token || !user) {
        throw new Error("Invalid login response: Missing token or user data");
      }
      storage.setToken(token);
      storage.setUserData(user);
      console.log("Token and user data stored:", { token, user }); // Debug log
      return user;
    } catch (error) {
      console.log("Login error22:", error);
      // console.error("Login error:", error.message || error);
      throw new Error(error.message || "Failed to login");
    }
  },

  /**
   * Register a new user
   * @param {Object} data - Registration data
   * @returns {Promise<Object>} - Registered user data
   * @throws {Error} - If registration fails
   */
  register: async (data) => {
    try {
      const response = await api.post("/auth/register", data);
      console.log("Register Response:", response); // Debug log
      return response;
    } catch (error) {
      console.error("Register error:", error.message || error);
      throw new Error(error.message || "Failed to register");
    }
  },

  /**
   * Log out the current user
   */
  logout: () => {
    try {
      storage.removeToken();
      storage.removeUserData();
      api.clearAuth();
      console.log("Logged out successfully"); // Debug log
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  /**
   * Refresh token (optional, if implemented on backend)
   * @returns {Promise<string>} - New token
   * @throws {Error} - If token refresh fails
   */
  refreshToken: async () => {
    try {
      const response = await api.post("/auth/refresh");
      console.log("Refresh Token Response:", response); // Debug log
      const { token } = response;
      if (!token) {
        throw new Error("Invalid refresh response: Missing token");
      }
      storage.setToken(token);
      console.log("New token stored:", token); // Debug log
      return token;
    } catch (error) {
      console.error("Refresh token error:", error.message || error);
      throw new Error(error.message || "Failed to refresh token");
    }
  },
};

export default authService;
