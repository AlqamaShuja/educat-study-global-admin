// stores/authStore.js

import { create } from "zustand";
import authService from "../services/authService";
import storage from "../utils/storage";

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  initializeAuth: () => {
    console.log("Initializing auth...");
    set({ loading: true });
    const token = storage.getToken();
    const user = storage.getUserData();
    console.log("Token:", !!token, "User:", user);
    const isTokenExpired = (token) => {
      try {
        const [, payload] = token.split(".");
        const decoded = JSON.parse(atob(payload));
        return decoded.exp * 1000 < Date.now();
      } catch {
        return true;
      }
    };
    if (token && user && !isTokenExpired(token)) {
      set({ user, isAuthenticated: true, loading: false });
      console.log("Auth initialized: User set");
    } else {
      set({ user: null, isAuthenticated: false, loading: false });
      console.log("Auth initialized: No user");
    }
  },

  login: async (credentials) => {
    set({ loading: true });
    try {
      const user = await authService.login(credentials);
      set({ user, isAuthenticated: true });
      return user;
    } catch (err) {
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));

export default useAuthStore;
