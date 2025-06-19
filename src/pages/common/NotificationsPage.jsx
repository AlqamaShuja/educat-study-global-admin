import React, { useState, useEffect } from "react";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Filter,
  Search,
  Settings,
  Archive,
  Trash2,
  Star,
  Clock,
  AlertTriangle,
  Info,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react";
import useNotificationStore from "../../stores/notificationStore";
import useAuthStore from "../../stores/authStore";
import NotificationPanel from "../../components/messaging/NotificationPanel";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";

const NotificationsPage = () => {
  const { user } = useAuthStore();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    clearAllNotifications,
  } = useNotificationStore();

  const [viewMode, setViewMode] = useState("all"); // 'all', 'unread', 'archived'
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = (notification) => {
    // Handle notification click based on type
    switch (notification.type) {
      case "appointment":
        // Navigate to appointment details
        break;
      case "message":
        // Navigate to messages
        break;
      case "document":
        // Navigate to documents
        break;
      default:
        // Default action
        break;
    }
  };

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  const handleMarkAsUnread = (notificationId) => {
    markAsUnread(notificationId);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleArchive = (notificationId) => {
    archiveNotification(notificationId);
  };

  const handleDelete = (notificationId) => {
    deleteNotification(notificationId);
  };

  const handleClearAll = () => {
    clearAllNotifications();
  };

  const handleActionClick = (notification, action) => {
    // Handle notification action buttons
    switch (action.type) {
      case "approve":
        // Handle approval
        break;
      case "reject":
        // Handle rejection
        break;
      case "view":
        // Navigate to item
        break;
      default:
        break;
    }
  };

  const handleRefresh = () => {
    fetchNotifications();
  };

  const getNotificationStats = () => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.read).length;
    const archived = notifications.filter((n) => n.archived).length;
    const today = notifications.filter((n) => {
      const notifDate = new Date(n.timestamp);
      const today = new Date();
      return notifDate.toDateString() === today.toDateString();
    }).length;

    return { total, unread, archived, today };
  };

  const stats = getNotificationStats();

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Stay updated with your latest activities and alerts
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <BellOff className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Unread
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.unread}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Today
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.today}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Archive className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Archived
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.archived}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            {/* View Mode Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {[
                { id: "all", label: "All", count: stats.total },
                { id: "unread", label: "Unread", count: stats.unread },
                { id: "archived", label: "Archived", count: stats.archived },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`
                    px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${
                      viewMode === mode.id
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }
                  `}
                >
                  {mode.label}
                  {mode.count > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {mode.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>

            {/* Filter Dropdown */}
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700"
            >
              <option value="all">All Types</option>
              <option value="message">Messages</option>
              <option value="appointment">Appointments</option>
              <option value="document">Documents</option>
              <option value="system">System</option>
              <option value="alert">Alerts</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* Bulk Actions */}
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NotificationPanel
            notifications={notifications}
            unreadCount={unreadCount}
            onNotificationClick={handleNotificationClick}
            onMarkAsRead={handleMarkAsRead}
            onMarkAsUnread={handleMarkAsUnread}
            onMarkAllRead={handleMarkAllRead}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onClearAll={handleClearAll}
            onActionClick={handleActionClick}
            loading={isLoading}
            error={error}
            maxHeight="600px"
            groupByDate={true}
            showPriority={true}
            allowBulkActions={true}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="w-full justify-start"
                disabled={unreadCount === 0}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive all read
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="w-full justify-start text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all
              </Button>
            </div>
          </Card>

          {/* Notification Types */}
          <Card className="p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Notification Types
            </h3>
            <div className="space-y-2">
              {[
                {
                  type: "message",
                  label: "Messages",
                  count: 12,
                  color: "blue",
                },
                {
                  type: "appointment",
                  label: "Appointments",
                  count: 8,
                  color: "green",
                },
                {
                  type: "document",
                  label: "Documents",
                  count: 5,
                  color: "purple",
                },
                { type: "system", label: "System", count: 3, color: "gray" },
                { type: "alert", label: "Alerts", count: 2, color: "red" },
              ].map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full bg-${item.color}-500`}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {item.label}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {item.count}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Settings Shortcut */}
          <Card className="p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Preferences
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="w-full justify-start"
              >
                <Settings className="h-4 w-4 mr-2" />
                Notification settings
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Bell className="h-4 w-4 mr-2" />
                Sound preferences
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Notification Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Push notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sound alerts</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowSettings(false)}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
