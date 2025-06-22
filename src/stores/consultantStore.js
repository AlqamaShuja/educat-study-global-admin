import { create } from "zustand";
import consultantService from "../services/consultantService";

const useConsultantStore = create((set) => ({
  leads: [],
  selectedLead: null,
  tasks: [],
  documents: [],
  loading: false,
  error: null,
  studentProfile: {},

  fetchLeads: async () => {
    set({ loading: true, error: null });
    try {
      const res = await consultantService.getAssignedLeads();
      set({ leads: res, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchStudentProfile: async (id) => {
    set({ loading: true, error: null, studentProfile: {}, });
    try {
      const res = await consultantService.getStudentProfile(id);
      set({ leads: res, loading: false, studentProfile: res, });
      return res;
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },


  updateTaskStatus: async (taskId, status) => {
    set({ loading: true });
    try {
      await api.put(`/consultant/tasks/${taskId}/status`, { status });
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId ? { ...task, status } : task
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  selectLead: (lead) => set({ selectedLead: lead }),

  clearSelectedLead: () => set({ selectedLead: null }),

  updateLeadStatus: async (leadId, status) => {
    try {
      const res = await consultantService.updateLeadStatus(leadId, status);
      set((state) => ({
        leads: state.leads.map((lead) =>
          lead.id === leadId ? { ...lead, status } : lead
        ),
        selectedLead:
          state.selectedLead?.id === leadId
            ? { ...state.selectedLead, status }
            : state.selectedLead,
      }));
      return res;
    } catch (error) {
      throw error;
    }
  },

  addConsultationNote: async (leadId, note) => {
    try {
      const res = await consultantService.addConsultationNotes(leadId, note);
      set((state) => ({
        leads: state.leads.map((lead) =>
          lead.id === leadId
            ? {
                ...lead,
                history: [
                  ...(lead.history || []),
                  { note, timestamp: new Date().toISOString() },
                ],
              }
            : lead
        ),
        selectedLead:
          state.selectedLead?.id === leadId
            ? {
                ...state.selectedLead,
                history: [
                  ...(state.selectedLead.history || []),
                  { note, timestamp: new Date().toISOString() },
                ],
              }
            : state.selectedLead,
      }));
      return res;
    } catch (error) {
      throw error;
    }
  },

  uploadLeadDocument: async (leadId, files, types, notes) => {
    try {
      const res = await consultantService.uploadLeadDocument(
        leadId,
        files,
        types,
        notes
      );
      set((state) => ({
        documents: [...state.documents, ...res],
      }));
      return res;
    } catch (error) {
      throw error;
    }
  },

  fetchLeadTasks: async (leadId) => {
    set({ loading: true, error: null });
    try {
      const res = await consultantService.getLeadTasks(leadId);
      set({ tasks: res, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchLeadDocuments: async (leadId) => {
    set({ loading: true, error: null });
    try {
      const res = await consultantService.getLeadDocuments(leadId);
      set({ documents: res, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  setFollowUpTask: async (leadId, task) => {
    try {
      const res = await consultantService.setFollowUpTask(leadId, task);
      set((state) => ({
        tasks: [...state.tasks, res.task],
      }));
      return res;
    } catch (error) {
      throw error;
    }
  },

  getStudentProfile: async (studentId) => {
    try {
      const res = await consultantService.getStudentProfile(studentId);
      return res;
    } catch (error) {
      throw error;
    }
  },

  requestProfileInfo: async (studentId, message) => {
    try {
      const res = await consultantService.requestProfileInfo(
        studentId,
        message
      );
      return res;
    } catch (error) {
      throw error;
    }
  },

  sendReviewNotification: async (studentId, message) => {
    try {
      const res = await consultantService.sendReviewNotification(
        studentId,
        message
      );
      return res;
    } catch (error) {
      throw error;
    }
  },

  sendMessage: async (studentId, message) => {
    try {
      const res = await consultantService.sendMessage(studentId, message);
      return res;
    } catch (error) {
      throw error;
    }
  },

  scheduleMeeting: async (studentId, meeting) => {
    try {
      const res = await consultantService.scheduleMeeting(studentId, meeting);
      return res;
    } catch (error) {
      throw error;
    }
  },

  shareResources: async (studentId, resources) => {
    try {
      const res = await consultantService.shareResources(studentId, resources);
      return res;
    } catch (error) {
      throw error;
    }
  },

  getCommunicationHistory: async (studentId) => {
    try {
      const res = await consultantService.getCommunicationHistory(studentId);
      return res;
    } catch (error) {
      throw error;
    }
  },

  markMessagesAsRead: async (studentId) => {
    try {
      const res = await consultantService.markMessagesAsRead(studentId);
      return res;
    } catch (error) {
      throw error;
    }
  },

  createApplicationChecklist: async (studentId, items) => {
    try {
      const res = await consultantService.createApplicationChecklist(
        studentId,
        items
      );
      return res;
    } catch (error) {
      throw error;
    }
  },

  trackDocumentSubmission: async (studentId, files, types, notes) => {
    try {
      const res = await consultantService.trackDocumentSubmission(
        studentId,
        files,
        types,
        notes
      );
      return res;
    } catch (error) {
      throw error;
    }
  },

  setDeadlineReminder: async (studentId, reminder) => {
    try {
      const res = await consultantService.setDeadlineReminder(
        studentId,
        reminder
      );
      return res;
    } catch (error) {
      throw error;
    }
  },

  updateApplicationStatus: async (studentId, status) => {
    try {
      const res = await consultantService.updateApplicationStatus(
        studentId,
        status
      );
      return res;
    } catch (error) {
      throw error;
    }
  },

  getApplicationProgress: async (studentId) => {
    try {
      const res = await consultantService.getApplicationProgress(studentId);
      return res;
    } catch (error) {
      throw error;
    }
  },
}));

export default useConsultantStore;
