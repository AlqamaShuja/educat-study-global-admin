// src/stores/socketStore.js
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import socketService from "../services/socketService";

const useSocketStore = create(
  subscribeWithSelector((set, get) => ({
    // Connection state
    isConnected: false,
    isConnecting: false,
    connectionError: null,
    reconnectAttempts: 0,
    latency: null,
    socketId: null,

    // Online users tracking
    onlineUsers: new Map(),

    // Connection methods
    connect: async (token) => {
      const { isConnected, isConnecting } = get();

      if (isConnected || isConnecting) {
        return;
      }

      set({
        isConnecting: true,
        connectionError: null,
      });

      try {
        await socketService.connect(token);

        set({
          isConnected: true,
          isConnecting: false,
          socketId: socketService.getSocketId(),
          reconnectAttempts: 0,
        });

        // Setup socket event listeners
        get().setupSocketListeners();
      } catch (error) {
        console.error("Socket connection failed:", error);
        set({
          isConnected: false,
          isConnecting: false,
          connectionError: error.message,
        });
        throw error;
      }
    },

    disconnect: () => {
      socketService.disconnect();
      set({
        isConnected: false,
        isConnecting: false,
        connectionError: null,
        socketId: null,
        onlineUsers: new Map(),
        latency: null,
      });
    },

    // Setup socket event listeners
    setupSocketListeners: () => {
      // Connection status updates
      socketService.on("socket_error", (error) => {
        set({ connectionError: error.message });
      });

      socketService.on("max_reconnect_attempts_reached", () => {
        set({
          connectionError:
            "Unable to connect to server. Please check your connection.",
        });
      });

      // Latency updates
      socketService.on("latency_update", (latency) => {
        set({ latency });
      });

      // Online status updates
      socketService.on("user_online", (data) => {
        const { onlineUsers } = get();
        const newOnlineUsers = new Map(onlineUsers);
        newOnlineUsers.set(data.userId, {
          ...data,
          lastSeen: new Date().toISOString(),
        });
        set({ onlineUsers: newOnlineUsers });
      });

      socketService.on("user_offline", (data) => {
        const { onlineUsers } = get();
        const newOnlineUsers = new Map(onlineUsers);

        if (newOnlineUsers.has(data.userId)) {
          newOnlineUsers.set(data.userId, {
            ...newOnlineUsers.get(data.userId),
            status: "offline",
            lastSeen: new Date().toISOString(),
          });
        }

        set({ onlineUsers: newOnlineUsers });
      });
    },

    // Socket operations
    joinConversation: (conversationId) => {
      const { isConnected } = get();
      if (!isConnected) {
        console.warn("Cannot join conversation: not connected");
        return;
      }
      socketService.joinConversation(conversationId);
    },

    leaveConversation: (conversationId) => {
      const { isConnected } = get();
      if (!isConnected) return;
      socketService.leaveConversation(conversationId);
    },

    sendMessage: (messageData) => {
      const { isConnected } = get();
      if (!isConnected) {
        throw new Error("Cannot send message: not connected");
      }
      return socketService.sendMessage(messageData);
    },

    sendTypingIndicator: (conversationId, isTyping) => {
      const { isConnected } = get();
      if (!isConnected) return;
      socketService.sendTypingIndicator(conversationId, isTyping);
    },

    markAsRead: (conversationId, messageId) => {
      const { isConnected } = get();
      if (!isConnected) return;
      socketService.markAsRead(conversationId, messageId);
    },

    updateStatus: (status) => {
      const { isConnected } = get();
      if (!isConnected) return;
      socketService.updateStatus(status);
    },

    // Utility methods
    getConnectionStatus: () => {
      return socketService.getConnectionStatus();
    },

    pingServer: () => {
      const { isConnected } = get();
      if (!isConnected) return;
      socketService.ping();
    },

    // Get user online status
    getUserOnlineStatus: (userId) => {
      const { onlineUsers } = get();
      return onlineUsers.get(userId) || { status: "offline" };
    },

    // Get all online users for a conversation
    getConversationOnlineUsers: (conversationId) => {
      socketService.getOnlineUsers(conversationId);
    },

    // Clear connection error
    clearConnectionError: () => {
      set({ connectionError: null });
    },

    // Reset store state
    reset: () => {
      get().disconnect();
      set({
        isConnected: false,
        isConnecting: false,
        connectionError: null,
        reconnectAttempts: 0,
        latency: null,
        socketId: null,
        onlineUsers: new Map(),
      });
    },
  }))
);

// Subscribe to auth changes to handle socket connection
let unsubscribeAuth = null;

export const initializeSocketStore = (authStore) => {
  // Clean up previous subscription
  if (unsubscribeAuth) {
    unsubscribeAuth();
  }

  // Subscribe to auth changes
  unsubscribeAuth = authStore.subscribe(
    (state) => state.token,
    (token, previousToken) => {
      const socketStore = useSocketStore.getState();

      if (token && token !== previousToken) {
        // New token, connect socket
        socketStore.connect(token).catch(console.error);
      } else if (!token && previousToken) {
        // Token removed, disconnect socket
        socketStore.disconnect();
      }
    }
  );
};

export default useSocketStore;
