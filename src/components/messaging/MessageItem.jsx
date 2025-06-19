import React, { useState } from "react";
import {
  Check,
  CheckCheck,
  Clock,
  Star,
  Reply,
  Forward,
  MoreHorizontal,
  Download,
  Eye,
  EyeOff,
  Archive,
  Trash2,
  Edit,
  Copy,
  Flag,
  Paperclip,
  Image,
  FileText,
  Phone,
  Video,
  ExternalLink,
  Calendar,
  User,
} from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Modal from "../ui/Modal";

const MessageItem = ({
  message,
  isSelected = false,
  showActions = true,
  showAvatar = true,
  showStatus = true,
  showAttachments = true,
  compact = false,
  interactive = true,
  onSelect,
  onClick,
  onReply,
  onForward,
  onEdit,
  onDelete,
  onArchive,
  onStarToggle,
  onMarkRead,
  onMarkUnread,
  onFlag,
  onDownloadAttachment,
  className = "",
}) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  const messageTypes = {
    text: { icon: null, label: "Message", color: "text-gray-600" },
    call: { icon: Phone, label: "Call", color: "text-green-600" },
    video: { icon: Video, label: "Video Call", color: "text-blue-600" },
    meeting: { icon: Calendar, label: "Meeting", color: "text-purple-600" },
    file: { icon: Paperclip, label: "File", color: "text-gray-600" },
    image: { icon: Image, label: "Image", color: "text-indigo-600" },
  };

  const statusConfig = {
    sending: { icon: Clock, color: "text-gray-400", label: "Sending" },
    sent: { icon: Check, color: "text-gray-400", label: "Sent" },
    delivered: { icon: CheckCheck, color: "text-gray-500", label: "Delivered" },
    read: { icon: CheckCheck, color: "text-blue-500", label: "Read" },
    failed: { icon: Clock, color: "text-red-500", label: "Failed" },
  };

  const priorityConfig = {
    high: { color: "text-red-600", bg: "bg-red-100", label: "High Priority" },
    medium: {
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      label: "Medium Priority",
    },
    low: { color: "text-green-600", bg: "bg-green-100", label: "Low Priority" },
  };

  const messageType = messageTypes[message.type] || messageTypes.text;
  const MessageTypeIcon = messageType.icon;
  const statusInfo = statusConfig[message.status] || statusConfig.sent;
  const StatusIcon = statusInfo.icon;
  const priorityInfo = message.priority
    ? priorityConfig[message.priority]
    : null;

  // Get user avatar
  const getUserAvatar = (user, size = "default") => {
    const sizeClasses = {
      sm: "w-6 h-6",
      default: "w-8 h-8",
      lg: "w-10 h-10",
    };

    if (user.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user.name}
          className={`${sizeClasses[size]} rounded-full object-cover`}
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
      <div
        className={`${sizeClasses[size]} rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center`}
      >
        <span
          className={`text-xs font-medium text-gray-700 dark:text-gray-300 ${
            size === "sm" ? "text-xs" : "text-sm"
          }`}
        >
          {initials}
        </span>
      </div>
    );
  };

  // Format timestamp
  const formatTimestamp = (timestamp, detailed = false) => {
    const date = parseISO(timestamp);

    if (detailed) {
      return format(date, "PPpp");
    }

    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Get attachment icon
  const getAttachmentIcon = (attachment) => {
    const type = attachment.type || attachment.mimeType;

    if (type?.startsWith("image/")) return Image;
    if (type?.startsWith("video/")) return Video;
    if (type?.includes("pdf")) return FileText;
    return Paperclip;
  };

  // Handle attachment click
  const handleAttachmentClick = (attachment) => {
    setSelectedAttachment(attachment);
    setShowAttachmentModal(true);
  };

  // Render attachment
  const renderAttachment = (attachment, index) => {
    const AttachmentIcon = getAttachmentIcon(attachment);
    const isImage =
      attachment.type?.startsWith("image/") ||
      attachment.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    return (
      <div
        key={attachment.id || index}
        className="flex items-center space-x-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
        onClick={() => handleAttachmentClick(attachment)}
      >
        {isImage ? (
          <img
            src={attachment.url || attachment.thumbnail}
            alt={attachment.name}
            className="w-8 h-8 rounded object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
            <AttachmentIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {attachment.name}
          </p>
          {attachment.size && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {(attachment.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDownloadAttachment && onDownloadAttachment(attachment);
          }}
          className="p-1"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Render actions menu
  const renderActions = () => (
    <div className="flex items-center space-x-1">
      {onReply && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onReply(message);
          }}
          className="p-1"
          title="Reply"
        >
          <Reply className="h-4 w-4" />
        </Button>
      )}

      {onForward && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onForward(message);
          }}
          className="p-1"
          title="Forward"
        >
          <Forward className="h-4 w-4" />
        </Button>
      )}

      {onStarToggle && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onStarToggle(message);
          }}
          className="p-1"
          title={message.starred ? "Unstar" : "Star"}
        >
          <Star
            className={`h-4 w-4 ${
              message.starred ? "text-yellow-400 fill-current" : ""
            }`}
          />
        </Button>
      )}

      {(onMarkRead || onMarkUnread) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            message.read ? onMarkUnread?.(message) : onMarkRead?.(message);
          }}
          className="p-1"
          title={message.read ? "Mark as unread" : "Mark as read"}
        >
          {message.read ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      )}

      <Button variant="ghost" size="sm" className="p-1" title="More actions">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );

  if (compact) {
    return (
      <div
        className={`
          flex items-center space-x-3 p-2 rounded-lg transition-all duration-200
          ${
            interactive
              ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              : ""
          }
          ${
            isSelected
              ? "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 ring-opacity-50"
              : ""
          }
          ${!message.read ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}
          ${className}
        `}
        onClick={() => interactive && onClick?.(message)}
      >
        {onSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(message);
            }}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        )}

        {showAvatar && (
          <div className="flex-shrink-0">
            {getUserAvatar(message.sender, "sm")}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span
              className={`text-sm font-medium truncate ${
                !message.read ? "font-semibold" : ""
              }`}
            >
              {message.sender.name}
            </span>
            {MessageTypeIcon && (
              <MessageTypeIcon className={`h-3 w-3 ${messageType.color}`} />
            )}
            {message.starred && (
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
            )}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {message.content}
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTimestamp(message.timestamp)}
          </span>
          {showStatus && message.isSentByMe && (
            <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
          )}
          {!message.read && !message.isSentByMe && (
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200
        ${
          interactive
            ? "cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600"
            : ""
        }
        ${
          isSelected
            ? "ring-2 ring-blue-500 ring-opacity-50 border-blue-300 dark:border-blue-600"
            : ""
        }
        ${
          !message.read
            ? "bg-blue-50/30 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
            : "bg-white dark:bg-gray-800"
        }
        ${className}
      `}
      onClick={() => interactive && onClick?.(message)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect(message);
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
            />
          )}

          {showAvatar && (
            <div className="flex-shrink-0">{getUserAvatar(message.sender)}</div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4
                className={`text-sm font-medium text-gray-900 dark:text-white ${
                  !message.read ? "font-semibold" : ""
                }`}
              >
                {message.sender.name}
              </h4>

              {message.sender.role && (
                <Badge variant="secondary" className="text-xs">
                  {message.sender.role}
                </Badge>
              )}

              {MessageTypeIcon && (
                <div className="flex items-center space-x-1">
                  <MessageTypeIcon className={`h-4 w-4 ${messageType.color}`} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {messageType.label}
                  </span>
                </div>
              )}

              {priorityInfo && (
                <Badge
                  variant="outline"
                  className={`text-xs ${priorityInfo.color}`}
                >
                  {priorityInfo.label}
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{formatTimestamp(message.timestamp, true)}</span>
              {message.edited && <span className="italic">(edited)</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {message.starred && (
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
          )}

          {showStatus && message.isSentByMe && (
            <div className="flex items-center space-x-1">
              <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {statusInfo.label}
              </span>
            </div>
          )}

          {!message.read && !message.isSentByMe && (
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
          )}

          {showActions && renderActions()}
        </div>
      </div>

      {/* Subject */}
      {message.subject && (
        <div className="mb-3">
          <h5 className="text-sm font-medium text-gray-900 dark:text-white">
            {message.subject}
          </h5>
        </div>
      )}

      {/* Content */}
      <div className="mb-4">
        <div
          className={`text-sm text-gray-700 dark:text-gray-300 ${
            !showFullContent && message.content.length > 200
              ? "line-clamp-3"
              : ""
          }`}
        >
          {showFullContent ? message.content : message.content.slice(0, 200)}
          {!showFullContent && message.content.length > 200 && "..."}
        </div>

        {message.content.length > 200 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowFullContent(!showFullContent);
            }}
            className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-700"
          >
            {showFullContent ? "Show less" : "Show more"}
          </Button>
        )}
      </div>

      {/* Attachments */}
      {showAttachments && message.attachments?.length > 0 && (
        <div className="mb-4">
          <h6 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Attachments ({message.attachments.length})
          </h6>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {message.attachments.map(renderAttachment)}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
          {message.recipient && <span>To: {message.recipient.name}</span>}

          {message.category && (
            <Badge variant="outline" className="text-xs">
              {message.category}
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {message.flagged && <Flag className="h-4 w-4 text-red-500" />}

          {message.hasReminder && <Clock className="h-4 w-4 text-orange-500" />}
        </div>
      </div>

      {/* Attachment Modal */}
      {showAttachmentModal && selectedAttachment && (
        <Modal
          isOpen={showAttachmentModal}
          onClose={() => setShowAttachmentModal(false)}
          title={selectedAttachment.name}
          className="max-w-4xl"
        >
          <div className="space-y-4">
            {selectedAttachment.type?.startsWith("image/") ? (
              <img
                src={selectedAttachment.url}
                alt={selectedAttachment.name}
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedAttachment.name}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Size: {(selectedAttachment.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Type: {selectedAttachment.type}
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => onDownloadAttachment?.(selectedAttachment)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>

                {selectedAttachment.url && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(selectedAttachment.url, "_blank")
                    }
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MessageItem;
