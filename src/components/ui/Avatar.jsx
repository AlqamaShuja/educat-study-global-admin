import React from "react";
import { User } from "lucide-react";

const Avatar = ({
  user,
  size = "md",
  online = false,
  showOnlineStatus = true,
  className = "",
  onClick = null,
  ...props
}) => {
  // Size configurations
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
    "2xl": "w-20 h-20 text-2xl",
  };

  const statusSizes = {
    xs: "w-2 h-2",
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3.5 h-3.5",
    xl: "w-4 h-4",
    "2xl": "w-5 h-5",
  };

  // Get user initials
  const getInitials = (user) => {
    if (!user) return "?";

    if (user.name) {
      return user.name
        .split(" ")
        .map((name) => name.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }

    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(
        0
      )}`.toUpperCase();
    }

    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return "?";
  };

  // Generate background color based on user ID or name
  const getAvatarColor = (user) => {
    if (!user) return "bg-gray-500";

    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-orange-500",
      "bg-cyan-500",
    ];

    const id = user?.id || user?.email || user?.name || "";
    const hash = id.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  // Role-based border colors
  const getRoleBorderColor = (role) => {
    const roleBorders = {
      super_admin: "ring-red-400",
      manager: "ring-blue-400",
      consultant: "ring-green-400",
      receptionist: "ring-yellow-400",
      lead: "ring-purple-400",
    };

    return roleBorders[role] || "ring-gray-300";
  };

  const baseClasses = `
    relative inline-block rounded-full flex-shrink-0 overflow-hidden
    ${sizeClasses[size]}
    ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
    ${className}
  `;

  const initials = getInitials(user);
  const avatarColor = getAvatarColor(user);
  const roleBorder = user?.role ? getRoleBorderColor(user.role) : "";

  return (
    <div className={baseClasses} onClick={onClick} {...props}>
      {/* Main Avatar */}
      {user?.avatar || user?.profilePicture ? (
        <img
          src={user.avatar || user.profilePicture}
          alt={user.name || user.email || "User"}
          className={`
            w-full h-full object-cover
            ${roleBorder ? `ring-2 ${roleBorder}` : ""}
          `}
          onError={(e) => {
            // Fallback to initials if image fails to load
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      ) : null}

      {/* Fallback Initials */}
      <div
        className={`
          w-full h-full flex items-center justify-center text-white font-medium
          ${avatarColor}
          ${roleBorder ? `ring-2 ${roleBorder}` : ""}
          ${user?.avatar || user?.profilePicture ? "hidden" : "flex"}
        `}
        style={{
          display: user?.avatar || user?.profilePicture ? "none" : "flex",
        }}
      >
        {initials !== "?" ? initials : <User className="w-1/2 h-1/2" />}
      </div>

      {/* Online Status Indicator */}
      {showOnlineStatus && (
        <div
          className={`
            absolute bottom-0 right-0 rounded-full border-2 border-white
            ${statusSizes[size]}
            ${online ? "bg-green-500" : "bg-gray-400"}
          `}
          title={online ? "Online" : "Offline"}
        />
      )}

      {/* Role Indicator (optional small badge) */}
      {user?.role &&
        (user.role === "super_admin" || user.role === "manager") && (
          <div
            className={`
            absolute -top-1 -right-1 rounded-full text-white text-xs font-bold
            flex items-center justify-center
            ${size === "xs" || size === "sm" ? "w-3 h-3" : "w-4 h-4"}
            ${user.role === "super_admin" ? "bg-red-500" : "bg-blue-500"}
          `}
            title={user.role === "super_admin" ? "Super Admin" : "Manager"}
          >
            {user.role === "super_admin" ? "SA" : "M"}
          </div>
        )}
    </div>
  );
};

// Avatar Group Component for multiple users
export const AvatarGroup = ({
  users = [],
  size = "md",
  max = 3,
  showCount = true,
  className = "",
  onUserClick = null,
}) => {
  const displayUsers = users.slice(0, max);
  const remainingCount = Math.max(0, users.length - max);

  const groupSizeClasses = {
    xs: "-space-x-1",
    sm: "-space-x-1.5",
    md: "-space-x-2",
    lg: "-space-x-2.5",
    xl: "-space-x-3",
    "2xl": "-space-x-4",
  };

  return (
    <div className={`flex items-center ${groupSizeClasses[size]} ${className}`}>
      {displayUsers.map((user, index) => (
        <Avatar
          key={user?.id || index}
          user={user}
          size={size}
          showOnlineStatus={false}
          className={`ring-2 ring-white ${index > 0 ? "relative" : ""}`}
          onClick={onUserClick ? () => onUserClick(user) : undefined}
          style={{ zIndex: displayUsers.length - index }}
        />
      ))}

      {showCount && remainingCount > 0 && (
        <div
          className={`
            ${sizeClasses[size]} 
            bg-gray-200 text-gray-600 rounded-full 
            flex items-center justify-center font-medium text-xs
            ring-2 ring-white relative
          `}
          style={{ zIndex: 0 }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

// Status-specific Avatar variants
export const OnlineAvatar = ({ user, ...props }) => (
  <Avatar user={user} online={true} {...props} />
);

export const OfflineAvatar = ({ user, ...props }) => (
  <Avatar user={user} online={false} {...props} />
);

// Quick preset sizes
export const SmallAvatar = ({ user, ...props }) => (
  <Avatar user={user} size="sm" {...props} />
);

export const LargeAvatar = ({ user, ...props }) => (
  <Avatar user={user} size="lg" {...props} />
);

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl",
  "2xl": "w-20 h-20 text-2xl",
};

export default Avatar;
