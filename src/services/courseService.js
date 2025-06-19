// services/courseService.js

import api from "./api";

const courseService = {
  getAllCourses: async () => {
    const res = await api.get("/courses");
    return res;
  },

  createCourse: async (data) => {
    const res = await api.post("/courses", data);
    return res;
  },

  updateCourse: async (courseIds, data) => {
    const res = await api.put(`/courses/${courseIds}`, data);
    return res;
  },

  deleteCourse: async (id) => {
    const res = await api.delete(`/courses/${id}`);
    return res;
  },
};

export default courseService;
