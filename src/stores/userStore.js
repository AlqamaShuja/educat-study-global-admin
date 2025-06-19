import { create } from "zustand";
import userService from "../services/userService";
import { toast } from "react-toastify";

const useUserStore = create((set, get) => ({
  profile: null,
  users: [],
  students: [],
  loading: false,
  isLoading: false,
  error: null,
  dashboard: {},


  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const profile = await userService.getProfile();
      set({ profile });
    } catch (error) {
      set({ error: error.message || "Failed to fetch profile" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await userService.updateProfile(data);
      set({ profile: updated });
      return updated;
    } catch (error) {
      set({ error: error.message || "Failed to update profile" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchAllStaff: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await userService.getAllStaff();
      set({ users });
    } catch (error) {
      set({ error: error.message || "Failed to fetch staff" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchManagers: async () => {
    set({ isLoading: true, error: null });
    try {
      // Option 1: Filter from users if already fetched
      const users = get().users;
      if (users.length) {
        return users.filter((user) => user.role === "manager");
      }
      // Option 2: Fetch from service
      const managers = await userService.getManagers();
      set((state) => ({
        users: [
          ...state.users.filter((u) => u.role !== "manager"),
          ...managers,
        ],
      }));
      return managers;
    } catch (error) {
      set({ error: error.message || "Failed to fetch managers" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchConsultants: async () => {
    set({ isLoading: true, error: null });
    try {
      // Option 1: Filter from users if already fetched
      const users = get().users;
      if (users.length) {
        return users.filter((user) => user.role === "consultant");
      }
      // Option 2: Fetch from service
      const consultants = await userService.getConsultants();
      set((state) => ({
        users: consultants
      }));
      return consultants;
    } catch (error) {
      set({ error: error.message || "Failed to fetch consultants" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStudents: async () => {
    set({ isLoading: true, error: null });
    try {
      const students = await userService.getAllStudents();
      set((state) => ({
        students,
      }));
      return students;
    } catch (error) {
      set({ error: error.message || "Failed to fetch consultants" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchSuperAdminDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await userService.getSuperAdminDashboardData();
      set((state) => ({
        dashboard: data,
      }));
      return data;
    } catch (error) {
      set({ error: error.message || "Failed to fetch consultants" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateLeadAssign: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await userService.updateLeadAssign(data);
      return res;
    } catch (error) {
      set({ error: error.message || "Failed to fetch consultants" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createStaff: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newStaff = await userService.createStaff(data);
      set((state) => ({
        users: [...state.users, newStaff],
      }));
      return newStaff;
    } catch (error) {
      console.log(error, "akcnasncjsncascs");

      set({ error: error.message || "Failed to create staff" });
      toast.error(error.message || "Failed to create staff");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateStaff: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const originalUsers = get().users;
      const updatedStaff = await userService.updateStaff(id, data);
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, ...updatedStaff } : user
        ),
      }));
      return updatedStaff;
    } catch (error) {
      set({ error: error.message || "Failed to update staff" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteStaff: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await userService.deleteStaff(id);
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
      }));
    } catch (error) {
      set({ error: error.message || "Failed to delete staff" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleStaffStatus: async (id, isActive) => {
    set({ isLoading: true, error: null });
    try {
      const originalUsers = get().users;
      const updatedStaff = await userService.toggleStaffStatus(id, isActive);
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, isActive: updatedStaff.isActive } : user
        ),
      }));
    } catch (error) {
      set({ error: error.message || "Failed to toggle staff status" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  importStaffCSV: async (file) => {
    set({ isLoading: true, error: null });
    try {
      const result = await userService.importStaffCSV(file);
      await get().fetchAllStaff(); // Refresh users after import
      return result;
    } catch (error) {
      set({ error: error.message || "Failed to import staff CSV" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getStaffLogs: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const logs = await userService.getStaffLogs(id);
      return logs;
    } catch (error) {
      set({ error: error.message || "Failed to fetch staff logs" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  bulkUpdateStaff: async (staffUpdates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedStaff = await userService.bulkUpdateStaff(staffUpdates);
      set((state) => ({
        users: state.users.map((user) => {
          const updated = updatedStaff.find((u) => u.id === user.id);
          return updated ? { ...user, ...updated } : user;
        }),
      }));
      return updatedStaff;
    } catch (error) {
      set({ error: error.message || "Failed to bulk update staff" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useUserStore;
