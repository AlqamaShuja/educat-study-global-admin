// src/services/conversationApi.js

class ConversationApiService {
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

  // Get all conversations for current user
  async getConversations(page = 1, limit = 20, sort = "lastMessage") {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
      });

      const response = await fetch(`${this.baseURL}/conversations?${params}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      throw error;
    }
  }

  // Create a new conversation
  async createConversation(participantIds, conversationData = {}) {
    try {
      const response = await fetch(`${this.baseURL}/conversations`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          participantIds,
          ...conversationData,
        }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      throw error;
    }
  }

  // Get conversation by ID
  async getConversation(conversationId) {
    try {
      const response = await fetch(
        `${this.baseURL}/conversations/${conversationId}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
      throw error;
    }
  }

  // Update conversation
  async updateConversation(conversationId, updates) {
    try {
      const response = await fetch(
        `${this.baseURL}/conversations/${conversationId}`,
        {
          method: "PATCH",
          headers: this.getHeaders(),
          body: JSON.stringify(updates),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to update conversation:", error);
      throw error;
    }
  }

  // Archive/unarchive conversation
  async archiveConversation(conversationId, archived = true) {
    try {
      return await this.updateConversation(conversationId, {
        isArchived: archived,
      });
    } catch (error) {
      console.error("Failed to archive conversation:", error);
      throw error;
    }
  }

  // Delete conversation
  async deleteConversation(conversationId) {
    try {
      const response = await fetch(
        `${this.baseURL}/conversations/${conversationId}`,
        {
          method: "DELETE",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      throw error;
    }
  }

  // Add participants to conversation
  async addParticipants(conversationId, participantIds) {
    try {
      const response = await fetch(
        `${this.baseURL}/conversations/${conversationId}/participants`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({ participantIds }),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to add participants:", error);
      throw error;
    }
  }

  // Remove participant from conversation
  async removeParticipant(conversationId, participantId) {
    try {
      const response = await fetch(
        `${this.baseURL}/conversations/${conversationId}/participants/${participantId}`,
        {
          method: "DELETE",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to remove participant:", error);
      throw error;
    }
  }

  // Update participant role
  async updateParticipantRole(conversationId, participantId, role) {
    try {
      const response = await fetch(
        `${this.baseURL}/conversations/${conversationId}/participants/${participantId}`,
        {
          method: "PATCH",
          headers: this.getHeaders(),
          body: JSON.stringify({ role }),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to update participant role:", error);
      throw error;
    }
  }

  // Leave conversation
  async leaveConversation(conversationId) {
    try {
      const response = await fetch(
        `${this.baseURL}/conversations/${conversationId}/leave`,
        {
          method: "POST",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to leave conversation:", error);
      throw error;
    }
  }

  // Mute/unmute conversation
  async muteConversation(conversationId, muted = true, muteUntil = null) {
    try {
      const response = await fetch(
        `${this.baseURL}/conversations/${conversationId}/mute`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({ muted, muteUntil }),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to mute conversation:", error);
      throw error;
    }
  }

  // Pin/unpin conversation
  async pinConversation(conversationId, pinned = true) {
    try {
      const response = await fetch(
        `${this.baseURL}/conversations/${conversationId}/pin`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({ pinned }),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to pin conversation:", error);
      throw error;
    }
  }

  // Search conversations
  async searchConversations(query, filters = {}) {
    try {
      const searchParams = new URLSearchParams({
        q: query,
        ...filters,
      });

      const response = await fetch(
        `${this.baseURL}/conversations/search?${searchParams}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to search conversations:", error);
      throw error;
    }
  }

  // Get conversation participants
  async getConversationParticipants(conversationId) {
    try {
      const response = await fetch(
        `${this.baseURL}/conversations/${conversationId}/participants`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to get conversation participants:", error);
      throw error;
    }
  }

  // Get conversation settings
  async getConversationSettings(conversationId) {
    try {
      const response = await fetch(
        `${this.baseURL}/conversations/${conversationId}/settings`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to get conversation settings:", error);
      throw error;
    }
  }

  // Update conversation settings
  async updateConversationSettings(conversationId, settings) {
    try {
      const response = await fetch(
        `${this.baseURL}/conversations/${conversationId}/settings`,
        {
          method: "PUT",
          headers: this.getHeaders(),
          body: JSON.stringify(settings),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to update conversation settings:", error);
      throw error;
    }
  }

  // Clear conversation history
  async clearConversationHistory(conversationId) {
    try {
      const response = await fetch(
        `${this.baseURL}/conversations/${conversationId}/clear-history`,
        {
          method: "POST",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to clear conversation history:", error);
      throw error;
    }
  }

  // ============== MONITORING APIs (Manager/Admin) ==============

  // Get monitored conversations (for managers/admins)
  async getMonitoredConversations(officeId = null, page = 1, limit = 20) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(officeId && { officeId }),
      });

      const response = await fetch(
        `${this.baseURL}/monitoring/conversations?${params}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to fetch monitored conversations:", error);
      throw error;
    }
  }

  // Get specific conversation for monitoring
  async getMonitoredConversation(conversationId) {
    try {
      const response = await fetch(
        `${this.baseURL}/monitoring/conversations/${conversationId}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to fetch monitored conversation:", error);
      throw error;
    }
  }

  // Get conversation analytics
  async getConversationAnalytics(conversationId, timeframe = "7d") {
    try {
      const response = await fetch(
        `${this.baseURL}/monitoring/conversations/${conversationId}/analytics?timeframe=${timeframe}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to fetch conversation analytics:", error);
      throw error;
    }
  }

  // Get office conversation statistics
  async getOfficeConversationStats(officeId, timeframe = "30d") {
    try {
      const response = await fetch(
        `${this.baseURL}/monitoring/offices/${officeId}/conversation-stats?timeframe=${timeframe}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to fetch office conversation stats:", error);
      throw error;
    }
  }

  // ============== UTILITY METHODS ==============

  // Find direct conversation with user
  async findDirectConversation(userId) {
    try {
      const response = await fetch(
        `${this.baseURL}/conversations/direct/${userId}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (response.status === 404) {
        return null; // No direct conversation exists
      }

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to find direct conversation:", error);
      throw error;
    }
  }

  // Get suggested contacts for new conversation
  async getSuggestedContacts() {
    try {
      const response = await fetch(
        `${this.baseURL}/conversations/suggested-contacts`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to get suggested contacts:", error);
      throw error;
    }
  }

  // Create direct conversation or get existing one
  async getOrCreateDirectConversation(userId) {
    try {
      // First try to find existing direct conversation
      const existingConversation = await this.findDirectConversation(userId);

      if (existingConversation) {
        return existingConversation;
      }

      // Create new direct conversation
      return await this.createConversation([userId], {
        type: "direct",
        name: null, // Will be auto-generated
      });
    } catch (error) {
      console.error("Failed to get or create direct conversation:", error);
      throw error;
    }
  }

  // Bulk operations
  async bulkArchiveConversations(conversationIds, archived = true) {
    try {
      const response = await fetch(
        `${this.baseURL}/conversations/bulk-archive`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({ conversationIds, archived }),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to bulk archive conversations:", error);
      throw error;
    }
  }

  async bulkDeleteConversations(conversationIds) {
    try {
      const response = await fetch(
        `${this.baseURL}/conversations/bulk-delete`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({ conversationIds }),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Failed to bulk delete conversations:", error);
      throw error;
    }
  }
}

// Create singleton instance
const conversationApi = new ConversationApiService();

export default conversationApi;
