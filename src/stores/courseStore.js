// stores/courseStore.js

import { create } from "zustand";
import courseService from "../services/courseService";

const useCourseStore = create((set) => ({
  courses: [],
  loading: false,

  fetchCourses: async () => {
    set({ loading: true });
    try {
      const data = await courseService.getAllCourses();
      set({ courses: data });
    } finally {
      set({ loading: false });
    }
  },

  createCourse: async (data) => {
    const newCourse = await courseService.createCourse(data);
    set((state) => ({
      courses: [...state.courses, newCourse],
    }));
    return newCourse;
  },

  updateCourse: async (id, data) => {
    const updatedCourse = await courseService.updateCourse(id, data);
    set((state) => ({
      courses: state.courses.map((c) => (c.id === id ? updatedCourse : c)),
    }));
    return updatedCourse;
  },

  deleteCourse: async (id) => {
    await courseService.deleteCourse(id);
    set((state) => ({
      courses: state.courses.filter((c) => c.id !== id),
    }));
  },
}));

export default useCourseStore;
