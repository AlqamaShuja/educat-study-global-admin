// src/stores/conversationStore.js
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import socketService from "../services/socketService";
import api from "../services/api";

const useConversationStore = create(
  subscribeWithSelector((set, get) => ({
    // Conversation state
    conversations: new Map(),
    activeConversationId: null,
    isLoading: false,
    error: null,

    // Filtering and search
    searchQuery: "",
    filterType: "all", // all, unread, archived
    sortBy: "lastMessage", // lastMessage, name, createdAt

    // Monitoring (for managers/admins)
    monitoredConversations: new Map(),
    isMonitoring: false,

    // Typing indicators
    typingUsers: new Map(), // conversationId -> Set of userIds

    // Pagination
    hasMore: true,
    currentPage: 1,
    limit: 20,

    // Load conversations
    loadConversations: async (page = 1, reset = false) => {
      const { limit, conversations } = get();

      if (reset) {
        set({
          conversations: new Map(),
          currentPage: 1,
          hasMore: true,
        });
      }

      set({ isLoading: true, error: null });

      try {
        const { data, } = await api.get(
          `/conversations?page=${page}&limit=${limit}&sort=${
            get().sortBy
          }`
        );

        console.log(data, "ascnasncajncsaja");
        
        const newConversations = new Map(conversations);

        data?.forEach((conversation) => {
          newConversations.set(conversation.id, {
            ...conversation,
            participants: new Map(
              conversation.participants?.map((p) => [p.userId, p]) || []
            ),
            lastMessage: conversation.lastMessage,
            unreadCount: conversation.unreadCount || 0,
            lastReadAt: conversation.lastReadAt,
          });
        });

        set({
          conversations: newConversations,
          hasMore: data.hasMore,
          currentPage: page,
          isLoading: false,
        });

        return data;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    // Create new conversation
    createConversation: async (participantIds, conversationData = {}) => {
      set({ isLoading: true, error: null });

      try {
        const conversation = await api.post("/conversations", {
          participantIds,
          ...conversationData,
        });

        const { conversations } = get();

        const newConversations = new Map(conversations);
        newConversations.set(conversation.id, {
          ...conversation,
          participants: new Map(
            conversation.participants?.map((p) => [p.userId, p]) || []
          ),
          unreadCount: 0,
        });

        set({
          conversations: newConversations,
          activeConversationId: conversation.id,
          isLoading: false,
        });

        // Join the conversation room
        socketService.joinConversation(conversation.id);

        return conversation;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    // Set active conversation
    setActiveConversation: (conversationId) => {
      const { activeConversationId, conversations } = get();

      // Leave current conversation room
      if (activeConversationId && activeConversationId !== conversationId) {
        socketService.leaveConversation(activeConversationId);
      }

      // Join new conversation room
      if (conversationId && conversationId !== activeConversationId) {
        socketService.joinConversation(conversationId);

        // Mark conversation as read when opened
        get().markConversationAsRead(conversationId);
      }

      set({ activeConversationId: conversationId });
    },

    // Update conversation
    updateConversation: (conversationId, updates) => {
      const { conversations } = get();
      const conversation = conversations.get(conversationId);

      if (conversation) {
        const newConversations = new Map(conversations);
        newConversations.set(conversationId, {
          ...conversation,
          ...updates,
          updatedAt: new Date().toISOString(),
        });

        set({ conversations: newConversations });
      }
    },

    // Mark conversation as read
    markConversationAsRead: (conversationId) => {
      const { conversations } = get();
      const conversation = conversations.get(conversationId);

      if (conversation && conversation.unreadCount > 0) {
        const newConversations = new Map(conversations);
        newConversations.set(conversationId, {
          ...conversation,
          unreadCount: 0,
          lastReadAt: new Date().toISOString(),
        });

        set({ conversations: newConversations });

        // Notify server
        if (conversation.lastMessage) {
          socketService.markAsRead(conversationId, conversation.lastMessage.id);
        }
      }
    },

    // Update unread count
    updateUnreadCount: (conversationId, increment = 1) => {
      const { conversations, activeConversationId } = get();
      const conversation = conversations.get(conversationId);

      if (conversation && conversationId !== activeConversationId) {
        const newConversations = new Map(conversations);
        newConversations.set(conversationId, {
          ...conversation,
          unreadCount: Math.max(0, (conversation.unreadCount || 0) + increment),
        });

        set({ conversations: newConversations });
      }
    },

    // Update last message
    updateLastMessage: (conversationId, message) => {
      const { conversations } = get();
      const conversation = conversations.get(conversationId);

      if (conversation) {
        const newConversations = new Map(conversations);
        newConversations.set(conversationId, {
          ...conversation,
          lastMessage: message,
          lastMessageAt: message.createdAt || new Date().toISOString(),
        });

        set({ conversations: newConversations });
      }
    },

    // Handle typing indicators
    setUserTyping: (conversationId, userId, isTyping) => {
      const { typingUsers } = get();
      const newTypingUsers = new Map(typingUsers);

      if (!newTypingUsers.has(conversationId)) {
        newTypingUsers.set(conversationId, new Set());
      }

      const conversationTyping = newTypingUsers.get(conversationId);

      if (isTyping) {
        conversationTyping.add(userId);
      } else {
        conversationTyping.delete(userId);
      }

      set({ typingUsers: newTypingUsers });
    },

    // Get typing users for conversation
    getTypingUsers: (conversationId) => {
      const { typingUsers } = get();
      return Array.from(typingUsers.get(conversationId) || []);
    },

    // Search and filter
    setSearchQuery: (query) => {
      set({ searchQuery: query });
    },

    setFilterType: (filterType) => {
      set({ filterType });
    },

    setSortBy: (sortBy) => {
      set({ sortBy });
      // Reload conversations with new sort
      get().loadConversations(1, true);
    },

    // Get filtered conversations
    getFilteredConversations: () => {
      const { conversations, searchQuery, filterType } = get();
      let filtered = Array.from(conversations.values());

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (conv) =>
            conv.name?.toLowerCase().includes(query) ||
            conv.lastMessage?.content?.toLowerCase().includes(query) ||
            Array.from(conv.participants.values()).some(
              (p) =>
                p.user?.name?.toLowerCase().includes(query) ||
                p.user?.email?.toLowerCase().includes(query)
            )
        );
      }

      // Apply type filter
      switch (filterType) {
        case "unread":
          filtered = filtered.filter((conv) => conv.unreadCount > 0);
          break;
        case "archived":
          filtered = filtered.filter((conv) => conv.isArchived);
          break;
        case "all":
        default:
          filtered = filtered.filter((conv) => !conv.isArchived);
          break;
      }

      // Sort conversations
      filtered.sort((a, b) => {
        switch (get().sortBy) {
          case "name":
            return (a.name || "").localeCompare(b.name || "");
          case "createdAt":
            return new Date(b.createdAt) - new Date(a.createdAt);
          case "lastMessage":
          default:
            return (
              new Date(b.lastMessageAt || b.createdAt) -
              new Date(a.lastMessageAt || a.createdAt)
            );
        }
      });

      return filtered;
    },

    // Monitoring functions (for managers/admins)
    loadMonitoredConversations: async (officeId = null) => {
      set({ isLoading: true, error: null });

      try {
        const url = officeId
          ? `/monitoring/conversations?officeId=${officeId}`
          : "/monitoring/conversations";

        const data = await api.get(url);

        // const data = await response.json();
        const monitoredConversations = new Map();

        data.conversations.forEach((conversation) => {
          monitoredConversations.set(conversation.id, conversation);
        });

        set({
          monitoredConversations,
          isMonitoring: true,
          isLoading: false,
        });

        return data;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    // Archive/unarchive conversation
    archiveConversation: async (conversationId, archive = true) => {
      try {
        // const token = localStorage.getItem("auth-storage");
        const response = await api.patch(
          `/conversations/${conversationId}`,
          { isArchived: archive }
        );

        get().updateConversation(conversationId, { isArchived: archive });
        return true;
      } catch (error) {
        set({ error: error.message });
        throw error;
      }
    },

    // Get conversation by ID
    getConversation: (conversationId) => {
      const { conversations } = get();
      return conversations.get(conversationId);
    },

    // Get active conversation
    getActiveConversation: () => {
      const { activeConversationId, conversations } = get();
      return activeConversationId
        ? conversations.get(activeConversationId)
        : null;
    },

    // Clear error
    clearError: () => {
      set({ error: null });
    },

    // Reset store
    reset: () => {
      set({
        conversations: new Map(),
        activeConversationId: null,
        isLoading: false,
        error: null,
        searchQuery: "",
        filterType: "all",
        sortBy: "lastMessage",
        monitoredConversations: new Map(),
        isMonitoring: false,
        typingUsers: new Map(),
        hasMore: true,
        currentPage: 1,
      });
    },
  }))
);

export default useConversationStore;
