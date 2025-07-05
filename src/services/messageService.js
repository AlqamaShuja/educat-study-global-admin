"use strict";

import apiService from "./api";

const messageService = {
  // Send a message
  async sendMessage(messageData) {
    return apiService.post("/messages", messageData);
  },

  async getConversations() {
    return apiService.get("/messages");
  },

  // Fetch messages (for a specific conversation or all conversations for super_admin)
  async getMessages(recipientId = null, limit = 50, offset = 0) {
    const params = { limit, offset };
    if (recipientId) params.recipientId = recipientId;
    return apiService.get("/messages", { params });
  },

  // Mark a message as read
  async markMessageAsRead(messageId) {
    return apiService.put(`/messages/${messageId}/read`);
  },
  

  // Fetch allowed recipients based on user role
  async getAllowedRecipients() {
    return apiService.get("/messages/users/allowed-recipients");
  },

  async uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    return apiService.post("/file/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default messageService;
