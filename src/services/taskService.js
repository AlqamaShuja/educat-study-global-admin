// services/taskService.js

import api from "./api";

const taskService = {
  getPendingTasks: async () => {
    const res = await api.get("/student/tasks");
    return res.data;
  },

  getApplicationChecklist: async () => {
    const res = await api.get("/student/checklist");
    return res.data;
  },

  getDeadlineCalendar: async () => {
    const res = await api.get("/student/calendar");
    return res.data;
  },
};

export default taskService;
