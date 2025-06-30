import React, { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Reply,
  Edit,
  Trash2,
  Copy,
  Forward,
  Pin,
  Download,
  ExternalLink,
  AlertCircle,
  Volume2,
  Play,
  Pause,
} from "lucide-react";
// import Avatar from "./Avatar";
import MessageStatus, {
  CompactMessageStatus,
  RetryMessageButton,
} from "./MessageStatus";
// import OnlineStatus from "./OnlineStatus";
import Avatar from "../ui/Avatar";


const MessageBubble = ({
  message,
  isOwn = false,
  showAvatar = true,
  showSenderName = false,
  showTimestamp = true,
  showStatus = true,
  canEdit = false,
  canDelete = false,
  onEdit = null,
  onDelete = null,
  onReply = null,
  onForward = null,
  onRetry = null,
  className = "",
  isSelected = false,
  isGrouped = false, // Whether this message is grouped with previous message from same sender
  conversationParticipants = [],
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || "");
  const [showMediaControls, setShowMediaControls] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const messageRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  // Handle edit save
  const handleEditSave = () => {
    if (editContent.trim() !== message.content && onEdit) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditContent(message.content || "");
    setIsEditing(false);
  };

  // Copy message content
  const handleCopy = () => {
    if (message.type === "text") {
      navigator.clipboard.writeText(message.content);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get file size display
  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Handle audio/video play
  const handleMediaPlay = () => {
    const media = audioRef.current || videoRef.current;
    if (media) {
      if (isPlaying) {
        media.pause();
      } else {
        media.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Message content renderers
  const renderTextContent = () => {
    if (isEditing) {
      return (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleEditSave();
              } else if (e.key === "Escape") {
                handleEditCancel();
              }
            }}
          />
          <div className="flex space-x-2">
            <button
              onClick={handleEditSave}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={handleEditCancel}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="whitespace-pre-wrap break-words">
        {message.content}
        {message.isEdited && (
          <span className="text-xs text-gray-400 ml-2">(edited)</span>
        )}
      </div>
    );
  };

  const renderImageContent = () => (
    <div className="space-y-2">
      <div className="relative group">
        <img
          src={message.fileUrl}
          alt={message.fileName || "Image"}
          className="max-w-sm max-h-64 rounded-lg cursor-pointer"
          onClick={() => window.open(message.fileUrl, "_blank")}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
          <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      {message.content && <div className="text-sm">{message.content}</div>}
    </div>
  );

  const renderVideoContent = () => (
    <div className="space-y-2">
      <div className="relative max-w-sm">
        <video
          ref={videoRef}
          src={message.fileUrl}
          className="w-full max-h-64 rounded-lg"
          controls
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>
      {message.content && <div className="text-sm">{message.content}</div>}
    </div>
  );

  const renderAudioContent = () => (
    <div className="space-y-2">
      <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3 min-w-48">
        <button
          onClick={handleMediaPlay}
          className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>
        <div className="flex-1">
          <div className="text-sm font-medium">
            {message.fileName || "Audio"}
          </div>
          <audio
            ref={audioRef}
            src={message.fileUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
        <Volume2 className="w-5 h-5 text-gray-400" />
      </div>
      {message.content && <div className="text-sm">{message.content}</div>}
    </div>
  );

  const renderFileContent = () => (
    <div className="space-y-2">
      <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center">
          <Download className="w-5 h-5 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">
            {message.fileName || "File"}
          </div>
          <div className="text-xs text-gray-500">
            {formatFileSize(message.fileSize)}
          </div>
        </div>
        <a
          href={message.fileUrl}
          download={message.fileName}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4 text-gray-600" />
        </a>
      </div>
      {message.content && <div className="text-sm">{message.content}</div>}
    </div>
  );

  const renderMessageContent = () => {
    switch (message.type) {
      case "image":
        return renderImageContent();
      case "video":
        return renderVideoContent();
      case "audio":
        return renderAudioContent();
      case "file":
        return renderFileContent();
      case "text":
      default:
        return renderTextContent();
    }
  };

  // Message actions menu
  const MessageActions = () => (
    <div className="absolute right-0 top-0 mt-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
      {onReply && (
        <button
          onClick={() => {
            onReply(message);
            setShowActions(false);
          }}
          className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50"
        >
          <Reply className="w-4 h-4" />
          <span>Reply</span>
        </button>
      )}

      {message.type === "text" && (
        <button
          onClick={() => {
            handleCopy();
            setShowActions(false);
          }}
          className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50"
        >
          <Copy className="w-4 h-4" />
          <span>Copy</span>
        </button>
      )}

      {onForward && (
        <button
          onClick={() => {
            onForward(message);
            setShowActions(false);
          }}
          className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50"
        >
          <Forward className="w-4 h-4" />
          <span>Forward</span>
        </button>
      )}

      {canEdit && message.type === "text" && (
        <button
          onClick={() => {
            setIsEditing(true);
            setShowActions(false);
          }}
          className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50"
        >
          <Edit className="w-4 h-4" />
          <span>Edit</span>
        </button>
      )}

      {canDelete && (
        <button
          onClick={() => {
            if (onDelete) onDelete(message.id);
            setShowActions(false);
          }}
          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      )}
    </div>
  );

  const bubbleBaseClasses = `
    max-w-xs lg:max-w-md xl:max-w-lg rounded-2xl px-4 py-2 relative
    ${isOwn ? "bg-blue-500 text-white ml-auto" : "bg-gray-100 text-gray-900"}
    ${isSelected ? "ring-2 ring-blue-400" : ""}
    ${message.status === "failed" ? "bg-red-100 border border-red-200" : ""}
    ${isGrouped ? (isOwn ? "rounded-br-md" : "rounded-bl-md") : ""}
  `;

  return (
    <div
      ref={messageRef}
      className={`flex items-end space-x-2 mb-2 group ${
        isOwn ? "flex-row-reverse space-x-reverse" : ""
      } ${className}`}
    >
      {/* Avatar */}
      {showAvatar && !isGrouped && (
        <div className="flex-shrink-0">
          {isOwn ? (
            <div className="w-8 h-8" /> // Spacer for own messages
          ) : (
            <Avatar
              user={message.sender}
              size="sm"
              online={message.sender?.status === "online"}
            />
          )}
        </div>
      )}

      {/* Message Bubble */}
      <div className="flex-1 min-w-0">
        {/* Sender Name */}
        {showSenderName && !isOwn && !isGrouped && (
          <div className="text-sm text-gray-600 mb-1 ml-2">
            {message.sender?.name || "Unknown User"}
          </div>
        )}

        {/* Reply Context */}
        {message.replyTo && (
          <div
            className={`
            text-xs border-l-2 pl-2 mb-2 opacity-75
            ${
              isOwn
                ? "border-white/30 text-white/80"
                : "border-gray-300 text-gray-600"
            }
          `}
          >
            <div className="font-medium">
              {message.replyTo.sender?.name || "Unknown"}
            </div>
            <div className="truncate">
              {message.replyTo.type === "text"
                ? message.replyTo.content
                : `${message.replyTo.type} message`}
            </div>
          </div>
        )}

        {/* Main Message */}
        <div
          className={bubbleBaseClasses}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {renderMessageContent()}

          {/* Message Footer */}
          <div
            className={`
            flex items-center justify-between mt-2 space-x-2
            ${isOwn ? "text-white/70" : "text-gray-500"}
          `}
          >
            <div className="flex items-center space-x-1 text-xs">
              {showTimestamp && <span>{formatTime(message.createdAt)}</span>}
            </div>

            {isOwn && showStatus && (
              <CompactMessageStatus
                status={message.status || "sent"}
                timestamp={message.createdAt}
                showTimestamp={false}
                className="text-white/70"
              />
            )}
          </div>

          {/* Actions Button */}
          {(showActions || isSelected) && (
            <button
              onClick={() => setShowActions(!showActions)}
              className={`
                absolute top-2 ${isOwn ? "left-2" : "right-2"}
                p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity
                ${
                  isOwn ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                }
                hover:bg-opacity-30
              `}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          )}

          {/* Actions Menu */}
          {showActions && <MessageActions />}
        </div>

        {/* Failed Message Retry */}
        {message.status === "failed" && onRetry && (
          <div className="mt-1 ml-2">
            <RetryMessageButton
              onRetry={() => onRetry(message)}
              className="text-xs"
            />
          </div>
        )}
      </div>

      {/* Own message avatar placeholder */}
      {showAvatar && !isGrouped && isOwn && <div className="w-8 h-8" />}
    </div>
  );
};

// System message component
export const SystemMessage = ({ message, className = "" }) => (
  <div className={`flex justify-center my-4 ${className}`}>
    <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full max-w-sm text-center">
      {message.content}
    </div>
  </div>
);

// Date separator component
export const DateSeparator = ({ date, className = "" }) => (
  <div className={`flex justify-center my-4 ${className}`}>
    <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
      {new Date(date).toLocaleDateString([], {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
    </div>
  </div>
);

export default MessageBubble;
