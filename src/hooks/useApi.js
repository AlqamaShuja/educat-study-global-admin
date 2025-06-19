import { useState } from "react";
import * as authService from "../services/authService";
import * as userService from "../services/userService";
import * as leadService from "../services/leadService";
import * as officeService from "../services/officeService";
import * as appointmentService from "../services/appointmentService";
import * as documentService from "../services/documentService";
import * as notificationService from "../services/notificationService";
import * as universityService from "../services/universityService";
import * as courseService from "../services/courseService";
import * as messageService from "../services/messageService";
import * as reportService from "../services/reportService";
import * as taskService from "../services/taskService";

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = async (service, method, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await service[method](...args);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || `API call failed: ${method}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    auth: {
      login: (credentials) => apiCall(authService, "login", credentials),
      signup: (data) => apiCall(authService, "signup", data),
      logout: () => apiCall(authService, "logout"),
      requestPasswordReset: (email) =>
        apiCall(authService, "requestPasswordReset", email),
      confirmPasswordReset: (token, newPassword) =>
        apiCall(authService, "confirmPasswordReset", token, newPassword),
    },
    user: {
      getProfile: () => apiCall(userService, "getProfile"),
      updateProfile: (data) => apiCall(userService, "updateProfile", data),
      changePassword: (data) => apiCall(userService, "changePassword", data),
    },
    lead: {
      getLeads: () => apiCall(leadService, "getLeads"),
      createLead: (data) => apiCall(leadService, "createLead", data),
      updateLeadStatus: (leadId, status) =>
        apiCall(leadService, "updateLeadStatus", leadId, status),
      addLeadNotes: (leadId, note) =>
        apiCall(leadService, "addLeadNotes", leadId, note),
      reassignLead: (leadId, consultantId) =>
        apiCall(leadService, "reassignLead", leadId, consultantId),
    },
    office: {
      getOffices: () => apiCall(officeService, "getOffices"),
      createOffice: (data) => apiCall(officeService, "createOffice", data),
      updateOffice: (officeId, data) =>
        apiCall(officeService, "updateOffice", officeId, data),
    },
    appointment: {
      getAppointments: () => apiCall(appointmentService, "getAppointments"),
      createAppointment: (data) =>
        apiCall(appointmentService, "createAppointment", data),
      updateAppointment: (appointmentId, data) =>
        apiCall(appointmentService, "updateAppointment", appointmentId, data),
    },
    document: {
      uploadDocument: (formData) =>
        apiCall(documentService, "uploadDocument", formData),
      getDocuments: () => apiCall(documentService, "getDocuments"),
    },
    notification: {
      getNotifications: () => apiCall(notificationService, "getNotifications"),
      markAsRead: (notificationId) =>
        apiCall(notificationService, "markAsRead", notificationId),
      markAllAsRead: () => apiCall(notificationService, "markAllAsRead"),
    },
    university: {
      getUniversities: () => apiCall(universityService, "getUniversities"),
      createUniversity: (data) =>
        apiCall(universityService, "createUniversity", data),
    },
    course: {
      getCourses: () => apiCall(courseService, "getCourses"),
      createCourse: (data) => apiCall(courseService, "createCourse", data),
    },
    message: {
      sendMessage: (data) => apiCall(messageService, "sendMessage", data),
      getMessages: () => apiCall(messageService, "getMessages"),
    },
    report: {
      getReports: () => apiCall(reportService, "getReports"),
      generateReport: (data) => apiCall(reportService, "generateReport", data),
    },
    task: {
      getTasks: () => apiCall(taskService, "getTasks"),
      createTask: (data) => apiCall(taskService, "createTask", data),
      updateTaskStatus: (taskId, status) =>
        apiCall(taskService, "updateTaskStatus", taskId, status),
    },
  };
};

export default useApi;
