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

  // Auth store
  const { user, logout, getUserDisplayInfo, updateProfile } = useAuthStore();

  // Socket connection
  const {
    isConnected,
    connectionError,
    reconnect,
    sendTypingIndicator,
    getUserOnlineStatus,
    updateStatus,
  } = useSocket();

  // Conversations management
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

  // Chat functionality
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
  } = useChat(activeConversationId);

  console.log(isConnected, "ascnajsncasncns");
  
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

  // Handle conversation selection on mobile
  const handleConversationSelect = useCallback(
    (conversationId) => {
      selectConversation(conversationId);
      if (isMobile) {
        setShowSidebar(false);
      }
    },
    [selectConversation, isMobile]
  );

  // Handle sending messages
  const handleSendMessage = useCallback(
    async (content) => {
      if (!activeConversationId) return;

      try {
        await sendTextMessage(content, replyingTo?.id);
        setReplyingTo(null);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [activeConversationId, sendTextMessage, replyingTo]
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file) => {
      if (!activeConversationId) return;

      try {
        await sendFileMessage(file);
      } catch (error) {
        console.error("Failed to upload file:", error);
      }
    },
    [activeConversationId, sendFileMessage]
  );

  // Handle typing indicators
  const handleTypingStart = useCallback(() => {
    if (activeConversationId) {
      sendTypingIndicator(activeConversationId, true);
    }
  }, [activeConversationId, sendTypingIndicator]);

  const handleTypingStop = useCallback(() => {
    if (activeConversationId) {
      sendTypingIndicator(activeConversationId, false);
    }
  }, [activeConversationId, sendTypingIndicator]);

  // Handle message actions
  const handleReply = useCallback((message) => {
    setReplyingTo(message);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleForward = useCallback((message) => {
    // TODO: Implement message forwarding
    console.log("Forward message:", message);
  }, []);

  // Handle new conversation
  const handleNewConversation = useCallback(() => {
    // TODO: Implement new conversation modal
    console.log("Create new conversation");
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  // Get user display information
  const userDisplayInfo = getUserDisplayInfo();
  const userOnlineStatus = getUserOnlineStatus(user?.id);
  const typingUsers = getTypingUsersInActiveConversation();

  // Connection status banner
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

  // User menu dropdown
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

  // Error banner
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

  return (
    <div className={`flex h-screen bg-gray-100 ${className}`}>
      {/* Connection Status */}
      {/* <ConnectionBanner /> */}
      {/* <ErrorBanner /> */}

      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-30">
          <button
            onClick={() => setShowSidebar(true)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Chat</span>
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
      )}

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
                <h1 className="text-lg font-semibold text-gray-900">Chat</h1>
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

        {/* Conversation List */}
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

      {/* Main Chat Area */}
      <div
        className={`
        flex-1 flex flex-col
        ${isMobile ? (showSidebar ? "hidden" : "block") : "block"}
        ${isMobile ? "pt-16" : ""}
      `}
      >
        <ChatWindow
          conversation={activeConversation}
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
        />
      </div>

      {/* Overlay for mobile */}
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Settings Modal */}
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

// Loading wrapper component
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
