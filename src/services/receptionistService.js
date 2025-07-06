import api from "./api";

const BASE_URL = "/receptionist";

export const receptionistService = {
  // Walk-in Registration
  registerWalkIn: async (walkInData) => {
    try {
      const response = await api.post(`${BASE_URL}/leads/register`, walkInData);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Appointment Management
  getAppointmentConfirmation: async (leadId) => {
    try {
      const response = await api.get(
        `${BASE_URL}/leads/${leadId}/confirmation`
      );
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  bookAppointment: async (appointmentData) => {
    try {
      const response = await api.post(
        `${BASE_URL}/appointments`,
        appointmentData
      );
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  rescheduleAppointment: async (appointmentId, rescheduleData) => {
    try {
      const response = await api.put(
        `${BASE_URL}/appointments/${appointmentId}`,
        rescheduleData
      );
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  cancelAppointment: async (appointmentId) => {
    try {
      const response = await api.delete(
        `${BASE_URL}/appointments/${appointmentId}`
      );
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  sendAppointmentReminder: async (appointmentId, reminderData) => {
    try {
      const response = await api.post(
        `${BASE_URL}/appointments/${appointmentId}/reminder`,
        reminderData
      );
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  checkInStudent: async (appointmentId) => {
    try {
      const response = await api.post(
        `${BASE_URL}/appointments/${appointmentId}/check-in`
      );
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Consultant Calendar Management
  getConsultantCalendars: async () => {
    try {
      const response = await api.get(`${BASE_URL}/consultants/calendars`);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Waiting List Management
  getWaitingList: async () => {
    try {
      const response = await api.get(`${BASE_URL}/appointments/waiting-list`);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lead Management
  updateLeadContact: async (leadId, contactData) => {
    try {
      const response = await api.put(
        `${BASE_URL}/leads/${leadId}/contact`,
        contactData
      );
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateLeadStatus: async (leadId, statusData) => {
    try {
      const response = await api.put(
        `${BASE_URL}/leads/${leadId}/status`,
        statusData
      );
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  addLeadNotes: async (leadId, noteData) => {
    try {
      const response = await api.post(
        `${BASE_URL}/leads/${leadId}/notes`,
        noteData
      );
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getLeadHistory: async (leadId) => {
    try {
      const response = await api.get(`${BASE_URL}/leads/${leadId}/history`);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Dashboard Data Aggregation
  getDashboardData: async () => {
    try {
      // Fetch multiple endpoints concurrently for dashboard
      const [waitingList, consultantCalendars] = await Promise.all([
        receptionistService.getWaitingList(),
        receptionistService.getConsultantCalendars(),
      ]);

      // Filter today's appointments
      const today = new Date().toDateString();
      const todayAppointments = consultantCalendars.filter(
        (appointment) => new Date(appointment.dateTime).toDateString() === today
      );

      // Calculate stats
      const stats = {
        todayAppointments: todayAppointments.length,
        waitingList: waitingList.length,
        completedToday: todayAppointments.filter(
          (apt) => apt.status === "completed"
        ).length,
        totalStudents: new Set(todayAppointments.map((apt) => apt.studentId))
          .size,
      };

      return {
        todayAppointments,
        waitingList,
        consultantCalendars,
        stats,
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Utility Functions for Form Data
  validateWalkInData: (walkInData) => {
    const errors = {};

    // Validate student data
    if (!walkInData.studentData) {
      errors.studentData = "Student data is required";
    } else {
      if (!walkInData.studentData.name) {
        errors.name = "Student name is required";
      }
      if (!walkInData.studentData.email) {
        errors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(walkInData.studentData.email)) {
        errors.email = "Email format is invalid";
      }
      if (!walkInData.studentData.phone) {
        errors.phone = "Phone number is required";
      }
    }

    // Validate study preferences
    if (!walkInData.studyPreferences) {
      errors.studyPreferences = "Study preferences are required";
    } else {
      if (!walkInData.studyPreferences.destination) {
        errors.destination = "Study destination is required";
      }
      if (!walkInData.studyPreferences.level) {
        errors.level = "Study level is required";
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  validateAppointmentData: (appointmentData) => {
    const errors = {};

    if (!appointmentData.studentId) {
      errors.studentId = "Student selection is required";
    }
    if (!appointmentData.consultantId) {
      errors.consultantId = "Consultant selection is required";
    }
    if (!appointmentData.dateTime) {
      errors.dateTime = "Date and time are required";
    } else {
      const appointmentDate = new Date(appointmentData.dateTime);
      const now = new Date();
      if (appointmentDate < now) {
        errors.dateTime = "Appointment cannot be scheduled in the past";
      }
    }
    if (!appointmentData.type) {
      errors.type = "Appointment type is required";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  // Format helpers
  formatAppointmentTime: (dateTime) => {
    return new Date(dateTime).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  formatDate: (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  formatTime: (dateTime) => {
    return new Date(dateTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  // Status helpers
  getStatusColor: (status) => {
    const statusColors = {
      scheduled: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      canceled: "bg-red-100 text-red-800",
      no_show: "bg-gray-100 text-gray-800",
      in_progress: "bg-yellow-100 text-yellow-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  },

  getStatusText: (status) => {
    const statusText = {
      scheduled: "Scheduled",
      completed: "Completed",
      canceled: "Canceled",
      no_show: "No Show",
      in_progress: "In Progress",
    };
    return statusText[status] || status;
  },

  // Search and filter helpers
  searchAppointments: (appointments, searchTerm) => {
    if (!searchTerm) return appointments;

    const term = searchTerm.toLowerCase();
    return appointments.filter(
      (appointment) =>
        appointment.student?.name?.toLowerCase().includes(term) ||
        appointment.consultant?.name?.toLowerCase().includes(term) ||
        appointment.notes?.toLowerCase().includes(term)
    );
  },

  filterAppointmentsByDate: (appointments, date) => {
    if (!date) return appointments;

    const filterDate = new Date(date).toDateString();
    return appointments.filter(
      (appointment) =>
        new Date(appointment.dateTime).toDateString() === filterDate
    );
  },

  filterAppointmentsByStatus: (appointments, status) => {
    if (!status || status === "all") return appointments;

    return appointments.filter((appointment) => appointment.status === status);
  },

  // Error handling
  handleApiError: (error) => {
    if (error.response) {
      // Server responded with error status
      return {
        message:
          error.response.data?.error ||
          error.response.data?.message ||
          "Server error occurred",
        status: error.response.status,
      };
    } else if (error.request) {
      // Network error
      return {
        message: "Network error. Please check your connection.",
        status: 0,
      };
    } else {
      // Other error
      return {
        message: error.message || "An unexpected error occurred",
        status: -1,
      };
    }
  },
};

export default receptionistService;
