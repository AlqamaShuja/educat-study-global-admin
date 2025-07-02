// src/hooks/useChat.js
import { useCallback, useEffect, useRef } from "react";
import useChatStore from "../stores/chatStore";
import useConversationStore from "../stores/conversationStore";
import useAuthStore from "../stores/authStore";
import useSocket from "./useSocket";

const useChat = (conversationId = null) => {
  const { user } = useAuthStore();
  const { sendMessage: socketSendMessage, isConnected } = useSocket();

  const {
    messages,
    messageStatuses,
    tempMessages,
    isLoading,
    isSending,
    error,
    messageInputs,
    uploadingFiles,
    messagePagination,
    searchResults,
    isSearching,
    searchQuery,
    loadMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    uploadFile,
    setMessageDraft,
    getMessageDraft,
    searchMessages,
    getConversationMessages,
    getMessageStatus,
    clearConversationMessages,
    clearError,
    addReceivedMessage,
    updateMessageStatus,
    replaceTemporaryMessage,
  } = useChatStore();

  const { getActiveConversation, updateLastMessage, markConversationAsRead } =
    useConversationStore();

  const messagesEndRef = useRef(null);
  const lastMessageCountRef = useRef(0);

  // Get messages for current conversation
  const conversationMessages = conversationId
    ? getConversationMessages(conversationId)
    : [];
  const pagination = messagePagination.get(conversationId) || {
    page: 1,
    hasMore: true,
    loading: false,
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    const currentMessageCount = conversationMessages.length;
    const hadNewMessage = currentMessageCount > lastMessageCountRef.current;

    if (hadNewMessage && conversationId) {
      scrollToBottom();
      lastMessageCountRef.current = currentMessageCount;
    }
  }, [conversationMessages.length, conversationId, scrollToBottom]);

  // Load initial messages when conversation changes
  useEffect(() => {
    if (conversationId && !messages.has(conversationId)) {
      loadMessages(conversationId, 1, true);
    }
  }, [conversationId, messages, loadMessages]);

  // Mark conversation as read when viewing - Updated for role-based system
  useEffect(() => {
    if (conversationId && conversationMessages.length > 0) {
      // Only mark as read if user is a participant (not just monitoring)
      if (!["manager", "super_admin"].includes(user?.role)) {
        markConversationAsRead(conversationId);
      }
    }
  }, [
    conversationId,
    conversationMessages.length,
    markConversationAsRead,
    user?.role,
  ]);

  // Send a text message - Updated with role-based validation
  const sendTextMessage = useCallback(
    async (content, replyToId = null) => {
      if (!conversationId || !content.trim()) {
        throw new Error("Conversation ID and message content are required");
      }

      // Role-based validation
      if (["manager", "super_admin"].includes(user?.role)) {
        throw new Error("Monitoring roles cannot send messages");
      }

      // For consultants, validate they can send messages to this conversation
      if (user?.role === "consultant") {
        // Additional validation could be added here to ensure
        // the consultant is chatting with an assigned lead
        const conversation = getActiveConversation();
        if (!conversation) {
          throw new Error("Invalid conversation");
        }
      }

      const messageData = {
        conversationId,
        content: content.trim(),
        type: "text",
        ...(replyToId && { replyToId }),
      };

      try {
        console.log("Sending text message:", messageData);
        const message = await sendMessage(conversationId, messageData);

        // Clear draft after successful send
        setMessageDraft(conversationId, "");

        // Update conversation last message
        updateLastMessage(conversationId, message);

        return message;
      } catch (error) {
        console.error("Failed to send message:", error);
        throw error;
      }
    },
    [
      conversationId,
      sendMessage,
      setMessageDraft,
      updateLastMessage,
      user?.role,
      getActiveConversation,
    ]
  );

  // Send a file message - Updated with role-based validation
  const sendFileMessage = useCallback(
    async (file, caption = "") => {
      if (!conversationId || !file) {
        throw new Error("Conversation ID and file are required");
      }

      // Role-based validation
      if (["manager", "super_admin"].includes(user?.role)) {
        throw new Error("Monitoring roles cannot send files");
      }

      try {
        console.log("Sending file message:", file.name);

        // Upload file first
        const uploadResult = await uploadFile(conversationId, file);

        // Send message with file data
        const messageData = {
          conversationId,
          content: caption,
          type: getFileMessageType(file.type),
          fileUrl: uploadResult.fileUrl,
          fileName: uploadResult.fileName,
          fileSize: uploadResult.fileSize,
          mimeType: file.type,
        };

        const message = await sendMessage(conversationId, messageData);
        updateLastMessage(conversationId, message);

        return message;
      } catch (error) {
        console.error("Failed to send file message:", error);
        throw error;
      }
    },
    [conversationId, uploadFile, sendMessage, updateLastMessage, user?.role]
  );

  // Determine file message type
  const getFileMessageType = (mimeType) => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    return "file";
  };

  // Edit a message - Updated with role-based validation
  const handleEditMessage = useCallback(
    async (messageId, newContent) => {
      if (!newContent.trim()) {
        throw new Error("Message content cannot be empty");
      }

      // Role-based validation
      if (["manager", "super_admin"].includes(user?.role)) {
        throw new Error("Monitoring roles cannot edit messages");
      }

      try {
        console.log("Editing message:", messageId);
        const updatedMessage = await editMessage(messageId, newContent.trim());

        // Update last message if this was the latest message
        const conversation = getActiveConversation();
        if (conversation && conversation.lastMessage?.id === messageId) {
          updateLastMessage(conversationId, updatedMessage);
        }

        return updatedMessage;
      } catch (error) {
        console.error("Failed to edit message:", error);
        throw error;
      }
    },
    [
      editMessage,
      getActiveConversation,
      updateLastMessage,
      conversationId,
      user?.role,
    ]
  );

  // Delete a message - Updated with role-based validation
  const handleDeleteMessage = useCallback(
    async (messageId) => {
      // Role-based validation
      if (["manager", "super_admin"].includes(user?.role)) {
        throw new Error("Monitoring roles cannot delete messages");
      }

      try {
        console.log("Deleting message:", messageId);
        await deleteMessage(messageId);

        // If this was the last message, we might need to update conversation
        const conversation = getActiveConversation();
        if (conversation && conversation.lastMessage?.id === messageId) {
          // Find the previous message to set as last message
          const previousMessage = conversationMessages
            .filter((msg) => msg.id !== messageId)
            .pop();

          if (previousMessage) {
            updateLastMessage(conversationId, previousMessage);
          }
        }

        return true;
      } catch (error) {
        console.error("Failed to delete message:", error);
        throw error;
      }
    },
    [
      deleteMessage,
      getActiveConversation,
      conversationMessages,
      updateLastMessage,
      conversationId,
      user?.role,
    ]
  );

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!conversationId || pagination.loading || !pagination.hasMore) {
      return;
    }

    try {
      console.log("Loading more messages for conversation:", conversationId);
      await loadMessages(conversationId, pagination.page + 1);
    } catch (error) {
      console.error("Failed to load more messages:", error);
    }
  }, [conversationId, pagination, loadMessages]);

  // Message draft management - Updated to prevent drafts for monitoring roles
  const draft =
    conversationId && !["manager", "super_admin"].includes(user?.role)
      ? getMessageDraft(conversationId)
      : "";

  const updateDraft = useCallback(
    (content) => {
      // Monitoring roles cannot have drafts
      if (["manager", "super_admin"].includes(user?.role)) {
        return;
      }

      if (conversationId) {
        setMessageDraft(conversationId, content);
      }
    },
    [conversationId, setMessageDraft, user?.role]
  );

  const clearDraft = useCallback(() => {
    if (conversationId && !["manager", "super_admin"].includes(user?.role)) {
      setMessageDraft(conversationId, "");
    }
  }, [conversationId, setMessageDraft, user?.role]);

  // Search messages
  const searchConversationMessages = useCallback(
    async (query, filters = {}) => {
      if (!query.trim()) return [];

      try {
        console.log(
          "Searching messages in conversation:",
          conversationId,
          "query:",
          query
        );
        const results = await searchMessages(query, conversationId, filters);
        return results.messages || [];
      } catch (error) {
        console.error("Message search failed:", error);
        throw error;
      }
    },
    [conversationId, searchMessages]
  );

  // File upload progress
  const getUploadProgress = useCallback(() => {
    if (!conversationId) return new Map();
    return uploadingFiles.get(conversationId) || new Map();
  }, [conversationId, uploadingFiles]);

  // Check if user can edit/delete message - Updated for role-based permissions
  const canModifyMessage = useCallback(
    (message) => {
      if (!user || !message) return false;

      // Monitoring roles cannot modify messages
      if (["manager", "super_admin"].includes(user?.role)) {
        return false;
      }

      // Users can only modify their own messages
      if (message.senderId !== user.id) return false;

      // Check if message is not too old (e.g., 15 minutes)
      const messageAge = Date.now() - new Date(message.createdAt).getTime();
      const maxEditTime = 15 * 60 * 1000; // 15 minutes

      return messageAge < maxEditTime;
    },
    [user]
  );

  // Check if user can send messages - New function for role-based validation
  const canSendMessages = useCallback(() => {
    if (!user) return false;

    // Monitoring roles cannot send messages
    if (["manager", "super_admin"].includes(user?.role)) {
      return false;
    }

    return true;
  }, [user?.role]);

  // Get message status for display
  const getMessageDisplayStatus = useCallback(
    (message) => {
      if (!message) return null;

      const status = getMessageStatus(message.id);

      // For temporary messages, use the message's status
      if (message.isTemporary) {
        return message.status || "sending";
      }

      return status?.status || "sent";
    },
    [getMessageStatus]
  );

  // Retry failed message - Updated with role-based validation
  const retryMessage = useCallback(
    async (failedMessage) => {
      if (!failedMessage.isTemporary) return;

      // Role-based validation
      if (["manager", "super_admin"].includes(user?.role)) {
        throw new Error("Monitoring roles cannot retry messages");
      }

      try {
        console.log("Retrying failed message:", failedMessage.id);

        // Remove the failed temporary message
        const { tempMessages } = useChatStore.getState();
        const newTempMessages = new Map(tempMessages);
        newTempMessages.delete(failedMessage.id);
        useChatStore.setState({ tempMessages: newTempMessages });

        // Resend the message
        await sendTextMessage(failedMessage.content, failedMessage.replyToId);
      } catch (error) {
        console.error("Failed to retry message:", error);
        throw error;
      }
    },
    [sendTextMessage, user?.role]
  );

  // Clear conversation messages
  const clearMessages = useCallback(() => {
    if (conversationId) {
      console.log("Clearing messages for conversation:", conversationId);
      clearConversationMessages(conversationId);
    }
  }, [conversationId, clearConversationMessages]);

  // Get conversation context for monitoring roles
  const getConversationContext = useCallback(() => {
    if (!conversationId) return null;

    const conversation = getActiveConversation();
    if (!conversation) return null;

    // For monitoring roles, provide additional context
    if (["manager", "super_admin"].includes(user?.role)) {
      return {
        ...conversation,
        isMonitoring: true,
        canInteract: false,
      };
    }

    return {
      ...conversation,
      isMonitoring: false,
      canInteract: true,
    };
  }, [conversationId, getActiveConversation, user?.role]);

  return {
    // Message data
    messages: conversationMessages,
    hasMoreMessages: pagination.hasMore,
    isLoadingMessages: isLoading || pagination.loading,
    isSending,
    error,

    // Message operations
    sendTextMessage,
    sendFileMessage,
    editMessage: handleEditMessage,
    deleteMessage: handleDeleteMessage,
    retryMessage,
    loadMoreMessages,
    clearMessages,

    // Draft management
    draft,
    updateDraft,
    clearDraft,

    // File uploads
    uploadProgress: getUploadProgress(),

    // Search
    searchMessages: searchConversationMessages,
    searchResults,
    isSearching,
    searchQuery,

    // Utilities
    scrollToBottom,
    messagesEndRef,
    canModifyMessage,
    canSendMessages, // New function
    getMessageStatus: getMessageDisplayStatus,
    getConversationContext, // New function for monitoring
    clearError,

    // Status
    isConnected,
  };
};

export default useChat;

// // src/hooks/useChat.js
// import { useCallback, useEffect, useRef } from "react";
// import useChatStore from "../stores/chatStore";
// import useConversationStore from "../stores/conversationStore";
// import useAuthStore from "../stores/authStore";
// import useSocket from "./useSocket";

// const useChat = (conversationId = null) => {
//   const { user } = useAuthStore();
//   const { sendMessage: socketSendMessage, isConnected } = useSocket();

//   const {
//     messages,
//     messageStatuses,
//     tempMessages,
//     isLoading,
//     isSending,
//     error,
//     messageInputs,
//     uploadingFiles,
//     messagePagination,
//     searchResults,
//     isSearching,
//     searchQuery,
//     loadMessages,
//     sendMessage,
//     editMessage,
//     deleteMessage,
//     uploadFile,
//     setMessageDraft,
//     getMessageDraft,
//     searchMessages,
//     getConversationMessages,
//     getMessageStatus,
//     clearConversationMessages,
//     clearError,
//     addReceivedMessage,
//     updateMessageStatus,
//     replaceTemporaryMessage,
//   } = useChatStore();

//   const { getActiveConversation, updateLastMessage, markConversationAsRead } =
//     useConversationStore();

//   const messagesEndRef = useRef(null);
//   const lastMessageCountRef = useRef(0);

//   // Get messages for current conversation
//   const conversationMessages = conversationId
//     ? getConversationMessages(conversationId)
//     : [];
//   const pagination = messagePagination.get(conversationId) || {
//     page: 1,
//     hasMore: true,
//     loading: false,
//   };

//   // Auto-scroll to bottom when new messages arrive
//   const scrollToBottom = useCallback((smooth = true) => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({
//         behavior: smooth ? "smooth" : "auto",
//       });
//     }
//   }, []);

//   // Scroll to bottom when new messages arrive
//   useEffect(() => {
//     const currentMessageCount = conversationMessages.length;
//     const hadNewMessage = currentMessageCount > lastMessageCountRef.current;

//     if (hadNewMessage && conversationId) {
//       scrollToBottom();
//       lastMessageCountRef.current = currentMessageCount;
//     }
//   }, [conversationMessages.length, conversationId, scrollToBottom]);

//   // Load initial messages when conversation changes
//   useEffect(() => {
//     if (conversationId && !messages.has(conversationId)) {
//       loadMessages(conversationId, 1, true);
//     }
//   }, [conversationId, messages, loadMessages]);

//   // Mark conversation as read when viewing
//   useEffect(() => {
//     if (conversationId && conversationMessages.length > 0) {
//       markConversationAsRead(conversationId);
//     }
//   }, [conversationId, conversationMessages.length, markConversationAsRead]);

//   // Send a text message
//   const sendTextMessage = useCallback(
//     async (content, replyToId = null) => {
//       if (!conversationId || !content.trim()) {
//         throw new Error("Conversation ID and message content are required");
//       }

//       const messageData = {
//         conversationId,
//         content: content.trim(),
//         type: "text",
//         ...(replyToId && { replyToId }),
//       };

//       try {
//         const message = await sendMessage(conversationId, messageData);

//         // Clear draft after successful send
//         setMessageDraft(conversationId, "");

//         // Update conversation last message
//         updateLastMessage(conversationId, message);

//         return message;
//       } catch (error) {
//         console.error("Failed to send message:", error);
//         throw error;
//       }
//     },
//     [conversationId, sendMessage, setMessageDraft, updateLastMessage]
//   );

//   // Send a file message
//   const sendFileMessage = useCallback(
//     async (file, caption = "") => {
//       if (!conversationId || !file) {
//         throw new Error("Conversation ID and file are required");
//       }

//       try {
//         // Upload file first
//         const uploadResult = await uploadFile(conversationId, file);

//         // Send message with file data
//         const messageData = {
//           conversationId,
//           content: caption,
//           type: getFileMessageType(file.type),
//           fileUrl: uploadResult.fileUrl,
//           fileName: uploadResult.fileName,
//           fileSize: uploadResult.fileSize,
//           mimeType: file.type,
//         };

//         const message = await sendMessage(conversationId, messageData);
//         updateLastMessage(conversationId, message);

//         return message;
//       } catch (error) {
//         console.error("Failed to send file message:", error);
//         throw error;
//       }
//     },
//     [conversationId, uploadFile, sendMessage, updateLastMessage]
//   );

//   // Determine file message type
//   const getFileMessageType = (mimeType) => {
//     if (mimeType.startsWith("image/")) return "image";
//     if (mimeType.startsWith("video/")) return "video";
//     if (mimeType.startsWith("audio/")) return "audio";
//     return "file";
//   };

//   // Edit a message
//   const handleEditMessage = useCallback(
//     async (messageId, newContent) => {
//       if (!newContent.trim()) {
//         throw new Error("Message content cannot be empty");
//       }

//       try {
//         const updatedMessage = await editMessage(messageId, newContent.trim());

//         // Update last message if this was the latest message
//         const conversation = getActiveConversation();
//         if (conversation && conversation.lastMessage?.id === messageId) {
//           updateLastMessage(conversationId, updatedMessage);
//         }

//         return updatedMessage;
//       } catch (error) {
//         console.error("Failed to edit message:", error);
//         throw error;
//       }
//     },
//     [editMessage, getActiveConversation, updateLastMessage, conversationId]
//   );

//   // Delete a message
//   const handleDeleteMessage = useCallback(
//     async (messageId) => {
//       try {
//         await deleteMessage(messageId);

//         // If this was the last message, we might need to update conversation
//         const conversation = getActiveConversation();
//         if (conversation && conversation.lastMessage?.id === messageId) {
//           // Find the previous message to set as last message
//           const previousMessage = conversationMessages
//             .filter((msg) => msg.id !== messageId)
//             .pop();

//           if (previousMessage) {
//             updateLastMessage(conversationId, previousMessage);
//           }
//         }

//         return true;
//       } catch (error) {
//         console.error("Failed to delete message:", error);
//         throw error;
//       }
//     },
//     [
//       deleteMessage,
//       getActiveConversation,
//       conversationMessages,
//       updateLastMessage,
//       conversationId,
//     ]
//   );

//   // Load more messages (pagination)
//   const loadMoreMessages = useCallback(async () => {
//     if (!conversationId || pagination.loading || !pagination.hasMore) {
//       return;
//     }

//     try {
//       await loadMessages(conversationId, pagination.page + 1);
//     } catch (error) {
//       console.error("Failed to load more messages:", error);
//     }
//   }, [conversationId, pagination, loadMessages]);

//   // Message draft management
//   const draft = conversationId ? getMessageDraft(conversationId) : "";

//   const updateDraft = useCallback(
//     (content) => {
//       if (conversationId) {
//         setMessageDraft(conversationId, content);
//       }
//     },
//     [conversationId, setMessageDraft]
//   );

//   const clearDraft = useCallback(() => {
//     if (conversationId) {
//       setMessageDraft(conversationId, "");
//     }
//   }, [conversationId, setMessageDraft]);

//   // Search messages
//   const searchConversationMessages = useCallback(
//     async (query, filters = {}) => {
//       if (!query.trim()) return [];

//       try {
//         const results = await searchMessages(query, conversationId, filters);
//         return results.messages || [];
//       } catch (error) {
//         console.error("Message search failed:", error);
//         throw error;
//       }
//     },
//     [conversationId, searchMessages]
//   );

//   // File upload progress
//   const getUploadProgress = useCallback(() => {
//     if (!conversationId) return new Map();
//     return uploadingFiles.get(conversationId) || new Map();
//   }, [conversationId, uploadingFiles]);

//   // Check if user can edit/delete message
//   const canModifyMessage = useCallback(
//     (message) => {
//       if (!user || !message) return false;

//       // Users can only modify their own messages
//       if (message.senderId !== user.id) return false;

//       // Check if message is not too old (e.g., 15 minutes)
//       const messageAge = Date.now() - new Date(message.createdAt).getTime();
//       const maxEditTime = 15 * 60 * 1000; // 15 minutes

//       return messageAge < maxEditTime;
//     },
//     [user]
//   );

//   // Get message status for display
//   const getMessageDisplayStatus = useCallback(
//     (message) => {
//       if (!message) return null;

//       const status = getMessageStatus(message.id);

//       // For temporary messages, use the message's status
//       if (message.isTemporary) {
//         return message.status || "sending";
//       }

//       return status?.status || "sent";
//     },
//     [getMessageStatus]
//   );

//   // Retry failed message
//   const retryMessage = useCallback(
//     async (failedMessage) => {
//       if (!failedMessage.isTemporary) return;

//       try {
//         // Remove the failed temporary message
//         const { tempMessages } = useChatStore.getState();
//         const newTempMessages = new Map(tempMessages);
//         newTempMessages.delete(failedMessage.id);
//         useChatStore.setState({ tempMessages: newTempMessages });

//         // Resend the message
//         await sendTextMessage(failedMessage.content, failedMessage.replyToId);
//       } catch (error) {
//         console.error("Failed to retry message:", error);
//         throw error;
//       }
//     },
//     [sendTextMessage]
//   );

//   // Clear conversation messages
//   const clearMessages = useCallback(() => {
//     if (conversationId) {
//       clearConversationMessages(conversationId);
//     }
//   }, [conversationId, clearConversationMessages]);

//   return {
//     // Message data
//     messages: conversationMessages,
//     hasMoreMessages: pagination.hasMore,
//     isLoadingMessages: isLoading || pagination.loading,
//     isSending,
//     error,

//     // Message operations
//     sendTextMessage,
//     sendFileMessage,
//     editMessage: handleEditMessage,
//     deleteMessage: handleDeleteMessage,
//     retryMessage,
//     loadMoreMessages,
//     clearMessages,

//     // Draft management
//     draft,
//     updateDraft,
//     clearDraft,

//     // File uploads
//     uploadProgress: getUploadProgress(),

//     // Search
//     searchMessages: searchConversationMessages,
//     searchResults,
//     isSearching,
//     searchQuery,

//     // Utilities
//     scrollToBottom,
//     messagesEndRef,
//     canModifyMessage,
//     getMessageStatus: getMessageDisplayStatus,
//     clearError,

//     // Status
//     isConnected,
//   };
// };

// export default useChat;
