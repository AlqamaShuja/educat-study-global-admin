// stores/messageStore.js

import { create } from "zustand";
import messageService from "../services/messageService";

const useMessageStore = create((set) => ({
  messages: [],
  loading: false,

  fetchMessages: async () => {
    set({ loading: true });
    try {
      const history = await messageService.getCommunicationHistory();
      set({ messages: history });
    } finally {
      set({ loading: false });
    }
  },

  sendMessage: async (message) => {
    const response = await messageService.sendMessage(message);
    set((state) => ({
      messages: [
        ...state.messages,
        {
          content: message,
          type: "message",
          timestamp: new Date().toISOString(),
        },
      ],
    }));
    return response;
  },
}));

export default useMessageStore;
