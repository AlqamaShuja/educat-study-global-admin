// src/stores/chatStore.js
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import socketService from "../services/socketService";
import apiService from "../services/api";

const useChatStore = create(
  subscribeWithSelector((set, get) => ({
    // Message state
    messages: new Map(), // conversationId -> Array of messages
    messageStatuses: new Map(), // messageId -> status
    tempMessages: new Map(), // tempId -> message (for optimistic updates)
    isLoading: false,
    isSending: false,
    error: null,

    // Message composition
    messageInputs: new Map(), // conversationId -> draft message
    uploadingFiles: new Map(), // conversationId -> uploading files

    // Pagination
    messagePagination: new Map(), // conversationId -> { page, hasMore, loading }

    // Search
    searchResults: [],
    isSearching: false,
    searchQuery: "",

    // Load messages for a conversation
    loadMessages: async (conversationId, page = 1, reset = false) => {
      const { messages, messagePagination } = get();

      // Initialize pagination if not exists
      if (!messagePagination.has(conversationId)) {
        const newPagination = new Map(messagePagination);
        newPagination.set(conversationId, {
          page: 1,
          hasMore: true,
          loading: false,
        });
        set({ messagePagination: newPagination });
      }

      const pagination = messagePagination.get(conversationId);
      if (pagination.loading || (!pagination.hasMore && !reset)) {
        return;
      }

      // Update loading state
      const newPagination = new Map(messagePagination);
      newPagination.set(conversationId, { ...pagination, loading: true });
      set({ messagePagination: newPagination, isLoading: page === 1 });

      try {
        const data = await apiService.get(
          `/conversations/${conversationId}/messages?page=${page}&limit=50`
        );

        console.log(data, "sacmkasncjnac:loadMessages");

        const newMessages = new Map(messages);

        if (reset || page === 1) {
          newMessages.set(conversationId, data.messages);
        } else {
          const existingMessages = newMessages.get(conversationId) || [];
          newMessages.set(conversationId, [
            ...data.messages,
            ...existingMessages,
          ]);
        }

        // Update pagination
        newPagination.set(conversationId, {
          page: data.currentPage,
          hasMore: data.hasMore,
          loading: false,
        });

        set({
          messages: newMessages,
          messagePagination: newPagination,
          isLoading: false,
          error: null,
        });

        return data;
      } catch (error) {
        newPagination.set(conversationId, { ...pagination, loading: false });
        set({
          messagePagination: newPagination,
          isLoading: false,
          error: error.message,
        });
        throw error;
      }
    },

    // Send message
    sendMessage: async (conversationId, messageData) => {
      const { messages, tempMessages } = get();

      set({ isSending: true, error: null });

      // Create temporary message for optimistic update
      const tempId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const tempMessage = {
        id: tempId,
        conversationId,
        content: messageData.content,
        type: messageData.type || "text",
        senderId:
          JSON.parse(localStorage.getItem("userData") || "{}")?.user?.id ||
          null,
        createdAt: new Date().toISOString(),
        status: "sending",
        isTemporary: true,
        ...messageData,
      };

      // Add to temporary messages
      const newTempMessages = new Map(tempMessages);
      newTempMessages.set(tempId, tempMessage);

      // Add to conversation messages for immediate display
      const newMessages = new Map(messages);
      const conversationMessages = newMessages.get(conversationId) || [];
      newMessages.set(conversationId, [...conversationMessages, tempMessage]);

      set({
        tempMessages: newTempMessages,
        messages: newMessages,
      });

      try {
        // Send via socket for real-time delivery
        const actualTempId = socketService.sendMessage({
          conversationId,
          ...messageData,
          tempId,
        });

        // Also send via HTTP API for reliability
        const savedMessage = await apiService.post(
          `/conversations/${conversationId}/messages`,
          {
            ...messageData,
            tempId: actualTempId,
          }
        );

        console.log(savedMessage, "ascnasncajsn:savedMessage");

        // Remove temporary message and replace with real one
        get().replaceTemporaryMessage(tempId, savedMessage);

        set({ isSending: false });
        return savedMessage;
      } catch (error) {
        // Mark temporary message as failed
        get().updateMessageStatus(tempId, "failed");
        set({ isSending: false, error: error.message });
        throw error;
      }
    },

    // Replace temporary message with real message
    replaceTemporaryMessage: (tempId, realMessage) => {
      const { messages, tempMessages } = get();
      const tempMessage = tempMessages.get(tempId);

      if (tempMessage) {
        const newTempMessages = new Map(tempMessages);
        newTempMessages.delete(tempId);

        const newMessages = new Map(messages);
        const conversationMessages =
          newMessages.get(tempMessage.conversationId) || [];

        // Replace temporary message with real message
        const updatedMessages = conversationMessages.map((msg) =>
          msg.id === tempId ? realMessage : msg
        );

        newMessages.set(tempMessage.conversationId, updatedMessages);

        set({
          tempMessages: newTempMessages,
          messages: newMessages,
        });
      }
    },

    // Add received message
    addReceivedMessage: (message) => {
      const { messages, tempMessages } = get();
      const newMessages = new Map(messages);

      // Check if this is replacing a temporary message
      const tempMessage = Array.from(tempMessages.values()).find(
        (temp) =>
          temp.conversationId === message.conversationId &&
          temp.content === message.content &&
          Math.abs(new Date(temp.createdAt) - new Date(message.createdAt)) <
            5000
      );

      if (tempMessage) {
        get().replaceTemporaryMessage(tempMessage.id, message);
      } else {
        // Add new message
        const conversationMessages =
          newMessages.get(message.conversationId) || [];
        const messageExists = conversationMessages.some(
          (msg) => msg.id === message.id
        );

        if (!messageExists) {
          newMessages.set(message.conversationId, [
            ...conversationMessages,
            message,
          ]);
          set({ messages: newMessages });
        }
      }
    },

    // Update message status
    updateMessageStatus: (messageId, status, statusData = {}) => {
      const { messageStatuses } = get();
      const newStatuses = new Map(messageStatuses);

      newStatuses.set(messageId, {
        status,
        timestamp: new Date().toISOString(),
        ...statusData,
      });

      set({ messageStatuses: newStatuses });

      // Also update in messages if it's a temporary message
      const { messages, tempMessages } = get();

      // Update in temp messages
      if (tempMessages.has(messageId)) {
        const newTempMessages = new Map(tempMessages);
        const tempMessage = newTempMessages.get(messageId);
        newTempMessages.set(messageId, { ...tempMessage, status });
        set({ tempMessages: newTempMessages });
      }

      // Update in messages
      const newMessages = new Map(messages);
      for (const [
        conversationId,
        conversationMessages,
      ] of newMessages.entries()) {
        const updatedMessages = conversationMessages.map((msg) =>
          msg.id === messageId ? { ...msg, status } : msg
        );
        if (
          JSON.stringify(updatedMessages) !==
          JSON.stringify(conversationMessages)
        ) {
          newMessages.set(conversationId, updatedMessages);
          break;
        }
      }
      set({ messages: newMessages });
    },

    // Edit message
    editMessage: async (messageId, newContent) => {
      try {
        const updatedMessage = await apiService.put(`/messages/${messageId}`, {
          content: newContent,
        });

        console.log(updatedMessage, "ascnjasncsasac:updatedMessage");

        get().updateMessageInConversation(updatedMessage);

        return updatedMessage;
      } catch (error) {
        set({ error: error.message });
        throw error;
      }
    },

    // Delete message
    deleteMessage: async (messageId) => {
      try {
        const token = localStorage.getItem("auth-storage");
        const response = await apiService.delete(`/messages/${messageId}`);

        get().removeMessageFromConversation(messageId);
        return true;
      } catch (error) {
        set({ error: error.message });
        throw error;
      }
    },

    // Update message in conversation
    updateMessageInConversation: (updatedMessage) => {
      const { messages } = get();
      const newMessages = new Map(messages);

      for (const [
        conversationId,
        conversationMessages,
      ] of newMessages.entries()) {
        const messageIndex = conversationMessages.findIndex(
          (msg) => msg.id === updatedMessage.id
        );
        if (messageIndex !== -1) {
          const updatedMessages = [...conversationMessages];
          updatedMessages[messageIndex] = updatedMessage;
          newMessages.set(conversationId, updatedMessages);
          break;
        }
      }

      set({ messages: newMessages });
    },

    // Remove message from conversation
    removeMessageFromConversation: (messageId) => {
      const { messages } = get();
      const newMessages = new Map(messages);

      for (const [
        conversationId,
        conversationMessages,
      ] of newMessages.entries()) {
        const filteredMessages = conversationMessages.filter(
          (msg) => msg.id !== messageId
        );
        if (filteredMessages.length !== conversationMessages.length) {
          newMessages.set(conversationId, filteredMessages);
          break;
        }
      }

      set({ messages: newMessages });
    },

    // Upload file
    uploadFile: async (conversationId, file, onProgress) => {
      const { uploadingFiles } = get();
      const fileId = `file_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Add to uploading files
      const newUploadingFiles = new Map(uploadingFiles);
      const conversationUploads =
        newUploadingFiles.get(conversationId) || new Map();
      conversationUploads.set(fileId, {
        file,
        progress: 0,
        status: "uploading",
      });
      newUploadingFiles.set(conversationId, conversationUploads);
      set({ uploadingFiles: newUploadingFiles });

      try {
        const formData = new FormData();
        formData.append("file", file);

        const uploadResult = await apiService.post(
          `/conversations/${conversationId}/upload`,
          formData
        );

        console.log(uploadResult, "askcnsncja:uploadResult");

        // Remove from uploading files
        conversationUploads.delete(fileId);
        if (conversationUploads.size === 0) {
          newUploadingFiles.delete(conversationId);
        } else {
          newUploadingFiles.set(conversationId, conversationUploads);
        }
        set({ uploadingFiles: newUploadingFiles });

        return uploadResult;
      } catch (error) {
        // Mark upload as failed
        conversationUploads.set(fileId, {
          ...conversationUploads.get(fileId),
          status: "failed",
          error: error.message,
        });
        newUploadingFiles.set(conversationId, conversationUploads);
        set({ uploadingFiles: newUploadingFiles });
        throw error;
      }
    },

    // Message draft management
    setMessageDraft: (conversationId, draft) => {
      const { messageInputs } = get();
      const newInputs = new Map(messageInputs);

      if (draft.trim()) {
        newInputs.set(conversationId, draft);
      } else {
        newInputs.delete(conversationId);
      }

      set({ messageInputs: newInputs });
    },

    getMessageDraft: (conversationId) => {
      const { messageInputs } = get();
      return messageInputs.get(conversationId) || "";
    },

    // Search messages
    searchMessages: async (query, conversationId = null, filters = {}) => {
      set({ isSearching: true, searchQuery: query });

      try {
        const token = localStorage.getItem("auth-storage");
        const params = new URLSearchParams({
          q: query,
          ...filters,
          ...(conversationId && { conversationId }),
        });

        const results = await apiService.get(
          `/monitoring/messages/search?${params}`
        );

        console.log(results, "sacnjancajsnc:resultsresults");

        set({
          searchResults: results.messages || [],
          isSearching: false,
        });

        return results;
      } catch (error) {
        set({
          isSearching: false,
          error: error.message,
        });
        throw error;
      }
    },

    // Get messages for conversation
    getConversationMessages: (conversationId) => {
      const { messages } = get();
      return messages.get(conversationId) || [];
    },

    // Get message status
    getMessageStatus: (messageId) => {
      const { messageStatuses } = get();
      return messageStatuses.get(messageId);
    },

    // Clear messages for conversation
    clearConversationMessages: (conversationId) => {
      const { messages } = get();
      const newMessages = new Map(messages);
      newMessages.delete(conversationId);
      set({ messages: newMessages });
    },

    // Clear error
    clearError: () => {
      set({ error: null });
    },

    // Reset store
    reset: () => {
      set({
        messages: new Map(),
        messageStatuses: new Map(),
        tempMessages: new Map(),
        isLoading: false,
        isSending: false,
        error: null,
        messageInputs: new Map(),
        uploadingFiles: new Map(),
        messagePagination: new Map(),
        searchResults: [],
        isSearching: false,
        searchQuery: "",
      });
    },
  }))
);

export default useChatStore;
