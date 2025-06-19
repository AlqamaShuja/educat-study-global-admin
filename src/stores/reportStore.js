// stores/reportStore.js

import { create } from 'zustand';
import reportService from '../services/reportService';

const useReportStore = create((set) => ({
  reports: [],
  loading: false,

  fetchReports: async () => {
    set({ loading: true });
    try {
      const data = await reportService.getReports();
      set({ reports: data });
    } finally {
      set({ loading: false });
    }
  },

  createReport: async (params) => {
    const newReport = await reportService.createReport(params);
    set((state) => ({
      reports: [...state.reports, newReport],
    }));
    return newReport;
  },
}));

export default useReportStore;
