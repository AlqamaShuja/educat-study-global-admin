// stores/taskStore.js

import { create } from "zustand";
import taskService from "../services/taskService";

const useTaskStore = create((set) => ({
  tasks: [],
  checklist: [],
  calendar: [],
  loading: false,

  fetchTasks: async () => {
    const data = await taskService.getPendingTasks();
    set({ tasks: data });
  },

  fetchChecklist: async () => {
    const data = await taskService.getApplicationChecklist();
    set({ checklist: data });
  },

  fetchCalendar: async () => {
    const data = await taskService.getDeadlineCalendar();
    set({ calendar: data });
  },
}));

export default useTaskStore;
