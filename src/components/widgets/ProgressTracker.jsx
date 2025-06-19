import React, { useState, useMemo } from "react";
import {
  CheckCircle,
  Circle,
  Clock,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Calendar,
  User,
  Flag,
  Target,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react";
import {
  format,
  parseISO,
  differenceInDays,
  isAfter,
  isBefore,
} from "date-fns";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

const ProgressTracker = ({
  title = "Progress Tracker",
  items = [],
  type = "steps", // 'steps', 'goals', 'milestones', 'tasks'
  showProgress = true,
  showTimeline = true,
  showDetails = false,
  allowExpand = true,
  showActions = true,
  colorScheme = "blue",
  onItemClick,
  onStatusChange,
  onViewDetails,
  className = "",
  loading = false,
  error = null,
}) => {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [selectedView, setSelectedView] = useState("all");

  // Status configurations
  const statusConfig = {
    completed: {
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      label: "Completed",
    },
    in_progress: {
      icon: Play,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      label: "In Progress",
    },
    pending: {
      icon: Clock,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-900/20",
      border: "border-yellow-200 dark:border-yellow-800",
      label: "Pending",
    },
    overdue: {
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      label: "Overdue",
    },
    blocked: {
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      label: "Blocked",
    },
    not_started: {
      icon: Circle,
      color: "text-gray-500 dark:text-gray-400",
      bg: "bg-gray-100 dark:bg-gray-700",
      border: "border-gray-200 dark:border-gray-600",
      label: "Not Started",
    },
  };

  // Process items and calculate progress
  const processedItems = useMemo(() => {
    return items.map((item, index) => {
      let status = item.status || "not_started";

      // Auto-detect status based on dates if not provided
      if (!item.status && item.dueDate) {
        const today = new Date();
        const dueDate = parseISO(item.dueDate);

        if (item.completedDate) {
          status = "completed";
        } else if (isBefore(dueDate, today)) {
          status = "overdue";
        } else if (item.startDate && isAfter(today, parseISO(item.startDate))) {
          status = "in_progress";
        } else {
          status = "pending";
        }
      }

      // Calculate progress percentage
      let progressPercent = 0;
      if (status === "completed") {
        progressPercent = 100;
      } else if (item.progress !== undefined) {
        progressPercent = item.progress;
      } else if (item.completedSubtasks && item.totalSubtasks) {
        progressPercent = (item.completedSubtasks / item.totalSubtasks) * 100;
      } else if (status === "in_progress") {
        progressPercent = 50; // Default for in-progress items
      }

      // Calculate days remaining
      let daysRemaining = null;
      if (item.dueDate && status !== "completed") {
        daysRemaining = differenceInDays(parseISO(item.dueDate), new Date());
      }

      return {
        ...item,
        status,
        progressPercent: Math.min(100, Math.max(0, progressPercent)),
        daysRemaining,
        order: index,
      };
    });
  }, [items]);

  // Filter items by view
  const filteredItems = useMemo(() => {
    if (selectedView === "all") return processedItems;
    return processedItems.filter((item) => item.status === selectedView);
  }, [processedItems, selectedView]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (processedItems.length === 0) return 0;

    const totalProgress = processedItems.reduce(
      (sum, item) => sum + item.progressPercent,
      0
    );
    return Math.round(totalProgress / processedItems.length);
  }, [processedItems]);

  // Get progress summary
  const progressSummary = useMemo(() => {
    const summary = {
      completed: 0,
      in_progress: 0,
      pending: 0,
      overdue: 0,
      blocked: 0,
      not_started: 0,
    };

    processedItems.forEach((item) => {
      summary[item.status] = (summary[item.status] || 0) + 1;
    });

    return summary;
  }, [processedItems]);

  // Toggle item expansion
  const toggleExpansion = (itemId) => {
    if (!allowExpand) return;

    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Handle status change
  const handleStatusChange = (item, newStatus) => {
    if (onStatusChange) {
      onStatusChange(item, newStatus);
    }
  };

  // Render progress bar
  const renderProgressBar = (item) => {
    const { progressPercent, status } = item;
    const config = statusConfig[status];

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {progressPercent.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              status === "completed"
                ? "bg-green-500"
                : status === "in_progress"
                ? "bg-blue-500"
                : status === "overdue"
                ? "bg-red-500"
                : "bg-gray-400"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  };

  // Render timeline connector
  const renderTimelineConnector = (index, isLast) => {
    if (!showTimeline || isLast) return null;

    return (
      <div className="absolute left-6 top-12 w-0.5 h-12 bg-gray-200 dark:bg-gray-700" />
    );
  };

  // Render item
  const renderItem = (item, index) => {
    const config = statusConfig[item.status];
    const StatusIcon = config.icon;
    const isExpanded = expandedItems.has(item.id);
    const isLast = index === filteredItems.length - 1;

    return (
      <div key={item.id} className="relative">
        {/* Timeline connector */}
        {renderTimelineConnector(index, isLast)}

        <div
          className={`
          flex items-start space-x-4 p-4 rounded-lg border-2 transition-all duration-200
          ${config.border} ${config.bg}
          ${onItemClick ? "cursor-pointer hover:shadow-md" : ""}
        `}
          onClick={() => onItemClick && onItemClick(item)}
        >
          {/* Status Icon */}
          <div
            className={`
            flex-shrink-0 p-2 rounded-full bg-white dark:bg-gray-800 border-2 ${
              config.border
            }
            ${showTimeline ? "relative z-10" : ""}
          `}
          >
            <StatusIcon className={`h-5 w-5 ${config.color}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Title and Status */}
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </h4>
                  <Badge
                    variant={
                      item.status === "completed"
                        ? "success"
                        : item.status === "in_progress"
                        ? "info"
                        : item.status === "overdue" || item.status === "blocked"
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {config.label}
                  </Badge>

                  {item.priority === "high" && (
                    <Badge variant="destructive" className="text-xs">
                      High Priority
                    </Badge>
                  )}
                </div>

                {/* Description */}
                {item.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {item.description}
                  </p>
                )}

                {/* Progress Bar */}
                {showProgress && (
                  <div className="mb-3">{renderProgressBar(item)}</div>
                )}

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  {item.dueDate && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Due: {format(parseISO(item.dueDate), "MMM d, yyyy")}
                      </span>
                      {item.daysRemaining !== null && (
                        <span
                          className={
                            item.daysRemaining < 0
                              ? "text-red-600 dark:text-red-400"
                              : item.daysRemaining <= 3
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-gray-500 dark:text-gray-400"
                          }
                        >
                          (
                          {item.daysRemaining < 0
                            ? `${Math.abs(item.daysRemaining)} days overdue`
                            : `${item.daysRemaining} days left`}
                          )
                        </span>
                      )}
                    </div>
                  )}

                  {item.assignee && (
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{item.assignee}</span>
                    </div>
                  )}

                  {item.totalSubtasks && (
                    <div className="flex items-center space-x-1">
                      <Target className="h-3 w-3" />
                      <span>
                        {item.completedSubtasks || 0}/{item.totalSubtasks}{" "}
                        subtasks
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                {showActions && (
                  <>
                    {item.status !== "completed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(item, "completed");
                        }}
                        className="p-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails && onViewDetails(item);
                      }}
                      className="p-1"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {allowExpand && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpansion(item.id);
                    }}
                    className="p-1"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && showDetails && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {item.startDate && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Start Date:
                      </span>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {format(parseISO(item.startDate), "MMM d, yyyy")}
                      </div>
                    </div>
                  )}

                  {item.dependencies && item.dependencies.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Dependencies:
                      </span>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {item.dependencies.join(", ")}
                      </div>
                    </div>
                  )}

                  {item.tags && item.tags.length > 0 && (
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Tags:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.notes && (
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Notes:
                      </span>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Card className={className}>
        <div className="p-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6 animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
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
              <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Failed to load progress data
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
              {overallProgress}% overall progress • {filteredItems.length} items
            </p>
          </div>

          {/* Overall Progress */}
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {overallProgress}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Complete
            </div>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
          {Object.entries(progressSummary).map(([status, count]) => {
            if (count === 0) return null;
            const config = statusConfig[status];
            return (
              <button
                key={status}
                onClick={() =>
                  setSelectedView(selectedView === status ? "all" : status)
                }
                className={`
                  p-3 rounded-lg text-center transition-all duration-200 border-2
                  ${
                    selectedView === status
                      ? `${config.border} ${config.bg}`
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }
                `}
              >
                <div className={`text-lg font-bold ${config.color}`}>
                  {count}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {config.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Items List */}
        <div className="space-y-4">
          {filteredItems.map((item, index) => renderItem(item, index))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <Target className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No items to track
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {selectedView !== "all"
                ? "Try selecting a different status"
                : "Items will appear here when added"}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProgressTracker;
