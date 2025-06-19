// services/leadRuleService.js

import api from "./api";

const leadRuleService = {
  getAllLeadRules: async () => {
    const res = await api.get("/super-admin/lead-rules");
    return res;
  },

  createLeadRule: async (data) => {
    const res = await api.post("/super-admin/lead-rules", data);
    return res;
  },

  updateLeadRule: async (id, data) => {
    const res = await api.put(`/super-admin/lead-rules/${id}`, data);
    return res;
  },

  deleteLeadRule: async (id) => {
    const res = await api.delete(`/super-admin/lead-rules/${id}`);
    return res;
  },

  getLeadRuleHistory: async (id) => {
    const res = await api.get(`/super-admin/lead-rules/${id}/history`);
    return res;
  },
};

export default leadRuleService;
