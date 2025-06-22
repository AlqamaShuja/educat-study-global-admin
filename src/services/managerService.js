import { addHours } from "date-fns";
import api from "./api";

const managerService = {
  // Create a new lead
  async createLead(leadData) {
    const res = await api.post("/manager/leads", leadData);
    return res;
  },

  // Get dashboard metrics
  async getDashboard() {
    const res = await api.get("/manager/dashboard");
    return res;
  },

  // Get staff schedules
  async getStaffSchedules() {
    const res = await api.get("/manager/staff/schedules");
    return res;
  },

  // Get consultant interactions
  async getConsultantInteractions(consultantId) {
    const res = await api.get(`/manager/staff/${consultantId}/interactions`);
    return res;
  },

  // Get consultation notes
  async getConsultationNotes(consultantId) {
    const res = await api.get(`/manager/staff/${consultantId}/notes`);
    return res;
  },

  // Reassign a lead to a consultant
  async reassignLead(leadId, consultantId) {
    const res = await api.put(`/manager/leads/${leadId}/reassign`, {
      consultantId,
    });
    return res;
  },

  // Get staff performance reports
  async getStaffReports() {
    const res = await api.get("/manager/staff/reports");
    return res;
  },

  // Create a new staff member (consultant, receptionist, student)
  async createStaffMember(staffData) {
    const res = await api.post("/manager/staff", staffData);
    return res;
  },

  // Update a staff member
  async updateStaffMember(staffId, staffData) {
    const res = await api.put(`/manager/staff/${staffId}`, staffData);
    return res;
  },

  // Disconnect a staff member from office
  async disconnectStaffMember(staffId) {
    const res = await api.delete(`/manager/staff/${staffId}`);
    return res;
  },

  // Get all office leads
  async getOfficeLeads() {
    const res = await api.get("/manager/leads");
    return res;
  },

  // Assign a lead to a consultant
  async assignLead(leadId, consultantId) {
    const res = await api.put(`/manager/leads/${leadId}/assign`, {
      consultantId,
    });
    return res;
  },

  // Set a reminder for a lead
  async setLeadReminder(leadId, reminderData) {
    const res = await api.post(
      `/manager/leads/${leadId}/reminders`,
      reminderData
    );
    return res;
  },

  // Add notes to a lead
  async addLeadNotes(leadId, noteData) {
    const res = await api.put(`/manager/leads/${leadId}/notes`, noteData);
    return res;
  },

  // Get lead progress
  async getLeadProgress(leadId) {
    const res = await api.get(`/manager/leads/${leadId}/progress`);
    return res;
  },

  // Get all consultants in manager's office
  async getOfficeConsultants() {
    const res = await api.get("/manager/consultants");
    return res.data;
  },

  // Get student profile (for StudentProfiles.jsx compatibility)
  async getStudentProfile(studentId) {
    const res = await api.get(`/consultant/students/${studentId}/profile`);
    return res;
  },

  // Get lead tasks (for StudentProfiles.jsx compatibility)
  async getLeadTasks(leadId) {
    const res = await api.get(`/consultant/leads/${leadId}/tasks`);
    return res;
  },

  // Get lead documents (for StudentProfiles.jsx compatibility)
  async getLeadDocuments(leadId) {
    const res = await api.get(`/consultant/leads/${leadId}/documents`);
    return res;
  },

  // Send message to student (for StudentProfiles.jsx compatibility)
  async sendMessage(studentId, message) {
    const res = await api.post(`/consultant/students/${studentId}/messages`, {
      message,
    });
    return res;
  },

  // Create task for a lead (for StudentProfiles.jsx compatibility)
  async createTask(leadId, taskData) {
    const res = await api.post(`/consultant/leads/${leadId}/tasks`, taskData);
    return res;
  },

  // Upload document for a lead (for StudentProfiles.jsx compatibility)
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
  getSchedules: async () => api.get("/manager/staff/schedules"),
  createSchedule: async (data) => {
    const mappedData = {
      ...data,
      type: data.type === "shift" ? "virtual" : "in_person",
      status: data.status === "cancelled" ? "canceled" : data.status,
      endTime:
        data.endTime || addHours(new Date(data.startTime), 1).toISOString(),
    };
    return api.post("/manager/staff/schedules", mappedData);
  },
  updateSchedule: async (id, data) => {
    const mappedData = {
      ...data,
      type: data.type === "shift" ? "virtual" : "in_person",
      status: data.status === "cancelled" ? "canceled" : data.status,
      endTime:
        data.endTime || addHours(new Date(data.startTime), 1).toISOString(),
    };
    return api.put(`/manager/staff/schedules/${id}`, mappedData);
  },
  deleteSchedule: async (id) => api.delete(`/manager/staff/schedules/${id}`),

  getStudents: async () => api.get("/manager/students"),
};

export default managerService;
