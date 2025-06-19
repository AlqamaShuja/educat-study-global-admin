// services/messageService.js

import api from "./api";

const messageService = {
  sendMessage: async (message) => {
    const res = await api.post("/student/messages", { message });
    return res.data;
  },

  getCommunicationHistory: async () => {
    const res = await api.get("/student/communication");
    return res.data;
  },
};

export default messageService;
