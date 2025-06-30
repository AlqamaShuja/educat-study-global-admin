// src/services/messageApi.js

class MessageApiService {
  constructor() {
    this.baseURL =
      process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem("authToken");
  }

  // Create request headers
  getHeaders(includeAuth = true) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Handle API response
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return response;
  }

  // Get messages for a conversation
  async getConversationMessages(conversationId, page = 1, limit = 50) {
    try {
      const response = await fetch(
        `${this.baseURL}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to fetch conversation messages:", error);
      throw error;
    }
  }

  // Send a message
  async sendMessage(conversationId, messageData) {
    try {
      const response = await fetch(
        `${this.baseURL}/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(messageData),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  }

  // Edit a message
  async editMessage(messageId, content) {
    try {
      const response = await fetch(`${this.baseURL}/messages/${messageId}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify({ content }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to edit message:", error);
      throw error;
    }
  }

  // Delete a message
  async deleteMessage(messageId) {
    try {
      const response = await fetch(`${this.baseURL}/messages/${messageId}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to delete message:", error);
      throw error;
    }
  }

  // Mark message as read
  async markMessageAsRead(messageId) {
    try {
      const response = await fetch(
        `${this.baseURL}/messages/${messageId}/read`,
        {
          method: "POST",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to mark message as read:", error);
      throw error;
    }
  }

  // Upload file for message
  async uploadFile(conversationId, file, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Create XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Set up progress tracking
        if (onProgress) {
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              onProgress(percentComplete);
            }
          });
        }

        // Set up completion handlers
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              reject(new Error("Invalid JSON response"));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(
                new Error(
                  errorData.message || `Upload failed with status ${xhr.status}`
                )
              );
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.addEventListener("timeout", () => {
          reject(new Error("Upload timeout"));
        });

        // Set up request
        xhr.open(
          "POST",
          `${this.baseURL}/conversations/${conversationId}/upload`
        );
        xhr.setRequestHeader("Authorization", `Bearer ${this.getAuthToken()}`);
        xhr.timeout = 30000; // 30 second timeout

        // Send request
        xhr.send(formData);
      });
    } catch (error) {
      console.error("Failed to upload file:", error);
      throw error;
    }
  }

  // Search messages
  async searchMessages(query, filters = {}) {
    try {
      const searchParams = new URLSearchParams({
        q: query,
        ...filters,
      });

      const response = await fetch(
        `${this.baseURL}/monitoring/messages/search?${searchParams}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to search messages:", error);
      throw error;
    }
  }

  // Get message reactions
  async getMessageReactions(messageId) {
    try {
      const response = await fetch(
        `${this.baseURL}/messages/${messageId}/reactions`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to get message reactions:", error);
      throw error;
    }
  }

  // Add reaction to message
  async addReaction(messageId, emoji) {
    try {
      const response = await fetch(
        `${this.baseURL}/messages/${messageId}/reactions`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({ emoji }),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to add reaction:", error);
      throw error;
    }
  }

  // Remove reaction from message
  async removeReaction(messageId, emoji) {
    try {
      const response = await fetch(
        `${this.baseURL}/messages/${messageId}/reactions`,
        {
          method: "DELETE",
          headers: this.getHeaders(),
          body: JSON.stringify({ emoji }),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to remove reaction:", error);
      throw error;
    }
  }

  // Forward message
  async forwardMessage(messageId, conversationIds) {
    try {
      const response = await fetch(
        `${this.baseURL}/messages/${messageId}/forward`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({ conversationIds }),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to forward message:", error);
      throw error;
    }
  }

  // Get message thread (replies)
  async getMessageThread(messageId) {
    try {
      const response = await fetch(
        `${this.baseURL}/messages/${messageId}/thread`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to get message thread:", error);
      throw error;
    }
  }

  // Pin/unpin message
  async toggleMessagePin(messageId, pinned) {
    try {
      const response = await fetch(
        `${this.baseURL}/messages/${messageId}/pin`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({ pinned }),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to toggle message pin:", error);
      throw error;
    }
  }

  // Get pinned messages for conversation
  async getPinnedMessages(conversationId) {
    try {
      const response = await fetch(
        `${this.baseURL}/conversations/${conversationId}/pinned-messages`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to get pinned messages:", error);
      throw error;
    }
  }

  // Report message
  async reportMessage(messageId, reason, description = "") {
    try {
      const response = await fetch(
        `${this.baseURL}/messages/${messageId}/report`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({ reason, description }),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to report message:", error);
      throw error;
    }
  }

  // Get message delivery status
  async getMessageStatus(messageId) {
    try {
      const response = await fetch(
        `${this.baseURL}/messages/${messageId}/status`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to get message status:", error);
      throw error;
    }
  }

  // Bulk operations
  async bulkDeleteMessages(messageIds) {
    try {
      const response = await fetch(`${this.baseURL}/messages/bulk-delete`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ messageIds }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to bulk delete messages:", error);
      throw error;
    }
  }

  // Export conversation messages
  async exportMessages(
    conversationId,
    format = "json",
    dateFrom = null,
    dateTo = null
  ) {
    try {
      const params = new URLSearchParams({
        format,
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });

      const response = await fetch(
        `${this.baseURL}/conversations/${conversationId}/export?${params}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`);
      }

      // Return blob for file download
      return await response.blob();
    } catch (error) {
      console.error("Failed to export messages:", error);
      throw error;
    }
  }
}

// Create singleton instance
const messageApi = new MessageApiService();

export default messageApi;
