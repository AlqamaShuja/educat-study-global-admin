// services/officeService.js

import api from "./api";

const officeService = {
  getAllOffices: async () => {
    const res = await api.get("/super-admin/offices");
    console.log(res, "asknacnascjasncasn");
    
    return res;
  },

  createOffice: async (data) => {
    const res = await api.post("/super-admin/offices", data);
    console.log(res, "acascnasjcn:createOffice");
    
    return res;
  },

  updateOffice: async (id, data) => {
    const res = await api.put(`/super-admin/offices/${id}`, data);
    return res;
  },

  toggleStatus: async (id, isActive) => {
    const res = await api.patch(`/super-admin/offices/${id}/status`, {
      isActive,
    });
    return res;
  },

  getPerformance: async (id) => {
    const res = await api.get(`/super-admin/offices/${id}/performance`);
    return res;
  },
};

export default officeService;
