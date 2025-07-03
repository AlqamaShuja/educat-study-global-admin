import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Users,
  Star,
  Archive,
  Filter,
  Plus,
  Pin,
  Trash2,
  MoreVertical,
  User,
  MessageCircle,
  Clock,
} from "lucide-react";
import apiService from "../../services/api";

const ConversationList = ({
  conversations = [],
  activeConversationId = null,
  currentUser = null,
  onConversationSelect,
  onNewConversation,
  searchQuery = "",
  onSearchChange,
  filterType = "all",
  onFilterChange,
  sortBy = "lastMessage",
  onSortChange,
  typingUsers = new Map(),
  onlineUsers = new Map(),
  isLoading = false,
  hasMore = false,
  onLoadMore,
  className = "",
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const listRef = useRef(null);

  console.log(conversations, "conversations data:");
  console.log("conversations length:", conversations.length);
  console.log(currentUser, "current user:");

  // Handle conversation selection - Updated for role-based handling
  const handleConversationClick = async (item) => {
    if (selectedConversations.size > 0) {
      // Multi-select mode
      toggleConversationSelection(item.id);
      return;
    }

    try {
      let conversationId;

      // Handle different data structures based on user role
      if (currentUser?.role === "consultant") {
        // For consultants, item is a lead, need to get/create conversation
        const data = await apiService.get(`/conversations/lead/${item.id}`);

        console.log(data, "=ascasjcasjbcas:data");
        
        // if (!response.ok) {
        //   throw new Error("Failed to get conversation");
        // }

        // const data = await response.json();
        conversationId = data.data.id;
      } else {
        // For managers, super admins, and students, use existing conversation ID
        conversationId = item.id;
      }

      onConversationSelect(conversationId);
    } catch (error) {
      console.error("Error selecting conversation:", error);
    }
  };

  // Toggle conversation selection for bulk actions
  const toggleConversationSelection = (conversationId) => {
    const newSelected = new Set(selectedConversations);
    if (newSelected.has(conversationId)) {
      newSelected.delete(conversationId);
    } else {
      newSelected.add(conversationId);
    }
    setSelectedConversations(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedConversations(new Set());
    setShowBulkActions(false);
  };

  // Get conversation display name - Updated for role-based data
  const getConversationDisplayName = (item) => {
    // Handle different data structures based on user role
    switch (currentUser?.role) {
      case "consultant":
        // For consultants, item is a lead with student info
        return item.name || "Unknown Student";

      case "manager":
      case "super_admin":
        // For managers and super admins, item has displayName
        return item.displayName || "Unknown Conversation";

      default:
        // For students and other roles - regular conversation handling
        if (item.name) {
          return item.name;
        }

        // Handle participants for regular conversations
        let participants = [];
        if (item.participants) {
          if (Array.isArray(item.participants)) {
            participants = item.participants;
          } else if (
            typeof item.participants === "object" &&
            item.participants !== null
          ) {
            participants = Object.values(item.participants);
          }
        }

        if (item.type === "direct") {
          const otherParticipant = participants.find(
            (p) => p.userId !== currentUser?.id
          );

          if (otherParticipant?.User?.name) {
            return otherParticipant.User.name;
          }

          if (otherParticipant?.user?.name) {
            return otherParticipant.user.name;
          }

          // Fallback based on purpose
          if (item.purpose === "lead_consultant") {
            const userParticipant = participants.find(
              (p) => p.userId === currentUser?.id
            );
            if (
              userParticipant?.User?.role === "student" ||
              userParticipant?.user?.role === "student"
            ) {
              return "Your Consultant";
            } else {
              return "Student Chat";
            }
          }

          return "Direct Chat";
        }

        // Group conversation
        const otherParticipants = participants.filter(
          (p) => p.userId !== currentUser?.id
        );

        if (otherParticipants.length <= 2) {
          return otherParticipants
            .map((p) => p.User?.name || p.user?.name || "Unknown")
            .join(", ");
        }

        const names = otherParticipants
          .slice(0, 2)
          .map((p) => p.User?.name || p.user?.name || "Unknown");
        return `${names.join(", ")} +${otherParticipants.length - 2} others`;
    }
  };

  // Get conversation subtitle - New function for additional info
  const getConversationSubtitle = (item) => {
    switch (currentUser?.role) {
      case "consultant":
        return item.email || "";

      case "manager":
        return `${item.consultantEmail} • ${item.studentEmail}`;

      case "super_admin":
        return `${item.consultantEmail} • ${item.studentEmail}${
          item.officeName ? ` • ${item.officeName}` : ""
        }`;

      default:
        return "";
    }
  };

  // Get conversation avatar - Updated for role-based data
  const getConversationAvatar = (item) => {
    switch (currentUser?.role) {
      case "consultant":
        // For consultants, show student avatar
        return {
          name: item.name,
          email: item.email,
          role: "student",
        };

      case "manager":
      case "super_admin":
        // For monitoring, show a conversation icon
        return null;

      default:
        // Regular conversation handling
        let participants = [];
        if (item.participants) {
          if (Array.isArray(item.participants)) {
            participants = item.participants;
          } else if (
            typeof item.participants === "object" &&
            item.participants !== null
          ) {
            participants = Object.values(item.participants);
          }
        }

        if (item.type === "direct") {
          const otherParticipant = participants.find(
            (p) => p.userId !== currentUser?.id
          );
          return otherParticipant?.User || otherParticipant?.user;
        }

        return null;
    }
  };

  // Format last message preview - Updated for role-based data
  const getLastMessagePreview = (item) => {
    if (item.lastMessage) {
      const sender =
        item.lastMessage.senderId === currentUser?.id
          ? "You"
          : item.lastMessage.sender?.name || "Unknown";

      switch (item.lastMessage.type) {
        case "image":
          return `${sender}: 📷 Photo`;
        case "video":
          return `${sender}: 🎥 Video`;
        case "audio":
          return `${sender}: 🎵 Audio`;
        case "file":
          return `${sender}: 📎 ${item.lastMessage.fileName || "File"}`;
        case "text":
        default:
          return `${sender}: ${item.lastMessage.content}`;
      }
    }

    // Handle different roles when no last message
    switch (currentUser?.role) {
      case "consultant":
        return item.hasConversation ? "Start chatting..." : "No messages yet";
      case "manager":
      case "super_admin":
        return "No recent messages";
      default:
        return "No messages yet";
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString();
  };

  // Check if user is online
  const isUserOnline = (userId) => {
    if (!userId) return false;
    const userStatus = onlineUsers.get(userId);
    return userStatus?.status === "online";
  };

  // Get typing users for conversation
  const getConversationTypingUsers = (conversationId) => {
    const typing = typingUsers.get(conversationId) || new Set();
    return Array.from(typing).filter((userId) => userId !== currentUser?.id);
  };

  // Infinite scroll handler
  const handleScroll = () => {
    if (!listRef.current || !hasMore || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      onLoadMore?.();
    }
  };

  useEffect(() => {
    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener("scroll", handleScroll);
      return () => listElement.removeEventListener("scroll", handleScroll);
    }
  }, [hasMore, isLoading]);

  // Get header title based on user role
  const getHeaderTitle = () => {
    switch (currentUser?.role) {
      case "consultant":
        return "My Students";
      case "manager":
        return "Office Conversations";
      case "super_admin":
        return "All Conversations";
      default:
        return "Messages";
    }
  };

  // Filter options
  const filterOptions = [
    { value: "all", label: "All", icon: MessageSquare },
    { value: "unread", label: "Unread", icon: Star },
    { value: "groups", label: "Groups", icon: Users },
    { value: "archived", label: "Archived", icon: Archive },
  ];

  // Sort options
  const sortOptions = [
    { value: "lastMessage", label: "Recent Activity" },
    { value: "name", label: "Name" },
    { value: "createdAt", label: "Date Created" },
  ];

  return (
    <div
      className={`flex flex-col h-full bg-white border-r border-gray-200 ${className}`}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {getHeaderTitle()}
          </h2>
          {/* <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
            {!["manager", "super_admin"].includes(currentUser?.role) && (
              <button
                onClick={onNewConversation}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div> */}
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Search ${getHeaderTitle().toLowerCase()}...`}
            className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <MessageSquare className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 space-y-3">
            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {filterOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => onFilterChange(option.value)}
                    className={`
                      flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${
                        filterType === option.value
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{option.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {showBulkActions && (
        <div className="flex-shrink-0 bg-blue-50 border-b border-blue-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700">
              {selectedConversations.size} selected
            </span>
            <div className="flex items-center space-x-2">
              <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                <Archive className="w-4 h-4" />
              </button>
              <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                <Pin className="w-4 h-4" />
              </button>
              <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={clearSelection}
                className="ml-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-100 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conversation List */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {currentUser?.role === "consultant" && "No assigned students"}
              {currentUser?.role === "manager" &&
                "No conversations in your office"}
              {currentUser?.role === "super_admin" && "No conversations found"}
              {!["consultant", "manager", "super_admin"].includes(
                currentUser?.role
              ) && "No conversations"}
            </h3>
            <p className="text-gray-500 mb-4">
              {currentUser?.role === "consultant" &&
                "Students will appear here when assigned to you."}
              {currentUser?.role === "manager" &&
                "Conversations will appear when consultants chat with students."}
              {currentUser?.role === "super_admin" &&
                "All system conversations will appear here."}
              {!["consultant", "manager", "super_admin"].includes(
                currentUser?.role
              ) && "Start a new conversation to get chatting!"}
            </p>
            {!["manager", "super_admin"].includes(currentUser?.role) && (
              <button
                onClick={onNewConversation}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Start Conversation
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((item) => {
              const isActive = item.id === activeConversationId;
              const isSelected = selectedConversations.has(item.id);
              const avatar = getConversationAvatar(item);
              const subtitle = getConversationSubtitle(item);

              return (
                <div
                  key={item.id}
                  onClick={() => handleConversationClick(item)}
                  className={`
                    relative flex items-center px-4 py-3 cursor-pointer transition-colors group
                    ${
                      isActive
                        ? "bg-blue-50 border-r-2 border-blue-500"
                        : "hover:bg-gray-50"
                    }
                    ${isSelected ? "bg-blue-100" : ""}
                  `}
                >
                  {/* Selection Checkbox */}
                  {showBulkActions && (
                    <div className="mr-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleConversationSelection(item.id)}
                        className="text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="flex-shrink-0 mr-3">
                    {avatar ? (
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-purple-600" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className={`text-sm font-medium truncate ${
                          isActive ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        {getConversationDisplayName(item)}
                      </h3>

                      <div className="flex items-center space-x-1 ml-2">
                        {/* Unread Count */}
                        {item.unreadCount > 0 && (
                          <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {item.unreadCount > 99 ? "99+" : item.unreadCount}
                          </div>
                        )}

                        {/* Status indicators for consultants */}
                        {currentUser?.role === "consultant" && (
                          <div
                            className={`w-3 h-3 rounded-full ${
                              item.hasConversation
                                ? "bg-green-400"
                                : "bg-gray-300"
                            }`}
                            title={
                              item.hasConversation
                                ? "Active conversation"
                                : "No conversation yet"
                            }
                          />
                        )}
                      </div>
                    </div>

                    {/* Subtitle */}
                    {subtitle && (
                      <p className="text-xs text-gray-500 truncate mb-1">
                        {subtitle}
                      </p>
                    )}

                    {/* Last Message */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 truncate flex-1">
                        {getLastMessagePreview(item)}
                      </p>

                      {/* Timestamp */}
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        {formatTimestamp(item.lastMessageAt || item.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Context Menu Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle context menu
                    }}
                    className="ml-2 p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 rounded transition-all"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;

// import React, { useState, useEffect, useRef } from "react";
// import {
//   Plus,
//   Search,
//   MoreVertical,
//   Archive,
//   Pin,
//   Trash2,
//   Settings,
//   Filter,
//   MessageSquare,
//   Users,
//   Star,
// } from "lucide-react";
// import Avatar, { AvatarGroup } from "../ui/Avatar";
// import OnlineStatus, { formatLastSeen } from "./OnlineStatus";
// import TypingIndicator, { MinimalTypingIndicator } from "./TypingIndicator";
// import SearchInput from "./SearchInput";
// import MessageStatus from "./MessageStatus";

// const ConversationList = ({
//   conversations = [],
//   activeConversationId = null,
//   currentUser = null,
//   onConversationSelect,
//   onNewConversation,
//   searchQuery = "",
//   onSearchChange,
//   filterType = "all",
//   onFilterChange,
//   sortBy = "lastMessage",
//   onSortChange,
//   typingUsers = new Map(),
//   onlineUsers = new Map(),
//   isLoading = false,
//   hasMore = false,
//   onLoadMore,
//   className = "",
// }) => {
//   const [showFilters, setShowFilters] = useState(false);
//   const [selectedConversations, setSelectedConversations] = useState(new Set());
//   const [showBulkActions, setShowBulkActions] = useState(false);
//   const listRef = useRef(null);

//   console.log(conversations, "conversations data:");
//   console.log("conversations length:", conversations.length);
//   console.log(currentUser, "current user:");

//   // Handle conversation selection
//   const handleConversationClick = (conversation) => {
//     if (selectedConversations.size > 0) {
//       // Multi-select mode
//       toggleConversationSelection(conversation.id);
//     } else {
//       // Normal selection
//       onConversationSelect(conversation.id);
//     }
//   };

//   // Toggle conversation selection for bulk actions
//   const toggleConversationSelection = (conversationId) => {
//     const newSelected = new Set(selectedConversations);
//     if (newSelected.has(conversationId)) {
//       newSelected.delete(conversationId);
//     } else {
//       newSelected.add(conversationId);
//     }
//     setSelectedConversations(newSelected);
//     setShowBulkActions(newSelected.size > 0);
//   };

//   // Clear selection
//   const clearSelection = () => {
//     setSelectedConversations(new Set());
//     setShowBulkActions(false);
//   };

//   // Get conversation display name - Fixed for your data structure
//   const getConversationDisplayName = (conversation) => {
//     // If conversation has a name, use it
//     if (conversation.name) {
//       return conversation.name;
//     }

//     // Handle participants - check if it's an object or array
//     let participants = [];
//     if (conversation.participants) {
//       if (Array.isArray(conversation.participants)) {
//         participants = conversation.participants;
//       } else if (
//         typeof conversation.participants === "object" &&
//         conversation.participants !== null
//       ) {
//         // If participants is an object, convert to array
//         participants = Object.values(conversation.participants);
//       }
//     }

//     console.log(
//       "Participants for conversation:",
//       conversation.id,
//       participants
//     );

//     if (conversation.type === "direct") {
//       // For direct conversations, find the other participant
//       const otherParticipant = participants.find(
//         (p) => p.userId !== currentUser?.id
//       );

//       console.log("Other participant:", otherParticipant);

//       if (otherParticipant?.User?.name) {
//         return otherParticipant.User.name;
//       }

//       // Also try lowercase 'user' in case the association is different
//       if (otherParticipant?.user?.name) {
//         return otherParticipant.user.name;
//       }

//       // Fallback based on purpose and role
//       if (conversation.purpose === "lead_consultant") {
//         // Try to determine if current user is lead or consultant
//         const userParticipant = participants.find(
//           (p) => p.userId === currentUser?.id
//         );
//         if (
//           userParticipant?.User?.role === "lead" ||
//           userParticipant?.user?.role === "lead"
//         ) {
//           return "Your Consultant";
//         } else {
//           return "Lead Chat";
//         }
//       }

//       if (conversation.purpose === "manager_consultant") {
//         return "Manager Chat";
//       }

//       if (conversation.purpose === "manager_receptionist") {
//         return "Manager Chat";
//       }

//       return `Direct Chat`;
//     }

//     // Group conversation
//     const otherParticipants = participants.filter(
//       (p) => p.userId !== currentUser?.id
//     );

//     if (otherParticipants.length === 0) {
//       // No participant data available - show a meaningful fallback
//       return `Group Chat`;
//     }

//     if (otherParticipants.length <= 2) {
//       return otherParticipants
//         .map((p) => p.User?.name || p.user?.name || "Unknown")
//         .join(", ");
//     }

//     const names = otherParticipants
//       .slice(0, 2)
//       .map((p) => p.User?.name || p.user?.name || "Unknown");
//     return `${names.join(", ")} +${otherParticipants.length - 2} others`;
//   };

//   // Get conversation avatar(s) - Fixed for your data structure
//   const getConversationAvatars = (conversation) => {
//     // Handle participants - check if it's an object or array
//     let participants = [];
//     if (conversation.participants) {
//       if (Array.isArray(conversation.participants)) {
//         participants = conversation.participants;
//       } else if (
//         typeof conversation.participants === "object" &&
//         conversation.participants !== null
//       ) {
//         participants = Object.values(conversation.participants);
//       }
//     }

//     if (conversation.type === "direct") {
//       const otherParticipant = participants.find(
//         (p) => p.userId !== currentUser?.id
//       );

//       // Handle both User and user associations
//       const user = otherParticipant?.User || otherParticipant?.user;
//       return user ? [user] : [];
//     }

//     // Group conversation - show multiple avatars
//     return participants
//       .filter((p) => p.userId !== currentUser?.id)
//       .map((p) => p.User || p.user) // Handle both User and user associations
//       .filter((user) => user) // Remove undefined users
//       .slice(0, 3);
//   };

//   // Format last message preview - Updated for your data structure
//   const getLastMessagePreview = (conversation) => {
//     // Since your data doesn't have lastMessage populated, check for lastMessageId
//     if (!conversation.lastMessageId) {
//       return "No messages yet";
//     }

//     // You might want to fetch the actual message content later
//     // For now, just show that there are messages
//     return "New message";

//     // This is the original code for when you have full message data:
//     /*
//     const lastMessage = conversation.lastMessage;
//     if (!lastMessage) return "No messages yet";

//     const sender =
//       lastMessage.senderId === currentUser?.id
//         ? "You"
//         : lastMessage.sender?.name || "Unknown";

//     switch (lastMessage.type) {
//       case "image":
//         return `${sender}: 📷 Photo`;
//       case "video":
//         return `${sender}: 🎥 Video`;
//       case "audio":
//         return `${sender}: 🎵 Audio`;
//       case "file":
//         return `${sender}: 📎 ${lastMessage.fileName || "File"}`;
//       case "text":
//       default:
//         return `${sender}: ${lastMessage.content}`;
//     }
//     */
//   };

//   // Check if user is online
//   const isUserOnline = (userId) => {
//     if (!userId) return false;
//     const userStatus = onlineUsers.get(userId);
//     return userStatus?.status === "online";
//   };

//   // Get typing users for conversation
//   const getConversationTypingUsers = (conversationId) => {
//     const typing = typingUsers.get(conversationId) || new Set();
//     return Array.from(typing).filter((userId) => userId !== currentUser?.id);
//   };

//   // Infinite scroll handler
//   const handleScroll = () => {
//     if (!listRef.current || !hasMore || isLoading) return;

//     const { scrollTop, scrollHeight, clientHeight } = listRef.current;
//     if (scrollTop + clientHeight >= scrollHeight - 100) {
//       onLoadMore?.();
//     }
//   };

//   useEffect(() => {
//     const listElement = listRef.current;
//     if (listElement) {
//       listElement.addEventListener("scroll", handleScroll);
//       return () => listElement.removeEventListener("scroll", handleScroll);
//     }
//   }, [hasMore, isLoading]);

//   // Filter options
//   const filterOptions = [
//     { value: "all", label: "All Conversations", icon: MessageSquare },
//     { value: "unread", label: "Unread", icon: Star },
//     { value: "groups", label: "Groups", icon: Users },
//     { value: "archived", label: "Archived", icon: Archive },
//   ];

//   // Sort options
//   const sortOptions = [
//     { value: "lastMessage", label: "Recent Activity" },
//     { value: "name", label: "Name" },
//     { value: "createdAt", label: "Date Created" },
//   ];

//   return (
//     <div
//       className={`flex flex-col h-full bg-white border-r border-gray-200 ${className}`}
//     >
//       {/* Header */}
//       <div className="flex-shrink-0 p-2 border-b border-gray-200">
//         {/* <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className={`p-2 rounded-lg transition-colors ${
//                 showFilters
//                   ? "bg-blue-100 text-blue-600"
//                   : "text-gray-500 hover:bg-gray-100"
//               }`}
//             >
//               <Filter className="w-5 h-5" />
//             </button>
//             <button
//               onClick={onNewConversation}
//               className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//             >
//               <Plus className="w-5 h-5" />
//             </button>
//           </div>
//         </div> */}

//         {/* Search */}
//         <SearchInput
//           value={searchQuery}
//           onChange={onSearchChange}
//           placeholder="Search conversations..."
//           className="mb-3"
//         />

//         {/* Filters */}
//         {showFilters && (
//           <div className="space-y-3">
//             {/* Filter Tabs */}
//             <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
//               {filterOptions.map((option) => {
//                 const Icon = option.icon;
//                 return (
//                   <button
//                     key={option.value}
//                     onClick={() => onFilterChange(option.value)}
//                     className={`
//                       flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
//                       ${
//                         filterType === option.value
//                           ? "bg-white text-blue-600 shadow-sm"
//                           : "text-gray-600 hover:text-gray-900"
//                       }
//                     `}
//                   >
//                     <Icon className="w-4 h-4" />
//                     <span className="hidden sm:inline">{option.label}</span>
//                   </button>
//                 );
//               })}
//             </div>

//             {/* Sort Options */}
//             <select
//               value={sortBy}
//               onChange={(e) => onSortChange(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               {sortOptions.map((option) => (
//                 <option key={option.value} value={option.value}>
//                   Sort by {option.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}
//       </div>

//       {/* Bulk Actions */}
//       {showBulkActions && (
//         <div className="flex-shrink-0 bg-blue-50 border-b border-blue-200 px-4 py-3">
//           <div className="flex items-center justify-between">
//             <span className="text-sm font-medium text-blue-700">
//               {selectedConversations.size} selected
//             </span>
//             <div className="flex items-center space-x-2">
//               <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
//                 <Archive className="w-4 h-4" />
//               </button>
//               <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
//                 <Pin className="w-4 h-4" />
//               </button>
//               <button className="p-1 text-red-600 hover:bg-red-100 rounded">
//                 <Trash2 className="w-4 h-4" />
//               </button>
//               <button
//                 onClick={clearSelection}
//                 className="ml-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-100 rounded"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Conversation List */}
//       <div ref={listRef} className="flex-1 overflow-y-auto">
//         {conversations.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-full p-8 text-center">
//             <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">
//               No conversations
//             </h3>
//             <p className="text-gray-500 mb-4">
//               Start a new conversation to get chatting!
//             </p>
//             <button
//               onClick={onNewConversation}
//               className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//             >
//               Start Conversation
//             </button>
//           </div>
//         ) : (
//           <div className="divide-y divide-gray-100">
//             {conversations.map((conversation) => {
//               const isActive = conversation.id === activeConversationId;
//               const isSelected = selectedConversations.has(conversation.id);
//               const avatars = getConversationAvatars(conversation);
//               const typingUserIds = getConversationTypingUsers(conversation.id);
//               const hasTyping = typingUserIds.length > 0;

//               return (
//                 <div
//                   key={conversation.id}
//                   onClick={() => handleConversationClick(conversation)}
//                   className={`
//                     relative flex items-center px-4 py-3 cursor-pointer transition-colors group
//                     ${
//                       isActive
//                         ? "bg-blue-50 border-r-2 border-blue-500"
//                         : "hover:bg-gray-50"
//                     }
//                     ${isSelected ? "bg-blue-100" : ""}
//                   `}
//                 >
//                   {/* Selection Checkbox */}
//                   {showBulkActions && (
//                     <div className="mr-3">
//                       <input
//                         type="checkbox"
//                         checked={isSelected}
//                         onChange={() =>
//                           toggleConversationSelection(conversation.id)
//                         }
//                         className="text-blue-600 rounded focus:ring-blue-500"
//                       />
//                     </div>
//                   )}

//                   {/* Avatar */}
//                   <div className="flex-shrink-0 mr-3">
//                     {conversation.type === "direct" && avatars.length > 0 ? (
//                       <Avatar
//                         user={avatars[0]}
//                         size="md"
//                         online={isUserOnline(avatars[0]?.id)}
//                       />
//                     ) : avatars.length > 0 ? (
//                       <AvatarGroup
//                         users={avatars}
//                         size="md"
//                         max={2}
//                         showCount={false}
//                       />
//                     ) : (
//                       // Fallback avatar when no participant data
//                       <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
//                         {conversation.type === "direct" ? (
//                           <Users className="w-5 h-5 text-gray-500" />
//                         ) : (
//                           <MessageSquare className="w-5 h-5 text-gray-500" />
//                         )}
//                       </div>
//                     )}
//                   </div>

//                   {/* Content */}
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center justify-between mb-1">
//                       <h3
//                         className={`
//                         text-sm font-medium truncate
//                         ${isActive ? "text-blue-900" : "text-gray-900"}
//                       `}
//                       >
//                         {getConversationDisplayName(conversation)}
//                       </h3>

//                       <div className="flex items-center space-x-1 ml-2">
//                         {/* Unread Count */}
//                         {conversation.unreadCount > 0 && (
//                           <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
//                             {conversation.unreadCount > 99
//                               ? "99+"
//                               : conversation.unreadCount}
//                           </div>
//                         )}

//                         {/* Last Message Status */}
//                         {conversation.lastMessage?.senderId ===
//                           currentUser?.id && (
//                           <MessageStatus
//                             status={conversation.lastMessage.status || "sent"}
//                             size="xs"
//                             showText={false}
//                           />
//                         )}

//                         {/* Pinned Indicator */}
//                         {conversation.isPinned && (
//                           <Pin className="w-3 h-3 text-yellow-500" />
//                         )}
//                       </div>
//                     </div>

//                     {/* Last Message or Typing Indicator */}
//                     <div className="flex items-center justify-between">
//                       <div className="flex-1 min-w-0">
//                         {hasTyping ? (
//                           <MinimalTypingIndicator
//                             typingUsers={typingUserIds.map((id) => ({
//                               id,
//                               name: "User",
//                             }))}
//                           />
//                         ) : (
//                           <p className="text-sm text-gray-500 truncate">
//                             {getLastMessagePreview(conversation)}
//                           </p>
//                         )}
//                       </div>

//                       {/* Timestamp */}
//                       {conversation.lastMessageAt && !hasTyping && (
//                         <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
//                           {formatLastSeen(conversation.lastMessageAt)}
//                         </span>
//                       )}
//                       {/* Show created date if no last message */}
//                       {!conversation.lastMessageAt && !hasTyping && (
//                         <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
//                           {formatLastSeen(conversation.createdAt)}
//                         </span>
//                       )}
//                     </div>

//                     {/* Online Status for Direct Conversations */}
//                     {conversation.type === "direct" && avatars.length > 0 && (
//                       <div className="mt-1">
//                         <OnlineStatus
//                           status={
//                             isUserOnline(avatars[0]?.id) ? "online" : "offline"
//                           }
//                           variant="text"
//                           size="xs"
//                           showText={false}
//                           showLastSeen={true}
//                           lastSeen={avatars[0]?.lastSeen}
//                         />
//                       </div>
//                     )}
//                   </div>

//                   {/* Context Menu Button */}
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       // Handle context menu
//                     }}
//                     className="ml-2 p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 rounded transition-all"
//                   >
//                     <MoreVertical className="w-4 h-4" />
//                   </button>

//                   {/* Active Indicator */}
//                   {isActive && (
//                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
//                   )}
//                 </div>
//               );
//             })}

//             {/* Loading Indicator */}
//             {isLoading && (
//               <div className="flex justify-center py-4">
//                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Compact conversation list for mobile
// export const CompactConversationList = ({
//   conversations,
//   activeConversationId,
//   onConversationSelect,
//   className = "",
// }) => (
//   <div className={`bg-white ${className}`}>
//     <div className="grid grid-cols-4 gap-2 p-2">
//       {conversations.slice(0, 8).map((conversation) => {
//         const isActive = conversation.id === activeConversationId;
//         return (
//           <button
//             key={conversation.id}
//             onClick={() => onConversationSelect(conversation.id)}
//             className={`
//               relative p-2 rounded-lg transition-colors
//               ${isActive ? "bg-blue-100" : "hover:bg-gray-100"}
//             `}
//           >
//             <Avatar user={conversation.participants?.[0]?.user} size="sm" />
//             {conversation.unreadCount > 0 && (
//               <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
//                 {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
//               </div>
//             )}
//           </button>
//         );
//       })}
//     </div>
//   </div>
// );

// export default ConversationList;
