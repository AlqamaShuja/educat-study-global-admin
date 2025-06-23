import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import Dropdown from "../ui/Dropdown";
import useUIStore from "../../stores/uiStore";
import useNotifications from "../../hooks/useNotifications";
import useAuthStore from "../../stores/authStore";

const Header = ({ onMenuClick, onSidebarToggle, user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useUIStore();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const getPageTitle = () => {
    if(location.pathname.includes("/consultant/students/")){
        return 'Student Profile'
    }
    if(location.pathname.includes("/university/")){
        return 'University Details'
    }
    if(location.pathname.includes("/office/")){
        return 'Office Details'
    }
    const pathSegments = location.pathname.split("/").filter(Boolean);
    if (pathSegments.length === 0) return "Dashboard";

    const titles = {
      dashboard: "Dashboard",
      "super-admin": "Super Admin",
      manager: "Manager",
      consultant: "Consultant",
      receptionist: "Receptionist",
      student: "Student",
      offices: "Office Management",
      staff: "Staff Management",
      universities: "Universities",
      leads: "Leads",
      appointments: "Appointments",
      documents: "Documents",
      tasks: "Tasks",
      reports: "Reports",
      profile: "Profile",
      applications: "Applications",
    };

    return (
      titles[pathSegments[pathSegments.length - 1]] ||
      pathSegments[pathSegments.length - 1]
        .replace("-", " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    );
  };

  const formatTime = () => {
    return new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Add navigation logic if needed
  };

  return (
    <header className="bg-card shadow-sm border-b border-border sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>

            {/* Sidebar toggle for desktop */}
            <Button
              variant="outline"
              size="sm"
              onClick={onSidebarToggle}
              className="hidden lg:flex"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>

            {/* Page title */}
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {getPageTitle()}
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                {formatTime()}
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="hidden md:flex"
            >
              {theme === "light" ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
            </Button> */}

            {/* Notifications */}
            <Dropdown
              position="bottom-right"
              trigger={
                <button className="relative p-2 text-muted-foreground hover:text-foreground focus:outline-none">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              }
              className="w-80"
            >
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-medium text-foreground">
                  Notifications
                </h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {!notifications?.length ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full p-4 border-b border-border hover:bg-muted text-left transition-colors ${
                        !notification.read ? "bg-primary/10" : ""
                      }`}
                    >
                      <p
                        className={`text-sm ${
                          !notification.read
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
              {notifications?.length > 5 && (
                <div className="p-2 border-t border-border">
                  <button
                    onClick={() => navigate("/notifications")}
                    className="w-full text-center text-sm text-primary hover:text-primary-foreground"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </Dropdown>

            {/* User menu */}
            <Dropdown
              position="bottom-right"
              trigger={
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted focus:outline-none">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-muted-foreground font-medium text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-foreground">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user?.role?.replace("_", " ") || "Role"}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              }
            >
              <Dropdown.Item onClick={() => navigate("/profile")}>
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Profile</span>
                </div>
              </Dropdown.Item>

              <Dropdown.Item onClick={() => navigate("/settings")}>
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>Settings</span>
                </div>
              </Dropdown.Item>

              <Dropdown.Divider />

              <Dropdown.Item onClick={handleLogout}>
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Logout</span>
                </div>
              </Dropdown.Item>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
