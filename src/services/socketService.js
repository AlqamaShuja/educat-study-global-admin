// src/services/socketService.js
import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 1000;
    this.eventListeners = new Map();
  }

  /**
   * Initialize socket connection with authentication
   * @param {string} token - JWT authentication token
   * @param {string} serverUrl - Socket server URL
   */
  connect(
    token,
    serverUrl = import.meta.env.VITE_API_BASE_URL.replace("/api/v1"),
  ) {
    if (this.socket?.connected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.socket = io(serverUrl, {
          auth: {
            token: token,
          },
          transports: ["websocket", "polling"],
          upgrade: true,
          rememberUpgrade: true,
          timeout: 20000,
          forceNew: true,
        });

        // Connection successful
        this.socket.on("connect", () => {
          console.log("✅ Socket connected:", this.socket.id);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.setupEventListeners();
          resolve();
        });

        // Connection error
        this.socket.on("connect_error", (error) => {
          console.error("❌ Socket connection error:", error);
          this.isConnected = false;

          if (error.message.includes("Authentication failed")) {
            reject(new Error("Authentication failed"));
          } else {
            this.handleReconnection();
            reject(error);
          }
        });

        // Disconnection
        this.socket.on("disconnect", (reason) => {
          console.log("🔌 Socket disconnected:", reason);
          this.isConnected = false;

          if (reason === "io server disconnect") {
            // Server forced disconnect, don't reconnect
            return;
          }

          this.handleReconnection();
        });

        // Authentication error
        this.socket.on("auth_error", (error) => {
          console.error("🚫 Authentication error:", error);
          this.disconnect();
          reject(new Error("Authentication failed"));
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Setup core event listeners
   */
  setupEventListeners() {
    if (!this.socket) return;

    // Message events
    this.socket.on("message_received", (data) => {
      this.emit("message_received", data);
    });

    this.socket.on("message_delivered", (data) => {
      this.emit("message_delivered", data);
    });

    this.socket.on("message_read", (data) => {
      this.emit("message_read", data);
    });

    // Typing events
    this.socket.on("user_typing", (data) => {
      this.emit("user_typing", data);
    });

    // Online status events
    this.socket.on("user_online", (data) => {
      this.emit("user_online", data);
    });

    this.socket.on("user_offline", (data) => {
      this.emit("user_offline", data);
    });

    // Conversation events
    this.socket.on("conversation_updated", (data) => {
      this.emit("conversation_updated", data);
    });

    this.socket.on("conversation_created", (data) => {
      this.emit("conversation_created", data);
    });

    // Error handling
    this.socket.on("error", (error) => {
      console.error("🚨 Socket error:", error);
      this.emit("socket_error", error);
    });
  }

  /**
   * Handle reconnection logic
   */
  handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ Max reconnection attempts reached");
      this.emit("max_reconnect_attempts_reached");
      return;
    }

    this.reconnectAttempts++;
    const delay =
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`
    );

    setTimeout(() => {
      if (!this.isConnected) {
        this.socket?.connect();
      }
    }, delay);
  }

  /**
   * Join a conversation room
   * @param {string} conversationId - Conversation ID to join
   */
  joinConversation(conversationId) {
    if (!this.isConnected || !this.socket) {
      console.warn("⚠️ Socket not connected, cannot join conversation");
      return;
    }

    this.socket.emit("join_conversation", { conversationId });
    console.log(`📨 Joined conversation: ${conversationId}`);
  }

  /**
   * Leave a conversation room
   * @param {string} conversationId - Conversation ID to leave
   */
  leaveConversation(conversationId) {
    if (!this.isConnected || !this.socket) return;

    this.socket.emit("leave_conversation", { conversationId });
    console.log(`📤 Left conversation: ${conversationId}`);
  }

  /**
   * Send a message
   * @param {Object} messageData - Message data
   */
  sendMessage(messageData) {
    if (!this.isConnected || !this.socket) {
      throw new Error("Socket not connected");
    }

    const messageWithTimestamp = {
      ...messageData,
      timestamp: new Date().toISOString(),
      tempId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.socket.emit("send_message", messageWithTimestamp);
    return messageWithTimestamp.tempId;
  }

  /**
   * Send typing indicator
   * @param {string} conversationId - Conversation ID
   * @param {boolean} isTyping - Whether user is typing
   */
  sendTypingIndicator(conversationId, isTyping) {
    if (!this.isConnected || !this.socket) return;

    const event = isTyping ? "typing_start" : "typing_stop";
    this.socket.emit(event, { conversationId });
  }

  /**
   * Mark messages as read
   * @param {string} conversationId - Conversation ID
   * @param {string} messageId - Last read message ID
   */
  markAsRead(conversationId, messageId) {
    if (!this.isConnected || !this.socket) return;

    this.socket.emit("mark_read", { conversationId, messageId });
  }

  /**
   * Update user status
   * @param {string} status - User status (online, away, busy, offline)
   */
  updateStatus(status) {
    if (!this.isConnected || !this.socket) return;

    this.socket.emit("update_status", { status });
  }

  /**
   * Get online users in conversation
   * @param {string} conversationId - Conversation ID
   */
  getOnlineUsers(conversationId) {
    if (!this.isConnected || !this.socket) return;

    this.socket.emit("get_online_users", { conversationId });
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  /**
   * Emit event to listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.eventListeners.clear();
    console.log("🔌 Socket disconnected");
  }

  /**
   * Check if socket is connected
   * @returns {boolean}
   */
  getConnectionStatus() {
    return this.isConnected && this.socket?.connected;
  }

  /**
   * Get socket ID
   * @returns {string|null}
   */
  getSocketId() {
    return this.socket?.id || null;
  }

  /**
   * Ping server for latency check
   */
  ping() {
    if (!this.isConnected || !this.socket) return;

    const start = Date.now();
    this.socket.emit("ping", start);

    this.socket.once("pong", (timestamp) => {
      const latency = Date.now() - timestamp;
      this.emit("latency_update", latency);
    });
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
