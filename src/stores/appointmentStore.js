// stores/appointmentStore.js

import { create } from "zustand";
import appointmentService from "../services/appointmentService";

const useAppointmentStore = create((set) => ({
  appointments: [],
  loading: false,

  fetchAppointments: async () => {
    set({ loading: true });
    try {
      const data = await appointmentService.getAppointments();
      set({ appointments: data });
    } finally {
      set({ loading: false });
    }
  },

  bookAppointment: async (payload) => {
    const newAppointment = await appointmentService.bookAppointment(payload);
    set((state) => ({
      appointments: [...state.appointments, newAppointment],
    }));
    return newAppointment;
  },
}));

export default useAppointmentStore;
