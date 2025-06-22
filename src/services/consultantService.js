import api from "./api";

const consultantService = {
  async getAssignedLeads() {
    const res = await api.get("/consultant/leads");
    return res;
  },
  async getStudentProfile(id) {
    const res = await api.get(`/consultant/students/${id}/profile`);
    return res;
  },

  async updateLeadStatus(leadId, status) {
    const res = await api.put(`/consultant/leads/${leadId}/status`, { status });
    return res;
  },

  async addConsultationNotes(leadId, note) {
    const res = await api.post(`/consultant/leads/${leadId}/notes`, { note });
    return res;
  },

  async uploadLeadDocument(leadId, files, types, notes) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("types", JSON.stringify(types));
    formData.append("notes", JSON.stringify(notes));
    const res = await api.post(
      `/consultant/leads/${leadId}/documents`,
      formData
    );
    return res;
  },

  async setFollowUpTask(leadId, task) {
    const res = await api.post(`/consultant/leads/${leadId}/tasks`, task);
    return res;
  },

  async getLeadTasks(leadId) {
    const res = await api.get(`/consultant/leads/${leadId}/tasks`);
    return res;
  },

  async getLeadDocuments(leadId) {
    const res = await api.get(`/consultant/leads/${leadId}/documents`);
    return res;
  },

  async getStudentProfile(studentId) {
    const res = await api.get(`/consultant/students/${studentId}/profile`);
    return res;
  },

  async requestProfileInfo(studentId, message) {
    const res = await api.post(`/consultant/students/${studentId}/review`, {
      message,
    });
    return res;
  },

  async sendReviewNotification(studentId, message) {
    const res = await api.post(
      `/consultant/students/${studentId}/notifications`,
      { message }
    );
    return res;
  },

  async sendMessage(studentId, message) {
    const res = await api.post(`/consultant/students/${studentId}/messages`, {
      message,
    });
    return res;
  },

  async scheduleMeeting(studentId, meeting) {
    const res = await api.post(
      `/consultant/students/${studentId}/meetings`,
      meeting
    );
    return res;
  },

  async shareResources(studentId, resources) {
    const res = await api.post(`/consultant/students/${studentId}/resources`, {
      resources,
    });
    return res;
  },

  async getCommunicationHistory(studentId) {
    const res = await api.get(
      `/consultant/students/${studentId}/communication`
    );
    return res;
  },

  async markMessagesAsRead(studentId) {
    const res = await api.patch(
      `/consultant/students/${studentId}/messages/read`
    );
    return res;
  },

  async createApplicationChecklist(studentId, items) {
    const res = await api.post(`/consultant/students/${studentId}/checklist`, {
      items,
    });
    return res;
  },

  async trackDocumentSubmission(studentId, files, types, notes) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("types", JSON.stringify(types));
    formData.append("notes", JSON.stringify(notes));
    const res = await api.put(
      `/consultant/students/${studentId}/documents`,
      formData
    );
    return res;
  },

  async setDeadlineReminder(studentId, reminder) {
    const res = await api.post(
      `/consultant/students/${studentId}/reminders`,
      reminder
    );
    return res;
  },

  async updateApplicationStatus(studentId, status) {
    const res = await api.put(
      `/consultant/students/${studentId}/application-status`,
      { status }
    );
    return res;
  },

  async getApplicationProgress(studentId) {
    const res = await api.get(`/consultant/students/${studentId}/progress`);
    return res;
  },
};

export default consultantService;
