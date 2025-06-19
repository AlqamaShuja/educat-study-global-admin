// stores/leadRuleStore.js

import { create } from "zustand";
import leadRuleService from "../services/leadRuleService";

const useLeadRuleStore = create((set) => ({
  leadRules: [],
  loading: false,
  error: null,

  fetchLeadRules: async () => {
    set({ loading: true, error: null });
    try {
      const data = await leadRuleService.getAllLeadRules();
      set({ leadRules: data });
    } catch (error) {
      set({ error: error.message || "Failed to fetch lead rules" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createLeadRule: async (data) => {
    set({ loading: true, error: null });
    try {
      const newRule = await leadRuleService.createLeadRule(data);
      set((state) => ({
        leadRules: [...state.leadRules, newRule],
      }));
      return newRule;
    } catch (error) {
      set({ error: error.message || "Failed to create lead rule" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateLeadRule: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedRule = await leadRuleService.updateLeadRule(id, data);
      set((state) => ({
        leadRules: state.leadRules.map((rule) =>
          rule.id === id ? updatedRule : rule
        ),
      }));
      return updatedRule;
    } catch (error) {
      set({ error: error.message || "Failed to update lead rule" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteLeadRule: async (id) => {
    set({ loading: true, error: null });
    try {
      await leadRuleService.deleteLeadRule(id);
      set((state) => ({
        leadRules: state.leadRules.filter((rule) => rule.id !== id),
      }));
    } catch (error) {
      set({ error: error.message || "Failed to delete lead rule" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getLeadRuleHistory: async (id) => {
    set({ loading: true, error: null });
    try {
      const history = await leadRuleService.getLeadRuleHistory(id);
      return history;
    } catch (error) {
      set({ error: error.message || "Failed to fetch rule history" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useLeadRuleStore;
