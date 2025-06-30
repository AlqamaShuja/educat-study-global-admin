import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Phone,
  Video,
  Info,
  MoreVertical,
  Search,
  Pin,
  Archive,
  Star,
  Download,
  ArrowUp,
  Settings,
  UserPlus,
  Volume2,
  VolumeX,
} from "lucide-react";
// import Avatar, { AvatarGroup } from "./Avatar";
import MessageBubble, { SystemMessage, DateSeparator } from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator, { CompactTypingIndicator } from "./TypingIndicator";
import OnlineStatus, { ConversationOnlineCount } from "./OnlineStatus";
import Avatar, { AvatarGroup } from "../ui/Avatar";

const ChatWindow = ({
  conversation = null,
  messages = [],
  currentUser = null,
  isLoading = false,
  isSending = false,
  hasMoreMessages = false,
  onLoadMoreMessages,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onFileUpload,
  onTypingStart,
  onTypingStop,
  typingUsers = [],
  onlineUsers = new Map(),
  messageDraft = "",
  onDraftChange,
  uploadProgress = new Map(),
  replyingTo = null,
  onReply,
  onCancelReply,
  onForward,
  onRetry,
  className = "",
}) => {
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const lastMessageCountRef = useRef(0);

  // Scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    setShowScrollToBottom(!isNearBottom && messages.length > 0);

    // Load more messages when scrolled to top
    if (scrollTop < 100 && hasMoreMessages && !isLoading) {
      onLoadMoreMessages?.();
    }
  }, [hasMoreMessages, isLoading, onLoadMoreMessages, messages.length]);

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    const currentMessageCount = messages.length;
    const hadNewMessage = currentMessageCount > lastMessageCountRef.current;

    if (hadNewMessage) {
      const container = messagesContainerRef.current;
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;

        if (isNearBottom) {
          scrollToBottom();
        }
      }
      lastMessageCountRef.current = currentMessageCount;
    }
  }, [messages.length, scrollToBottom]);

  // Setup scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // Group messages by date and sender
  const groupedMessages = React.useMemo(() => {
    const groups = [];
    let currentDate = null;
    let currentGroup = null;

    messages.forEach((message, index) => {
      const messageDate = new Date(message.createdAt).toDateString();
      const prevMessage = messages[index - 1];

      // Add date separator
      if (messageDate !== currentDate) {
        groups.push({
          type: "date",
          date: message.createdAt,
          id: `date-${messageDate}`,
        });
        currentDate = messageDate;
        currentGroup = null;
      }

      // Check if we should group with previous message
      const shouldGroup =
        prevMessage &&
        prevMessage.senderId === message.senderId &&
        new Date(message.createdAt) - new Date(prevMessage.createdAt) <
          5 * 60 * 1000 && // 5 minutes
        new Date(prevMessage.createdAt).toDateString() === messageDate;

      if (shouldGroup && currentGroup) {
        currentGroup.messages.push(message);
      } else {
        currentGroup = {
          type: "message",
          senderId: message.senderId,
          sender: message.sender,
          messages: [message],
          id: `group-${message.id}`,
        };
        groups.push(currentGroup);
      }
    });

    return groups;
  }, [messages]);

  // Get conversation display info
  const getConversationInfo = () => {
    if (!conversation) return { name: "", participants: [], description: "" };

    if (conversation.name) {
      return {
        name: conversation.name,
        participants: Array.from(conversation.participants?.values() || []),
        description: conversation.description || "",
      };
    }

    if (conversation.type === "direct") {
      const participants = Array.from(
        conversation.participants?.values() || []
      );
      const otherParticipant = participants.find(
        (p) => p.userId !== currentUser?.id
      );
      return {
        name: otherParticipant?.user?.name || "Unknown User",
        participants,
        description: otherParticipant?.user?.email || "",
      };
    }

    // Group conversation
    const participants = Array.from(conversation.participants?.values() || []);
    const otherParticipants = participants.filter(
      (p) => p.userId !== currentUser?.id
    );

    return {
      name:
        otherParticipants.length <= 2
          ? otherParticipants.map((p) => p.user?.name || "Unknown").join(", ")
          : `${otherParticipants
              .slice(0, 2)
              .map((p) => p.user?.name || "Unknown")
              .join(", ")} +${otherParticipants.length - 2} others`,
      participants,
      description: `${participants.length} members`,
    };
  };

  // Handle message actions
  const handleMessageEdit = (messageId, newContent) => {
    onEditMessage?.(messageId, newContent);
  };

  const handleMessageDelete = (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      onDeleteMessage?.(messageId);
    }
  };

  const handleMessageReply = (message) => {
    onReply?.(message);
  };

  const handleMessageForward = (message) => {
    onForward?.(message);
  };

  const conversationInfo = getConversationInfo();
  const onlineCount = conversationInfo.participants.filter(
    (p) => onlineUsers.get(p.userId)?.status === "online"
  ).length;

  if (!conversation) {
    return (
      <div
        className={`flex items-center justify-center h-full bg-gray-50 ${className}`}
      >
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No conversation selected
          </h3>
          <p className="text-gray-500">
            Choose a conversation from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            {conversation.type === "direct" ? (
              <Avatar
                user={
                  conversationInfo.participants.find(
                    (p) => p.userId !== currentUser?.id
                  )?.user
                }
                size="md"
                online={
                  onlineUsers.get(
                    conversationInfo.participants.find(
                      (p) => p.userId !== currentUser?.id
                    )?.userId
                  )?.status === "online"
                }
              />
            ) : (
              <AvatarGroup
                users={conversationInfo.participants
                  .filter((p) => p.userId !== currentUser?.id)
                  .map((p) => p.user)
                  .slice(0, 3)}
                size="md"
                max={2}
              />
            )}

            {/* Conversation Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {conversationInfo.name}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {conversation.type === "direct" ? (
                  <OnlineStatus
                    status={
                      onlineUsers.get(
                        conversationInfo.participants.find(
                          (p) => p.userId !== currentUser?.id
                        )?.userId
                      )?.status || "offline"
                    }
                    variant="text"
                    size="sm"
                    showText={true}
                    showLastSeen={true}
                    lastSeen={
                      conversationInfo.participants.find(
                        (p) => p.userId !== currentUser?.id
                      )?.user?.lastSeen
                    }
                  />
                ) : (
                  <ConversationOnlineCount
                    onlineUsers={conversationInfo.participants.filter(
                      (p) => onlineUsers.get(p.userId)?.status === "online"
                    )}
                    totalUsers={conversationInfo.participants.length}
                  />
                )}

                {typingUsers.length > 0 && (
                  <span className="text-green-600">
                    {typingUsers.length === 1
                      ? `${typingUsers[0].name || "Someone"} is typing...`
                      : `${typingUsers.length} people are typing...`}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-lg transition-colors ${
                showSearch
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
              title="Search in conversation"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Voice call"
            >
              <Phone className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Video call"
            >
              <Video className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 rounded-lg transition-colors ${
                showInfo
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
              title="Conversation info"
            >
              <Info className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-1"
      >
        {/* Loading indicator for more messages */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
          </div>
        )}

        {/* Messages */}
        {groupedMessages.map((group) => {
          if (group.type === "date") {
            return <DateSeparator key={group.id} date={group.date} />;
          }

          const isOwnMessage = group.senderId === currentUser?.id;

          return (
            <div key={group.id} className="space-y-1">
              {group.messages.map((message, index) => {
                const isGrouped = index > 0;
                const canEdit = isOwnMessage && message.type === "text";
                const canDelete = isOwnMessage;

                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={isOwnMessage}
                    showAvatar={!isGrouped}
                    showSenderName={
                      !isOwnMessage &&
                      !isGrouped &&
                      conversation.type !== "direct"
                    }
                    showTimestamp={index === group.messages.length - 1}
                    showStatus={isOwnMessage}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    onEdit={handleMessageEdit}
                    onDelete={handleMessageDelete}
                    onReply={handleMessageReply}
                    onForward={handleMessageForward}
                    onRetry={onRetry}
                    isGrouped={isGrouped}
                    conversationParticipants={conversationInfo.participants}
                  />
                );
              })}
            </div>
          );
        })}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <CompactTypingIndicator typingUsers={typingUsers} />
        )}

        {/* Messages End Marker */}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollToBottom && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-20 right-6 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all transform hover:scale-105"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Message Input */}
      <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4">
        <MessageInput
          value={messageDraft}
          onChange={onDraftChange}
          onSend={onSendMessage}
          onFileUpload={onFileUpload}
          onTypingStart={onTypingStart}
          onTypingStop={onTypingStop}
          disabled={isSending}
          replyingTo={replyingTo}
          onCancelReply={onCancelReply}
          uploadProgress={uploadProgress}
          placeholder={`Message ${conversationInfo.name}...`}
        />
      </div>

      {/* Conversation Info Sidebar */}
      {showInfo && (
        <div className="absolute top-0 right-0 w-80 h-full bg-white border-l border-gray-200 z-10">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Conversation Info</h2>
              <button
                onClick={() => setShowInfo(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* Conversation Details */}
            <div className="space-y-6">
              <div className="text-center">
                {conversation.type === "direct" ? (
                  <Avatar
                    user={
                      conversationInfo.participants.find(
                        (p) => p.userId !== currentUser?.id
                      )?.user
                    }
                    size="xl"
                    className="mx-auto mb-4"
                  />
                ) : (
                  <AvatarGroup
                    users={conversationInfo.participants.map((p) => p.user)}
                    size="lg"
                    className="justify-center mb-4"
                  />
                )}
                <h3 className="text-lg font-medium">{conversationInfo.name}</h3>
                <p className="text-gray-500">{conversationInfo.description}</p>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg">
                  <Volume2 className="w-5 h-5 text-gray-500" />
                  <span>Mute notifications</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg">
                  <Pin className="w-5 h-5 text-gray-500" />
                  <span>Pin conversation</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg">
                  <Archive className="w-5 h-5 text-gray-500" />
                  <span>Archive conversation</span>
                </button>
              </div>

              {/* Participants */}
              <div>
                <h4 className="font-medium mb-3">
                  Participants ({conversationInfo.participants.length})
                </h4>
                <div className="space-y-2">
                  {conversationInfo.participants.map((participant) => (
                    <div
                      key={participant.userId}
                      className="flex items-center space-x-3"
                    >
                      <Avatar
                        user={participant.user}
                        size="sm"
                        online={
                          onlineUsers.get(participant.userId)?.status ===
                          "online"
                        }
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {participant.user?.name || "Unknown User"}
                          {participant.userId === currentUser?.id && " (You)"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {participant.user?.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
