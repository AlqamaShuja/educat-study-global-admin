// src/hooks/useSocket.js
import { useEffect, useRef, useCallback } from "react";
import useAuthStore from "../stores/authStore";
import useSocketStore from "../stores/socketStore";
import useConversationStore from "../stores/conversationStore";
import useChatStore from "../stores/chatStore";
import socketService from "../services/socketService";

const useSocket = () => {
  const { token, user, isAuthenticated } = useAuthStore();
  const {
    isConnected,
    isConnecting,
    connectionError,
    connect,
    disconnect,
    setupSocketListeners,
    clearConnectionError,
  } = useSocketStore();

  const {
    updateConversation,
    updateLastMessage,
    updateUnreadCount,
    setUserTyping,
  } = useConversationStore();

  const { addReceivedMessage, updateMessageStatus } = useChatStore();

  const eventListenersSetup = useRef(false);

  // Initialize socket connection when authenticated
  useEffect(() => {
    if (isAuthenticated && token && !isConnected && !isConnecting) {
      connect(token).catch(console.error);
    } else if (!isAuthenticated && isConnected) {
      disconnect();
    }
  }, [isAuthenticated, token, isConnected, isConnecting, connect, disconnect]);

  // Setup socket event listeners
  const setupEventListeners = useCallback(() => {
    if (eventListenersSetup.current) return;

    // Message events
    socketService.on("message_received", (data) => {
      const { message, conversationId } = data;

      // Add message to chat store
      addReceivedMessage(message);

      // Update conversation last message
      updateLastMessage(conversationId, message);

      // Increment unread count if not in active conversation
      updateUnreadCount(conversationId, 1);

      // Show notification if user is not on the page
      if (
        document.hidden &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        const senderName = message.sender?.name || "Someone";
        new Notification(`New message from ${senderName}`, {
          body:
            message.type === "text"
              ? message.content
              : `Sent a ${message.type}`,
          icon: message.sender?.avatar || "/default-avatar.png",
          tag: `message-${conversationId}`,
        });
      }
    });

    socketService.on("message_delivered", (data) => {
      updateMessageStatus(data.messageId, "delivered", {
        deliveredAt: data.deliveredAt,
      });
    });

    socketService.on("message_read", (data) => {
      updateMessageStatus(data.messageId, "read", {
        readAt: data.readAt,
        readBy: data.readBy,
      });
    });

    // Typing events
    socketService.on("user_typing", (data) => {
      const { conversationId, userId, isTyping, user: typingUser } = data;

      // Don't show typing indicator for current user
      if (userId !== user?.id) {
        setUserTyping(conversationId, userId, isTyping);

        // Auto-clear typing indicator after 3 seconds
        if (isTyping) {
          setTimeout(() => {
            setUserTyping(conversationId, userId, false);
          }, 3000);
        }
      }
    });

    // Conversation events
    socketService.on("conversation_updated", (data) => {
      updateConversation(data.conversationId, data.updates);
    });

    socketService.on("conversation_created", (data) => {
      const { conversation } = data;
      // This could trigger a refresh of conversations list
      console.log("New conversation created:", conversation);
    });

    // Online status events are handled in socket store

    eventListenersSetup.current = true;
  }, [
    addReceivedMessage,
    updateLastMessage,
    updateUnreadCount,
    setUserTyping,
    updateConversation,
    updateMessageStatus,
    user?.id,
  ]);

  // Setup event listeners when connected
  useEffect(() => {
    if (isConnected) {
      setupEventListeners();
    }

    return () => {
      eventListenersSetup.current = false;
    };
  }, [isConnected, setupEventListeners]);

  // Request notification permission on first connection
  useEffect(() => {
    if (
      isConnected &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, [isConnected]);

  // Socket operation methods
  const joinConversation = useCallback(
    (conversationId) => {
      if (!isConnected) {
        console.warn("Cannot join conversation: socket not connected");
        return;
      }
      useSocketStore.getState().joinConversation(conversationId);
    },
    [isConnected]
  );

  const leaveConversation = useCallback(
    (conversationId) => {
      if (!isConnected) return;
      useSocketStore.getState().leaveConversation(conversationId);
    },
    [isConnected]
  );

  const sendMessage = useCallback(
    (messageData) => {
      if (!isConnected) {
        throw new Error("Cannot send message: socket not connected");
      }
      return useSocketStore.getState().sendMessage(messageData);
    },
    [isConnected]
  );

  const sendTypingIndicator = useCallback(
    (conversationId, isTyping) => {
      if (!isConnected) return;
      useSocketStore.getState().sendTypingIndicator(conversationId, isTyping);
    },
    [isConnected]
  );

  const markAsRead = useCallback(
    (conversationId, messageId) => {
      if (!isConnected) return;
      useSocketStore.getState().markAsRead(conversationId, messageId);
    },
    [isConnected]
  );

  const updateStatus = useCallback(
    (status) => {
      if (!isConnected) return;
      useSocketStore.getState().updateStatus(status);
    },
    [isConnected]
  );

  // Connection management
  const reconnect = useCallback(async () => {
    if (token) {
      clearConnectionError();
      try {
        await connect(token);
      } catch (error) {
        console.error("Reconnection failed:", error);
      }
    }
  }, [token, connect, clearConnectionError]);

  const forceDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  // Get connection info
  const connectionInfo = {
    isConnected,
    isConnecting,
    error: connectionError,
    socketId: useSocketStore.getState().socketId,
    latency: useSocketStore.getState().latency,
  };

  // Online users methods
  const getOnlineUsers = useCallback(() => {
    return useSocketStore.getState().onlineUsers;
  }, []);

  const getUserOnlineStatus = useCallback((userId) => {
    return useSocketStore.getState().getUserOnlineStatus(userId);
  }, []);

  const getConversationOnlineUsers = useCallback(
    (conversationId) => {
      if (!isConnected) return;
      useSocketStore.getState().getConversationOnlineUsers(conversationId);
    },
    [isConnected]
  );

  // Ping server for latency check
  const pingServer = useCallback(() => {
    if (!isConnected) return;
    useSocketStore.getState().pingServer();
  }, [isConnected]);

  return {
    // Connection state
    ...connectionInfo,

    // Connection methods
    reconnect,
    disconnect: forceDisconnect,

    // Socket operations
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTypingIndicator,
    markAsRead,
    updateStatus,

    // Online status
    getOnlineUsers,
    getUserOnlineStatus,
    getConversationOnlineUsers,

    // Utilities
    pingServer,
    clearError: clearConnectionError,
  };
};

export default useSocket;
