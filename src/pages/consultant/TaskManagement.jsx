import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  User,
  AlertCircle,
  Edit,
  Trash2,
  Search,
  Target,
  CheckCircle,
  Filter,
  RefreshCw,
  FileText,
  X,
  Save,
  Bell,
  Users,
} from "lucide-react";
import useConsultantStore from "../../stores/consultantStore";

const TaskManagement = () => {
  const {
    leads,
    tasks: allTasks,
    loading,
    error,
    fetchLeads,
    fetchAllLeadTasks,
    setFollowUpTask,
    clearError,
    deleteLeadTaskById,
    editLeadTask,
  } = useConsultantStore();

  const [selectedLead, setSelectedLead] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const [filters, setFilters] = useState({
    status: "",
    search: "",
    dueDate: "",
    leadId: "",
  });

  const [taskForm, setTaskForm] = useState({
    description: "",
    dueDate: "",
    status: "pending",
    leadId: "",
    notes: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const taskStatuses = [
    {
      value: "pending",
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
      icon: "⏳",
    },
    {
      value: "in_progress",
      label: "In Progress",
      color: "bg-blue-100 text-blue-800",
      icon: "🔄",
    },
    {
      value: "completed",
      label: "Completed",
      color: "bg-green-100 text-green-800",
      icon: "✅",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "bg-gray-100 text-gray-800",
      icon: "❌",
    },
  ];

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  useEffect(() => {
    applyFilters();
  }, [allTasks, filters]);

  const initializeData = async () => {
    try {
      await fetchLeads();
      await fetchAllLeadTasks();
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
    }
  };

  const applyFilters = () => {
    let filtered = [...allTasks];

    if (filters.status) {
      filtered = filtered.filter((task) => task.status === filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.description?.toLowerCase().includes(searchLower) ||
          task.studentName?.toLowerCase().includes(searchLower) ||
          task.notes?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.dueDate) {
      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.dueDate).toDateString();
        const filterDate = new Date(filters.dueDate).toDateString();
        return taskDate === filterDate;
      });
    }

    if (filters.leadId) {
      filtered = filtered.filter((task) => task.leadId === filters.leadId);
    }

    filtered = filtered.map((task) => ({
      ...task,
      isOverdue:
        new Date(task.dueDate) < new Date() && task.status !== "completed",
    }));

    setFilteredTasks(filtered);
  };

  const validateTaskForm = () => {
    const errors = {};

    if (!taskForm.description.trim()) {
      errors.description = "Task description is required";
    }

    if (!taskForm.dueDate) {
      errors.dueDate = "Due date is required";
    }

    if (!taskForm.leadId) {
      errors.leadId = "Please select a student";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateTask = async () => {
    if (!validateTaskForm()) return;

    try {
      await setFollowUpTask(taskForm.leadId, {
        description: taskForm.description,
        dueDate: new Date(taskForm.dueDate).toISOString(),
        status: taskForm.status,
        notes: taskForm.notes,
      });

      setShowCreateModal(false);
      resetTaskForm();
      await fetchAllLeadTasks();
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  const handleEditTask = async () => {
    if (!validateTaskForm()) return;

    try {
      await editLeadTask(selectedTask.id, {
        description: taskForm.description,
        dueDate: new Date(taskForm.dueDate).toISOString(),
        status: taskForm.status,
        leadId: taskForm.leadId,
        notes: taskForm.notes,
      });

      setShowCreateModal(false);
      setIsEditing(false);
      setSelectedTask(null);
      resetTaskForm();
      await fetchAllLeadTasks();
    } catch (err) {
      console.error("Failed to edit task:", err);
    }
  };

  const handleDeleteTask = async () => {
    try {
      await deleteLeadTaskById(taskToDelete.id);
      setShowConfirmModal(false);
      setTaskToDelete(null);
      await fetchAllLeadTasks();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const openDeleteConfirmModal = (task) => {
    setTaskToDelete(task);
    setShowConfirmModal(true);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setTaskForm({
      description: task.description || "",
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().slice(0, 16)
        : "",
      status: task.status || "pending",
      leadId: task.leadId || "",
      notes: task.notes || "",
    });
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const resetTaskForm = () => {
    setTaskForm({
      description: "",
      dueDate: "",
      status: "pending",
      leadId: selectedLead?.id || "",
      notes: "",
    });
    setFormErrors({});
  };

  const getTaskStats = () => {
    const relevantTasks = filters.leadId
      ? allTasks.filter((task) => task.leadId === filters.leadId)
      : allTasks;

    return {
      total: relevantTasks.length,
      pending: relevantTasks.filter((task) => task.status === "pending").length,
      inProgress: relevantTasks.filter((task) => task.status === "in_progress")
        .length,
      completed: relevantTasks.filter((task) => task.status === "completed")
        .length,
      overdue: relevantTasks.filter(
        (task) =>
          new Date(task.dueDate) < new Date() && task.status !== "completed"
      ).length,
    };
  };

  const getStatusColor = (status) =>
    taskStatuses.find((s) => s.value === status)?.color ||
    "bg-gray-100 text-gray-800";

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOverdue: date < new Date(),
    };
  };

  const stats = getTaskStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="ml-auto text-red-500 hover:text-red-700 rounded-lg p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Task Management
              </h1>
              <p className="text-gray-600 mt-2">
                {selectedLead
                  ? `Managing tasks for ${selectedLead.student?.name}`
                  : "Manage follow-up tasks for your students"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchAllLeadTasks()}
                disabled={loading}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  resetTaskForm();
                  setShowCreateModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md"
              >
                <Plus className="h-4 w-4" />
                Create Task
              </button>
            </div>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              label: "Total",
              value: stats.total,
              icon: Target,
              color: "text-blue-600",
              bgColor: "bg-blue-50",
            },
            {
              label: "Pending",
              value: stats.pending,
              icon: Clock,
              color: "text-yellow-600",
              bgColor: "bg-yellow-50",
            },
            {
              label: "In Progress",
              value: stats.inProgress,
              icon: CheckSquare,
              color: "text-blue-600",
              bgColor: "bg-blue-50",
            },
            {
              label: "Completed",
              value: stats.completed,
              icon: CheckCircle,
              color: "text-green-600",
              bgColor: "bg-green-50",
            },
            {
              label: "Overdue",
              value: stats.overdue,
              icon: AlertCircle,
              color: "text-red-600",
              bgColor: "bg-red-50",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bgColor} rounded-xl p-6 border border-gray-200 shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {taskStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.icon} {status.label}
                </option>
              ))}
            </select>

            <select
              value={filters.leadId}
              onChange={(e) =>
                setFilters({ ...filters, leadId: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Students</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.student?.name || "Unknown"}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={filters.dueDate}
              onChange={(e) =>
                setFilters({ ...filters, dueDate: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mt-4 text-sm text-gray-600 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Showing {filteredTasks.length} of {allTasks.length} tasks
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tasks Overview
            </h3>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <CheckSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tasks found
              </h3>
              <p className="text-gray-600 mb-6">
                {Object.values(filters).some((f) => f)
                  ? "No tasks match your current filters."
                  : "Create your first task to get started."}
              </p>
              <button
                onClick={() => {
                  setIsEditing(false);
                  resetTaskForm();
                  setShowCreateModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4 mr-2 inline" />
                Create First Task
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTasks.map((task, index) => {
                    const dateInfo = formatDate(task.dueDate);
                    const status = taskStatuses.find(
                      (s) => s.value === task.status
                    );

                    const lead = leads.find(l => l.id == task.leadId);

                    return (
                      <tr
                        key={task.id || index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <div className="font-medium text-gray-900 truncate">
                              {task.description}
                            </div>
                            {task.notes && (
                              <div className="text-sm text-gray-500 truncate mt-1">
                                {task.notes}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm mr-3">
                              {lead.student?.name?.charAt(0) || "S"}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {lead.student?.name || ""}
                              </div>
                              <div className="text-sm text-gray-500">
                                {lead.student?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`whitespace-nowrap inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              task.status
                            )} ${task.isOverdue ? "ring-2 ring-red-500" : ""}`}
                          >
                            <span className="mr-1">{status?.icon}</span>
                            {task.isOverdue && task.status !== "completed"
                              ? "Overdue"
                              : status?.label || task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`text-sm ${
                              task.isOverdue && task.status !== "completed"
                                ? "text-red-600 font-medium"
                                : "text-gray-600"
                            }`}
                          >
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {dateInfo.date}
                            </div>
                            <div className="flex items-center mt-1">
                              <Clock className="h-4 w-4 mr-1" />
                              {dateInfo.time}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(task)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-lg transition-colors"
                              title="Edit Task"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDeleteConfirmModal(task)}
                              className="bg-red-50 hover:bg-red-100 text-red-700 p-2 rounded-lg transition-colors"
                              title="Delete Task"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Task Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {isEditing ? "Edit Task" : "Create New Task"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setIsEditing(false);
                      setSelectedTask(null);
                      resetTaskForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student *
                  </label>
                  <select
                    value={taskForm.leadId}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, leadId: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.leadId ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isEditing}
                  >
                    <option value="">Select a student</option>
                    {leads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.student?.name || "Unknown"} ({lead.student?.email}
                        )
                      </option>
                    ))}
                  </select>
                  {formErrors.leadId && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.leadId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Description *
                  </label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, description: e.target.value })
                    }
                    placeholder="Describe the follow-up task..."
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.description
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={taskForm.status}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {taskStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.icon} {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={taskForm.dueDate}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, dueDate: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.dueDate
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {formErrors.dueDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.dueDate}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={taskForm.notes}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, notes: e.target.value })
                    }
                    placeholder="Any additional notes..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setIsEditing(false);
                      setSelectedTask(null);
                      resetTaskForm();
                    }}
                    className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={isEditing ? handleEditTask : handleCreateTask}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {isEditing ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {isEditing ? "Update Task" : "Create Task"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showConfirmModal && taskToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Confirm Deletion
                </h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete the task "
                  <span className="font-medium">
                    {taskToDelete.description}
                  </span>
                  "? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setTaskToDelete(null);
                    }}
                    className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteTask}
                    disabled={loading}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Delete Task
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagement;

// import React, { useState, useEffect } from "react";
// import {
//   CheckSquare,
//   Plus,
//   Calendar,
//   Clock,
//   User,
//   AlertCircle,
//   Edit,
//   Trash2,
//   Search,
//   Target,
//   CheckCircle,
//   Filter,
//   RefreshCw,
//   FileText,
//   X,
//   Save,
//   Bell,
//   Users,
//   Delete,
//   Trash,
// } from "lucide-react";
// import useConsultantStore from "../../stores/consultantStore";

// const TaskManagement = () => {
//   const {
//     leads,
//     tasks: allTasks,
//     loading,
//     error,
//     fetchLeads,
//     fetchLeadTasks,
//     fetchAllLeadTasks,
//     setFollowUpTask,
//     clearError,
//     deleteLeadTaskById,
//   } = useConsultantStore();

//   const [selectedLead, setSelectedLead] = useState(null);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedTask, setSelectedTask] = useState(null);
//   // const [allTasks, setAllTasks] = useState([]);
//   const [filteredTasks, setFilteredTasks] = useState([]);

//   const [filters, setFilters] = useState({
//     status: "",
//     priority: "",
//     search: "",
//     dueDate: "",
//     leadId: "",
//   });

//   const [taskForm, setTaskForm] = useState({
//     description: "",
//     dueDate: "",
//     priority: "medium",
//     status: "pending",
//     leadId: "",
//     notes: "",
//   });

//   const [formErrors, setFormErrors] = useState({});

//   const taskPriorities = [
//     {
//       value: "low",
//       label: "Low",
//       color: "bg-gray-100 text-gray-800",
//       icon: "🔵",
//     },
//     {
//       value: "medium",
//       label: "Medium",
//       color: "bg-blue-100 text-blue-800",
//       icon: "🟡",
//     },
//     {
//       value: "high",
//       label: "High",
//       color: "bg-orange-100 text-orange-800",
//       icon: "🟠",
//     },
//     {
//       value: "urgent",
//       label: "Urgent",
//       color: "bg-red-100 text-red-800",
//       icon: "🔴",
//     },
//   ];

//   const taskStatuses = [
//     {
//       value: "pending",
//       label: "Pending",
//       color: "bg-yellow-100 text-yellow-800",
//       icon: "⏳",
//     },
//     {
//       value: "in_progress",
//       label: "In Progress",
//       color: "bg-blue-100 text-blue-800",
//       icon: "🔄",
//     },
//     {
//       value: "completed",
//       label: "Completed",
//       color: "bg-green-100 text-green-800",
//       icon: "✅",
//     },
//     {
//       value: "cancelled",
//       label: "Cancelled",
//       color: "bg-gray-100 text-gray-800",
//       icon: "❌",
//     },
//   ];

//   useEffect(() => {
//     initializeData();
//   }, []);

//   useEffect(() => {
//     if (error) {
//       const timer = setTimeout(clearError, 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [error, clearError]);

//   useEffect(() => {
//     applyFilters();
//   }, [allTasks, filters]);

//   const initializeData = async () => {
//     try {
//       await fetchLeads();
//       await fetchAllLeadTasks();
//     } catch (err) {
//       console.error("Failed to fetch initial data:", err);
//     }
//   };

//   // const loadTasksForLead = async (leadId) => {
//   //   try {
//   //     const leadTasks = await fetchLeadTasks(leadId);
//   //     return leadTasks || [];
//   //   } catch (err) {
//   //     console.error(`Failed to fetch tasks for lead ${leadId}:`, err);
//   //     return [];
//   //   }
//   // };

//   const loadAllTasks = async () => {
//     try {
//       const allLeadTasks = [];
//       const leadTasks = await fetchAllLeadTasks(lead.id);

//       // for (const lead of leads) {
//       //   const leadTasks = await loadTasksForLead(lead.id);
//       //   const tasksWithLeadInfo = leadTasks.map((task) => ({
//       //     ...task,
//       //     leadId: lead.id,
//       //     studentName: lead.student?.name || "Unknown",
//       //     studentEmail: lead.student?.email || "N/A",
//       //     leadStatus: lead.status,
//       //   }));
//       //   allLeadTasks.push(...tasksWithLeadInfo);
//       // }
//       // setAllTasks(allLeadTasks);
//     } catch (err) {
//       console.error("Failed to load all tasks:", err);
//     }
//   };

//   // useEffect(() => {
//   //   if (leads.length > 0) {
//   //     loadAllTasks();
//   //   }
//   // }, [leads]);

//   const applyFilters = () => {
//     let filtered = [...allTasks];

//     if (filters.status) {
//       filtered = filtered.filter((task) => task.status === filters.status);
//     }

//     if (filters.priority) {
//       filtered = filtered.filter((task) => task.priority === filters.priority);
//     }

//     if (filters.search) {
//       const searchLower = filters.search.toLowerCase();
//       filtered = filtered.filter(
//         (task) =>
//           task.description?.toLowerCase().includes(searchLower) ||
//           task.studentName?.toLowerCase().includes(searchLower) ||
//           task.notes?.toLowerCase().includes(searchLower)
//       );
//     }

//     if (filters.dueDate) {
//       filtered = filtered.filter((task) => {
//         const taskDate = new Date(task.dueDate).toDateString();
//         const filterDate = new Date(filters.dueDate).toDateString();
//         return taskDate === filterDate;
//       });
//     }

//     if (filters.leadId) {
//       filtered = filtered.filter((task) => task.leadId === filters.leadId);
//     }

//     // Add overdue status for display
//     filtered = filtered.map((task) => ({
//       ...task,
//       isOverdue:
//         new Date(task.dueDate) < new Date() && task.status !== "completed",
//     }));

//     setFilteredTasks(filtered);
//   };

//   const validateTaskForm = () => {
//     const errors = {};

//     if (!taskForm.description.trim()) {
//       errors.description = "Task description is required";
//     }

//     if (!taskForm.dueDate) {
//       errors.dueDate = "Due date is required";
//     }

//     if (!taskForm.leadId) {
//       errors.leadId = "Please select a student";
//     }

//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleCreateTask = async () => {
//     if (!validateTaskForm()) return;

//     try {
//       await setFollowUpTask(taskForm.leadId, {
//         description: taskForm.description,
//         dueDate: new Date(taskForm.dueDate).toISOString(),
//         priority: taskForm.priority,
//         notes: taskForm.notes,
//       });

//       setShowCreateModal(false);
//       resetTaskForm();
//       await fetchAllLeadTasks(); // Refresh tasks
//     } catch (err) {
//       console.error("Failed to create task:", err);
//     }
//   };

//   const resetTaskForm = () => {
//     setTaskForm({
//       description: "",
//       dueDate: "",
//       priority: "medium",
//       status: "pending",
//       leadId: selectedLead?.id || "",
//       notes: "",
//     });
//     setFormErrors({});
//   };

//   const handleEditTask = (task) => {
//     setSelectedTask(task);
//     setTaskForm({
//       description: task.description || "",
//       dueDate: task.dueDate
//         ? new Date(task.dueDate).toISOString().slice(0, 16)
//         : "",
//       priority: task.priority || "medium",
//       status: task.status || "pending",
//       leadId: task.leadId || "",
//       notes: task.notes || "",
//     });
//     setShowEditModal(true);
//   };

//   const getTaskStats = () => {
//     const relevantTasks = filters.leadId
//       ? allTasks.filter((task) => task.leadId === filters.leadId)
//       : allTasks;

//     return {
//       total: relevantTasks.length,
//       pending: relevantTasks.filter((task) => task.status === "pending").length,
//       inProgress: relevantTasks.filter((task) => task.status === "in_progress")
//         .length,
//       completed: relevantTasks.filter((task) => task.status === "completed")
//         .length,
//       overdue: relevantTasks.filter(
//         (task) =>
//           new Date(task.dueDate) < new Date() && task.status !== "completed"
//       ).length,
//     };
//   };

//   const getPriorityColor = (priority) =>
//     taskPriorities.find((p) => p.value === priority)?.color ||
//     "bg-gray-100 text-gray-800";

//   const getStatusColor = (status) =>
//     taskStatuses.find((s) => s.value === status)?.color ||
//     "bg-gray-100 text-gray-800";

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return {
//       date: date.toLocaleDateString(),
//       time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
//       isOverdue: date < new Date(),
//     };
//   };

//   const stats = getTaskStats();

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* Error Message */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
//             <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
//             <p className="text-red-700">{error}</p>
//             <button
//               onClick={clearError}
//               className="ml-auto text-red-500 hover:text-red-700 rounded-lg p-1"
//             >
//               <X className="h-4 w-4" />
//             </button>
//           </div>
//         )}

//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">
//                 Task Management
//               </h1>
//               <p className="text-gray-600 mt-2">
//                 {selectedLead
//                   ? `Managing tasks for ${selectedLead.student?.name}`
//                   : "Manage follow-up tasks for your students"}
//               </p>
//             </div>
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={loadAllTasks}
//                 disabled={loading}
//                 className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
//               >
//                 <RefreshCw
//                   className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
//                 />
//                 Refresh
//               </button>
//               <button
//                 onClick={() => setShowCreateModal(true)}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md"
//               >
//                 <Plus className="h-4 w-4" />
//                 Create Task
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Task Statistics */}
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//           {[
//             {
//               label: "Total",
//               value: stats.total,
//               icon: Target,
//               color: "text-blue-600",
//               bgColor: "bg-blue-50",
//             },
//             {
//               label: "Pending",
//               value: stats.pending,
//               icon: Clock,
//               color: "text-yellow-600",
//               bgColor: "bg-yellow-50",
//             },
//             {
//               label: "In Progress",
//               value: stats.inProgress,
//               icon: CheckSquare,
//               color: "text-blue-600",
//               bgColor: "bg-blue-50",
//             },
//             {
//               label: "Completed",
//               value: stats.completed,
//               icon: CheckCircle,
//               color: "text-green-600",
//               bgColor: "bg-green-50",
//             },
//             {
//               label: "Overdue",
//               value: stats.overdue,
//               icon: AlertCircle,
//               color: "text-red-600",
//               bgColor: "bg-red-50",
//             },
//           ].map((stat) => (
//             <div
//               key={stat.label}
//               className={`${stat.bgColor} rounded-xl p-6 border border-gray-200 shadow-sm`}
//             >
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">
//                     {stat.label}
//                   </p>
//                   <p className="text-3xl font-bold text-gray-900 mt-1">
//                     {stat.value}
//                   </p>
//                 </div>
//                 <stat.icon className={`h-8 w-8 ${stat.color}`} />
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
//           <div className="flex items-center gap-3 mb-4">
//             <Filter className="h-5 w-5 text-gray-600" />
//             <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search tasks..."
//                 value={filters.search}
//                 onChange={(e) =>
//                   setFilters({ ...filters, search: e.target.value })
//                 }
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <select
//               value={filters.status}
//               onChange={(e) =>
//                 setFilters({ ...filters, status: e.target.value })
//               }
//               className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="">All Statuses</option>
//               {taskStatuses.map((status) => (
//                 <option key={status.value} value={status.value}>
//                   {status.icon} {status.label}
//                 </option>
//               ))}
//             </select>

//             <select
//               value={filters.priority}
//               onChange={(e) =>
//                 setFilters({ ...filters, priority: e.target.value })
//               }
//               className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="">All Priorities</option>
//               {taskPriorities.map((priority) => (
//                 <option key={priority.value} value={priority.value}>
//                   {priority.icon} {priority.label}
//                 </option>
//               ))}
//             </select>

//             <select
//               value={filters.leadId}
//               onChange={(e) =>
//                 setFilters({ ...filters, leadId: e.target.value })
//               }
//               className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="">All Students</option>
//               {leads.map((lead) => (
//                 <option key={lead.id} value={lead.id}>
//                   {lead.student?.name || "Unknown"}
//                 </option>
//               ))}
//             </select>

//             <input
//               type="date"
//               value={filters.dueDate}
//               onChange={(e) =>
//                 setFilters({ ...filters, dueDate: e.target.value })
//               }
//               className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>

//           <div className="mt-4 text-sm text-gray-600 flex items-center gap-2">
//             <Users className="h-4 w-4" />
//             Showing {filteredTasks.length} of {allTasks.length} tasks
//           </div>
//         </div>

//         {/* Tasks Table */}
//         <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
//           <div className="p-6 border-b border-gray-200">
//             <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//               <FileText className="h-5 w-5" />
//               Tasks Overview
//             </h3>
//           </div>

//           {loading ? (
//             <div className="p-12 text-center">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//               <p className="text-gray-500 mt-4">Loading tasks...</p>
//             </div>
//           ) : filteredTasks.length === 0 ? (
//             <div className="p-12 text-center">
//               <CheckSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg font-medium text-gray-900 mb-2">
//                 No tasks found
//               </h3>
//               <p className="text-gray-600 mb-6">
//                 {Object.values(filters).some((f) => f)
//                   ? "No tasks match your current filters."
//                   : "Create your first task to get started."}
//               </p>
//               <button
//                 onClick={() => setShowCreateModal(true)}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
//               >
//                 <Plus className="h-4 w-4 mr-2 inline" />
//                 Create First Task
//               </button>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Task
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Student
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Priority
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Due Date
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredTasks.map((task, index) => {
//                     const dateInfo = formatDate(task.dueDate);
//                     const priority = taskPriorities.find(
//                       (p) => p.value === task.priority
//                     );
//                     const status = taskStatuses.find(
//                       (s) => s.value === task.status
//                     );

//                     return (
//                       <tr
//                         key={task.id || index}
//                         className="hover:bg-gray-50 transition-colors"
//                       >
//                         <td className="px-6 py-4">
//                           <div className="max-w-xs">
//                             <div className="font-medium text-gray-900 truncate">
//                               {task.description}
//                             </div>
//                             {task.notes && (
//                               <div className="text-sm text-gray-500 truncate mt-1">
//                                 {task.notes}
//                               </div>
//                             )}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center">
//                             <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm mr-3">
//                               {task.studentName?.charAt(0) || "S"}
//                             </div>
//                             <div>
//                               <div className="font-medium text-gray-900">
//                                 {task.studentName}
//                               </div>
//                               <div className="text-sm text-gray-500">
//                                 {task.studentEmail}
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span
//                             className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
//                               task.priority
//                             )}`}
//                           >
//                             <span className="mr-1">{priority?.icon}</span>
//                             {priority?.label || task.priority}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span
//                             className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                               task.status
//                             )} ${task.isOverdue ? "ring-2 ring-red-500" : ""}`}
//                           >
//                             <span className="mr-1">{status?.icon}</span>
//                             {task.isOverdue && task.status !== "completed"
//                               ? "Overdue"
//                               : status?.label || task.status}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div
//                             className={`text-sm ${
//                               task.isOverdue && task.status !== "completed"
//                                 ? "text-red-600 font-medium"
//                                 : "text-gray-600"
//                             }`}
//                           >
//                             <div className="flex items-center">
//                               <Calendar className="h-4 w-4 mr-1" />
//                               {dateInfo.date}
//                             </div>
//                             <div className="flex items-center mt-1">
//                               <Clock className="h-4 w-4 mr-1" />
//                               {dateInfo.time}
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center gap-2">
//                             <button
//                               onClick={() => handleEditTask(task)}
//                               className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-lg transition-colors"
//                               title="Edit Task"
//                             >
//                               <Edit className="h-4 w-4" />
//                             </button>
//                             <button
//                               onClick={() => handleEditTask(task)}
//                               className="bg-blue-50 hover:bg-blue-100 text-red-700 p-2 rounded-lg transition-colors"
//                               title="Delete Task"
//                             >
//                               <Trash className="h-4 w-4" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* Create Task Modal */}
//         {showCreateModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
//               <div className="p-6 border-b border-gray-200">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-xl font-semibold text-gray-900">
//                     Create New Task
//                   </h3>
//                   <button
//                     onClick={() => {
//                       setShowCreateModal(false);
//                       resetTaskForm();
//                     }}
//                     className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
//                   >
//                     <X className="h-5 w-5" />
//                   </button>
//                 </div>
//               </div>

//               <div className="p-6 space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Student *
//                   </label>
//                   <select
//                     value={taskForm.leadId}
//                     onChange={(e) =>
//                       setTaskForm({ ...taskForm, leadId: e.target.value })
//                     }
//                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                       formErrors.leadId ? "border-red-500" : "border-gray-300"
//                     }`}
//                   >
//                     <option value="">Select a student</option>
//                     {leads.map((lead) => (
//                       <option key={lead.id} value={lead.id}>
//                         {lead.student?.name || "Unknown"} ({lead.student?.email}
//                         )
//                       </option>
//                     ))}
//                   </select>
//                   {formErrors.leadId && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {formErrors.leadId}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Task Description *
//                   </label>
//                   <textarea
//                     value={taskForm.description}
//                     onChange={(e) =>
//                       setTaskForm({ ...taskForm, description: e.target.value })
//                     }
//                     placeholder="Describe the follow-up task..."
//                     rows={3}
//                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                       formErrors.description
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     }`}
//                   />
//                   {formErrors.description && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {formErrors.description}
//                     </p>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Priority
//                     </label>
//                     <select
//                       value={taskForm.priority}
//                       onChange={(e) =>
//                         setTaskForm({ ...taskForm, priority: e.target.value })
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     >
//                       {taskPriorities.map((priority) => (
//                         <option key={priority.value} value={priority.value}>
//                           {priority.icon} {priority.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Due Date *
//                     </label>
//                     <input
//                       type="datetime-local"
//                       value={taskForm.dueDate}
//                       onChange={(e) =>
//                         setTaskForm({ ...taskForm, dueDate: e.target.value })
//                       }
//                       className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                         formErrors.dueDate
//                           ? "border-red-500"
//                           : "border-gray-300"
//                       }`}
//                     />
//                     {formErrors.dueDate && (
//                       <p className="text-red-500 text-sm mt-1">
//                         {formErrors.dueDate}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Additional Notes
//                   </label>
//                   <textarea
//                     value={taskForm.notes}
//                     onChange={(e) =>
//                       setTaskForm({ ...taskForm, notes: e.target.value })
//                     }
//                     placeholder="Any additional notes..."
//                     rows={2}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>

//                 <div className="flex justify-end gap-3 pt-6">
//                   <button
//                     onClick={() => {
//                       setShowCreateModal(false);
//                       resetTaskForm();
//                     }}
//                     className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleCreateTask}
//                     disabled={loading}
//                     className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
//                   >
//                     {loading ? (
//                       <>
//                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                         Creating...
//                       </>
//                     ) : (
//                       <>
//                         <Save className="h-4 w-4" />
//                         Create Task
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Edit Task Modal */}
//         {showEditModal && selectedTask && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
//               <div className="p-6 border-b border-gray-200">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-xl font-semibold text-gray-900">
//                     Edit Task
//                   </h3>
//                   <button
//                     onClick={() => {
//                       setShowEditModal(false);
//                       setSelectedTask(null);
//                       resetTaskForm();
//                     }}
//                     className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
//                   >
//                     <X className="h-5 w-5" />
//                   </button>
//                 </div>
//               </div>

//               <div className="p-6 space-y-4">
//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                   <div className="flex items-center">
//                     <Bell className="h-5 w-5 text-blue-600 mr-2" />
//                     <div>
//                       <p className="text-sm font-medium text-blue-900">Note</p>
//                       <p className="text-sm text-blue-700">
//                         Task editing is currently view-only. Create a new task
//                         for updates.
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Student
//                   </label>
//                   <div className="flex items-center p-3 bg-gray-50 rounded-lg">
//                     <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm mr-3">
//                       {selectedTask.studentName?.charAt(0) || "S"}
//                     </div>
//                     <div>
//                       <div className="font-medium text-gray-900">
//                         {selectedTask.studentName}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         {selectedTask.studentEmail}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Task Description
//                   </label>
//                   <div className="p-3 bg-gray-50 rounded-lg">
//                     <p className="text-gray-900">{selectedTask.description}</p>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Priority
//                     </label>
//                     <div className="p-3 bg-gray-50 rounded-lg">
//                       <span
//                         className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
//                           selectedTask.priority
//                         )}`}
//                       >
//                         {
//                           taskPriorities.find(
//                             (p) => p.value === selectedTask.priority
//                           )?.icon
//                         }{" "}
//                         {
//                           taskPriorities.find(
//                             (p) => p.value === selectedTask.priority
//                           )?.label
//                         }
//                       </span>
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Status
//                     </label>
//                     <div className="p-3 bg-gray-50 rounded-lg">
//                       <span
//                         className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
//                           selectedTask.status
//                         )}`}
//                       >
//                         {
//                           taskStatuses.find(
//                             (s) => s.value === selectedTask.status
//                           )?.icon
//                         }{" "}
//                         {
//                           taskStatuses.find(
//                             (s) => s.value === selectedTask.status
//                           )?.label
//                         }
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Due Date
//                   </label>
//                   <div className="p-3 bg-gray-50 rounded-lg">
//                     <div className="flex items-center text-gray-900">
//                       <Calendar className="h-4 w-4 mr-2" />
//                       {new Date(selectedTask.dueDate).toLocaleString()}
//                     </div>
//                   </div>
//                 </div>

//                 {selectedTask.notes && (
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Notes
//                     </label>
//                     <div className="p-3 bg-gray-50 rounded-lg">
//                       <p className="text-gray-900">{selectedTask.notes}</p>
//                     </div>
//                   </div>
//                 )}

//                 <div className="flex justify-end pt-6">
//                   <button
//                     onClick={() => {
//                       setShowEditModal(false);
//                       setSelectedTask(null);
//                       resetTaskForm();
//                     }}
//                     className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TaskManagement;
