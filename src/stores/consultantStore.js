// stores/consultantStore.js
import { create } from "zustand";
import consultantService from "../services/consultantService";

const useConsultantStore = create((set, get) => ({
  // State
  leads: [],
  selectedLead: null,
  tasks: [],
  documents: [],
  loading: false,
  error: null,
  studentProfile: null,

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
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to upload document";
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
    }),
}));

export default useConsultantStore;

// import { create } from "zustand";
// import consultantService from "../services/consultantService";

// const useConsultantStore = create((set) => ({
//   leads: [],
//   selectedLead: null,
//   tasks: [],
//   documents: [],
//   loading: false,
//   error: null,
//   studentProfile: {},

//   fetchLeads: async () => {
//     set({ loading: true, error: null });
//     try {
//       const res = await consultantService.getAssignedLeads();
//       set({ leads: res, loading: false });
//     } catch (error) {
//       set({ error: error.message, loading: false });
//     }
//   },

//   fetchStudentProfile: async (id) => {
//     set({ loading: true, error: null, studentProfile: {}, });
//     try {
//       const res = await consultantService.getStudentProfile(id);
//       set({ leads: res, loading: false, studentProfile: res, });
//       return res;
//     } catch (error) {
//       set({ error: error.message, loading: false });
//     }
//   },

//   updateTaskStatus: async (taskId, status) => {
//     set({ loading: true });
//     try {
//       await api.put(`/consultant/tasks/${taskId}/status`, { status });
//       set((state) => ({
//         tasks: state.tasks.map((task) =>
//           task.id === taskId ? { ...task, status } : task
//         ),
//         loading: false,
//       }));
//     } catch (error) {
//       set({ error: error.message, loading: false });
//       throw error;
//     }
//   },

//   selectLead: (lead) => set({ selectedLead: lead }),

//   clearSelectedLead: () => set({ selectedLead: null }),

//   updateLeadStatus: async (leadId, status) => {
//     try {
//       const res = await consultantService.updateLeadStatus(leadId, status);
//       set((state) => ({
//         leads: state.leads.map((lead) =>
//           lead.id === leadId ? { ...lead, status } : lead
//         ),
//         selectedLead:
//           state.selectedLead?.id === leadId
//             ? { ...state.selectedLead, status }
//             : state.selectedLead,
//       }));
//       return res;
//     } catch (error) {
//       throw error;
//     }
//   },

//   addConsultationNote: async (leadId, note) => {
//     try {
//       const res = await consultantService.addConsultationNotes(leadId, note);
//       set((state) => ({
//         leads: state.leads.map((lead) =>
//           lead.id === leadId
//             ? {
//                 ...lead,
//                 history: [
//                   ...(lead.history || []),
//                   { note, timestamp: new Date().toISOString() },
//                 ],
//               }
//             : lead
//         ),
//         selectedLead:
//           state.selectedLead?.id === leadId
//             ? {
//                 ...state.selectedLead,
//                 history: [
//                   ...(state.selectedLead.history || []),
//                   { note, timestamp: new Date().toISOString() },
//                 ],
//               }
//             : state.selectedLead,
//       }));
//       return res;
//     } catch (error) {
//       throw error;
//     }
//   },

//   uploadLeadDocument: async (leadId, files, types, notes) => {
//     try {
//       const res = await consultantService.uploadLeadDocument(
//         leadId,
//         files,
//         types,
//         notes
//       );
//       set((state) => ({
//         documents: [...state.documents, ...res],
//       }));
//       return res;
//     } catch (error) {
//       throw error;
//     }
//   },

//   fetchLeadTasks: async (leadId) => {
//     set({ loading: true, error: null });
//     try {
//       const res = await consultantService.getLeadTasks(leadId);
//       set({ tasks: res, loading: false });
//     } catch (error) {
//       set({ error: error.message, loading: false });
//     }
//   },

//   fetchLeadDocuments: async (leadId) => {
//     set({ loading: true, error: null });
//     try {
//       const res = await consultantService.getLeadDocuments(leadId);
//       set({ documents: res, loading: false });
//     } catch (error) {
//       set({ error: error.message, loading: false });
//     }
//   },

//   setFollowUpTask: async (leadId, task) => {
//     try {
//       const res = await consultantService.setFollowUpTask(leadId, task);
//       set((state) => ({
//         tasks: [...state.tasks, res.task],
//       }));
//       return res;
//     } catch (error) {
//       throw error;
//     }
//   },

//   getStudentProfile: async (studentId) => {
//     try {
//       const res = await consultantService.getStudentProfile(studentId);
//       return res;
//     } catch (error) {
//       throw error;
//     }
//   },

//   requestProfileInfo: async (studentId, message) => {
//     try {
//       const res = await consultantService.requestProfileInfo(
//         studentId,
//         message
//       );
//       return res;
//     } catch (error) {
//       throw error;
//     }
//   },

//   sendReviewNotification: async (studentId, message) => {
//     try {
//       const res = await consultantService.sendReviewNotification(
//         studentId,
//         message
//       );
//       return res;
//     } catch (error) {
//       throw error;
//     }
//   },

//   sendMessage: async (studentId, message) => {
//     try {
//       const res = await consultantService.sendMessage(studentId, message);
//       return res;
//     } catch (error) {
//       throw error;
//     }
//   },

//   scheduleMeeting: async (studentId, meeting) => {
//     try {
//       const res = await consultantService.scheduleMeeting(studentId, meeting);
//       return res;
//     } catch (error) {
//       throw error;
//     }
//   },

//   shareResources: async (studentId, resources) => {
//     try {
//       const res = await consultantService.shareResources(studentId, resources);
//       return res;
//     } catch (error) {
//       throw error;
//     }
//   },

//   getCommunicationHistory: async (studentId) => {
//     try {
//       const res = await consultantService.getCommunicationHistory(studentId);
//       return res;
//     } catch (error) {
//       throw error;
//     }
//   },

//   markMessagesAsRead: async (studentId) => {
//     try {
//       const res = await consultantService.markMessagesAsRead(studentId);
//       return res;
//     } catch (error) {
//       throw error;
//     }
//   },

//   createApplicationChecklist: async (studentId, items) => {
//     try {
//       const res = await consultantService.createApplicationChecklist(
//         studentId,
//         items
//       );
//       return res;
//     } catch (error) {
//       throw error;
//     }
//   },

//   trackDocumentSubmission: async (studentId, files, types, notes) => {
//     try {
//       const res = await consultantService.trackDocumentSubmission(
//         studentId,
//         files,
//         types,
//         notes
//       );
//       return res;
//     } catch (error) {
//       throw error;
//     }
//   },

//   setDeadlineReminder: async (studentId, reminder) => {
//     try {
//       const res = await consultantService.setDeadlineReminder(
//         studentId,
//         reminder
//       );
//       return res;
//     } catch (error) {
//       throw error;
//     }
//   },

//   updateApplicationStatus: async (studentId, status) => {
//     try {
//       const res = await consultantService.updateApplicationStatus(
//         studentId,
//         status
//       );
//       return res;
//     } catch (error) {
//       throw error;
//     }
//   },

//   getApplicationProgress: async (studentId) => {
//     try {
//       const res = await consultantService.getApplicationProgress(studentId);
//       return res;
//     } catch (error) {
//       throw error;
//     }
//   },
// }));

// export default useConsultantStore;
