import { create } from "zustand"; // Use named import
import managerService from "../services/managerService";

const useManagerStore = create((set, get) => ({
  leads: [],
  studentProfile: null,
  tasks: [],
  documents: [],
  dashboard: null,
  consultants: [],
  loading: false,
  error: null,
  schedules: [],

  fetchLeads: async () => {
    set({ loading: true, error: null });
    try {
      const res = await managerService.getOfficeLeads();
      console.log("Fetched leads:", res);
      set({ leads: res || [], loading: false });
    } catch (error) {
      console.error("Fetch leads error:", error);
      set({
        error: error.response?.data?.error || "Failed to fetch leads",
        loading: false,
      });
    }
  },

  fetchStudentProfile: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const res = await managerService.getStudentProfile(studentId);
      console.log("Fetched student profile:", res);
      set({ studentProfile: res, loading: false });
      return res;
    } catch (error) {
      console.error("Fetch student profile error:", error);
      set({
        error: error.response?.data?.error || "Failed to fetch profile",
        loading: false,
      });
      throw error;
    }
  },

  fetchLeadTasks: async (leadId) => {
    set({ loading: true, error: null });
    try {
      const res = await managerService.getLeadTasks(leadId);
      console.log("Fetched lead tasks:", res);
      set({ tasks: res || [], loading: false });
    } catch (error) {
      console.error("Fetch lead tasks error:", error);
      set({
        error: error.response?.data?.error || "Failed to fetch tasks",
        loading: false,
      });
    }
  },

  fetchLeadDocuments: async (leadId) => {
    set({ loading: true, error: null });
    try {
      const res = await managerService.getLeadDocuments(leadId);
      console.log("Fetched lead documents:", res);
      set({ documents: res || [], loading: false });
    } catch (error) {
      console.error("Fetch lead documents error:", error);
      set({
        error: error.response?.data?.error || "Failed to fetch documents",
        loading: false,
      });
    }
  },

  sendMessage: async (studentId, message) => {
    set({ loading: true, error: null });
    try {
      const res = await managerService.sendMessage(studentId, message);
      console.log("Message sent:", res);
      set({ loading: false });
      return res;
    } catch (error) {
      console.error("Send message error:", error);
      set({
        error: error.response?.data?.error || "Failed to send message",
        loading: false,
      });
      throw error;
    }
  },

  createTask: async (leadId, taskData) => {
    set({ loading: true, error: null });
    try {
      const res = await managerService.createTask(leadId, taskData);
      console.log("Task created:", res);
      set((state) => ({
        tasks: [...state.tasks, res],
        loading: false,
      }));
      return res;
    } catch (error) {
      console.error("Create task error:", error);
      set({
        error: error.response?.data?.error || "Failed to create task",
        loading: false,
      });
      throw error;
    }
  },

  uploadDocument: async (leadId, files, types, notes) => {
    set({ loading: true, error: null });
    try {
      const res = await managerService.uploadLeadDocument(
        leadId,
        files,
        types,
        notes
      );
      console.log("Document uploaded:", res);
      set((state) => ({
        documents: [...state.documents, res],
        loading: false,
      }));
      return res;
    } catch (error) {
      console.error("Upload document error:", error);
      set({
        error: error.response?.data?.error || "Failed to upload document",
        loading: false,
      });
      throw error;
    }
  },

  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const res = await managerService.getDashboard();
      console.log("Fetched dashboard:", res);
      set({ dashboard: res, loading: false });
    } catch (error) {
      console.error("Fetch dashboard error:", error);
      set({
        error: error.response?.data?.error || "Failed to fetch dashboard",
        loading: false,
      });
    }
  },

  fetchOfficeConsultants: async () => {
    set({ loading: true, error: null });
    try {
      const res = await managerService.getOfficeConsultants();
      console.log("Fetched consultants:", res);
      set({ consultants: res || [], loading: false });
    } catch (error) {
      console.error("Fetch consultants error:", error);
      set({
        error: error.response?.data?.error || "Failed to fetch consultants",
        loading: false,
      });
    }
  },

  reassignLead: async (leadId, consultantId) => {
    set({ loading: true, error: null });
    try {
      const res = await managerService.reassignLead(leadId, consultantId);
      console.log("Lead reassigned:", res.data);
      set((state) => ({
        leads: state.leads.map((lead) => (lead.id === leadId ? res : lead)),
        loading: false,
      }));
      return res;
    } catch (error) {
      console.error("Reassign lead error:", error);
      set({
        error: error.response?.data?.error || "Failed to reassign lead",
        loading: false,
      });
      throw error;
    }
  },

  fetchSchedules: async () => {
    set({ loading: true });
    try {
      const response = await managerService.getSchedules();
      set({ schedules: response || [], loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch schedules",
        loading: false,
      });
    }
  },
  
  setSchedules: (schedules) => set({ schedules }),
}));

export default useManagerStore;
