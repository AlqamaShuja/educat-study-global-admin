// stores/authStore.js

import { create } from "zustand";
import authService from "../services/authService";
import storage from "../utils/storage";

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  initializeAuth: () => {
    console.log("Initializing auth...");
    set({ loading: true });

    const token = localStorage.getItem("authToken"); // storage.getToken();
    const rawUser = localStorage.getItem("userData"); // storage.getUserData();

    console.log("Token exists:", !!token, "Raw user:", rawUser);

    const isTokenExpired = (token) => {
      try {
        const [, payload] = token.split(".");
        const decoded = JSON.parse(atob(payload));
        return decoded.exp * 1000 < Date.now(); // true if expired
      } catch (error) {
        console.error("Token parsing error:", error);
        return true;
      }
    };

    if (token && rawUser && !isTokenExpired(token)) {
      try {
        const parsedUser = JSON.parse(rawUser);
        set({
          user: parsedUser,
          isAuthenticated: true,
          loading: false,
        });
        console.log("Auth initialized: User set");
      } catch (err) {
        console.error("Failed to parse user data:", err);
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    } else {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      console.log("Auth initialized: No valid token or user");
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

  setUser: (user) =>
    set((state) => ({ ...state, user, isAuthenticated: !!user })),
  setLoading: (val) => set((state) => ({ ...state, loading: val })),
}));

export default useAuthStore;
