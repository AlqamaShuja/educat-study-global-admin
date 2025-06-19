// services/notificationService.js

import api from "./api";

const notificationService = {
  getNotifications: async () => {
    const res = await api.get("/notifications");
    return res.data;
  },

  markAsRead: async (notificationId) => {
    const res = await api.patch(`/notifications/${notificationId}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.patch(`/notifications/read-all`);
    return res.data;
  },
};

export default notificationService;
