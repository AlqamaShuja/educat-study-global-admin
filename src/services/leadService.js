// services/leadService.js

import api from "./api";

const leadService = {
  getAllLeads: async () => {
    const res = await api.get("/super-admin/leads");
    return res;
  },

  getLeadById: async (id) => {
    const res = await api.get(`/super-admin/leads/${id}`);
    return res;
  },

  reassignLead: async (id, consultantId) => {
    const res = await api.put(`/super-admin/leads/${id}/reassign`, {
      consultantId,
    });
    return res;
  },

  assignLeadToConsultant: async (payload) => {
    const res = await api.post("/super-admin/leads/assign", payload);
    return res;
  },

  getLeadHistory: async (id) => {
    const res = await api.get(`/super-admin/leads/${id}/history`);
    return res;
  },

  exportLeads: async () => {
    const res = await api.get("/super-admin/leads/export", {
      responseType: "blob",
    });
    return res;
  },
};

export default leadService;
