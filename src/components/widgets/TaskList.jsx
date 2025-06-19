import React, { useState, useMemo } from "react";
import {
  CheckSquare,
  Square,
  Clock,
  AlertTriangle,
  Star,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  User,
  Flag,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Zap,
  Target,
  CheckCircle2,
  Circle,
  PlayCircle,
  PauseCircle,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import {
  format,
  parseISO,
  isToday,
  isTomorrow,
  isThisWeek,
  differenceInDays,
} from "date-fns";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Input from "../ui/Input";

const TaskList = ({
  title = "Task List",
  tasks = [],
  showCompleted = true,
  showFilters = true,
  showSearch = true,
  showActions = true,
  allowAdd = true,
  allowEdit = true,
  allowDelete = true,
  maxItems = 10,
  groupBy = "none", // 'none', 'priority', 'status', 'date', 'assignee'
  sortBy = "dueDate", // 'dueDate', 'priority', 'title', 'status', 'created'
  sortOrder = "asc",
  onTaskClick,
  onTaskComplete,
  onTaskAdd,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  className = "",
  loading = false,
  error = null,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [showCompletedTasks, setShowCompletedTasks] = useState(showCompleted);
  const [currentSortBy, setCurrentSortBy] = useState(sortBy);
  const [currentSortOrder, setCurrentSortOrder] = useState(sortOrder);
  const [selectedTasks, setSelectedTasks] = useState(new Set());

  // Priority configurations
  const priorityConfig = {
    high: {
      icon: ArrowUp,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/20",
      label: "High",
      value: 3,
    },
    medium: {
      icon: Minus,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-900/20",
      label: "Medium",
      value: 2,
    },
    low: {
      icon: ArrowDown,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/20",
      label: "Low",
      value: 1,
    },
  };

  // Status configurations
  const statusConfig = {
    completed: {
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      label: "Completed",
    },
    in_progress: {
      icon: PlayCircle,
      color: "text-blue-600 dark:text-blue-400",
      label: "In Progress",
    },
    paused: {
      icon: PauseCircle,
      color: "text-yellow-600 dark:text-yellow-400",
      label: "Paused",
    },
    pending: {
      icon: Circle,
      color: "text-gray-500 dark:text-gray-400",
      label: "Pending",
    },
  };

  // Process and filter tasks
  const processedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.assignee?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((task) => task.status === filterStatus);
    }

    // Apply priority filter
    if (filterPriority !== "all") {
      filtered = filtered.filter((task) => task.priority === filterPriority);
    }

    // Show/hide completed tasks
    if (!showCompletedTasks) {
      filtered = filtered.filter((task) => task.status !== "completed");
    }

    // Add computed properties
    filtered = filtered.map((task) => {
      let urgency = "normal";
      let daysUntilDue = null;

      if (task.dueDate) {
        daysUntilDue = differenceInDays(parseISO(task.dueDate), new Date());

        if (daysUntilDue < 0) {
          urgency = "overdue";
        } else if (daysUntilDue === 0) {
          urgency = "today";
        } else if (daysUntilDue === 1) {
          urgency = "tomorrow";
        } else if (daysUntilDue <= 7) {
          urgency = "this_week";
        }
      }

      return {
        ...task,
        urgency,
        daysUntilDue,
        priorityValue: priorityConfig[task.priority]?.value || 1,
      };
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (currentSortBy) {
        case "priority":
          aValue = a.priorityValue;
          bValue = b.priorityValue;
          break;
        case "dueDate":
          aValue = a.dueDate ? new Date(a.dueDate) : new Date("2099-12-31");
          bValue = b.dueDate ? new Date(b.dueDate) : new Date("2099-12-31");
          break;
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "created":
          aValue = new Date(a.createdAt || a.created || "2000-01-01");
          bValue = new Date(b.createdAt || b.created || "2000-01-01");
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return currentSortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return currentSortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered.slice(0, maxItems);
  }, [
    tasks,
    searchTerm,
    filterStatus,
    filterPriority,
    showCompletedTasks,
    currentSortBy,
    currentSortOrder,
    maxItems,
  ]);

  // Group tasks if needed
  const groupedTasks = useMemo(() => {
    if (groupBy === "none") {
      return { "All Tasks": processedTasks };
    }

    const groups = {};

    processedTasks.forEach((task) => {
      let groupKey;

      switch (groupBy) {
        case "priority":
          groupKey = priorityConfig[task.priority]?.label || "No Priority";
          break;
        case "status":
          groupKey = statusConfig[task.status]?.label || "Unknown Status";
          break;
        case "date":
          if (!task.dueDate) {
            groupKey = "No Due Date";
          } else if (isToday(parseISO(task.dueDate))) {
            groupKey = "Today";
          } else if (isTomorrow(parseISO(task.dueDate))) {
            groupKey = "Tomorrow";
          } else if (isThisWeek(parseISO(task.dueDate))) {
            groupKey = "This Week";
          } else {
            groupKey = "Later";
          }
          break;
        case "assignee":
          groupKey = task.assignee || "Unassigned";
          break;
        default:
          groupKey = "All Tasks";
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(task);
    });

    return groups;
  }, [processedTasks, groupBy]);

  // Toggle task completion
  const toggleTask = (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";

    if (onTaskComplete) {
      onTaskComplete(task, newStatus);
    } else if (onTaskStatusChange) {
      onTaskStatusChange(task, newStatus);
    }
  };

  // Toggle task selection
  const toggleTaskSelection = (taskId) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  // Handle sorting change
  const handleSort = (newSortBy) => {
    if (newSortBy === currentSortBy) {
      setCurrentSortOrder(currentSortOrder === "asc" ? "desc" : "asc");
    } else {
      setCurrentSortBy(newSortBy);
      setCurrentSortOrder("asc");
    }
  };

  // Get urgency styling
  const getUrgencyStyle = (task) => {
    switch (task.urgency) {
      case "overdue":
        return "border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10";
      case "today":
        return "border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/10";
      case "tomorrow":
        return "border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10";
      default:
        return "border-l-4 border-transparent";
    }
  };

  // Format due date
  const formatDueDate = (task) => {
    if (!task.dueDate) return null;

    const date = parseISO(task.dueDate);

    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";

    if (task.daysUntilDue < 0) {
      return `${Math.abs(task.daysUntilDue)} days overdue`;
    }

    return format(date, "MMM d");
  };

  // Render task item
  const renderTask = (task) => {
    const priorityConf = priorityConfig[task.priority];
    const statusConf = statusConfig[task.status];
    const StatusIcon = statusConf?.icon || Circle;
    const PriorityIcon = priorityConf?.icon || Minus;

    return (
      <div
        key={task.id}
        className={`
          group flex items-start space-x-3 p-3 rounded-lg transition-all duration-200
          ${getUrgencyStyle(task)}
          ${task.status === "completed" ? "opacity-60" : ""}
          ${
            onTaskClick
              ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              : ""
          }
        `}
        onClick={() => onTaskClick && onTaskClick(task)}
      >
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleTask(task);
          }}
          className="flex-shrink-0 mt-0.5"
        >
          {task.status === "completed" ? (
            <CheckSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <Square className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Title */}
              <h4
                className={`
                font-medium text-gray-900 dark:text-white
                ${task.status === "completed" ? "line-through" : ""}
              `}
              >
                {task.title}
              </h4>

              {/* Description */}
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {task.description}
                </p>
              )}

              {/* Meta information */}
              <div className="flex items-center space-x-4 mt-2">
                {/* Priority */}
                {priorityConf && (
                  <div
                    className={`flex items-center space-x-1 ${priorityConf.color}`}
                  >
                    <PriorityIcon className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      {priorityConf.label}
                    </span>
                  </div>
                )}

                {/* Due date */}
                {task.dueDate && (
                  <div
                    className={`
                    flex items-center space-x-1 text-xs
                    ${
                      task.urgency === "overdue"
                        ? "text-red-600 dark:text-red-400"
                        : task.urgency === "today"
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  `}
                  >
                    <Calendar className="h-3 w-3" />
                    <span>{formatDueDate(task)}</span>
                  </div>
                )}

                {/* Assignee */}
                {task.assignee && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                    <User className="h-3 w-3" />
                    <span>{task.assignee}</span>
                  </div>
                )}

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex space-x-1">
                    {task.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {task.tags.length > 2 && (
                      <span className="text-xs text-gray-400">
                        +{task.tags.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                {allowEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskEdit && onTaskEdit(task);
                    }}
                    className="p-1"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}

                {allowDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskDelete && onTaskDelete(task);
                    }}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}

                <Button variant="ghost" size="sm" className="p-1">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
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
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
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
                Failed to load tasks
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
              {processedTasks.length} tasks
              {tasks.filter((t) => t.status === "completed").length > 0 &&
                ` • ${
                  tasks.filter((t) => t.status === "completed").length
                } completed`}
            </p>
          </div>

          {allowAdd && (
            <Button size="sm" onClick={onTaskAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        {(showSearch || showFilters) && (
          <div className="space-y-4 mb-6">
            {/* Search */}
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {/* Filters */}
            {showFilters && (
              <div className="flex flex-wrap items-center gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort("dueDate")}
                  className="flex items-center space-x-1"
                >
                  <Calendar className="h-3 w-3" />
                  <span>Due Date</span>
                  {currentSortBy === "dueDate" &&
                    (currentSortOrder === "asc" ? (
                      <SortAsc className="h-3 w-3" />
                    ) : (
                      <SortDesc className="h-3 w-3" />
                    ))}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort("priority")}
                  className="flex items-center space-x-1"
                >
                  <Flag className="h-3 w-3" />
                  <span>Priority</span>
                  {currentSortBy === "priority" &&
                    (currentSortOrder === "asc" ? (
                      <SortAsc className="h-3 w-3" />
                    ) : (
                      <SortDesc className="h-3 w-3" />
                    ))}
                </Button>

                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showCompletedTasks}
                    onChange={(e) => setShowCompletedTasks(e.target.checked)}
                    className="rounded"
                  />
                  <span>Show completed</span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Tasks */}
        <div className="space-y-1">
          {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
            <div key={groupName}>
              {/* Group Header */}
              {groupBy !== "none" && Object.keys(groupedTasks).length > 1 && (
                <div className="flex items-center space-x-2 py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-2">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">
                    {groupName}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {groupTasks.length}
                  </Badge>
                </div>
              )}

              {/* Group Tasks */}
              <div className="space-y-1">{groupTasks.map(renderTask)}</div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {processedTasks.length === 0 && (
          <div className="text-center py-8">
            <Target className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {searchTerm || filterStatus !== "all" || filterPriority !== "all"
                ? "No tasks match your filters"
                : "No tasks yet"}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {allowAdd
                ? "Create your first task to get started"
                : "Tasks will appear here when added"}
            </p>
            {allowAdd && (
              <Button
                variant="outline"
                size="sm"
                onClick={onTaskAdd}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            )}
          </div>
        )}

        {/* Bulk Actions */}
        {selectedTasks.size > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedTasks.size} task{selectedTasks.size !== 1 ? "s" : ""}{" "}
              selected
            </span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Mark Complete
              </Button>
              <Button variant="outline" size="sm">
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TaskList;
