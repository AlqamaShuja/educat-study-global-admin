import React, { useState, useEffect } from "react";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  X,
  Clock,
  Calendar,
  MessageCircle,
  User,
  UserPlus,
  FileText,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Star,
  Archive,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  Filter,
  Search,
  MoreHorizontal,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  Globe,
  Zap,
} from "lucide-react";
import {
  format,
  parseISO,
  formatDistanceToNow,
  isToday,
  isYesterday,
} from "date-fns";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Input from "../ui/Input";
import Card from "../ui/Card";
import Modal from "../ui/Modal";

const NotificationPanel = ({
  notifications = [],
  unreadCount = 0,
  showSearch = true,
  showFilters = true,
  showSettings = true,
  allowMarkAllRead = true,
  allowBulkActions = true,
  maxHeight = "400px",
  groupByDate = true,
  showPriority = true,
  playSound = true,
  onNotificationClick,
  onMarkAsRead,
  onMarkAsUnread,
  onMarkAllRead,
  onArchive,
  onDelete,
  onClearAll,
  onSettingsClick,
  onActionClick,
  className = "",
  loading = false,
  error = null,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(playSound);

  const notificationTypes = {
    message: {
      icon: MessageCircle,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/20",
      label: "Message",
    },
    appointment: {
      icon: Calendar,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/20",
      label: "Appointment",
    },
    user_action: {
      icon: User,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/20",
      label: "User Action",
    },
    system: {
      icon: Settings,
      color: "text-gray-600 dark:text-gray-400",
      bg: "bg-gray-100 dark:bg-gray-700",
      label: "System",
    },
    alert: {
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/20",
      label: "Alert",
    },
    reminder: {
      icon: Clock,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-900/20",
      label: "Reminder",
    },
    document: {
      icon: FileText,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100 dark:bg-indigo-900/20",
      label: "Document",
    },
    task: {
      icon: CheckCircle,
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-100 dark:bg-teal-900/20",
      label: "Task",
    },
  };

  const priorityConfig = {
    high: {
      color: "text-red-600",
      bg: "bg-red-100",
      label: "High",
      border: "border-red-200",
    },
    medium: {
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      label: "Medium",
      border: "border-yellow-200",
    },
    low: {
      color: "text-green-600",
      bg: "bg-green-100",
      label: "Low",
      border: "border-green-200",
    },
    normal: {
      color: "text-gray-600",
      bg: "bg-gray-100",
      label: "Normal",
      border: "border-gray-200",
    },
  };

  // Play notification sound
  useEffect(() => {
    if (soundEnabled && notifications.length > 0) {
      const latestNotification = notifications[0];
      if (latestNotification && !latestNotification.read) {
        // Play sound logic here
        console.log("Playing notification sound");
      }
    }
  }, [notifications, soundEnabled]);

  // Filter notifications
  const filteredNotifications = React.useMemo(() => {
    let filtered = notifications;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (notif) =>
          notif.title.toLowerCase().includes(term) ||
          notif.message.toLowerCase().includes(term) ||
          notif.sender?.name?.toLowerCase().includes(term)
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter((notif) => notif.type === filterType);
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter((notif) => notif.priority === filterPriority);
    }

    if (showUnreadOnly) {
      filtered = filtered.filter((notif) => !notif.read);
    }

    return filtered;
  }, [notifications, searchTerm, filterType, filterPriority, showUnreadOnly]);

  // Group notifications by date
  const groupedNotifications = React.useMemo(() => {
    if (!groupByDate) return { all: filteredNotifications };

    const groups = {};

    filteredNotifications.forEach((notification) => {
      const notifDate = parseISO(notification.timestamp);
      let groupKey;

      if (isToday(notifDate)) {
        groupKey = "Today";
      } else if (isYesterday(notifDate)) {
        groupKey = "Yesterday";
      } else {
        groupKey = format(notifDate, "MMMM d, yyyy");
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    return groups;
  }, [filteredNotifications, groupByDate]);

  const handleNotificationClick = (notification) => {
    onNotificationClick?.(notification);
    if (!notification.read) {
      onMarkAsRead?.(notification.id);
    }
  };

  const toggleNotificationSelection = (notificationId) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const selectAllVisible = () => {
    const allIds = new Set(filteredNotifications.map((n) => n.id));
    setSelectedNotifications(allIds);
  };

  const clearSelection = () => {
    setSelectedNotifications(new Set());
  };

  const bulkMarkAsRead = () => {
    selectedNotifications.forEach((id) => {
      onMarkAsRead?.(id);
    });
    clearSelection();
  };

  const bulkArchive = () => {
    selectedNotifications.forEach((id) => {
      onArchive?.(id);
    });
    clearSelection();
  };

  const bulkDelete = () => {
    selectedNotifications.forEach((id) => {
      onDelete?.(id);
    });
    clearSelection();
  };

  const formatNotificationTime = (timestamp) => {
    const date = parseISO(timestamp);

    if (isToday(date)) {
      return format(date, "HH:mm");
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMM dd");
    }
  };

  const renderNotification = (notification) => {
    const typeConfig =
      notificationTypes[notification.type] || notificationTypes.system;
    const TypeIcon = typeConfig.icon;
    const isSelected = selectedNotifications.has(notification.id);
    const priorityInfo = notification.priority
      ? priorityConfig[notification.priority]
      : null;

    return (
      <div
        key={notification.id}
        className={`
          group relative p-3 border-l-4 transition-all duration-200 cursor-pointer
          ${
            notification.read
              ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              : "bg-blue-50 dark:bg-blue-900/10 border-blue-500 dark:border-blue-400"
          }
          ${isSelected ? "ring-2 ring-blue-500 ring-opacity-50" : ""}
          hover:bg-gray-50 dark:hover:bg-gray-700
          ${priorityInfo?.border || "border-gray-200"}
        `}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start space-x-3">
          {/* Selection checkbox */}
          {allowBulkActions && (
            <div className="flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleNotificationSelection(notification.id);
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Icon */}
          <div className={`flex-shrink-0 p-2 rounded-lg ${typeConfig.bg}`}>
            <TypeIcon className={`h-4 w-4 ${typeConfig.color}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4
                    className={`text-sm font-medium ${
                      !notification.read ? "font-semibold" : ""
                    } text-gray-900 dark:text-white`}
                  >
                    {notification.title}
                  </h4>

                  {priorityInfo && showPriority && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${priorityInfo.color}`}
                    >
                      {priorityInfo.label}
                    </Badge>
                  )}

                  {notification.starred && (
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {notification.message}
                </p>

                {notification.sender && (
                  <div className="flex items-center space-x-1 mt-1">
                    <User className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {notification.sender.name}
                    </span>
                  </div>
                )}

                {notification.actions && notification.actions.length > 0 && (
                  <div className="flex space-x-2 mt-2">
                    {notification.actions.map((action, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant={action.variant || "outline"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onActionClick?.(notification, action);
                        }}
                        className="text-xs"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end space-y-1 ml-4">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatNotificationTime(notification.timestamp)}
                </span>

                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                notification.read
                  ? onMarkAsUnread?.(notification.id)
                  : onMarkAsRead?.(notification.id);
              }}
              className="p-1"
              title={notification.read ? "Mark as unread" : "Mark as read"}
            >
              {notification.read ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onArchive?.(notification.id);
              }}
              className="p-1"
              title="Archive"
            >
              <Archive className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(notification.id);
              }}
              className="p-1 text-red-600 hover:text-red-700"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="sm" className="p-1">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <div className="p-4">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
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
          <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {allowMarkAllRead && unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={onMarkAllRead}>
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}

            {showSettings && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettingsModal(true)}
                className="p-1"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        {showSearch && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700"
            >
              <option value="all">All Types</option>
              {Object.entries(notificationTypes).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700"
            >
              <option value="all">All Priorities</option>
              {Object.entries(priorityConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>

            <label className="flex items-center space-x-1 text-sm">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="rounded"
              />
              <span>Unread only</span>
            </label>
          </div>
        )}

        {/* Bulk actions */}
        {allowBulkActions && selectedNotifications.size > 0 && (
          <div className="flex items-center justify-between mt-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {selectedNotifications.size} selected
            </span>
            <div className="flex space-x-2">
              <Button size="sm" variant="ghost" onClick={clearSelection}>
                Clear
              </Button>
              <Button size="sm" variant="ghost" onClick={selectAllVisible}>
                Select all
              </Button>
              <Button size="sm" variant="ghost" onClick={bulkMarkAsRead}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={bulkArchive}>
                <Archive className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={bulkDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto" style={{ maxHeight }}>
        {Object.entries(groupedNotifications).map(
          ([groupName, groupNotifications]) => (
            <div key={groupName}>
              {groupByDate && Object.keys(groupedNotifications).length > 1 && (
                <div className="sticky top-0 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  {groupName}
                </div>
              )}
              <div className="space-y-1">
                {groupNotifications.map(renderNotification)}
              </div>
            </div>
          )
        )}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-8">
            <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ||
              filterType !== "all" ||
              filterPriority !== "all" ||
              showUnreadOnly
                ? "No notifications match your filters"
                : "No notifications yet"}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredNotifications.length} notifications
            </span>

            {onClearAll && (
              <Button variant="outline" size="sm" onClick={onClearAll}>
                Clear all
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <Modal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          title="Notification Settings"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sound notifications</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1"
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Notification types</h4>
              {Object.entries(notificationTypes).map(([key, config]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <config.icon className={`h-4 w-4 ${config.color}`} />
                  <span className="text-sm">{config.label}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowSettingsModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowSettingsModal(false)}>Save</Button>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
};

export default NotificationPanel;
