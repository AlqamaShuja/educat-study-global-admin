import React, { useState, useMemo } from "react";
import {
  Clock,
  User,
  UserPlus,
  FileText,
  Calendar,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  formatDistanceToNow,
  parseISO,
  isToday,
  isYesterday,
  format,
} from "date-fns";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

const RecentActivity = ({
  activities = [],
  title = "Recent Activity",
  showFilters = true,
  maxItems = 10,
  showLoadMore = true,
  showTimestamps = true,
  showAvatars = true,
  groupByDate = true,
  allowRefresh = true,
  onRefresh,
  onViewAll,
  onActivityClick,
  className = "",
  loading = false,
  error = null,
}) => {
  const [filterType, setFilterType] = useState("all");
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [visibleItems, setVisibleItems] = useState(maxItems);

  // Activity type configurations
  const activityConfig = {
    user_created: {
      icon: UserPlus,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/20",
      label: "User Created",
    },
    user_updated: {
      icon: Edit,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/20",
      label: "User Updated",
    },
    appointment_booked: {
      icon: Calendar,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/20",
      label: "Appointment Booked",
    },
    appointment_completed: {
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/20",
      label: "Appointment Completed",
    },
    appointment_cancelled: {
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/20",
      label: "Appointment Cancelled",
    },
    document_uploaded: {
      icon: FileText,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/20",
      label: "Document Uploaded",
    },
    message_sent: {
      icon: MessageCircle,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100 dark:bg-indigo-900/20",
      label: "Message Sent",
    },
    lead_assigned: {
      icon: User,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-900/20",
      label: "Lead Assigned",
    },
    system_alert: {
      icon: AlertCircle,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-900/20",
      label: "System Alert",
    },
  };

  // Filter activities by type
  const filteredActivities = useMemo(() => {
    if (filterType === "all") return activities;
    return activities.filter((activity) => activity.type === filterType);
  }, [activities, filterType]);

  // Group activities by date if enabled
  const groupedActivities = useMemo(() => {
    if (!groupByDate) {
      return { all: filteredActivities.slice(0, visibleItems) };
    }

    const groups = {};
    const sortedActivities = [...filteredActivities]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, visibleItems);

    sortedActivities.forEach((activity) => {
      const date = parseISO(activity.timestamp);
      let groupKey;

      if (isToday(date)) {
        groupKey = "Today";
      } else if (isYesterday(date)) {
        groupKey = "Yesterday";
      } else {
        groupKey = format(date, "MMMM d, yyyy");
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(activity);
    });

    return groups;
  }, [filteredActivities, visibleItems, groupByDate]);

  // Get unique activity types for filter
  const activityTypes = useMemo(() => {
    const types = [...new Set(activities.map((activity) => activity.type))];
    return types.filter((type) => activityConfig[type]);
  }, [activities]);

  // Toggle group expansion
  const toggleGroup = (groupKey) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  // Load more items
  const loadMore = () => {
    setVisibleItems((prev) => prev + maxItems);
  };

  // Format relative time
  const formatRelativeTime = (timestamp) => {
    const date = parseISO(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Get user avatar or initials
  const getUserAvatar = (user) => {
    if (user.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover"
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
      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {initials}
        </span>
      </div>
    );
  };

  // Render activity item
  const renderActivity = (activity, index) => {
    const config = activityConfig[activity.type] || activityConfig.system_alert;
    const Icon = config.icon;

    return (
      <div
        key={activity.id || index}
        className={`
          flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700
          transition-colors duration-200 cursor-pointer
        `}
        onClick={() => onActivityClick && onActivityClick(activity)}
      >
        {/* Icon */}
        <div className={`p-2 rounded-lg ${config.bg} flex-shrink-0`}>
          <Icon className={`h-4 w-4 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Main content */}
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.title || config.label}
              </p>

              {activity.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {activity.description}
                </p>
              )}

              {/* User info */}
              <div className="flex items-center space-x-2 mt-2">
                {showAvatars && activity.user && (
                  <>
                    {getUserAvatar(activity.user)}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.user.name}
                    </span>
                  </>
                )}

                {activity.metadata && (
                  <div className="flex items-center space-x-2">
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {key}: {value}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Timestamp */}
            {showTimestamps && (
              <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-4">
                {formatRelativeTime(activity.timestamp)}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="p-1">
            <Eye className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="p-1">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Card className={className}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
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

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <div className="p-6">
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Failed to load activities
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {error}
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {filteredActivities.length} activities
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Filter */}
            {showFilters && activityTypes.length > 0 && (
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                {activityTypes.map((type) => (
                  <option key={type} value={type}>
                    {activityConfig[type].label}
                  </option>
                ))}
              </select>
            )}

            {/* Refresh */}
            {allowRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Activities */}
        <div className="space-y-1">
          {Object.entries(groupedActivities).map(
            ([groupKey, groupActivities]) => (
              <div key={groupKey}>
                {/* Group Header (if grouping by date) */}
                {groupByDate && groupKey !== "all" && (
                  <div className="flex items-center justify-between py-2 px-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {groupKey}
                    </h4>
                    <button
                      onClick={() => toggleGroup(groupKey)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {expandedGroups.has(groupKey) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}

                {/* Group Activities */}
                {(!groupByDate ||
                  groupKey === "all" ||
                  expandedGroups.has(groupKey)) && (
                  <div className="space-y-1">
                    {groupActivities.map((activity, index) =>
                      renderActivity(activity, index)
                    )}
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {/* Empty State */}
        {filteredActivities.length === 0 && (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No recent activity
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Activities will appear here as they happen
            </p>
          </div>
        )}

        {/* Footer Actions */}
        {filteredActivities.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            {/* Load More */}
            {showLoadMore && visibleItems < filteredActivities.length && (
              <Button variant="outline" size="sm" onClick={loadMore}>
                Load More ({filteredActivities.length - visibleItems} remaining)
              </Button>
            )}

            {/* View All */}
            {onViewAll && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewAll}
                className="ml-auto"
              >
                View All Activities
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecentActivity;
