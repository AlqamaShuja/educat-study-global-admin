import React from "react";
import { Circle, Clock, Moon, Zap } from "lucide-react";

const OnlineStatus = ({
  status = "offline",
  size = "md",
  showText = false,
  showLastSeen = false,
  lastSeen = null,
  className = "",
  variant = "dot", // 'dot', 'badge', 'pill', 'text'
}) => {
  // Status configurations
  const statusConfig = {
    online: {
      color: "bg-green-500",
      textColor: "text-green-500",
      borderColor: "border-green-500",
      icon: Circle,
      label: "Online",
      description: "Active now",
    },
    away: {
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
      borderColor: "border-yellow-500",
      icon: Clock,
      label: "Away",
      description: "Away from keyboard",
    },
    busy: {
      color: "bg-red-500",
      textColor: "text-red-500",
      borderColor: "border-red-500",
      icon: Moon,
      label: "Busy",
      description: "Do not disturb",
    },
    offline: {
      color: "bg-gray-400",
      textColor: "text-gray-400",
      borderColor: "border-gray-400",
      icon: Circle,
      label: "Offline",
      description: "Last seen recently",
    },
  };

  // Size configurations
  const sizeConfig = {
    xs: {
      dot: "w-2 h-2",
      badge: "w-4 h-4",
      text: "text-xs",
      icon: "w-3 h-3",
    },
    sm: {
      dot: "w-2.5 h-2.5",
      badge: "w-5 h-5",
      text: "text-sm",
      icon: "w-3.5 h-3.5",
    },
    md: {
      dot: "w-3 h-3",
      badge: "w-6 h-6",
      text: "text-base",
      icon: "w-4 h-4",
    },
    lg: {
      dot: "w-4 h-4",
      badge: "w-8 h-8",
      text: "text-lg",
      icon: "w-5 h-5",
    },
  };

  const config = statusConfig[status] || statusConfig.offline;
  const sizes = sizeConfig[size];

  // Render variants
  const renderDot = () => (
    <div
      className={`
        ${sizes.dot} ${config.color} rounded-full flex-shrink-0
        ${status === "online" ? "animate-pulse" : ""}
        ${className}
      `}
      title={
        showLastSeen && lastSeen
          ? `${config.label} • ${formatLastSeen(lastSeen)}`
          : config.label
      }
    />
  );

  const renderBadge = () => {
    const Icon = config.icon;
    return (
      <div
        className={`
          ${sizes.badge} ${config.color} rounded-full 
          flex items-center justify-center flex-shrink-0
          ${status === "online" ? "animate-pulse" : ""}
          ${className}
        `}
        title={config.label}
      >
        <Icon className={`${sizes.icon} text-white`} fill="currentColor" />
      </div>
    );
  };

  const renderPill = () => (
    <div
      className={`
        flex items-center space-x-1.5 px-2 py-1 rounded-full 
        border ${config.borderColor} ${config.textColor}
        ${status === "online" ? "bg-green-50" : ""}
        ${status === "away" ? "bg-yellow-50" : ""}
        ${status === "busy" ? "bg-red-50" : ""}
        ${status === "offline" ? "bg-gray-50" : ""}
        ${className}
      `}
    >
      <div
        className={`${sizes.dot} ${config.color} rounded-full flex-shrink-0`}
      />
      {showText && (
        <span className={`${sizes.text} font-medium`}>{config.label}</span>
      )}
    </div>
  );

  const renderText = () => (
    <div className={`flex flex-col ${className}`}>
      <div className={`flex items-center space-x-2 ${config.textColor}`}>
        <div
          className={`${sizes.dot} ${config.color} rounded-full flex-shrink-0`}
        />
        <span className={`${sizes.text} font-medium`}>{config.label}</span>
      </div>
      {showLastSeen && lastSeen && status === "offline" && (
        <span className="text-xs text-gray-400 ml-5">
          {formatLastSeen(lastSeen)}
        </span>
      )}
    </div>
  );

  // Render based on variant
  switch (variant) {
    case "badge":
      return renderBadge();
    case "pill":
      return renderPill();
    case "text":
      return renderText();
    case "dot":
    default:
      return renderDot();
  }
};

// Preset variants
export const OnlineDot = ({ status, ...props }) => (
  <OnlineStatus status={status} variant="dot" {...props} />
);

export const OnlineBadge = ({ status, ...props }) => (
  <OnlineStatus status={status} variant="badge" {...props} />
);

export const OnlinePill = ({ status, showText = true, ...props }) => (
  <OnlineStatus status={status} variant="pill" showText={showText} {...props} />
);

export const OnlineText = ({
  status,
  showText = true,
  showLastSeen = true,
  ...props
}) => (
  <OnlineStatus
    status={status}
    variant="text"
    showText={showText}
    showLastSeen={showLastSeen}
    {...props}
  />
);

// Status list component for showing multiple user statuses
export const StatusList = ({ users = [], className = "" }) => {
  // Group users by status
  const groupedUsers = users.reduce((acc, user) => {
    const status = user.status || "offline";
    if (!acc[status]) acc[status] = [];
    acc[status].push(user);
    return acc;
  }, {});

  const statusOrder = ["online", "away", "busy", "offline"];

  return (
    <div className={`space-y-3 ${className}`}>
      {statusOrder.map((status) => {
        const statusUsers = groupedUsers[status];
        if (!statusUsers || statusUsers.length === 0) return null;

        return (
          <div key={status}>
            <div className="flex items-center space-x-2 mb-2">
              <OnlineStatus status={status} variant="dot" size="sm" />
              <span className="text-sm font-medium text-gray-600 capitalize">
                {status} ({statusUsers.length})
              </span>
            </div>
            <div className="space-y-1 ml-4">
              {statusUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-gray-700">
                    {user.name || user.email}
                  </span>
                  {status === "offline" && user.lastSeen && (
                    <span className="text-xs text-gray-400">
                      {formatLastSeen(user.lastSeen)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Conversation header status showing online users count
export const ConversationOnlineCount = ({
  onlineUsers = [],
  totalUsers = 0,
  className = "",
}) => {
  if (totalUsers <= 1) return null;

  return (
    <div
      className={`flex items-center space-x-1 text-sm text-gray-500 ${className}`}
    >
      <OnlineStatus status="online" variant="dot" size="xs" />
      <span>
        {onlineUsers.length} of {totalUsers} online
      </span>
    </div>
  );
};

// Status selector component
export const StatusSelector = ({
  currentStatus = "online",
  onStatusChange,
  className = "",
}) => {
  const statuses = ["online", "away", "busy", "offline"];

  return (
    <div className={`space-y-1 ${className}`}>
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => onStatusChange?.(status)}
          className={`
            w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left
            transition-colors duration-200
            ${
              currentStatus === status
                ? "bg-blue-50 text-blue-700"
                : "hover:bg-gray-50 text-gray-700"
            }
          `}
        >
          <OnlineStatus status={status} variant="dot" size="sm" />
          <div className="flex-1">
            <div className="font-medium capitalize">{status}</div>
            <div className="text-xs text-gray-500">
              {status === "online" && "Available for chat"}
              {status === "away" && "Away from keyboard"}
              {status === "busy" && "Do not disturb"}
              {status === "offline" && "Appear offline"}
            </div>
          </div>
          {currentStatus === status && (
            <Zap className="w-4 h-4 text-blue-600" />
          )}
        </button>
      ))}
    </div>
  );
};

// Utility function (also exported for external use)
export const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return "";

  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffMs = now - lastSeenDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return lastSeenDate.toLocaleDateString();
};

export default OnlineStatus;
