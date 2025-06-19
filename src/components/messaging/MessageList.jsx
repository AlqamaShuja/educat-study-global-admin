import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  CheckCheck,
  Check,
  Clock,
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  Download,
  Paperclip,
  Image,
  Phone,
  Video,
  User,
} from "lucide-react";
import {
  format,
  parseISO,
  isToday,
  isYesterday,
  formatDistanceToNow,
} from "date-fns";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Input from "../ui/Input";

const MessageList = ({
  messages = [],
  selectedMessageId,
  searchTerm = "",
  filterBy = "all",
  showSearch = true,
  showFilters = true,
  showActions = true,
  allowSelect = true,
  groupByDate = true,
  showAvatars = true,
  showStatus = true,
  showAttachments = true,
  maxHeight = "600px",
  onMessageClick,
  onMessageSelect,
  onSearch,
  onFilter,
  onReply,
  onForward,
  onArchive,
  onDelete,
  onMarkRead,
  onStarToggle,
  className = "",
  loading = false,
  error = null,
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [currentFilter, setCurrentFilter] = useState(filterBy);
  const listRef = useRef(null);

  const messageTypes = {
    text: { icon: null, label: "Message" },
    call: { icon: Phone, label: "Call" },
    video: { icon: Video, label: "Video Call" },
    file: { icon: Paperclip, label: "File" },
    image: { icon: Image, label: "Image" },
  };

  const statusConfig = {
    sent: { icon: Check, color: "text-gray-400" },
    delivered: { icon: CheckCheck, color: "text-gray-400" },
    read: { icon: CheckCheck, color: "text-blue-500" },
    failed: { icon: Clock, color: "text-red-500" },
  };

  // Filter messages
  const filteredMessages = React.useMemo(() => {
    let filtered = messages;

    if (localSearchTerm) {
      const term = localSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (msg) =>
          msg.content.toLowerCase().includes(term) ||
          msg.sender.name.toLowerCase().includes(term) ||
          msg.subject?.toLowerCase().includes(term)
      );
    }

    switch (currentFilter) {
      case "unread":
        filtered = filtered.filter((msg) => !msg.read);
        break;
      case "starred":
        filtered = filtered.filter((msg) => msg.starred);
        break;
      case "archived":
        filtered = filtered.filter((msg) => msg.archived);
        break;
      case "attachments":
        filtered = filtered.filter((msg) => msg.attachments?.length > 0);
        break;
      default:
        break;
    }

    return filtered;
  }, [messages, localSearchTerm, currentFilter]);

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    if (!groupByDate) return { all: filteredMessages };

    const groups = {};

    filteredMessages.forEach((message) => {
      const messageDate = parseISO(message.timestamp);
      let groupKey;

      if (isToday(messageDate)) {
        groupKey = "Today";
      } else if (isYesterday(messageDate)) {
        groupKey = "Yesterday";
      } else {
        groupKey = format(messageDate, "MMMM d, yyyy");
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(message);
    });

    return groups;
  }, [filteredMessages, groupByDate]);

  // Handle search
  const handleSearch = (value) => {
    setLocalSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
    if (onFilter) {
      onFilter(filter);
    }
  };

  // Toggle message selection
  const toggleMessageSelection = (messageId) => {
    if (!allowSelect) return;

    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);

    if (onMessageSelect) {
      onMessageSelect(Array.from(newSelected));
    }
  };

  // Select all messages
  const selectAll = () => {
    const allIds = new Set(filteredMessages.map((msg) => msg.id));
    setSelectedMessages(allIds);
    if (onMessageSelect) {
      onMessageSelect(Array.from(allIds));
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedMessages(new Set());
    if (onMessageSelect) {
      onMessageSelect([]);
    }
  };

  // Get user avatar
  const getUserAvatar = (user) => {
    if (user.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }

    const initials = user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return (
      <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {initials}
        </span>
      </div>
    );
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = parseISO(timestamp);

    if (isToday(date)) {
      return format(date, "h:mm a");
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMM d");
    }
  };

  // Render message item
  const renderMessage = (message) => {
    const isSelected = selectedMessages.has(message.id);
    const isCurrentSelected = selectedMessageId === message.id;
    const messageType = messageTypes[message.type] || messageTypes.text;
    const MessageTypeIcon = messageType.icon;
    const statusInfo = statusConfig[message.status] || statusConfig.sent;
    const StatusIcon = statusInfo.icon;

    return (
      <div
        key={message.id}
        className={`
          group flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200
          ${
            isCurrentSelected
              ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
              : "hover:bg-gray-50 dark:hover:bg-gray-700"
          }
          ${!message.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}
          ${isSelected ? "ring-2 ring-blue-500 ring-opacity-50" : ""}
        `}
        onClick={() => {
          if (onMessageClick) {
            onMessageClick(message);
          }
          if (!message.read && onMarkRead) {
            onMarkRead(message);
          }
        }}
      >
        {/* Selection Checkbox */}
        {allowSelect && (
          <div className="flex-shrink-0 mt-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                toggleMessageSelection(message.id);
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Avatar */}
        {showAvatars && (
          <div className="flex-shrink-0">{getUserAvatar(message.sender)}</div>
        )}

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Sender and Subject */}
              <div className="flex items-center space-x-2 mb-1">
                <h4
                  className={`
                  text-sm font-medium truncate
                  ${
                    !message.read
                      ? "text-gray-900 dark:text-white font-semibold"
                      : "text-gray-700 dark:text-gray-300"
                  }
                `}
                >
                  {message.sender.name}
                </h4>

                {message.subject && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    - {message.subject}
                  </span>
                )}

                {message.starred && (
                  <Star className="h-4 w-4 text-yellow-400 fill-current flex-shrink-0" />
                )}

                {MessageTypeIcon && (
                  <MessageTypeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
              </div>

              {/* Message Preview */}
              <p
                className={`
                text-sm line-clamp-2
                ${
                  !message.read
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400"
                }
              `}
              >
                {message.content}
              </p>

              {/* Attachments */}
              {showAttachments && message.attachments?.length > 0 && (
                <div className="flex items-center space-x-2 mt-2">
                  <Paperclip className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {message.attachments.length} attachment
                    {message.attachments.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>

            {/* Timestamp and Status */}
            <div className="flex flex-col items-end space-y-1 ml-4 flex-shrink-0">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTimestamp(message.timestamp)}
              </span>

              {showStatus && message.isSentByMe && (
                <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
              )}

              {!message.read && !message.isSentByMe && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onReply && onReply(message);
              }}
              className="p-1"
            >
              <Reply className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onStarToggle && onStarToggle(message);
              }}
              className="p-1"
            >
              <Star
                className={`h-4 w-4 ${
                  message.starred ? "text-yellow-400 fill-current" : ""
                }`}
              />
            </Button>

            <Button variant="ghost" size="sm" className="p-1">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <div className="p-4">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <div className="p-4 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Messages
            </h3>
            <Badge variant="secondary">{filteredMessages.length}</Badge>
          </div>

          {/* Search */}
          {showSearch && (
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search messages..."
                value={localSearchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-2">
              {["all", "unread", "starred", "archived", "attachments"].map(
                (filter) => (
                  <Button
                    key={filter}
                    variant={currentFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange(filter)}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                )
              )}
            </div>
          )}

          {/* Bulk Actions */}
          {selectedMessages.size > 0 && (
            <div className="flex items-center justify-between mt-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {selectedMessages.size} selected
              </span>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
                <Button variant="ghost" size="sm">
                  <Archive className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Message List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-4 space-y-1"
          style={{ maxHeight }}
        >
          {Object.entries(groupedMessages).map(([groupName, groupMessages]) => (
            <div key={groupName}>
              {groupByDate && Object.keys(groupedMessages).length > 1 && (
                <div className="sticky top-0 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 rounded-lg mb-2">
                  {groupName}
                </div>
              )}
              {groupMessages.map(renderMessage)}
            </div>
          ))}

          {filteredMessages.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <User className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                {localSearchTerm || currentFilter !== "all"
                  ? "No messages match your criteria"
                  : "No messages yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MessageList;
