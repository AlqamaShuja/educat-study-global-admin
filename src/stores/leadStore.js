// stores/leadStore.js

import { create } from "zustand";
import leadService from "../services/leadService";

const useLeadStore = create((set) => ({
  leads: [],
  loading: false,

  fetchLeads: async () => {
    set({ loading: true });
    try {
      const data = await leadService.getAllLeads();
      set({ leads: data });
    } finally {
      set({ loading: false });
    }
  },

  reassignLead: async (leadId, consultantId) => {
    const updatedLead = await leadService.reassignLead(leadId, consultantId);
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === leadId ? updatedLead : lead
      ),
    }));
    return updatedLead;
  },
}));

export default useLeadStore;
