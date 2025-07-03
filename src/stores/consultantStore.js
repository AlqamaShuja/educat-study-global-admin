// stores/consultantStore.js
import { create } from "zustand";
import consultantService from "../services/consultantService";
import { toast } from "react-toastify";

const useConsultantStore = create((set, get) => ({
  // State
  leads: [],
  selectedLead: null,
  tasks: [],
  documents: [],
  loading: false,
  error: null,
  studentProfile: null,
  appointments: [],
  proposals: [],
  checklists: [],

  // Helper methods
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch assigned leads
  fetchLeads: async () => {
    set({ loading: true, error: null });
    try {
      const res = await consultantService.getAssignedLeads();
      set({ leads: res, loading: false });
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to fetch leads";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Fetch student profile
  fetchStudentProfile: async (studentId) => {
    set({ loading: true, error: null, studentProfile: null });
    try {
      const res = await consultantService.getStudentProfile(studentId);
      set({ studentProfile: res, loading: false }); // Fixed: don't overwrite leads
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch student profile";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Update lead status
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
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to update lead status";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Add consultation note
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
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to add consultation note";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Fetch lead tasks
  fetchLeadTasks: async (leadId) => {
    set({ loading: true, error: null });
    try {
      const res = await consultantService.getLeadTasks(leadId);
      set({ tasks: res, loading: false });
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to fetch tasks";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  fetchAllLeadTasks: async () => {
    set({ loading: true, error: null });
    try {
      const res = await consultantService.getAllLeadTasks();
      set({ tasks: res, loading: false });
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to fetch tasks";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  deleteLeadTaskById: async (id) => {
    set({ error: null });
    try {
      set((prev) => ({
        ...prev,
        tasks: prev.tasks?.filter((task) => task.id !== id),
        loading: false,
      }));
      const res = await consultantService.deleteLeadTaskById(id);
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete task";
      set({ error: errorMessage, loading: false });
      throw new AppError(errorMessage, error.response?.status || 500);
    }
  },

  editLeadTask: async (taskId, taskData) => {
    set({ loading: true, error: null });
    try {
      const res = await consultantService.editLeadTask(taskId, {
        description: taskData.description,
        dueDate: new Date(taskData.dueDate).toISOString(),
        status: taskData.status,
        leadId: taskData.leadId,
        notes: taskData.notes,
      });
      set((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId ? { ...task, ...res.data } : task
        ),
        loading: false,
      }));
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update task";
      set({ error: errorMessage, loading: false });
      throw new AppError(errorMessage, error.response?.status || 500);
    }
  },

  // Fetch lead documents
  fetchLeadDocuments: async (leadId) => {
    set({ loading: true, error: null });
    try {
      const res = await consultantService.getLeadDocuments(leadId);
      set({ documents: res, loading: false });
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch documents";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Create task (alias for setFollowUpTask to match component usage)
  createTask: async (leadId, taskData) => {
    try {
      const res = await consultantService.setFollowUpTask(leadId, taskData);
      // Refresh tasks after creating
      await get().fetchLeadTasks(leadId);
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to create task";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Set follow-up task
  setFollowUpTask: async (leadId, taskData) => {
    try {
      const res = await consultantService.setFollowUpTask(leadId, taskData);
      set((state) => ({
        tasks: [...state.tasks, res],
      }));
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to set follow-up task";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Upload document (accepts FormData)
  uploadDocument: async (leadId, formData) => {
    try {
      const res = await consultantService.uploadLeadDocument(leadId, formData);
      // Refresh documents after upload
      await get().fetchLeadDocuments(leadId);
      return res;
    } catch (error) {
      console.log(error, "asncajsncajsncsn");

      const errorMessage =
        error.error ||
        error.response?.data?.error ||
        error.message ||
        "Failed to upload document";
      // toast.error(errorMessage)
      set({ error: errorMessage });
      throw error;
    }
  },

  // Upload lead document (legacy method for backward compatibility)
  uploadLeadDocument: async (leadId, formData) => {
    try {
      const res = await consultantService.uploadLeadDocument(leadId, formData);
      set((state) => ({
        documents: [...state.documents, ...res],
      }));
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to upload lead document";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Update document status
  updateDocumentStatus: async (documentId, status, notes) => {
    try {
      const res = await consultantService.updateDocumentStatus(
        documentId,
        status,
        notes
      );
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === documentId ? { ...doc, status, notes } : doc
        ),
      }));
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to update document status";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Get student profile (alias method)
  getStudentProfile: async (studentId) => {
    try {
      const res = await consultantService.getStudentProfile(studentId);
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to get student profile";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Request profile info
  requestProfileInfo: async (studentId, message) => {
    try {
      const res = await consultantService.requestProfileInfo(
        studentId,
        message
      );
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to request profile info";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Send review notification
  sendReviewNotification: async (studentId, message) => {
    try {
      const res = await consultantService.sendReviewNotification(
        studentId,
        message
      );
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to send review notification";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Send message
  sendMessage: async (studentId, message) => {
    try {
      const res = await consultantService.sendMessage(studentId, message);
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to send message";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Schedule meeting
  scheduleMeeting: async (studentId, meetingData) => {
    try {
      const res = await consultantService.scheduleMeeting(
        studentId,
        meetingData
      );
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to schedule meeting";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Share resources
  shareResources: async (studentId, resources) => {
    try {
      const res = await consultantService.shareResources(studentId, resources);
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to share resources";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Get communication history
  getCommunicationHistory: async (studentId) => {
    try {
      const res = await consultantService.getCommunicationHistory(studentId);
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to get communication history";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Mark messages as read
  markMessagesAsRead: async (studentId) => {
    try {
      const res = await consultantService.markMessagesAsRead(studentId);
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to mark messages as read";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Create application checklist
  createApplicationChecklist: async (studentId, items) => {
    try {
      const res = await consultantService.createApplicationChecklist(
        studentId,
        items
      );
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to create application checklist";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Track document submission
  trackDocumentSubmission: async (studentId, formData) => {
    try {
      const res = await consultantService.trackDocumentSubmission(
        studentId,
        formData
      );
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to track document submission";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Set deadline reminder
  setDeadlineReminder: async (studentId, reminderData) => {
    try {
      const res = await consultantService.setDeadlineReminder(
        studentId,
        reminderData
      );
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to set deadline reminder";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Update application status
  updateApplicationStatus: async (studentId, status) => {
    try {
      const res = await consultantService.updateApplicationStatus(
        studentId,
        status
      );
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to update application status";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Get application progress
  getApplicationProgress: async (studentId) => {
    try {
      const res = await consultantService.getApplicationProgress(studentId);
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to get application progress";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Update task status (for backward compatibility)
  updateTaskStatus: async (taskId, status) => {
    set({ loading: true });
    try {
      // Note: This endpoint doesn't exist in the backend routes provided
      // You may need to implement this in the backend or remove this method
      await api.put(`/consultant/tasks/${taskId}/status`, { status });
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId ? { ...task, status } : task
        ),
        loading: false,
      }));
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to update task status";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Select lead
  selectLead: (lead) => set({ selectedLead: lead }),

  // Clear selected lead
  clearSelectedLead: () => set({ selectedLead: null }),

  // Clear all data
  clearData: () =>
    set({
      leads: [],
      selectedLead: null,
      tasks: [],
      documents: [],
      loading: false,
      error: null,
      studentProfile: null,
      appointments: [],
    }),

  fetchAppointments: async () => {
    set({ loading: true, error: null });
    try {
      const res = await consultantService.getAppointments();
      set({ appointments: res, loading: false });
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch appointments";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Update appointment
  updateAppointment: async (appointmentId, appointmentData) => {
    try {
      const res = await consultantService.updateAppointment(
        appointmentId,
        appointmentData
      );
      set((state) => ({
        appointments: state.appointments.map((apt) =>
          apt.id === appointmentId ? res : apt
        ),
      }));
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to update appointment";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Delete appointment
  deleteAppointment: async (appointmentId) => {
    try {
      await consultantService.deleteAppointment(appointmentId);
      set((state) => ({
        appointments: state.appointments.filter(
          (apt) => apt.id !== appointmentId
        ),
      }));
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to delete appointment";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Update lead parked status - NEW FUNCTION
  updateLeadParkedStatus: async (leadId, parked) => {
    try {
      const res = await consultantService.updateLeadParkedStatus(
        leadId,
        parked
      );
      set((state) => ({
        leads: state.leads.map((lead) =>
          lead.id === leadId ? { ...lead, parked } : lead
        ),
        selectedLead:
          state.selectedLead?.id === leadId
            ? { ...state.selectedLead, parked }
            : state.selectedLead,
      }));
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to update parked status";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Create proposal
  createProposal: async (leadId, proposalData) => {
    set({ loading: true, error: null });
    try {
      const res = await consultantService.createProposal(leadId, proposalData);
      set((state) => ({
        proposals: [...state.proposals, res],
        loading: false,
      }));
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to create proposal";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Fetch proposals
  fetchProposals: async (status = "") => {
    set({ loading: true, error: null });
    try {
      const res = await consultantService.getProposals(status);
      set({ proposals: res.proposals, loading: false });
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch proposals";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Fetch proposals by lead
  fetchProposalsByLead: async (leadId) => {
    set({ loading: true, error: null });
    try {
      const res = await consultantService.getProposalsByLead(leadId);
      return res.proposals;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch proposals for lead";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Update proposal
  updateProposal: async (proposalId, proposalData) => {
    try {
      const res = await consultantService.updateProposal(
        proposalId,
        proposalData
      );
      set((state) => ({
        proposals: state.proposals.map((proposal) =>
          proposal.id === proposalId ? res : proposal
        ),
      }));
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to update proposal";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Delete proposal
  deleteProposal: async (proposalId) => {
    try {
      await consultantService.deleteProposal(proposalId);
      set((state) => ({
        proposals: state.proposals.filter(
          (proposal) => proposal.id !== proposalId
        ),
      }));
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to delete proposal";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Create checklist for student
  createChecklist: async (studentId, checklistData) => {
    set({ loading: true, error: null });
    try {
      const res = await consultantService.createChecklist(
        studentId,
        checklistData
      );
      set((state) => ({
        checklists: [...state.checklists, res],
        loading: false,
      }));
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to create checklist";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Get student checklists
  fetchStudentChecklists: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const res = await consultantService.getStudentChecklists(studentId);
      set({ checklists: res, loading: false });
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch checklists";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Update checklist
  updateChecklist: async (checklistId, checklistData) => {
    try {
      const res = await consultantService.updateChecklist(
        checklistId,
        checklistData
      );
      // set((state) => ({
      //   checklists: state.checklists.map((checklist) =>
      //     checklist.id === checklistId ? res.data : checklist
      //   ),
      // }));
      return res;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to update checklist";
      set({ error: errorMessage });
      throw error;
    }
  },

  // Delete checklist
  deleteChecklist: async (checklistId) => {
    try {
      await consultantService.deleteChecklist(checklistId);
      set((state) => ({
        checklists: state.checklists.filter(
          (checklist) => checklist.id !== checklistId
        ),
      }));
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to delete checklist";
      set({ error: errorMessage });
      throw error;
    }
  },
}));

export default useConsultantStore;