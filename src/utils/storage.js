const storage = {
  // Local Storage utilities
  setLocalItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set local storage item ${key}:`, error);
    }
  },

  getLocalItem(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Failed to get local storage item ${key}:`, error);
      return null;
    }
  },

  removeLocalItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove local storage item ${key}:`, error);
    }
  },

  clearLocalStorage() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Failed to clear local storage:", error);
    }
  },

  // Session Storage utilities
  setSessionItem(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set session storage item ${key}:`, error);
    }
  },

  getSessionItem(key) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Failed to get session storage item ${key}:`, error);
      return null;
    }
  },

  removeSessionItem(key) {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove session storage item ${key}:`, error);
    }
  },

  clearSessionStorage() {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error("Failed to clear session storage:", error);
    }
  },

  // Specific utilities for auth token
  setAuthToken(token) {
    this.setLocalItem("authToken", token);
  },

  getAuthToken() {
    return this.getLocalItem("authToken");
  },

  removeAuthToken() {
    this.removeLocalItem("authToken");
  },

  // Aliases for backward compatibility
  setToken(token) {
    this.setAuthToken(token);
  },

  getToken() {
    return this.getAuthToken();
  },

  removeToken() {
    this.removeAuthToken();
  },

  // Specific utilities for user data
  setUserData(user) {
    this.setLocalItem("userData", user);
  },

  getUserData() {
    return this.getLocalItem("userData");
  },

  removeUserData() {
    this.removeLocalItem("userData");
  },

  // Check if storage is available
  isStorageAvailable(type = "localStorage") {
    try {
      const storage = window[type];
      const testKey = "__storage_test__";
      storage.setItem(testKey, testKey);
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },
};

export default storage;