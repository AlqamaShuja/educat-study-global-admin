// services/appointmentService.js

import api from "./api";

const appointmentService = {
  getAppointments: async () => {
    const res = await api.get("/student/appointments");
    return res.data;
  },

  bookAppointment: async (data) => {
    const res = await api.post("/student/appointments", data);
    return res.data;
  },

  joinMeeting: async (appointmentId) => {
    const res = await api.post("/student/meetings/join", { appointmentId });
    return res.data;
  },

  getConsultantAppointments: async () => {
    const res = await api.get("/consultant/appointments");
    return res.data;
  },

  updateAppointmentStatus: async (appointmentId, status) => {
    const res = await api.patch(`/consultant/appointments/${appointmentId}`, {
      status,
    });
    return res.data;
  },
};

export default appointmentService;
