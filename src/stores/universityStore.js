// stores/universityStore.js

import { create } from "zustand";
import universityService from "../services/universityService";

const useUniversityStore = create((set) => ({
  universities: [],
  loading: false,

  fetchUniversities: async () => {
    set({ loading: true });
    try {
      const data = await universityService.getAllUniversities();
      set({ universities: data });
    } finally {
      set({ loading: false });
    }
  },

  createUniversity: async (payload) => {
    const newUniversity = await universityService.createUniversity(payload);
    set((state) => ({
      universities: [...state.universities, newUniversity],
    }));
    return newUniversity;
  },

  updateUniversity: async (id, payload) => {
    const updated = await universityService.updateUniversity(id, payload);
    set((state) => ({
      universities: state.universities.map((u) => (u.id === id ? updated : u)),
    }));
    return updated;
  },

  deleteUniversity: async (id) => {
    await universityService.deleteUniversity(id);
    set((state) => ({
      universities: state.universities.filter((u) => u.id !== id),
    }));
  },
}));

export default useUniversityStore;
