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
};

export default consultantService;
