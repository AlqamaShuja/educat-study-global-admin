// services/consultantService.js
import api from "./api";

const consultantService = {
  // Get assigned leads
  async getAssignedLeads() {
    const res = await api.get("/consultant/leads");
    return res;
  },

  // Get student profile
  async getStudentProfile(studentId) {
    const res = await api.get(`/consultant/students/${studentId}/profile`);
    return res;
  },

  // Update lead status
  async updateLeadStatus(leadId, status) {
    const res = await api.put(`/consultant/leads/${leadId}/status`, { status });
    return res;
  },

  // Add consultation notes
  async addConsultationNotes(leadId, note) {
    const res = await api.post(`/consultant/leads/${leadId}/notes`, { note });
    return res;
  },

  // Get lead tasks
  async getLeadTasks(leadId) {
    const res = await api.get(`/consultant/leads/${leadId}/tasks`);
    return res;
  },

  // get all lead task
  async getAllLeadTasks() {
    const res = await api.get(`/consultant/tasks`);
    return res;
  },

  async deleteLeadTaskById(id) {
    const res = await api.delete(`/consultant/tasks/${id}`);
    return res;
  },

  async editLeadTask(taskId, taskData) {
    const res = await api.put(`/consultant/tasks/${taskId}`, taskData);
    return res;
  },

  // Get lead documents
  async getLeadDocuments(leadId) {
    const res = await api.get(`/consultant/leads/${leadId}/documents`);
    return res;
  },

  // Create follow-up task
  async setFollowUpTask(leadId, taskData) {
    const res = await api.post(`/consultant/leads/${leadId}/tasks`, taskData);
    return res;
  },

  // Upload documents for lead (accepts FormData)
  async uploadLeadDocument(leadId, formData) {
    try {
      const res = await api.post(
        `/consultant/leads/${leadId}/documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res;
    } catch (error) {
      return error;
    }
  },

  // Request profile info
  async requestProfileInfo(studentId, message) {
    const res = await api.post(`/consultant/students/${studentId}/review`, {
      message,
    });
    return res;
  },

  // Send review notification
  async sendReviewNotification(studentId, message) {
    const res = await api.post(
      `/consultant/students/${studentId}/notifications`,
      { message }
    );
    return res;
  },

  // Send message to student
  async sendMessage(studentId, message) {
    const res = await api.post(`/consultant/students/${studentId}/messages`, {
      message,
    });
    return res;
  },

  // Schedule meeting
  async scheduleMeeting(studentId, meetingData) {
    const res = await api.post(
      `/consultant/students/${studentId}/meetings`,
      meetingData
    );
    return res;
  },

  // Share resources
  async shareResources(studentId, resources) {
    const res = await api.post(`/consultant/students/${studentId}/resources`, {
      resources,
    });
    return res;
  },

  // Get communication history
  async getCommunicationHistory(studentId) {
    const res = await api.get(
      `/consultant/students/${studentId}/communication`
    );
    return res;
  },

  // Mark messages as read
  async markMessagesAsRead(studentId) {
    const res = await api.patch(
      `/consultant/students/${studentId}/messages/read`
    );
    return res;
  },

  // Create application checklist
  async createApplicationChecklist(studentId, items) {
    const res = await api.post(`/consultant/students/${studentId}/checklist`, {
      items,
    });
    return res;
  },

  // Track document submission (accepts FormData)
  async trackDocumentSubmission(studentId, formData) {
    const res = await api.put(
      `/consultant/students/${studentId}/documents`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res;
  },

  // Set deadline reminder
  async setDeadlineReminder(studentId, reminderData) {
    const res = await api.post(
      `/consultant/students/${studentId}/reminders`,
      reminderData
    );
    return res;
  },

  // Update application status
  async updateApplicationStatus(studentId, status) {
    const res = await api.put(
      `/consultant/students/${studentId}/application-status`,
      { status }
    );
    return res;
  },

  // Get application progress
  async getApplicationProgress(studentId) {
    const res = await api.get(`/consultant/students/${studentId}/progress`);
    return res;
  },

  // Get appointments
  async getAppointments() {
    const res = await api.get("/consultant/appointments");
    return res;
  },

  // Update appointment
  async updateAppointment(appointmentId, appointmentData) {
    const res = await api.put(
      `/consultant/appointments/${appointmentId}`,
      appointmentData
    );
    return res;
  },

  // Delete appointment
  async deleteAppointment(appointmentId) {
    const res = await api.delete(`/consultant/appointments/${appointmentId}`);
    return res;
  },

  async updateDocumentStatus(documentId, status, notes) {
    const res = await api.put(`/consultant/documents/${documentId}/status`, {
      status,
      notes,
    });
    return res;
  },

  // Update lead parked status - NEW FUNCTION
  async updateLeadParkedStatus(leadId, parked) {
    const res = await api.put(`/consultant/leads/${leadId}/parked`, { parked });
    return res;
  },

  // Proposal-related functions - NEW FUNCTIONS

  // Create proposal for a lead
  async createProposal(leadId, proposalData) {
    const res = await api.post(
      `/consultant/leads/${leadId}/proposals`,
      proposalData
    );
    return res;
  },

  // Get all proposals created by consultant
  async getProposals(status = "") {
    const params = status ? { status } : {};
    const res = await api.get("/consultant/proposals", { params });
    return res;
  },

  // Get proposals for a specific lead
  async getProposalsByLead(leadId) {
    const res = await api.get(`/consultant/leads/${leadId}/proposals`);
    return res;
  },

  // Get proposal by ID
  async getProposalById(proposalId) {
    const res = await api.get(`/consultant/proposals/${proposalId}`);
    return res;
  },

  // Update proposal
  async updateProposal(proposalId, proposalData) {
    const res = await api.put(
      `/consultant/proposals/${proposalId}`,
      proposalData
    );
    return res;
  },

  // Delete proposal
  async deleteProposal(proposalId) {
    const res = await api.delete(`/consultant/proposals/${proposalId}`);
    return res;
  },

  // Get proposal statistics
  async getProposalStats() {
    const res = await api.get("/consultant/proposals/stats");
    return res;
  },

  // Create checklist for student
  async createChecklist(studentId, checklistData) {
    const res = await api.post(
      `/checklists/student/${studentId}`,
      checklistData
    );
    return res;
  },

  // Get student checklists
  async getStudentChecklists(studentId) {
    const res = await api.get(`/checklists/student/${studentId}`);
    return res;
  },

  // Update checklist
  async updateChecklist(checklistId, checklistData) {
    const res = await api.patch(`/checklists/${checklistId}`, checklistData);
    return res;
  },

  // Delete checklist
  async deleteChecklist(checklistId) {
    const res = await api.delete(`/checklists/${checklistId}`);
    return res;
  },
};

export default consultantService;
