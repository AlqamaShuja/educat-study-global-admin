import React, { useState, useEffect, useCallback } from "react";
import {
  Menu,
  X,
  Settings,
  Bell,
  User,
  LogOut,
  MessageSquare,
} from "lucide-react";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import SearchInput from "./SearchInput";
import OnlineStatus, { StatusSelector } from "./OnlineStatus";
import Avatar from "../ui/Avatar";
import useSocket from "../../hooks/useSocket";
import useChat from "../../hooks/useChat";
import useAuthStore from "../../stores/authStore";
import useConversations from "../../hooks/useConversations";

const ChatContainer = ({ className = "" }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Auth store - RESTORED
  const { user, logout, getUserDisplayInfo, updateProfile } = useAuthStore();

  // Socket connection - RESTORED
  const {
    isConnected,
    connectionError,
    reconnect,
    sendTypingIndicator,
    getUserOnlineStatus,
    updateStatus,
  } = useSocket();

  // Conversations management - RESTORED
  const {
    conversations,
    activeConversation,
    activeConversationId,
    isLoading: conversationsLoading,
    error: conversationsError,
    searchQuery,
    filterType,
    sortBy,
    unreadCount,
    selectConversation,
    createConversation: handleCreateConversation,
    searchConversations,
    filterConversations,
    sortConversations,
    getTypingUsersInActiveConversation,
    refreshConversations,
    loadMoreConversations,
    hasMore: hasMoreConversations,
  } = useConversations();

  // Chat functionality - RESTORED
  const {
    messages,
    hasMoreMessages,
    isLoading: messagesLoading,
    isSending,
    error: chatError,
    draft,
    updateDraft,
    uploadProgress,
    sendTextMessage,
    sendFileMessage,
    editMessage,
    deleteMessage,
    retryMessage,
    loadMoreMessages,
    clearError: clearChatError,
    canSendMessages, // New function from updated useChat
    getConversationContext, // New function from updated useChat
  } = useChat(activeConversationId);

  console.log("ChatContainer - Current user:", user);
  console.log("ChatContainer - Conversations:", conversations);
  console.log("ChatContainer - Active conversation ID:", activeConversationId);
  console.log("ChatContainer - Active conversation:", activeConversation);
  console.log("ChatContainer - Messages:", messages);
  console.log("ChatContainer - Messages loading:", messagesLoading);
  console.log("ChatContainer - Connection status:", isConnected);

  // State for message composition
  const [replyingTo, setReplyingTo] = useState(null);

  // Responsive design
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setShowSidebar(!mobile);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Handle conversation selection - RESTORED with role-based system
  const handleConversationSelect = useCallback(
    async (conversationId) => {
      try {
        console.log("Selecting conversation:", conversationId);

        // For role-based system, conversationId might be a lead ID for consultants
        // The ConversationList component handles the API call to get/create conversation
        // and passes the actual conversation ID here

        await selectConversation(conversationId);

        if (isMobile) {
          setShowSidebar(false);
        }
      } catch (error) {
        console.error("Error selecting conversation:", error);
      }
    },
    [selectConversation, isMobile]
  );

  // Handle sending messages - RESTORED
  const handleSendMessage = useCallback(
    async (content) => {
      if (!activeConversationId) {
        console.error("No active conversation to send message to");
        return;
      }

      if (!canSendMessages()) {
        console.error("User cannot send messages (monitoring role)");
        return;
      }

      try {
        console.log(
          "Sending message:",
          content,
          "to conversation:",
          activeConversationId
        );
        await sendTextMessage(content, replyingTo?.id);
        setReplyingTo(null);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [activeConversationId, sendTextMessage, replyingTo, canSendMessages]
  );

  // Handle file upload - RESTORED
  const handleFileUpload = useCallback(
    async (file) => {
      if (!activeConversationId) {
        console.error("No active conversation to upload file to");
        return;
      }

      if (!canSendMessages()) {
        console.error("User cannot send files (monitoring role)");
        return;
      }

      try {
        console.log(
          "Uploading file:",
          file.name,
          "to conversation:",
          activeConversationId
        );
        await sendFileMessage(file);
      } catch (error) {
        console.error("Failed to upload file:", error);
      }
    },
    [activeConversationId, sendFileMessage, canSendMessages]
  );

  // Handle typing indicators - RESTORED
  const handleTypingStart = useCallback(() => {
    if (activeConversationId && canSendMessages()) {
      sendTypingIndicator(activeConversationId, true);
    }
  }, [activeConversationId, sendTypingIndicator, canSendMessages]);

  const handleTypingStop = useCallback(() => {
    if (activeConversationId && canSendMessages()) {
      sendTypingIndicator(activeConversationId, false);
    }
  }, [activeConversationId, sendTypingIndicator, canSendMessages]);

  // Handle message actions - RESTORED
  const handleReply = useCallback(
    (message) => {
      if (canSendMessages()) {
        setReplyingTo(message);
      }
    },
    [canSendMessages]
  );

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleForward = useCallback((message) => {
    // TODO: Implement message forwarding
    console.log("Forward message:", message);
  }, []);

  // Handle new conversation - Updated for role-based system
  const handleNewConversation = useCallback(() => {
    // For consultants, they can't create new conversations - they work with assigned leads
    // For managers/super_admins, they are monitoring only
    // Only students and other roles can create new conversations

    if (["consultant", "manager", "super_admin"].includes(user?.role)) {
      console.log("New conversation not available for this role");
      return;
    }

    // TODO: Implement new conversation modal for eligible roles
    console.log("Create new conversation");
  }, [user?.role]);

  // Handle logout - RESTORED
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  // Get user display information - RESTORED
  const userDisplayInfo = getUserDisplayInfo();
  const userOnlineStatus = getUserOnlineStatus(user?.id);
  const typingUsers = getTypingUsersInActiveConversation();

  // Connection status banner - RESTORED
  const ConnectionBanner = () => {
    if (isConnected) return null;

    return (
      <div className="bg-red-500 text-white px-4 py-2 text-center text-sm">
        <span>Connection lost. </span>
        {connectionError ? (
          <span>{connectionError} </span>
        ) : (
          <span>Reconnecting... </span>
        )}
        <button
          onClick={reconnect}
          className="underline hover:no-underline ml-2"
        >
          Retry
        </button>
      </div>
    );
  };

  // User menu dropdown - RESTORED with role display
  const UserMenu = () => (
    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Avatar user={userDisplayInfo} size="md" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {userDisplayInfo?.name || "Unknown User"}
            </div>
            <div className="text-sm text-gray-500 truncate">
              {userDisplayInfo?.email}
            </div>
            <div className="text-xs text-blue-600 capitalize">
              {user?.role?.replace("_", " ")}
            </div>
          </div>
        </div>
      </div>

      {/* Status Selector */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="text-sm font-medium text-gray-700 mb-2">Status</div>
        <StatusSelector
          currentStatus={userOnlineStatus.status || "online"}
          onStatusChange={updateStatus}
        />
      </div>

      {/* Menu Items */}
      <div className="py-1">
        <button
          onClick={() => {
            setShowSettings(true);
            setShowUserMenu(false);
          }}
          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>

        <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </button>

        <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>

        <hr className="my-1" />

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  // Error banner - RESTORED
  const ErrorBanner = () => {
    const error = conversationsError || chatError;
    if (!error) return null;

    return (
      <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm">
        <span>{error} </span>
        <button
          onClick={() => {
            clearChatError();
            refreshConversations();
          }}
          className="underline hover:no-underline ml-2"
        >
          Retry
        </button>
        <button
          onClick={() => {
            clearChatError();
          }}
          className="ml-4 text-yellow-200 hover:text-white"
        >
          <X className="w-4 h-4 inline" />
        </button>
      </div>
    );
  };

  // Get header title based on user role
  const getHeaderTitle = () => {
    switch (user?.role) {
      case "consultant":
        return "Student Conversations";
      case "manager":
        return "Office Monitoring";
      case "super_admin":
        return "System Monitoring";
      default:
        return "Chat";
    }
  };

  // Create a mock conversation object when we have an activeConversationId but no activeConversation
  const getDisplayConversation = () => {
    if (activeConversation) {
      return activeConversation;
    }

    // If we have an activeConversationId but no conversation object, create a mock one
    if (activeConversationId) {
      return {
        id: activeConversationId,
        name: "Loading conversation...",
        type: "direct",
        participants: [],
      };
    }

    return null;
  };

  const displayConversation = getDisplayConversation();

  return (
    <div className={`flex h-screen bg-gray-100 ${className}`}>
      {/* Connection Status - RESTORED */}
      {/* <ConnectionBanner />
      <ErrorBanner /> */}

      {/* Mobile Header */}
      {/* {isMobile && (
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-30">
          <button
            onClick={() => setShowSidebar(true)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">
              {getHeaderTitle()}
            </span>
            {unreadCount > 0 && (
              <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                {unreadCount > 99 ? "99+" : unreadCount}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100"
            >
              <Avatar user={userDisplayInfo} size="sm" />
            </button>
            {showUserMenu && <UserMenu />}
          </div>
        </div>
      )} */}

      {/* Sidebar */}
      <div
        className={`
        ${isMobile ? "fixed inset-0 z-40" : "relative"}
        ${showSidebar ? "block" : "hidden"}
        ${isMobile ? "w-full" : "w-80"}
        bg-white border-r border-gray-200 flex flex-col
      `}
      >
        {/* Sidebar Header */}
        {/* {!isMobile && (
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                <h1 className="text-lg font-semibold text-gray-900">
                  {getHeaderTitle()}
                </h1>
                {unreadCount > 0 && (
                  <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100"
                >
                  <Avatar
                    user={userDisplayInfo}
                    size="sm"
                    online={userOnlineStatus.status === "online"}
                  />
                </button>
                {showUserMenu && <UserMenu />}
              </div>
            </div>
          </div>
        )} */}

        {/* Mobile Close Button */}
        {isMobile && (
          <div className="flex justify-end p-4">
            <button
              onClick={() => setShowSidebar(false)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Conversation List - RESTORED with proper component */}
        <div className="flex-1 overflow-hidden">
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            currentUser={user}
            onConversationSelect={handleConversationSelect}
            onNewConversation={handleNewConversation}
            searchQuery={searchQuery}
            onSearchChange={searchConversations}
            filterType={filterType}
            onFilterChange={filterConversations}
            sortBy={sortBy}
            onSortChange={sortConversations}
            typingUsers={new Map()} // Will be populated from conversation store
            onlineUsers={new Map()} // Will be populated from socket store
            isLoading={conversationsLoading}
            hasMore={hasMoreConversations}
            onLoadMore={loadMoreConversations}
          />
        </div>
      </div>

      {/* Main Chat Area - FIXED CONDITION */}
      <div
        className={`
        flex-1 flex flex-col
        ${isMobile ? (showSidebar ? "hidden" : "block") : "block"}
        ${isMobile ? "pt-16" : ""}
      `}
      >
        {/* FIXED: Show ChatWindow if we have activeConversationId (don't require activeConversation) */}
        {activeConversationId ? (
          // Chat Window - RESTORED with proper component
          <ChatWindow
            conversation={displayConversation}
            messages={messages}
            currentUser={user}
            isLoading={messagesLoading}
            isSending={isSending}
            hasMoreMessages={hasMoreMessages}
            onLoadMoreMessages={loadMoreMessages}
            onSendMessage={handleSendMessage}
            onEditMessage={editMessage}
            onDeleteMessage={deleteMessage}
            onFileUpload={handleFileUpload}
            onTypingStart={handleTypingStart}
            onTypingStop={handleTypingStop}
            typingUsers={typingUsers}
            onlineUsers={new Map()} // Will be populated from socket store
            messageDraft={draft}
            onDraftChange={updateDraft}
            uploadProgress={uploadProgress}
            replyingTo={replyingTo}
            onReply={handleReply}
            onCancelReply={handleCancelReply}
            onForward={handleForward}
            onRetry={retryMessage}
            canSendMessages={canSendMessages()}
            conversationContext={getConversationContext()}
          />
        ) : (
          // Empty state when no conversation is selected
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {user?.role === "consultant" &&
                  "Select a student to start chatting"}
                {user?.role === "manager" && "Select a conversation to monitor"}
                {user?.role === "super_admin" &&
                  "Select a conversation to monitor"}
                {!["consultant", "manager", "super_admin"].includes(
                  user?.role
                ) && "Select a conversation to start chatting"}
              </h3>
              <p className="text-gray-500">
                {user?.role === "consultant" &&
                  "Choose a student from the list to begin your consultation."}
                {user?.role === "manager" &&
                  "Monitor conversations happening in your office."}
                {user?.role === "super_admin" &&
                  "Monitor all conversations across the system."}
                {!["consultant", "manager", "super_admin"].includes(
                  user?.role
                ) &&
                  "Choose a conversation from the sidebar or start a new one."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile */}
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Settings Modal - RESTORED */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    defaultValue={userDisplayInfo?.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <StatusSelector
                    currentStatus={userOnlineStatus.status || "online"}
                    onStatusChange={updateStatus}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Notifications</span>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Sound</span>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Loading wrapper component - RESTORED
export const ChatContainerWithLoading = () => {
  const { user, loading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Not Authenticated
          </h2>
          <p className="text-gray-600">Please log in to access the chat.</p>
        </div>
      </div>
    );
  }

  return <ChatContainer />;
};

export default ChatContainer;

// import React, { useState, useEffect, useCallback } from "react";
// import {
//   Menu,
//   X,
//   Settings,
//   Bell,
//   User,
//   LogOut,
//   MessageSquare,
// } from "lucide-react";
// import ConversationList from "./ConversationList";
// import ChatWindow from "./ChatWindow";
// import SearchInput from "./SearchInput";
// import OnlineStatus, { StatusSelector } from "./OnlineStatus";
// import Avatar from "../ui/Avatar";
// import useSocket from "../../hooks/useSocket";
// import useChat from "../../hooks/useChat";
// import useAuthStore from "../../stores/authStore";
// import useConversations from "../../hooks/useConversations";

// const ChatContainer = ({ className = "" }) => {
//   const [isMobile, setIsMobile] = useState(false);
//   const [showSidebar, setShowSidebar] = useState(true);
//   const [showUserMenu, setShowUserMenu] = useState(false);
//   const [showSettings, setShowSettings] = useState(false);

//   // Auth store - RESTORED
//   const { user, logout, getUserDisplayInfo, updateProfile } = useAuthStore();

//   // Socket connection - RESTORED
//   const {
//     isConnected,
//     connectionError,
//     reconnect,
//     sendTypingIndicator,
//     getUserOnlineStatus,
//     updateStatus,
//   } = useSocket();

//   // Conversations management - RESTORED
//   const {
//     conversations,
//     activeConversation,
//     activeConversationId,
//     isLoading: conversationsLoading,
//     error: conversationsError,
//     searchQuery,
//     filterType,
//     sortBy,
//     unreadCount,
//     selectConversation,
//     createConversation: handleCreateConversation,
//     searchConversations,
//     filterConversations,
//     sortConversations,
//     getTypingUsersInActiveConversation,
//     refreshConversations,
//     loadMoreConversations,
//     hasMore: hasMoreConversations,
//   } = useConversations();

//   // Chat functionality - RESTORED
//   const {
//     messages,
//     hasMoreMessages,
//     isLoading: messagesLoading,
//     isSending,
//     error: chatError,
//     draft,
//     updateDraft,
//     uploadProgress,
//     sendTextMessage,
//     sendFileMessage,
//     editMessage,
//     deleteMessage,
//     retryMessage,
//     loadMoreMessages,
//     clearError: clearChatError,
//     canSendMessages, // New function from updated useChat
//     getConversationContext, // New function from updated useChat
//   } = useChat(activeConversationId);

//   console.log("ChatContainer - Current user:", user);
//   console.log("ChatContainer - Conversations:", conversations);
//   console.log("ChatContainer - Active conversation:", activeConversationId);
//   console.log("ChatContainer - Messages:", messages);
//   console.log("ChatContainer - Connection status:", isConnected);

//   // State for message composition
//   const [replyingTo, setReplyingTo] = useState(null);

//   // Responsive design
//   useEffect(() => {
//     const checkScreenSize = () => {
//       const mobile = window.innerWidth < 768;
//       setIsMobile(mobile);
//       setShowSidebar(!mobile);
//     };

//     checkScreenSize();
//     window.addEventListener("resize", checkScreenSize);
//     return () => window.removeEventListener("resize", checkScreenSize);
//   }, []);

//   // Handle conversation selection - RESTORED with role-based system
//   const handleConversationSelect = useCallback(
//     async (conversationId) => {
//       try {
//         console.log("Selecting conversation:", conversationId);

//         // For role-based system, conversationId might be a lead ID for consultants
//         // The ConversationList component handles the API call to get/create conversation
//         // and passes the actual conversation ID here

//         await selectConversation(conversationId);

//         if (isMobile) {
//           setShowSidebar(false);
//         }
//       } catch (error) {
//         console.error("Error selecting conversation:", error);
//       }
//     },
//     [selectConversation, isMobile]
//   );

//   // Handle sending messages - RESTORED
//   const handleSendMessage = useCallback(
//     async (content) => {
//       if (!activeConversationId) {
//         console.error("No active conversation to send message to");
//         return;
//       }

//       if (!canSendMessages()) {
//         console.error("User cannot send messages (monitoring role)");
//         return;
//       }

//       try {
//         console.log(
//           "Sending message:",
//           content,
//           "to conversation:",
//           activeConversationId
//         );
//         await sendTextMessage(content, replyingTo?.id);
//         setReplyingTo(null);
//       } catch (error) {
//         console.error("Failed to send message:", error);
//       }
//     },
//     [activeConversationId, sendTextMessage, replyingTo, canSendMessages]
//   );

//   // Handle file upload - RESTORED
//   const handleFileUpload = useCallback(
//     async (file) => {
//       if (!activeConversationId) {
//         console.error("No active conversation to upload file to");
//         return;
//       }

//       if (!canSendMessages()) {
//         console.error("User cannot send files (monitoring role)");
//         return;
//       }

//       try {
//         console.log(
//           "Uploading file:",
//           file.name,
//           "to conversation:",
//           activeConversationId
//         );
//         await sendFileMessage(file);
//       } catch (error) {
//         console.error("Failed to upload file:", error);
//       }
//     },
//     [activeConversationId, sendFileMessage, canSendMessages]
//   );

//   // Handle typing indicators - RESTORED
//   const handleTypingStart = useCallback(() => {
//     if (activeConversationId && canSendMessages()) {
//       sendTypingIndicator(activeConversationId, true);
//     }
//   }, [activeConversationId, sendTypingIndicator, canSendMessages]);

//   const handleTypingStop = useCallback(() => {
//     if (activeConversationId && canSendMessages()) {
//       sendTypingIndicator(activeConversationId, false);
//     }
//   }, [activeConversationId, sendTypingIndicator, canSendMessages]);

//   // Handle message actions - RESTORED
//   const handleReply = useCallback(
//     (message) => {
//       if (canSendMessages()) {
//         setReplyingTo(message);
//       }
//     },
//     [canSendMessages]
//   );

//   const handleCancelReply = useCallback(() => {
//     setReplyingTo(null);
//   }, []);

//   const handleForward = useCallback((message) => {
//     // TODO: Implement message forwarding
//     console.log("Forward message:", message);
//   }, []);

//   // Handle new conversation - Updated for role-based system
//   const handleNewConversation = useCallback(() => {
//     // For consultants, they can't create new conversations - they work with assigned leads
//     // For managers/super_admins, they are monitoring only
//     // Only students and other roles can create new conversations

//     if (["consultant", "manager", "super_admin"].includes(user?.role)) {
//       console.log("New conversation not available for this role");
//       return;
//     }

//     // TODO: Implement new conversation modal for eligible roles
//     console.log("Create new conversation");
//   }, [user?.role]);

//   // Handle logout - RESTORED
//   const handleLogout = useCallback(() => {
//     logout();
//   }, [logout]);

//   // Get user display information - RESTORED
//   const userDisplayInfo = getUserDisplayInfo();
//   const userOnlineStatus = getUserOnlineStatus(user?.id);
//   const typingUsers = getTypingUsersInActiveConversation();

//   // Connection status banner - RESTORED
//   const ConnectionBanner = () => {
//     if (isConnected) return null;

//     return (
//       <div className="bg-red-500 text-white px-4 py-2 text-center text-sm">
//         <span>Connection lost. </span>
//         {connectionError ? (
//           <span>{connectionError} </span>
//         ) : (
//           <span>Reconnecting... </span>
//         )}
//         <button
//           onClick={reconnect}
//           className="underline hover:no-underline ml-2"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   };

//   // User menu dropdown - RESTORED with role display
//   const UserMenu = () => (
//     <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
//       {/* User Info */}
//       <div className="px-4 py-3 border-b border-gray-100">
//         <div className="flex items-center space-x-3">
//           <Avatar user={userDisplayInfo} size="md" />
//           <div className="flex-1 min-w-0">
//             <div className="font-medium text-gray-900 truncate">
//               {userDisplayInfo?.name || "Unknown User"}
//             </div>
//             <div className="text-sm text-gray-500 truncate">
//               {userDisplayInfo?.email}
//             </div>
//             <div className="text-xs text-blue-600 capitalize">
//               {user?.role?.replace("_", " ")}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Status Selector */}
//       <div className="px-4 py-3 border-b border-gray-100">
//         <div className="text-sm font-medium text-gray-700 mb-2">Status</div>
//         <StatusSelector
//           currentStatus={userOnlineStatus.status || "online"}
//           onStatusChange={updateStatus}
//         />
//       </div>

//       {/* Menu Items */}
//       <div className="py-1">
//         <button
//           onClick={() => {
//             setShowSettings(true);
//             setShowUserMenu(false);
//           }}
//           className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//         >
//           <Settings className="w-4 h-4" />
//           <span>Settings</span>
//         </button>

//         <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
//           <Bell className="w-4 h-4" />
//           <span>Notifications</span>
//         </button>

//         <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
//           <User className="w-4 h-4" />
//           <span>Profile</span>
//         </button>

//         <hr className="my-1" />

//         <button
//           onClick={handleLogout}
//           className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//         >
//           <LogOut className="w-4 h-4" />
//           <span>Sign out</span>
//         </button>
//       </div>
//     </div>
//   );

//   // Error banner - RESTORED
//   const ErrorBanner = () => {
//     const error = conversationsError || chatError;
//     if (!error) return null;

//     return (
//       <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm">
//         <span>{error} </span>
//         <button
//           onClick={() => {
//             clearChatError();
//             refreshConversations();
//           }}
//           className="underline hover:no-underline ml-2"
//         >
//           Retry
//         </button>
//         <button
//           onClick={() => {
//             clearChatError();
//           }}
//           className="ml-4 text-yellow-200 hover:text-white"
//         >
//           <X className="w-4 h-4 inline" />
//         </button>
//       </div>
//     );
//   };

//   // Get header title based on user role
//   const getHeaderTitle = () => {
//     switch (user?.role) {
//       case "consultant":
//         return "Student Conversations";
//       case "manager":
//         return "Office Monitoring";
//       case "super_admin":
//         return "System Monitoring";
//       default:
//         return "Chat";
//     }
//   };

//   return (
//     <div className={`flex h-screen bg-gray-100 ${className}`}>
//       {/* Connection Status - RESTORED */}
//       {/* <ConnectionBanner />
//       <ErrorBanner /> */}

//       {/* Mobile Header */}
//       {isMobile && (
//         <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-30">
//           <button
//             onClick={() => setShowSidebar(true)}
//             className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
//           >
//             <Menu className="w-5 h-5" />
//           </button>

//           <div className="flex items-center space-x-2">
//             <MessageSquare className="w-5 h-5 text-blue-600" />
//             <span className="font-semibold text-gray-900">
//               {getHeaderTitle()}
//             </span>
//             {unreadCount > 0 && (
//               <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
//                 {unreadCount > 99 ? "99+" : unreadCount}
//               </div>
//             )}
//           </div>

//           <div className="relative">
//             <button
//               onClick={() => setShowUserMenu(!showUserMenu)}
//               className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100"
//             >
//               <Avatar user={userDisplayInfo} size="sm" />
//             </button>
//             {showUserMenu && <UserMenu />}
//           </div>
//         </div>
//       )}

//       {/* Sidebar */}
//       <div
//         className={`
//         ${isMobile ? "fixed inset-0 z-40" : "relative"}
//         ${showSidebar ? "block" : "hidden"}
//         ${isMobile ? "w-full" : "w-80"}
//         bg-white border-r border-gray-200 flex flex-col
//       `}
//       >
//         {/* Sidebar Header */}
//         {!isMobile && (
//           <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-3">
//                 <MessageSquare className="w-6 h-6 text-blue-600" />
//                 <h1 className="text-lg font-semibold text-gray-900">
//                   {getHeaderTitle()}
//                 </h1>
//                 {unreadCount > 0 && (
//                   <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
//                     {unreadCount > 99 ? "99+" : unreadCount}
//                   </div>
//                 )}
//               </div>

//               <div className="relative">
//                 <button
//                   onClick={() => setShowUserMenu(!showUserMenu)}
//                   className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100"
//                 >
//                   <Avatar
//                     user={userDisplayInfo}
//                     size="sm"
//                     online={userOnlineStatus.status === "online"}
//                   />
//                 </button>
//                 {showUserMenu && <UserMenu />}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Mobile Close Button */}
//         {isMobile && (
//           <div className="flex justify-end p-4">
//             <button
//               onClick={() => setShowSidebar(false)}
//               className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//         )}

//         {/* Conversation List - RESTORED with proper component */}
//         <div className="flex-1 overflow-hidden">
//           <ConversationList
//             conversations={conversations}
//             activeConversationId={activeConversationId}
//             currentUser={user}
//             onConversationSelect={handleConversationSelect}
//             onNewConversation={handleNewConversation}
//             searchQuery={searchQuery}
//             onSearchChange={searchConversations}
//             filterType={filterType}
//             onFilterChange={filterConversations}
//             sortBy={sortBy}
//             onSortChange={sortConversations}
//             typingUsers={new Map()} // Will be populated from conversation store
//             onlineUsers={new Map()} // Will be populated from socket store
//             isLoading={conversationsLoading}
//             hasMore={hasMoreConversations}
//             onLoadMore={loadMoreConversations}
//           />
//         </div>
//       </div>

//       {/* Main Chat Area */}
//       <div
//         className={`
//         flex-1 flex flex-col
//         ${isMobile ? (showSidebar ? "hidden" : "block") : "block"}
//         ${isMobile ? "pt-16" : ""}
//       `}
//       >
//         {activeConversationId && activeConversation ? (
//           // Chat Window - RESTORED with proper component
//           <ChatWindow
//             conversation={activeConversation}
//             messages={messages}
//             currentUser={user}
//             isLoading={messagesLoading}
//             isSending={isSending}
//             hasMoreMessages={hasMoreMessages}
//             onLoadMoreMessages={loadMoreMessages}
//             onSendMessage={handleSendMessage}
//             onEditMessage={editMessage}
//             onDeleteMessage={deleteMessage}
//             onFileUpload={handleFileUpload}
//             onTypingStart={handleTypingStart}
//             onTypingStop={handleTypingStop}
//             typingUsers={typingUsers}
//             onlineUsers={new Map()} // Will be populated from socket store
//             messageDraft={draft}
//             onDraftChange={updateDraft}
//             uploadProgress={uploadProgress}
//             replyingTo={replyingTo}
//             onReply={handleReply}
//             onCancelReply={handleCancelReply}
//             onForward={handleForward}
//             onRetry={retryMessage}
//             canSendMessages={canSendMessages()}
//             conversationContext={getConversationContext()}
//           />
//         ) : (
//           // Empty state when no conversation is selected
//           <div className="flex-1 flex items-center justify-center bg-gray-50">
//             <div className="text-center">
//               <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <h3 className="text-lg font-medium text-gray-900 mb-2">
//                 {user?.role === "consultant" &&
//                   "Select a student to start chatting"}
//                 {user?.role === "manager" && "Select a conversation to monitor"}
//                 {user?.role === "super_admin" &&
//                   "Select a conversation to monitor"}
//                 {!["consultant", "manager", "super_admin"].includes(
//                   user?.role
//                 ) && "Select a conversation to start chatting"}
//               </h3>
//               <p className="text-gray-500">
//                 {user?.role === "consultant" &&
//                   "Choose a student from the list to begin your consultation."}
//                 {user?.role === "manager" &&
//                   "Monitor conversations happening in your office."}
//                 {user?.role === "super_admin" &&
//                   "Monitor all conversations across the system."}
//                 {!["consultant", "manager", "super_admin"].includes(
//                   user?.role
//                 ) &&
//                   "Choose a conversation from the sidebar or start a new one."}
//               </p>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Overlay for mobile */}
//       {isMobile && showSidebar && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-30"
//           onClick={() => setShowSidebar(false)}
//         />
//       )}

//       {/* Settings Modal - RESTORED */}
//       {showSettings && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
//             <div className="flex items-center justify-between p-6 border-b border-gray-200">
//               <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
//               <button
//                 onClick={() => setShowSettings(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="p-6">
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Display Name
//                   </label>
//                   <input
//                     type="text"
//                     defaultValue={userDisplayInfo?.name}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Status
//                   </label>
//                   <StatusSelector
//                     currentStatus={userOnlineStatus.status || "online"}
//                     onStatusChange={updateStatus}
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-gray-700">Notifications</span>
//                   <input type="checkbox" className="rounded" defaultChecked />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-gray-700">Sound</span>
//                   <input type="checkbox" className="rounded" defaultChecked />
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
//               <button
//                 onClick={() => setShowSettings(false)}
//                 className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => setShowSettings(false)}
//                 className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Loading wrapper component - RESTORED
// export const ChatContainerWithLoading = () => {
//   const { user, loading, initializeAuth } = useAuthStore();

//   useEffect(() => {
//     initializeAuth();
//   }, [initializeAuth]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-100">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-100">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-gray-900 mb-4">
//             Not Authenticated
//           </h2>
//           <p className="text-gray-600">Please log in to access the chat.</p>
//         </div>
//       </div>
//     );
//   }

//   return <ChatContainer />;
// };

// export default ChatContainer;

// import React, { useState, useEffect, useCallback } from "react";
// import {
//   Menu,
//   X,
//   Settings,
//   Bell,
//   User,
//   LogOut,
//   MessageSquare,
// } from "lucide-react";
// import ConversationList from "./ConversationList";
// import ChatWindow from "./ChatWindow";
// import SearchInput from "./SearchInput";
// import OnlineStatus, { StatusSelector } from "./OnlineStatus";
// import Avatar from "../ui/Avatar";
// import useSocket from "../../hooks/useSocket";
// import useChat from "../../hooks/useChat";
// import useAuthStore from "../../stores/authStore";
// import useConversations from "../../hooks/useConversations";

// const ChatContainer = ({ className = "" }) => {
//   const [isMobile, setIsMobile] = useState(false);
//   const [showSidebar, setShowSidebar] = useState(true);
//   const [showUserMenu, setShowUserMenu] = useState(false);
//   const [showSettings, setShowSettings] = useState(false);

//   // Auth store
//   const { user, logout, getUserDisplayInfo, updateProfile } = useAuthStore();

//   // Socket connection
//   const {
//     isConnected,
//     connectionError,
//     reconnect,
//     sendTypingIndicator,
//     getUserOnlineStatus,
//     updateStatus,
//   } = useSocket();

//   // Conversations management
//   const {
//     conversations,
//     activeConversation,
//     activeConversationId,
//     isLoading: conversationsLoading,
//     error: conversationsError,
//     searchQuery,
//     filterType,
//     sortBy,
//     unreadCount,
//     selectConversation,
//     createConversation: handleCreateConversation,
//     searchConversations,
//     filterConversations,
//     sortConversations,
//     getTypingUsersInActiveConversation,
//     refreshConversations,
//     loadMoreConversations,
//     hasMore: hasMoreConversations,
//   } = useConversations();

//   // Chat functionality
//   const {
//     messages,
//     hasMoreMessages,
//     isLoading: messagesLoading,
//     isSending,
//     error: chatError,
//     draft,
//     updateDraft,
//     uploadProgress,
//     sendTextMessage,
//     sendFileMessage,
//     editMessage,
//     deleteMessage,
//     retryMessage,
//     loadMoreMessages,
//     clearError: clearChatError,
//   } = useChat(activeConversationId);

//   console.log(isConnected, "ascnajsncasncns");

//   // State for message composition
//   const [replyingTo, setReplyingTo] = useState(null);

//   // Responsive design
//   useEffect(() => {
//     const checkScreenSize = () => {
//       const mobile = window.innerWidth < 768;
//       setIsMobile(mobile);
//       setShowSidebar(!mobile);
//     };

//     checkScreenSize();
//     window.addEventListener("resize", checkScreenSize);
//     return () => window.removeEventListener("resize", checkScreenSize);
//   }, []);

//   // Handle conversation selection on mobile
//   const handleConversationSelect = useCallback(
//     (conversationId) => {
//       selectConversation(conversationId);
//       if (isMobile) {
//         setShowSidebar(false);
//       }
//     },
//     [selectConversation, isMobile]
//   );

//   // Handle sending messages
//   const handleSendMessage = useCallback(
//     async (content) => {
//       if (!activeConversationId) return;

//       try {
//         await sendTextMessage(content, replyingTo?.id);
//         setReplyingTo(null);
//       } catch (error) {
//         console.error("Failed to send message:", error);
//       }
//     },
//     [activeConversationId, sendTextMessage, replyingTo]
//   );

//   // Handle file upload
//   const handleFileUpload = useCallback(
//     async (file) => {
//       if (!activeConversationId) return;

//       try {
//         await sendFileMessage(file);
//       } catch (error) {
//         console.error("Failed to upload file:", error);
//       }
//     },
//     [activeConversationId, sendFileMessage]
//   );

//   // Handle typing indicators
//   const handleTypingStart = useCallback(() => {
//     if (activeConversationId) {
//       sendTypingIndicator(activeConversationId, true);
//     }
//   }, [activeConversationId, sendTypingIndicator]);

//   const handleTypingStop = useCallback(() => {
//     if (activeConversationId) {
//       sendTypingIndicator(activeConversationId, false);
//     }
//   }, [activeConversationId, sendTypingIndicator]);

//   // Handle message actions
//   const handleReply = useCallback((message) => {
//     setReplyingTo(message);
//   }, []);

//   const handleCancelReply = useCallback(() => {
//     setReplyingTo(null);
//   }, []);

//   const handleForward = useCallback((message) => {
//     // TODO: Implement message forwarding
//     console.log("Forward message:", message);
//   }, []);

//   // Handle new conversation
//   const handleNewConversation = useCallback(() => {
//     // TODO: Implement new conversation modal
//     console.log("Create new conversation");
//   }, []);

//   // Handle logout
//   const handleLogout = useCallback(() => {
//     logout();
//   }, [logout]);

//   // Get user display information
//   const userDisplayInfo = getUserDisplayInfo();
//   const userOnlineStatus = getUserOnlineStatus(user?.id);
//   const typingUsers = getTypingUsersInActiveConversation();

//   // Connection status banner
//   const ConnectionBanner = () => {
//     if (isConnected) return null;

//     return (
//       <div className="bg-red-500 text-white px-4 py-2 text-center text-sm">
//         <span>Connection lost. </span>
//         {connectionError ? (
//           <span>{connectionError} </span>
//         ) : (
//           <span>Reconnecting... </span>
//         )}
//         <button
//           onClick={reconnect}
//           className="underline hover:no-underline ml-2"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   };

//   // User menu dropdown
//   const UserMenu = () => (
//     <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
//       {/* User Info */}
//       <div className="px-4 py-3 border-b border-gray-100">
//         <div className="flex items-center space-x-3">
//           <Avatar user={userDisplayInfo} size="md" />
//           <div className="flex-1 min-w-0">
//             <div className="font-medium text-gray-900 truncate">
//               {userDisplayInfo?.name || "Unknown User"}
//             </div>
//             <div className="text-sm text-gray-500 truncate">
//               {userDisplayInfo?.email}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Status Selector */}
//       <div className="px-4 py-3 border-b border-gray-100">
//         <div className="text-sm font-medium text-gray-700 mb-2">Status</div>
//         <StatusSelector
//           currentStatus={userOnlineStatus.status || "online"}
//           onStatusChange={updateStatus}
//         />
//       </div>

//       {/* Menu Items */}
//       <div className="py-1">
//         <button
//           onClick={() => {
//             setShowSettings(true);
//             setShowUserMenu(false);
//           }}
//           className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//         >
//           <Settings className="w-4 h-4" />
//           <span>Settings</span>
//         </button>

//         <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
//           <Bell className="w-4 h-4" />
//           <span>Notifications</span>
//         </button>

//         <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
//           <User className="w-4 h-4" />
//           <span>Profile</span>
//         </button>

//         <hr className="my-1" />

//         <button
//           onClick={handleLogout}
//           className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//         >
//           <LogOut className="w-4 h-4" />
//           <span>Sign out</span>
//         </button>
//       </div>
//     </div>
//   );

//   // Error banner
//   const ErrorBanner = () => {
//     const error = conversationsError || chatError;
//     if (!error) return null;

//     return (
//       <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm">
//         <span>{error} </span>
//         <button
//           onClick={() => {
//             clearChatError();
//             refreshConversations();
//           }}
//           className="underline hover:no-underline ml-2"
//         >
//           Retry
//         </button>
//         <button
//           onClick={() => {
//             clearChatError();
//           }}
//           className="ml-4 text-yellow-200 hover:text-white"
//         >
//           <X className="w-4 h-4 inline" />
//         </button>
//       </div>
//     );
//   };

//   return (
//     <div className={`flex h-screen bg-gray-100 ${className}`}>
//       {/* Connection Status */}
//       {/* <ConnectionBanner /> */}
//       {/* <ErrorBanner /> */}

//       {/* Mobile Header */}
//       {isMobile && (
//         <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-30">
//           <button
//             onClick={() => setShowSidebar(true)}
//             className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
//           >
//             <Menu className="w-5 h-5" />
//           </button>

//           <div className="flex items-center space-x-2">
//             <MessageSquare className="w-5 h-5 text-blue-600" />
//             <span className="font-semibold text-gray-900">Chat</span>
//             {unreadCount > 0 && (
//               <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
//                 {unreadCount > 99 ? "99+" : unreadCount}
//               </div>
//             )}
//           </div>

//           <div className="relative">
//             <button
//               onClick={() => setShowUserMenu(!showUserMenu)}
//               className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100"
//             >
//               <Avatar user={userDisplayInfo} size="sm" />
//             </button>
//             {showUserMenu && <UserMenu />}
//           </div>
//         </div>
//       )}

//       {/* Sidebar */}
//       <div
//         className={`
//         ${isMobile ? "fixed inset-0 z-40" : "relative"}
//         ${showSidebar ? "block" : "hidden"}
//         ${isMobile ? "w-full" : "w-80"}
//         bg-white border-r border-gray-200 flex flex-col
//       `}
//       >
//         {/* Sidebar Header */}
//         {/* {!isMobile && (
//           <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-3">
//                 <MessageSquare className="w-6 h-6 text-blue-600" />
//                 <h1 className="text-lg font-semibold text-gray-900">Chat</h1>
//                 {unreadCount > 0 && (
//                   <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
//                     {unreadCount > 99 ? "99+" : unreadCount}
//                   </div>
//                 )}
//               </div>

//               <div className="relative">
//                 <button
//                   onClick={() => setShowUserMenu(!showUserMenu)}
//                   className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100"
//                 >
//                   <Avatar
//                     user={userDisplayInfo}
//                     size="sm"
//                     online={userOnlineStatus.status === "online"}
//                   />
//                 </button>
//                 {showUserMenu && <UserMenu />}
//               </div>
//             </div>
//           </div>
//         )} */}

//         {/* Mobile Close Button */}
//         {isMobile && (
//           <div className="flex justify-end p-4">
//             <button
//               onClick={() => setShowSidebar(false)}
//               className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//         )}

//         {/* Conversation List */}
//         <div className="flex-1 overflow-hidden">
//           <ConversationList
//             conversations={conversations}
//             activeConversationId={activeConversationId}
//             currentUser={user}
//             onConversationSelect={handleConversationSelect}
//             onNewConversation={handleNewConversation}
//             searchQuery={searchQuery}
//             onSearchChange={searchConversations}
//             filterType={filterType}
//             onFilterChange={filterConversations}
//             sortBy={sortBy}
//             onSortChange={sortConversations}
//             typingUsers={new Map()} // Will be populated from conversation store
//             onlineUsers={new Map()} // Will be populated from socket store
//             isLoading={conversationsLoading}
//             hasMore={hasMoreConversations}
//             onLoadMore={loadMoreConversations}
//           />
//         </div>
//       </div>

//       {/* Main Chat Area */}
//       <div
//         className={`
//         flex-1 flex flex-col
//         ${isMobile ? (showSidebar ? "hidden" : "block") : "block"}
//         ${isMobile ? "pt-16" : ""}
//       `}
//       >
//         <ChatWindow
//           conversation={activeConversation}
//           messages={messages}
//           currentUser={user}
//           isLoading={messagesLoading}
//           isSending={isSending}
//           hasMoreMessages={hasMoreMessages}
//           onLoadMoreMessages={loadMoreMessages}
//           onSendMessage={handleSendMessage}
//           onEditMessage={editMessage}
//           onDeleteMessage={deleteMessage}
//           onFileUpload={handleFileUpload}
//           onTypingStart={handleTypingStart}
//           onTypingStop={handleTypingStop}
//           typingUsers={typingUsers}
//           onlineUsers={new Map()} // Will be populated from socket store
//           messageDraft={draft}
//           onDraftChange={updateDraft}
//           uploadProgress={uploadProgress}
//           replyingTo={replyingTo}
//           onReply={handleReply}
//           onCancelReply={handleCancelReply}
//           onForward={handleForward}
//           onRetry={retryMessage}
//         />
//       </div>

//       {/* Overlay for mobile */}
//       {isMobile && showSidebar && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-30"
//           onClick={() => setShowSidebar(false)}
//         />
//       )}

//       {/* Settings Modal */}
//       {showSettings && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
//             <div className="flex items-center justify-between p-6 border-b border-gray-200">
//               <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
//               <button
//                 onClick={() => setShowSettings(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="p-6">
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Display Name
//                   </label>
//                   <input
//                     type="text"
//                     defaultValue={userDisplayInfo?.name}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Status
//                   </label>
//                   <StatusSelector
//                     currentStatus={userOnlineStatus.status || "online"}
//                     onStatusChange={updateStatus}
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-gray-700">Notifications</span>
//                   <input type="checkbox" className="rounded" defaultChecked />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-gray-700">Sound</span>
//                   <input type="checkbox" className="rounded" defaultChecked />
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
//               <button
//                 onClick={() => setShowSettings(false)}
//                 className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => setShowSettings(false)}
//                 className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Loading wrapper component
// export const ChatContainerWithLoading = () => {
//   const { user, loading, initializeAuth } = useAuthStore();

//   useEffect(() => {
//     initializeAuth();
//   }, [initializeAuth]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-100">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-100">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-gray-900 mb-4">
//             Not Authenticated
//           </h2>
//           <p className="text-gray-600">Please log in to access the chat.</p>
//         </div>
//       </div>
//     );
//   }

//   return <ChatContainer />;
// };

// export default ChatContainer;
