// src/hooks/useConversations.js
import { useCallback, useEffect, useMemo } from "react";
import useConversationStore from "../stores/conversationStore";
import useAuthStore from "../stores/authStore";
import useSocket from "./useSocket";
import apiService from "../services/api";

const useConversations = () => {
  const { user, hasPermission, canChatWith } = useAuthStore();
  const { joinConversation, leaveConversation } = useSocket();

  const {
    conversations,
    activeConversationId,
    isLoading,
    error,
    searchQuery,
    filterType,
    sortBy,
    monitoredConversations,
    isMonitoring,
    typingUsers,
    hasMore,
    currentPage,
    loadConversations,
    createConversation,
    setActiveConversation,
    updateConversation,
    markConversationAsRead,
    updateUnreadCount,
    updateLastMessage,
    setUserTyping,
    setSearchQuery,
    setFilterType,
    setSortBy,
    getFilteredConversations,
    loadMonitoredConversations,
    archiveConversation,
    getConversation,
    getActiveConversation,
    clearError,
  } = useConversationStore();

  // Load conversations on mount - Updated for role-based system
  useEffect(() => {
    if (user?.id && conversations.size === 0 && !isLoading) {
      loadConversations(1, true);
    }
  }, [user?.id]);

  // Get filtered and sorted conversations - Updated for role-based data
  const filteredConversations = useMemo(() => {
    const filtered = getFilteredConversations();

    // Apply search filter based on user role
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();

      return filtered.filter((item) => {
        switch (user?.role) {
          case "consultant":
            // For consultants, filter by student name or email
            return (
              item.name?.toLowerCase().includes(searchLower) ||
              item.email?.toLowerCase().includes(searchLower)
            );
          case "manager":
          case "super_admin":
            // For monitoring, filter by consultant name, student name, or display name
            return (
              item.displayName?.toLowerCase().includes(searchLower) ||
              item.consultantName?.toLowerCase().includes(searchLower) ||
              item.studentName?.toLowerCase().includes(searchLower) ||
              item.consultantEmail?.toLowerCase().includes(searchLower) ||
              item.studentEmail?.toLowerCase().includes(searchLower)
            );
          default:
            // For regular users, filter by conversation name
            return item.name?.toLowerCase().includes(searchLower);
        }
      });
    }

    return filtered;
  }, [
    getFilteredConversations,
    conversations,
    searchQuery,
    filterType,
    sortBy,
    user?.role,
  ]);

  // Create a new conversation - Updated for role-based permissions
  const handleCreateConversation = useCallback(
    async (participantIds, conversationData = {}) => {
      // Role-based restrictions
      if (user?.role === "consultant") {
        throw new Error("Consultants can only chat with assigned students");
      }

      if (["manager", "super_admin"].includes(user?.role)) {
        throw new Error("Monitoring roles cannot create new conversations");
      }

      if (!participantIds || participantIds.length === 0) {
        throw new Error("At least one participant is required");
      }

      // Validate that user can chat with all participants
      const canChatWithAll = participantIds.every((participantId) => {
        return canChatWith(participantId);
      });

      if (!canChatWithAll) {
        throw new Error(
          "You do not have permission to chat with some of these users"
        );
      }

      try {
        const conversation = await createConversation(
          participantIds,
          conversationData
        );
        return conversation;
      } catch (error) {
        console.error("Failed to create conversation:", error);
        throw error;
      }
    },
    [createConversation, canChatWith, user?.role]
  );

  // Switch to a conversation - Updated for role-based system
  const selectConversation = useCallback(
    async (conversationId) => {
      if (conversationId === activeConversationId) return;

      try {
        // For consultants, conversationId might be a lead ID
        // Need to get/create the actual conversation
        if (user?.role === "consultant") {
          // The conversationId is actually a lead (student) ID
          // Call the API to get or create the conversation
          const data = await apiService.get(
            `/conversations/lead/${conversationId}`,
          );

          console.log(data, 'sacnascansjacsnsanc');
          
          // const data = await response.json();
          const actualConversationId = data.data.id;

          setActiveConversation(actualConversationId);
        } else {
          // For other roles, use the conversation ID directly
          setActiveConversation(conversationId);
        }
      } catch (error) {
        console.error("Error selecting conversation:", error);
        throw error;
      }
    },
    [activeConversationId, setActiveConversation, user?.role]
  );

  // Find or create direct conversation with a user - Updated for role-based system
  const findOrCreateDirectConversation = useCallback(
    async (targetUserId, targetUserData = null) => {
      if (!targetUserId) {
        throw new Error("Target user ID is required");
      }

      // Role-based restrictions
      if (user?.role === "consultant") {
        // Consultants can only chat with assigned leads
        // This should be handled by the selectConversation method
        return selectConversation(targetUserId);
      }

      if (["manager", "super_admin"].includes(user?.role)) {
        throw new Error("Monitoring roles cannot create conversations");
      }

      // Look for existing direct conversation
      const existingConversation = Array.from(conversations.values()).find(
        (conv) => {
          const participants = Array.from(conv.participants.values());
          return (
            conv.type === "direct" &&
            participants.length === 2 &&
            participants.some((p) => p.userId === targetUserId) &&
            participants.some((p) => p.userId === user?.id)
          );
        }
      );

      if (existingConversation) {
        selectConversation(existingConversation.id);
        return existingConversation;
      }

      // Create new direct conversation
      const conversationData = {
        type: "direct",
        purpose: "general",
        name: targetUserData?.name || `Chat with User ${targetUserId}`,
      };

      try {
        const newConversation = await handleCreateConversation(
          [targetUserId],
          conversationData
        );
        return newConversation;
      } catch (error) {
        console.error("Failed to create direct conversation:", error);
        throw error;
      }
    },
    [
      conversations,
      user?.id,
      user?.role,
      selectConversation,
      handleCreateConversation,
    ]
  );

  // Load more conversations (pagination)
  const loadMoreConversations = useCallback(async () => {
    if (!hasMore || isLoading) return;

    try {
      await loadConversations(currentPage + 1);
    } catch (error) {
      console.error("Failed to load more conversations:", error);
    }
  }, [hasMore, isLoading, currentPage, loadConversations]);

  // Refresh conversations
  const refreshConversations = useCallback(async () => {
    try {
      await loadConversations(1, true);
    } catch (error) {
      console.error("Failed to refresh conversations:", error);
    }
  }, [loadConversations]);

  // Archive/unarchive conversation
  const handleArchiveConversation = useCallback(
    async (conversationId, archive = true) => {
      try {
        await archiveConversation(conversationId, archive);

        // If archiving the active conversation, clear it
        if (archive && conversationId === activeConversationId) {
          setActiveConversation(null);
        }
      } catch (error) {
        console.error("Failed to archive conversation:", error);
        throw error;
      }
    },
    [archiveConversation, activeConversationId, setActiveConversation]
  );

  // Search conversations
  const searchConversations = useCallback(
    (query) => {
      setSearchQuery(query);
    },
    [setSearchQuery]
  );

  // Filter conversations
  const filterConversations = useCallback(
    (filter) => {
      setFilterType(filter);
    },
    [setFilterType]
  );

  // Sort conversations
  const sortConversations = useCallback(
    (sortOption) => {
      setSortBy(sortOption);
    },
    [setSortBy]
  );

  // Get conversation participants info
  const getConversationParticipants = useCallback(
    (conversationId) => {
      const conversation = getConversation(conversationId);
      if (!conversation) return [];

      return Array.from(conversation.participants.values()).map(
        (participant) => ({
          ...participant,
          isCurrentUser: participant.userId === user?.id,
        })
      );
    },
    [getConversation, user?.id]
  );

  // Get conversation display name - Updated for role-based system
  const getConversationDisplayName = useCallback(
    (conversationOrItem) => {
      if (!conversationOrItem) return "";

      // Handle different data structures based on user role
      switch (user?.role) {
        case "consultant":
          // For consultants, item is a lead with student info
          return conversationOrItem.name || "Unknown Student";

        case "manager":
        case "super_admin":
          // For managers and super admins, item has displayName
          return conversationOrItem.displayName || "Unknown Conversation";

        default:
          // For regular users - standard conversation handling
          const conversation = conversationOrItem;

          if (conversation.name) {
            return conversation.name;
          }

          // For direct conversations, show other user's name
          if (conversation.type === "direct") {
            const participants = Array.from(
              conversation.participants?.values() || []
            );
            const otherParticipant = participants.find(
              (p) => p.userId !== user?.id
            );
            return otherParticipant?.user?.name || "Unknown User";
          }

          // For group conversations, show participant names
          const participants = Array.from(
            conversation.participants?.values() || []
          );
          const names = participants
            .filter((p) => p.userId !== user?.id)
            .map((p) => p.user?.name || "Unknown")
            .slice(0, 3);

          if (names.length === 0) return "You";
          if (names.length <= 2) return names.join(", ");
          return `${names.slice(0, 2).join(", ")} +${names.length - 2} others`;
      }
    },
    [user?.id, user?.role]
  );

  // Get unread conversations count - Updated for role-based data
  const unreadCount = useMemo(() => {
    return Array.from(conversations.values()).reduce(
      (total, item) => total + (item.unreadCount || 0),
      0
    );
  }, [conversations]);

  // Get typing users for active conversation
  const getTypingUsersInActiveConversation = useCallback(() => {
    if (!activeConversationId) return [];

    const typingUserIds = Array.from(
      typingUsers.get(activeConversationId) || []
    );
    const conversation = getConversation(activeConversationId);

    if (!conversation) return [];

    return typingUserIds
      .filter((userId) => userId !== user?.id)
      .map((userId) => {
        const participant = conversation.participants.get(userId);
        return participant?.user || { id: userId, name: "Unknown User" };
      });
  }, [activeConversationId, typingUsers, getConversation, user?.id]);

  // Monitoring functions (for managers/admins) - Updated for role-based system
  const loadConversationsForMonitoring = useCallback(
    async (officeId = null) => {
      if (!["manager", "super_admin"].includes(user?.role)) {
        throw new Error("You do not have permission to monitor conversations");
      }

      try {
        await loadMonitoredConversations(officeId);
      } catch (error) {
        console.error("Failed to load monitored conversations:", error);
        throw error;
      }
    },
    [user?.role, loadMonitoredConversations]
  );

  const getMonitoredConversations = useCallback(() => {
    return Array.from(monitoredConversations.values());
  }, [monitoredConversations]);

  // Check if user can perform actions - Updated for role-based permissions
  const canCreateConversation = useMemo(() => {
    // Only students and other non-monitoring roles can create conversations
    return (
      user && !["consultant", "manager", "super_admin"].includes(user.role)
    );
  }, [user]);

  const canArchiveConversation = useCallback(
    (conversationId) => {
      // Monitoring roles cannot archive conversations
      if (["manager", "super_admin"].includes(user?.role)) {
        return false;
      }

      const conversation = getConversation(conversationId);
      if (!conversation) return false;

      // Users can archive conversations they're part of
      return conversation.participants.has(user?.id);
    },
    [getConversation, user?.id, user?.role]
  );

  const canMonitorConversations = useMemo(() => {
    return ["manager", "super_admin"].includes(user?.role);
  }, [user?.role]);

  // Get conversation stats - Updated for role-based data
  const getConversationStats = useMemo(() => {
    const stats = {
      total: conversations.size,
      unread: 0,
      archived: 0,
      direct: 0,
      group: 0,
    };

    for (const item of conversations.values()) {
      if (item.unreadCount > 0) stats.unread++;
      if (item.isArchived) stats.archived++;

      // For role-based data, we might not have type info
      if (item.type === "direct") stats.direct++;
      if (item.type === "group") stats.group++;

      // For consultant role, all items are direct conversations with leads
      if (user?.role === "consultant") {
        stats.direct = stats.total;
      }
    }

    return stats;
  }, [conversations, user?.role]);

  return {
    // Conversation data
    conversations: filteredConversations,
    allConversations: Array.from(conversations.values()),
    activeConversation: getActiveConversation(),
    activeConversationId,
    isLoading,
    error,
    hasMore,
    unreadCount,

    // Conversation operations
    createConversation: handleCreateConversation,
    selectConversation,
    findOrCreateDirectConversation,
    archiveConversation: handleArchiveConversation,
    refreshConversations,
    loadMoreConversations,

    // Search and filtering
    searchQuery,
    filterType,
    sortBy,
    searchConversations,
    filterConversations,
    sortConversations,

    // Conversation info
    getConversationParticipants,
    getConversationDisplayName,
    getTypingUsersInActiveConversation,

    // Monitoring (admin/manager)
    isMonitoring,
    monitoredConversations: getMonitoredConversations(),
    loadConversationsForMonitoring,
    canMonitorConversations,

    // Permissions
    canCreateConversation,
    canArchiveConversation,

    // Stats
    conversationStats: getConversationStats,

    // Utilities
    clearError,
  };
};

export default useConversations;

// // src/hooks/useConversations.js
// import { useCallback, useEffect, useMemo } from "react";
// import useConversationStore from "../stores/conversationStore";
// import useAuthStore from "../stores/authStore";
// import useSocket from "./useSocket";

// const useConversations = () => {
//   const { user, hasPermission, canChatWith } = useAuthStore();
//   const { joinConversation, leaveConversation } = useSocket();

//   const {
//     conversations,
//     activeConversationId,
//     isLoading,
//     error,
//     searchQuery,
//     filterType,
//     sortBy,
//     monitoredConversations,
//     isMonitoring,
//     typingUsers,
//     hasMore,
//     currentPage,
//     loadConversations,
//     createConversation,
//     setActiveConversation,
//     updateConversation,
//     markConversationAsRead,
//     updateUnreadCount,
//     updateLastMessage,
//     setUserTyping,
//     setSearchQuery,
//     setFilterType,
//     setSortBy,
//     getFilteredConversations,
//     loadMonitoredConversations,
//     archiveConversation,
//     getConversation,
//     getActiveConversation,
//     clearError,
//   } = useConversationStore();

//   // Load conversations on mount
//   useEffect(() => {
//     if (conversations.size === 0 && !isLoading) {
//       loadConversations(1, true);
//     }
//   }, []);

//   // Get filtered and sorted conversations
//   const filteredConversations = useMemo(() => {
//     return getFilteredConversations();
//   }, [
//     getFilteredConversations,
//     conversations,
//     searchQuery,
//     filterType,
//     sortBy,
//   ]);

//   // Create a new conversation
//   const handleCreateConversation = useCallback(
//     async (participantIds, conversationData = {}) => {
//       if (!participantIds || participantIds.length === 0) {
//         throw new Error("At least one participant is required");
//       }

//       // Validate that user can chat with all participants
//       const canChatWithAll = participantIds.every((participantId) => {
//         // This would need to be enhanced with actual user data
//         return true; // For now, allow all
//       });

//       if (!canChatWithAll) {
//         throw new Error(
//           "You do not have permission to chat with some of these users"
//         );
//       }

//       try {
//         const conversation = await createConversation(
//           participantIds,
//           conversationData
//         );
//         return conversation;
//       } catch (error) {
//         console.error("Failed to create conversation:", error);
//         throw error;
//       }
//     },
//     [createConversation, canChatWith]
//   );

//   // Switch to a conversation
//   const selectConversation = useCallback(
//     (conversationId) => {
//       if (conversationId === activeConversationId) return;

//       setActiveConversation(conversationId);
//     },
//     [activeConversationId, setActiveConversation]
//   );

//   // Find or create direct conversation with a user
//   const findOrCreateDirectConversation = useCallback(
//     async (targetUserId, targetUserData = null) => {
//       if (!targetUserId) {
//         throw new Error("Target user ID is required");
//       }

//       // Look for existing direct conversation
//       const existingConversation = Array.from(conversations.values()).find(
//         (conv) => {
//           const participants = Array.from(conv.participants.values());
//           return (
//             conv.type === "direct" &&
//             participants.length === 2 &&
//             participants.some((p) => p.userId === targetUserId) &&
//             participants.some((p) => p.userId === user?.id)
//           );
//         }
//       );

//       if (existingConversation) {
//         selectConversation(existingConversation.id);
//         return existingConversation;
//       }

//       // Create new direct conversation
//       const conversationData = {
//         type: "direct",
//         name: targetUserData?.name || `Chat with User ${targetUserId}`,
//       };

//       try {
//         const newConversation = await handleCreateConversation(
//           [targetUserId],
//           conversationData
//         );
//         return newConversation;
//       } catch (error) {
//         console.error("Failed to create direct conversation:", error);
//         throw error;
//       }
//     },
//     [conversations, user?.id, selectConversation, handleCreateConversation]
//   );

//   // Load more conversations (pagination)
//   const loadMoreConversations = useCallback(async () => {
//     if (!hasMore || isLoading) return;

//     try {
//       await loadConversations(currentPage + 1);
//     } catch (error) {
//       console.error("Failed to load more conversations:", error);
//     }
//   }, [hasMore, isLoading, currentPage, loadConversations]);

//   // Refresh conversations
//   const refreshConversations = useCallback(async () => {
//     try {
//       await loadConversations(1, true);
//     } catch (error) {
//       console.error("Failed to refresh conversations:", error);
//     }
//   }, [loadConversations]);

//   // Archive/unarchive conversation
//   const handleArchiveConversation = useCallback(
//     async (conversationId, archive = true) => {
//       try {
//         await archiveConversation(conversationId, archive);

//         // If archiving the active conversation, clear it
//         if (archive && conversationId === activeConversationId) {
//           setActiveConversation(null);
//         }
//       } catch (error) {
//         console.error("Failed to archive conversation:", error);
//         throw error;
//       }
//     },
//     [archiveConversation, activeConversationId, setActiveConversation]
//   );

//   // Search conversations
//   const searchConversations = useCallback(
//     (query) => {
//       setSearchQuery(query);
//     },
//     [setSearchQuery]
//   );

//   // Filter conversations
//   const filterConversations = useCallback(
//     (filter) => {
//       setFilterType(filter);
//     },
//     [setFilterType]
//   );

//   // Sort conversations
//   const sortConversations = useCallback(
//     (sortOption) => {
//       setSortBy(sortOption);
//     },
//     [setSortBy]
//   );

//   // Get conversation participants info
//   const getConversationParticipants = useCallback(
//     (conversationId) => {
//       const conversation = getConversation(conversationId);
//       if (!conversation) return [];

//       return Array.from(conversation.participants.values()).map(
//         (participant) => ({
//           ...participant,
//           isCurrentUser: participant.userId === user?.id,
//         })
//       );
//     },
//     [getConversation, user?.id]
//   );

//   // Get conversation display name
//   const getConversationDisplayName = useCallback(
//     (conversation) => {
//       if (!conversation) return "";

//       if (conversation.name) {
//         return conversation.name;
//       }

//       // For direct conversations, show other user's name
//       if (conversation.type === "direct") {
//         const participants = Array.from(conversation.participants.values());
//         const otherParticipant = participants.find(
//           (p) => p.userId !== user?.id
//         );
//         return otherParticipant?.user?.name || "Unknown User";
//       }

//       // For group conversations, show participant names
//       const participants = Array.from(conversation.participants.values());
//       const names = participants
//         .filter((p) => p.userId !== user?.id)
//         .map((p) => p.user?.name || "Unknown")
//         .slice(0, 3);

//       if (names.length === 0) return "You";
//       if (names.length <= 2) return names.join(", ");
//       return `${names.slice(0, 2).join(", ")} +${names.length - 2} others`;
//     },
//     [user?.id]
//   );

//   // Get unread conversations count
//   const unreadCount = useMemo(() => {
//     return Array.from(conversations.values()).reduce(
//       (total, conv) => total + (conv.unreadCount || 0),
//       0
//     );
//   }, [conversations]);

//   // Get typing users for active conversation
//   const getTypingUsersInActiveConversation = useCallback(() => {
//     if (!activeConversationId) return [];

//     const typingUserIds = Array.from(
//       typingUsers.get(activeConversationId) || []
//     );
//     const conversation = getConversation(activeConversationId);

//     if (!conversation) return [];

//     return typingUserIds
//       .filter((userId) => userId !== user?.id)
//       .map((userId) => {
//         const participant = conversation.participants.get(userId);
//         return participant?.user || { id: userId, name: "Unknown User" };
//       });
//   }, [activeConversationId, typingUsers, getConversation, user?.id]);

//   // Monitoring functions (for managers/admins)
//   const loadConversationsForMonitoring = useCallback(
//     async (officeId = null) => {
//       if (
//         !hasPermission("view_office_conversations") &&
//         !hasPermission("view_all_conversations")
//       ) {
//         throw new Error("You do not have permission to monitor conversations");
//       }

//       try {
//         await loadMonitoredConversations(officeId);
//       } catch (error) {
//         console.error("Failed to load monitored conversations:", error);
//         throw error;
//       }
//     },
//     [hasPermission, loadMonitoredConversations]
//   );

//   const getMonitoredConversations = useCallback(() => {
//     return Array.from(monitoredConversations.values());
//   }, [monitoredConversations]);

//   // Check if user can perform actions
//   const canCreateConversation = useMemo(() => {
//     return user && user.role !== "lead"; // Leads can only chat with assigned consultants
//   }, [user]);

//   const canArchiveConversation = useCallback(
//     (conversationId) => {
//       const conversation = getConversation(conversationId);
//       if (!conversation) return false;

//       // Users can archive conversations they're part of
//       return conversation.participants.has(user?.id);
//     },
//     [getConversation, user?.id]
//   );

//   const canMonitorConversations = useMemo(() => {
//     return (
//       hasPermission("view_office_conversations") ||
//       hasPermission("view_all_conversations")
//     );
//   }, [hasPermission]);

//   // Get conversation stats
//   const getConversationStats = useMemo(() => {
//     const stats = {
//       total: conversations.size,
//       unread: 0,
//       archived: 0,
//       direct: 0,
//       group: 0,
//     };

//     for (const conversation of conversations.values()) {
//       if (conversation.unreadCount > 0) stats.unread++;
//       if (conversation.isArchived) stats.archived++;
//       if (conversation.type === "direct") stats.direct++;
//       if (conversation.type === "group") stats.group++;
//     }

//     return stats;
//   }, [conversations]);

//   return {
//     // Conversation data
//     conversations: filteredConversations,
//     allConversations: Array.from(conversations.values()),
//     activeConversation: getActiveConversation(),
//     activeConversationId,
//     isLoading,
//     error,
//     hasMore,
//     unreadCount,

//     // Conversation operations
//     createConversation: handleCreateConversation,
//     selectConversation,
//     findOrCreateDirectConversation,
//     archiveConversation: handleArchiveConversation,
//     refreshConversations,
//     loadMoreConversations,

//     // Search and filtering
//     searchQuery,
//     filterType,
//     sortBy,
//     searchConversations,
//     filterConversations,
//     sortConversations,

//     // Conversation info
//     getConversationParticipants,
//     getConversationDisplayName,
//     getTypingUsersInActiveConversation,

//     // Monitoring (admin/manager)
//     isMonitoring,
//     monitoredConversations: getMonitoredConversations(),
//     loadConversationsForMonitoring,
//     canMonitorConversations,

//     // Permissions
//     canCreateConversation,
//     canArchiveConversation,

//     // Stats
//     conversationStats: getConversationStats,

//     // Utilities
//     clearError,
//   };
// };

// export default useConversations;
