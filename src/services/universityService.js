// services/universityService.js

import api from "./api";

const universityService = {
  getAllUniversities: async () => {
    const res = await api.get("/universities");
    return res;
  },

  createUniversity: async (data) => {
    const res = await api.post("/universities", data);
    return res;
  },

  updateUniversity: async (id, data) => {
    const res = await api.put(`/universities/${id}`, data);
    return res;
  },

  deleteUniversity: async (id) => {
    const res = await api.delete(`/universities/${id}`);
    return res;
  },

  getUniversityCourses: async (id) => {
    const res = await api.get(`/universities/${id}/courses`);
    return res;
  },

  getUnassignedCourses: async () => {
    const res = await api.get("/universities/unassigned");
    return res;
  },
};

export default universityService;
