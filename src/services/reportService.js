// services/reportService.js

import api from "./api";

const reportService = {
  getReports: async () => {
    const res = await api.get("/super-admin/reports");
    return res.data;
  },

  createReport: async (data) => {
    const res = await api.post("/super-admin/reports", data);
    return res.data;
  },

  scheduleReport: async (data) => {
    const res = await api.post("/super-admin/reports/schedule", data);
    return res.data;
  },

  exportReport: async (id) => {
    const res = await api.get(`/super-admin/reports/export/${id}`, {
      responseType: "blob",
    });
    return res.data;
  },
};

export default reportService;
