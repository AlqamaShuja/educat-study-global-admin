import React from "react";
import {
  MessageSquare,
  Users,
  Shield,
  Settings,
  User,
  LayoutDashboard,
  Bell,
} from "lucide-react";
import { getNavigationItems } from "../config/routes";
import useAuthStore from "../stores/authStore";
import useConversations from "../hooks/useConversations";
import useSocket from "../hooks/useSocket";

const ChatNavigation = ({ className = "" }) => {
  const { user } = useAuthStore();
  const { unreadCount } = useConversations();
  const { isConnected } = useSocket();

  if (!user) return null;

  const navigationItems = [] // getNavigationItems(user.role);

  // Icon mapping
  const iconMap = {
    LayoutDashboard: LayoutDashboard,
    MessageSquare: MessageSquare,
    Shield: Shield,
    User: User,
    Settings: Settings,
    Users: Users,
    Bell: Bell,
  };

  const getCurrentPath = () => {
    return window.location.pathname;
  };

  const isActivePath = (path) => {
    const currentPath = getCurrentPath();
    if (path === "/chat") {
      return currentPath === "/chat" || currentPath.startsWith("/chat/");
    }
    return currentPath === path;
  };

  return (
    <nav className={`space-y-1 ${className}`}>
      {navigationItems.map((item) => {
        const Icon = iconMap[item.icon] || MessageSquare;
        const isActive = isActivePath(item.path);
        const showBadge = item.path === "/chat" && unreadCount > 0;

        return (
          <a
            key={item.path}
            href={item.path}
            className={`
              group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${
                isActive
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              }
            `}
          >
            <Icon
              className={`
                mr-3 h-5 w-5 transition-colors
                ${
                  isActive
                    ? "text-blue-500"
                    : "text-gray-400 group-hover:text-gray-500"
                }
              `}
            />

            <span className="flex-1">{item.label}</span>

            {/* Unread badge for messages */}
            {showBadge && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[1.25rem] text-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}

            {/* Connection status for chat */}
            {item.path === "/chat" && (
              <div
                className={`
                w-2 h-2 rounded-full ml-2
                ${isConnected ? "bg-green-500" : "bg-gray-400"}
              `}
                title={isConnected ? "Connected" : "Disconnected"}
              />
            )}
          </a>
        );
      })}

      {/* Connection Status Indicator */}
      <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <div
            className={`
            w-2 h-2 rounded-full mr-2
            ${isConnected ? "bg-green-500" : "bg-red-500"}
          `}
          />
          <span>{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
      </div>
    </nav>
  );
};

// Status bar component for showing chat status
export const ChatStatusBar = ({ className = "" }) => {
  const { isConnected, connectionError } = useSocket();
  const { unreadCount } = useConversations();

  if (isConnected && unreadCount === 0) return null;

  return (
    <div
      className={`bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 ${className}`}
    >
      <div className="flex items-center justify-between text-sm">
        {!isConnected && (
          <div className="flex items-center text-red-600 dark:text-red-400">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
            <span>{connectionError || "Chat disconnected"}</span>
          </div>
        )}

        {unreadCount > 0 && (
          <div className="flex items-center text-blue-600 dark:text-blue-400">
            <MessageSquare className="w-4 h-4 mr-2" />
            <span>
              {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatNavigation;
