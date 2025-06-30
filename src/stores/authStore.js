// src/stores/authStore.js
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import authService from "../services/authService";
import storage from "../utils/storage";

const useAuthStore = create(
  subscribeWithSelector((set, get) => ({
    // Authentication state (keeping your existing structure)
    user: null,
    isAuthenticated: false,
    loading: false, // keeping your 'loading' instead of 'isLoading'
    error: null,

    // Enhanced features - permissions and role info
    permissions: [],
    canMonitorConversations: false,

    // Your existing initializeAuth with enhancements
    initializeAuth: () => {
      console.log("Initializing auth...");
      set({ loading: true });

      const token = localStorage.getItem("authToken");
      const rawUser = localStorage.getItem("userData");

      console.log("Token exists:", !!token, "Raw user:", rawUser);

      const isTokenExpired = (token) => {
        try {
          const [, payload] = token.split(".");
          const decoded = JSON.parse(atob(payload));
          return decoded.exp * 1000 < Date.now();
        } catch (error) {
          console.error("Token parsing error:", error);
          return true;
        }
      };

      if (token && rawUser && !isTokenExpired(token)) {
        try {
          const parsedUser = JSON.parse(rawUser);

          // Calculate permissions based on user role
          const permissions = get().calculatePermissions(parsedUser);
          const canMonitorConversations =
            get().checkMonitoringPermissions(parsedUser);

          set({
            user: parsedUser,
            isAuthenticated: true,
            loading: false,
            permissions,
            canMonitorConversations,
            error: null,
          });
          console.log("Auth initialized: User set");
        } catch (err) {
          console.error("Failed to parse user data:", err);
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
            permissions: [],
            canMonitorConversations: false,
            error: "Failed to parse user data",
          });
        }
      } else {
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          permissions: [],
          canMonitorConversations: false,
          error: null,
        });
        console.log("Auth initialized: No valid token or user");
      }
    },

    // Your existing login with enhancements
    login: async (credentials) => {
      set({ loading: true, error: null });
      try {
        const user = await authService.login(credentials);

        // Calculate permissions based on user role
        const permissions = get().calculatePermissions(user);
        const canMonitorConversations = get().checkMonitoringPermissions(user);

        set({
          user,
          isAuthenticated: true,
          permissions,
          canMonitorConversations,
          error: null,
        });
        return user;
      } catch (err) {
        set({ error: err.message || "Login failed" });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    // Your existing logout
    logout: () => {
      authService.logout();
      set({
        user: null,
        isAuthenticated: false,
        permissions: [],
        canMonitorConversations: false,
        error: null,
      });
    },

    // Your existing setUser with enhancements
    setUser: (user) => {
      const permissions = get().calculatePermissions(user);
      const canMonitorConversations = get().checkMonitoringPermissions(user);

      set((state) => ({
        ...state,
        user,
        isAuthenticated: !!user,
        permissions: user ? permissions : [],
        canMonitorConversations: user ? canMonitorConversations : false,
      }));
    },

    // Your existing setLoading
    setLoading: (val) => set((state) => ({ ...state, loading: val })),

    // Enhanced features - Calculate user permissions based on role
    calculatePermissions: (user) => {
      if (!user || !user.role) return [];

      const rolePermissions = {
        super_admin: [
          "view_all_conversations",
          "monitor_all_offices",
          "manage_users",
          "system_administration",
          "view_analytics",
          "export_data",
        ],
        manager: [
          "view_office_conversations",
          "monitor_office_staff",
          "manage_office_staff",
          "view_office_analytics",
          "assign_consultants",
        ],
        consultant: [
          "chat_with_leads",
          "chat_with_manager",
          "manage_assigned_leads",
          "view_lead_profiles",
          "update_lead_status",
        ],
        receptionist: [
          "chat_with_manager",
          "chat_with_consultants",
          "manage_appointments",
          "view_office_schedule",
        ],
        lead: ["chat_with_consultant", "update_profile", "view_appointments"],
      };

      return rolePermissions[user.role] || [];
    },

    // Check if user can monitor conversations
    checkMonitoringPermissions: (user) => {
      if (!user || !user.role) return false;
      return ["super_admin", "manager"].includes(user.role);
    },

    // Check if user has specific permission
    hasPermission: (permission) => {
      const { permissions } = get();
      return permissions.includes(permission);
    },

    // Check if user can chat with another user
    canChatWith: (targetUser) => {
      const { user } = get();

      if (!user || !targetUser) return false;

      const chatMatrix = {
        lead: ["consultant"],
        consultant: ["lead", "manager"],
        receptionist: ["manager", "consultant"],
        manager: ["consultant", "receptionist", "lead"],
        super_admin: ["consultant", "receptionist", "manager", "lead"],
      };

      const allowedRoles = chatMatrix[user.role] || [];
      return allowedRoles.includes(targetUser.role);
    },

    // Check if user can access specific office data
    canAccessOffice: (officeId) => {
      const { user } = get();

      if (!user) return false;
      if (user.role === "super_admin") return true;

      return user.officeId === officeId;
    },

    // Update user profile (enhanced feature)
    updateProfile: async (profileData) => {
      const { user } = get();

      if (!user) {
        throw new Error("Not authenticated");
      }

      set({ loading: true, error: null });

      try {
        // Use your existing authService if it has updateProfile method
        let updatedUser;
        if (authService.updateProfile) {
          updatedUser = await authService.updateProfile(profileData);
        } else {
          // Fallback to direct API call
          const token = localStorage.getItem("authToken");
          const response = await fetch("/api/v1/users/profile", {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(profileData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Profile update failed");
          }

          updatedUser = await response.json();
        }

        // Update localStorage
        localStorage.setItem("userData", JSON.stringify(updatedUser));

        set({
          user: { ...user, ...updatedUser },
          loading: false,
          error: null,
        });

        return updatedUser;
      } catch (error) {
        set({
          loading: false,
          error: error.message,
        });
        throw error;
      }
    },

    // Refresh token functionality (enhanced feature)
    refreshAuthToken: async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No token available for refresh");
      }

      set({ loading: true });

      try {
        // Use your authService if it has refresh method
        let refreshedData;
        if (authService.refreshToken) {
          refreshedData = await authService.refreshToken();
        } else {
          // Fallback to direct API call
          const response = await fetch("/api/v1/auth/refresh", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Token refresh failed");
          }

          refreshedData = await response.json();
        }

        // Update localStorage with new token
        localStorage.setItem("authToken", refreshedData.token);

        set({
          loading: false,
          error: null,
        });

        return refreshedData.token;
      } catch (error) {
        // If refresh fails, logout user
        get().logout();
        throw error;
      }
    },

    // Get user display info
    getUserDisplayInfo: () => {
      const { user } = get();
      if (!user) return null;

      return {
        id: user.id,
        name: user.name || `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        avatar: user.avatar || user.profilePicture,
        officeId: user.officeId,
        office: user.office,
      };
    },

    // Check if token is expired (your existing logic enhanced)
    isTokenExpired: () => {
      const token = localStorage.getItem("authToken");
      if (!token) return true;

      try {
        const [, payload] = token.split(".");
        const decoded = JSON.parse(atob(payload));
        return decoded.exp * 1000 < Date.now();
      } catch {
        return true;
      }
    },

    // Get current token
    getToken: () => {
      return localStorage.getItem("authToken");
    },

    // Clear error
    clearError: () => {
      set({ error: null });
    },

    // Enhanced validation (optional - validates token with server)
    validateTokenWithServer: async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        return false;
      }

      set({ loading: true });

      try {
        const response = await fetch("/api/v1/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Token validation failed");
        }

        const user = await response.json();
        const permissions = get().calculatePermissions(user);
        const canMonitorConversations = get().checkMonitoringPermissions(user);

        // Update localStorage with fresh user data
        localStorage.setItem("userData", JSON.stringify(user));

        set({
          user,
          isAuthenticated: true,
          loading: false,
          permissions,
          canMonitorConversations,
          error: null,
        });

        return true;
      } catch (error) {
        console.error("Token validation failed:", error);
        get().logout();
        return false;
      }
    },
  }))
);

export default useAuthStore;

// // stores/authStore.js

// import { create } from "zustand";
// import authService from "../services/authService";
// import storage from "../utils/storage";

// const useAuthStore = create((set) => ({
//   user: null,
//   isAuthenticated: false,
//   loading: true,

//   initializeAuth: () => {
//     console.log("Initializing auth...");
//     set({ loading: true });

//     const token = localStorage.getItem("authToken"); // storage.getToken();
//     const rawUser = localStorage.getItem("userData"); // storage.getUserData();

//     console.log("Token exists:", !!token, "Raw user:", rawUser);

//     const isTokenExpired = (token) => {
//       try {
//         const [, payload] = token.split(".");
//         const decoded = JSON.parse(atob(payload));
//         return decoded.exp * 1000 < Date.now(); // true if expired
//       } catch (error) {
//         console.error("Token parsing error:", error);
//         return true;
//       }
//     };

//     if (token && rawUser && !isTokenExpired(token)) {
//       try {
//         const parsedUser = JSON.parse(rawUser);
//         set({
//           user: parsedUser,
//           isAuthenticated: true,
//           loading: false,
//         });
//         console.log("Auth initialized: User set");
//       } catch (err) {
//         console.error("Failed to parse user data:", err);
//         set({
//           user: null,
//           isAuthenticated: false,
//           loading: false,
//         });
//       }
//     } else {
//       set({
//         user: null,
//         isAuthenticated: false,
//         loading: false,
//       });
//       console.log("Auth initialized: No valid token or user");
//     }
//   },

//   login: async (credentials) => {
//     set({ loading: true });
//     try {
//       const user = await authService.login(credentials);
//       set({ user, isAuthenticated: true });
//       return user;
//     } catch (err) {
//       throw err;
//     } finally {
//       set({ loading: false });
//     }
//   },

//   logout: () => {
//     authService.logout();
//     set({ user: null, isAuthenticated: false });
//   },

//   setUser: (user) =>
//     set((state) => ({ ...state, user, isAuthenticated: !!user })),
//   setLoading: (val) => set((state) => ({ ...state, loading: val })),
// }));

// export default useAuthStore;
