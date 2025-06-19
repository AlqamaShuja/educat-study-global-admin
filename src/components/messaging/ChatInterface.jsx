import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  Image,
  Smile,
  Phone,
  Video,
  Info,
  Search,
  MoreVertical,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  Star,
  Archive,
  Trash2,
  Download,
  Reply,
  Forward,
  Edit,
  Copy,
  Flag,
  Mic,
  MicOff,
  Pause,
  Play,
  X,
  Plus,
} from "lucide-react";
import {
  format,
  parseISO,
  isToday,
  isYesterday,
  formatDistanceToNow,
} from "date-fns";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Badge from "../ui/Badge";
import Modal from "../ui/Modal";

const ChatInterface = ({
  conversation,
  messages = [],
  currentUser,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onReplyToMessage,
  onForwardMessage,
  onStartCall,
  onStartVideoCall,
  onToggleStarMessage,
  onSearchMessages,
  onLoadMoreMessages,
  onTypingStart,
  onTypingStop,
  onMarkAsRead,
  onArchiveConversation,
  onDeleteConversation,
  showParticipants = true,
  showMessageActions = true,
  showCallButtons = true,
  allowFileUpload = true,
  allowVoiceMessages = true,
  maxMessageLength = 2000,
  className = "",
  loading = false,
  typing = false,
  onlineStatus = {},
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showParticipantsList, setShowParticipantsList] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showMessageDetails, setShowMessageDetails] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const recordingTimer = useRef(null);

  const statusConfig = {
    sending: { icon: Clock, color: "text-gray-400" },
    sent: { icon: Check, color: "text-gray-400" },
    delivered: { icon: CheckCheck, color: "text-gray-500" },
    read: { icon: CheckCheck, color: "text-blue-500" },
    failed: { icon: X, color: "text-red-500" },
  };

  const emojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "👍",
    "👎",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝️",
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👏",
    "🙌",
    "🤲",
    "🤝",
    "🙏",
    "✍️",
    "💪",
    "🦾",
    "🦿",
    "🦵",
    "🦶",
    "👂",
    "🦻",
    "👃",
    "🧠",
    "🫀",
    "🫁",
    "🦷",
    "🦴",
    "👀",
    "👁️",
    "👅",
    "👄",
    "💋",
    "🩸",
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(recordingTimer.current);
      setRecordingDuration(0);
    }

    return () => clearInterval(recordingTimer.current);
  }, [isRecording]);

  // Typing indicator
  useEffect(() => {
    let typingTimeout;

    if (newMessage.trim()) {
      onTypingStart?.();
      typingTimeout = setTimeout(() => {
        onTypingStop?.();
      }, 3000);
    } else {
      onTypingStop?.();
    }

    return () => clearTimeout(typingTimeout);
  }, [newMessage, onTypingStart, onTypingStop]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() || attachments.length > 0) {
      const messageData = {
        content: newMessage.trim(),
        attachments,
        replyTo: replyingTo?.id,
        type: attachments.some((a) => a.type?.startsWith("image/"))
          ? "image"
          : "text",
      };

      onSendMessage?.(messageData);
      setNewMessage("");
      setAttachments([]);
      setReplyingTo(null);
      messageInputRef.current?.focus();
    }
  };

  const handleEditMessage = (messageId) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      setEditingMessageId(messageId);
      setEditingContent(message.content);
    }
  };

  const saveEditedMessage = () => {
    if (editingContent.trim()) {
      onEditMessage?.(editingMessageId, editingContent.trim());
      setEditingMessageId(null);
      setEditingContent("");
    }
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const attachment = {
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      };
      setAttachments((prev) => [...prev, attachment]);
    });
    e.target.value = "";
  };

  const removeAttachment = (attachmentId) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  };

  const insertEmoji = (emoji) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  const toggleMessageSelection = (messageId) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
  };

  const startRecording = () => {
    setIsRecording(true);
    // Add actual voice recording logic here
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Add logic to save voice message
  };

  const formatMessageTime = (timestamp) => {
    const date = parseISO(timestamp);

    if (isToday(date)) {
      return format(date, "HH:mm");
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, "HH:mm")}`;
    } else {
      return format(date, "MMM dd, HH:mm");
    }
  };

  const getUserStatus = (userId) => {
    return onlineStatus[userId] || "offline";
  };

  const renderMessage = (message, index) => {
    const isOwnMessage = message.senderId === currentUser?.id;
    const isEditing = editingMessageId === message.id;
    const isSelected = selectedMessages.has(message.id);
    const statusInfo = statusConfig[message.status] || statusConfig.sent;
    const StatusIcon = statusInfo.icon;
    const nextMessage = messages[index + 1];
    const isLastInGroup =
      !nextMessage || nextMessage.senderId !== message.senderId;

    return (
      <div
        key={message.id}
        className={`flex ${
          isOwnMessage ? "justify-end" : "justify-start"
        } mb-2 group`}
      >
        <div
          className={`flex items-start space-x-2 max-w-[70%] ${
            isOwnMessage ? "flex-row-reverse space-x-reverse" : ""
          }`}
        >
          {/* Avatar */}
          {!isOwnMessage && isLastInGroup && (
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
              {message.sender?.avatar ? (
                <img
                  src={message.sender.avatar}
                  alt={message.sender.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {message.sender?.name?.charAt(0) || "U"}
                </span>
              )}
            </div>
          )}

          {!isOwnMessage && !isLastInGroup && <div className="w-8" />}

          {/* Message bubble */}
          <div
            className={`
              relative px-4 py-2 rounded-lg max-w-full
              ${
                isOwnMessage
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
              }
              ${isSelected ? "ring-2 ring-blue-500 ring-opacity-50" : ""}
              ${showMessageActions ? "cursor-pointer" : ""}
            `}
            onClick={() =>
              showMessageActions && toggleMessageSelection(message.id)
            }
          >
            {/* Reply indicator */}
            {message.replyTo && (
              <div
                className={`text-xs mb-2 p-2 rounded ${
                  isOwnMessage ? "bg-blue-700" : "bg-gray-200 dark:bg-gray-600"
                }`}
              >
                <div className="font-medium">Replying to:</div>
                <div className="truncate">{message.replyTo.content}</div>
              </div>
            )}

            {/* Message content */}
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      saveEditedMessage();
                    } else if (e.key === "Escape") {
                      cancelEdit();
                    }
                  }}
                  className="bg-white dark:bg-gray-800"
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={saveEditedMessage}>
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-sm">{message.content}</div>

                {/* Attachments */}
                {message.attachments?.map((attachment, idx) => (
                  <div key={idx} className="mt-2">
                    {attachment.type?.startsWith("image/") ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="max-w-full h-auto rounded cursor-pointer"
                        onClick={() => window.open(attachment.url, "_blank")}
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-2 bg-white bg-opacity-20 rounded">
                        <Paperclip className="h-4 w-4" />
                        <span className="text-sm">{attachment.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(attachment.url, "_blank")}
                          className="p-1"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* Message metadata */}
            <div
              className={`flex items-center justify-between mt-2 text-xs ${
                isOwnMessage
                  ? "text-blue-100"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <span>{formatMessageTime(message.timestamp)}</span>
              <div className="flex items-center space-x-1">
                {message.edited && <span className="italic">edited</span>}
                {message.starred && <Star className="h-3 w-3 fill-current" />}
                {isOwnMessage && (
                  <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
                )}
              </div>
            </div>

            {/* Message actions */}
            {showMessageActions && (
              <div
                className={`
                absolute top-0 ${
                  isOwnMessage
                    ? "left-0 -translate-x-full"
                    : "right-0 translate-x-full"
                }
                opacity-0 group-hover:opacity-100 transition-opacity
                flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1
              `}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReplyToMessage?.(message);
                    setReplyingTo(message);
                  }}
                  className="p-1"
                >
                  <Reply className="h-3 w-3" />
                </Button>

                {isOwnMessage && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditMessage(message.id);
                    }}
                    className="p-1"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStarMessage?.(message);
                  }}
                  className="p-1"
                >
                  <Star
                    className={`h-3 w-3 ${
                      message.starred ? "fill-current text-yellow-500" : ""
                    }`}
                  />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMessageDetails(message);
                  }}
                  className="p-1"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-gray-800 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="p-1 md:hidden">
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {conversation?.avatar ? (
            <img
              src={conversation.avatar}
              alt={conversation.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {conversation?.name?.charAt(0) || "C"}
              </span>
            </div>
          )}

          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {conversation?.name || "Conversation"}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              {conversation?.participants && (
                <span>{conversation.participants.length} participants</span>
              )}
              {typing && <span className="italic">Someone is typing...</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
            className="p-1"
          >
            <Search className="h-4 w-4" />
          </Button>

          {showCallButtons && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStartCall?.(conversation)}
                className="p-1"
              >
                <Phone className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStartVideoCall?.(conversation)}
                className="p-1"
              >
                <Video className="h-4 w-4" />
              </Button>
            </>
          )}

          {showParticipants && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowParticipantsList(true)}
              className="p-1"
            >
              <Info className="h-4 w-4" />
            </Button>
          )}

          <Button variant="ghost" size="sm" className="p-1">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Input
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(renderMessage)}

        {typing && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Reply className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Replying to {replyingTo.sender?.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(null)}
              className="p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
            {replyingTo.content}
          </div>
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="relative">
                {attachment.type?.startsWith("image/") ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                    <Paperclip className="h-6 w-6 text-gray-500" />
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(attachment.id)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-end space-x-2">
          {/* Attachment buttons */}
          <div className="flex items-center space-x-1">
            {allowFileUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          {/* Message input */}
          <div className="flex-1 relative">
            <Input
              ref={messageInputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="pr-12"
              maxLength={maxMessageLength}
            />

            {/* Character count */}
            {newMessage.length > maxMessageLength * 0.8 && (
              <div className="absolute -top-6 right-0 text-xs text-gray-500">
                {newMessage.length}/{maxMessageLength}
              </div>
            )}
          </div>

          {/* Voice message / Send button */}
          {allowVoiceMessages &&
          !newMessage.trim() &&
          attachments.length === 0 ? (
            <Button
              variant={isRecording ? "destructive" : "ghost"}
              size="sm"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              className="p-2"
            >
              {isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && attachments.length === 0}
              size="sm"
              className="p-2"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <div className="mt-2 flex items-center space-x-2 text-red-600">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-sm">Recording... {recordingDuration}s</span>
          </div>
        )}
      </div>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-10">
          <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => insertEmoji(emoji)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message details modal */}
      {showMessageDetails && (
        <Modal
          isOpen={!!showMessageDetails}
          onClose={() => setShowMessageDetails(null)}
          title="Message Details"
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Sent by</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {showMessageDetails.sender?.name}
              </p>
            </div>

            <div>
              <h4 className="font-medium">Timestamp</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {format(parseISO(showMessageDetails.timestamp), "PPpp")}
              </p>
            </div>

            <div>
              <h4 className="font-medium">Status</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {showMessageDetails.status}
              </p>
            </div>

            {showMessageDetails.edited && (
              <div>
                <h4 className="font-medium">Last edited</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {format(parseISO(showMessageDetails.editedAt), "PPpp")}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ChatInterface;
