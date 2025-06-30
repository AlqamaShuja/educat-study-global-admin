import React from "react";
import { Check, CheckCheck, Clock, AlertCircle, Send, Eye } from "lucide-react";

const MessageStatus = ({
  status = "sent",
  size = "sm",
  showText = false,
  timestamp = null,
  readBy = [],
  error = null,
  className = "",
}) => {
  // Status configurations
  const statusConfig = {
    sending: {
      icon: Clock,
      color: "text-gray-400",
      bgColor: "bg-gray-100",
      label: "Sending",
      description: "Message is being sent...",
      animate: true,
    },
    sent: {
      icon: Check,
      color: "text-gray-400",
      bgColor: "bg-gray-100",
      label: "Sent",
      description: "Message sent successfully",
      animate: false,
    },
    delivered: {
      icon: CheckCheck,
      color: "text-gray-500",
      bgColor: "bg-gray-100",
      label: "Delivered",
      description: "Message delivered to recipient",
      animate: false,
    },
    read: {
      icon: CheckCheck,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      label: "Read",
      description: "Message has been read",
      animate: false,
    },
    failed: {
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-100",
      label: "Failed",
      description: "Failed to send message",
      animate: false,
    },
  };

  // Size configurations
  const sizeConfig = {
    xs: {
      icon: "w-3 h-3",
      text: "text-xs",
      badge: "w-4 h-4",
    },
    sm: {
      icon: "w-4 h-4",
      text: "text-sm",
      badge: "w-5 h-5",
    },
    md: {
      icon: "w-5 h-5",
      text: "text-base",
      badge: "w-6 h-6",
    },
    lg: {
      icon: "w-6 h-6",
      text: "text-lg",
      badge: "w-7 h-7",
    },
  };

  const config = statusConfig[status] || statusConfig.sent;
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

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

  // Get tooltip text
  const getTooltipText = () => {
    let text = config.description;

    if (timestamp) {
      text += ` at ${formatTimestamp(timestamp)}`;
    }

    if (status === "read" && readBy.length > 0) {
      const readers = readBy
        .slice(0, 3)
        .map((user) => user.name || "Unknown")
        .join(", ");
      const remaining = readBy.length - 3;
      text += `\nRead by: ${readers}`;
      if (remaining > 0) {
        text += ` and ${remaining} others`;
      }
    }

    if (error) {
      text += `\nError: ${error}`;
    }

    return text;
  };

  return (
    <div
      className={`flex items-center space-x-1 ${className}`}
      title={getTooltipText()}
    >
      {/* Status Icon */}
      <Icon
        className={`
          ${sizes.icon} ${config.color}
          ${config.animate ? "animate-spin" : ""}
          ${status === "failed" ? "animate-pulse" : ""}
        `}
      />

      {/* Status Text */}
      {showText && (
        <span className={`${sizes.text} ${config.color} font-medium`}>
          {config.label}
        </span>
      )}

      {/* Timestamp */}
      {timestamp && (
        <span className={`${sizes.text} text-gray-400`}>
          {formatTimestamp(timestamp)}
        </span>
      )}

      {/* Read Count Badge */}
      {status === "read" && readBy.length > 1 && (
        <div
          className={`
            ${sizes.badge} ${config.bgColor} ${config.color}
            rounded-full flex items-center justify-center
            text-xs font-bold
          `}
          title={`Read by ${readBy.length} people`}
        >
          {readBy.length}
        </div>
      )}
    </div>
  );
};

// Compact status indicator for message bubbles
export const CompactMessageStatus = ({
  status,
  timestamp,
  showTimestamp = true,
  className = "",
}) => (
  <div className={`flex items-center space-x-1 ${className}`}>
    <MessageStatus status={status} size="xs" showText={false} />
    {showTimestamp && timestamp && (
      <span className="text-xs text-gray-400">
        {new Date(timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    )}
  </div>
);

// Detailed status for message info modal
export const DetailedMessageStatus = ({
  status,
  sentAt,
  deliveredAt,
  readAt,
  readBy = [],
  error,
  className = "",
}) => {
  const getStatusSteps = () => {
    const steps = [
      {
        label: "Sent",
        timestamp: sentAt,
        completed: ["sent", "delivered", "read"].includes(status),
        icon: Send,
      },
      {
        label: "Delivered",
        timestamp: deliveredAt,
        completed: ["delivered", "read"].includes(status),
        icon: Check,
      },
      {
        label: "Read",
        timestamp: readAt,
        completed: status === "read",
        icon: Eye,
      },
    ];

    return steps;
  };

  const steps = getStatusSteps();

  if (status === "failed") {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Failed to send</span>
        </div>
        {error && <p className="text-sm text-red-500 ml-7">{error}</p>}
        {sentAt && (
          <p className="text-sm text-gray-500 ml-7">
            Attempted at {new Date(sentAt).toLocaleString()}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <div key={step.label} className="flex items-start space-x-3">
            <div
              className={`
                w-6 h-6 rounded-full flex items-center justify-center mt-0.5
                ${
                  step.completed
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span
                  className={`
                    text-sm font-medium
                    ${step.completed ? "text-gray-900" : "text-gray-400"}
                  `}
                >
                  {step.label}
                </span>
                {step.timestamp && (
                  <span className="text-xs text-gray-500">
                    {new Date(step.timestamp).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Read by users */}
              {step.label === "Read" && readBy.length > 0 && (
                <div className="mt-1">
                  <div className="text-xs text-gray-500">
                    Read by:{" "}
                    {readBy.map((user) => user.name || "Unknown").join(", ")}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Status indicator for conversation list
export const ConversationMessageStatus = ({
  lastMessage,
  unreadCount = 0,
  className = "",
}) => {
  if (!lastMessage) return null;

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {unreadCount > 0 ? (
        <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
          {unreadCount > 99 ? "99+" : unreadCount}
        </div>
      ) : (
        <MessageStatus
          status={lastMessage.status || "sent"}
          size="xs"
          showText={false}
        />
      )}
    </div>
  );
};

// Bulk message status for group conversations
export const BulkMessageStatus = ({
  totalRecipients = 0,
  deliveredCount = 0,
  readCount = 0,
  size = "sm",
  showDetails = false,
  className = "",
}) => {
  const sizes = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
  };

  if (totalRecipients <= 1) {
    // Single recipient - show normal status
    if (readCount > 0) return <MessageStatus status="read" size={size} />;
    if (deliveredCount > 0)
      return <MessageStatus status="delivered" size={size} />;
    return <MessageStatus status="sent" size={size} />;
  }

  // Multiple recipients - show counts
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {readCount > 0 && (
        <div className="flex items-center space-x-1 text-blue-500">
          <Eye className="w-4 h-4" />
          {showDetails && <span className={sizes[size]}>{readCount}</span>}
        </div>
      )}

      {deliveredCount > readCount && (
        <div className="flex items-center space-x-1 text-gray-500">
          <CheckCheck className="w-4 h-4" />
          {showDetails && (
            <span className={sizes[size]}>{deliveredCount - readCount}</span>
          )}
        </div>
      )}

      {totalRecipients > deliveredCount && (
        <div className="flex items-center space-x-1 text-gray-400">
          <Check className="w-4 h-4" />
          {showDetails && (
            <span className={sizes[size]}>
              {totalRecipients - deliveredCount}
            </span>
          )}
        </div>
      )}

      {showDetails && (
        <span className={`${sizes[size]} text-gray-400`}>
          /{totalRecipients}
        </span>
      )}
    </div>
  );
};

// Retry button for failed messages
export const RetryMessageButton = ({
  onRetry,
  isRetrying = false,
  className = "",
}) => (
  <button
    onClick={onRetry}
    disabled={isRetrying}
    className={`
      flex items-center space-x-1 px-2 py-1 rounded text-xs
      text-red-600 hover:bg-red-50 transition-colors
      disabled:opacity-50 disabled:cursor-not-allowed
      ${className}
    `}
  >
    <AlertCircle className={`w-3 h-3 ${isRetrying ? "animate-spin" : ""}`} />
    <span>{isRetrying ? "Retrying..." : "Retry"}</span>
  </button>
);

export default MessageStatus;
