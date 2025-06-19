import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useApi from "../../hooks/useApi";
import useTasks from "../../hooks/useTasks";
import useAuthStore from "../../stores/authStore";
import { validateTaskForm } from "../../utils/validators";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import DataTable from "../../components/tables/DataTable";
import Toast from "../../components/ui/Toast";
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
} from "lucide-react";

const TaskManagement = () => {
  const { studentId } = useParams();
  const { user } = useAuthStore();
  const { callApi, services, loading: apiLoading, error: apiError } = useApi();
  const {
    getTasks,
    createTask,
    updateTaskStatus,
    deleteTask,
    loading: taskLoading,
    error: taskError,
  } = useTasks();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
    search: "",
    dueDate: "",
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    category: "follow_up",
    priority: "medium",
    dueDate: "",
    reminderDate: "",
    studentId: "",
    assignedTo: user?.id || "",
    status: "pending",
  });

  const taskCategories = [
    {
      value: "follow_up",
      label: "Follow Up",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "document_review",
      label: "Document Review",
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "application_support",
      label: "Application Support",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "meeting_preparation",
      label: "Meeting Preparation",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "deadline_reminder",
      label: "Deadline Reminder",
      color: "bg-red-100 text-red-800",
    },
    {
      value: "administrative",
      label: "Administrative",
      color: "bg-gray-100 text-gray-800",
    },
  ];

  const taskPriorities = [
    { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
    { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-800" },
    { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" },
  ];

  const taskStatuses = [
    {
      value: "pending",
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "in_progress",
      label: "In Progress",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "completed",
      label: "Completed",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "bg-gray-100 text-gray-800",
    },
    { value: "overdue", label: "Overdue", color: "bg-red-100 text-red-800" },
  ];

  useEffect(() => {
    fetchStudents();
    fetchTasks();
  }, []);

  useEffect(() => {
    if (studentId && students.length) {
      const student = students.find((s) => s.id === studentId);
      if (student) {
        setSelectedStudent(student);
        setTaskForm((prev) => ({ ...prev, studentId }));
      }
    }
  }, [studentId, students]);

  const fetchStudents = async () => {
    try {
      const response = await callApi(services.lead.getLeads);
      const leads = response || [];
      const studentsData = leads.map((lead) => ({
        id: lead.studentId,
        name: lead.student?.name || "Unknown",
        email: lead.student?.email || "N/A",
        status: lead.status,
        leadId: lead.id,
      }));
      setStudents(studentsData);
    } catch (error) {
      setToast({
        show: true,
        message: "Failed to fetch students",
        type: "error",
      });
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      const tasksWithStatus = response.map((task) => ({
        ...task,
        status:
          new Date(task.dueDate) < new Date() && task.status !== "completed"
            ? "overdue"
            : task.status,
      }));
      setTasks(tasksWithStatus);
    } catch (error) {
      setToast({
        show: true,
        message: taskError || "Failed to fetch tasks",
        type: "error",
      });
    }
  };

  const handleCreateTask = async () => {
    const validationErrors = validateTaskForm(taskForm);
    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      const studentForTask =
        selectedStudent || students.find((s) => s.id === taskForm.studentId);
      const newTask = await createTask({
        ...taskForm,
        dueDate: new Date(taskForm.dueDate).toISOString(),
        reminderDate: taskForm.reminderDate
          ? new Date(taskForm.reminderDate).toISOString()
          : null,
      });
      setTasks((prev) => [
        ...prev,
        { ...newTask, studentName: studentForTask?.name || "Unknown" },
      ]);
      setShowCreateModal(false);
      resetTaskForm();
      setToast({
        show: true,
        message: "Task created successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: taskError || "Failed to create task",
        type: "error",
      });
    }
  };

  const handleEditTask = async () => {
    const validationErrors = validateTaskForm(taskForm);
    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      const updatedTask = await callApi(
        services.task.updateTask,
        selectedTask.id,
        {
          ...taskForm,
          dueDate: new Date(taskForm.dueDate).toISOString(),
          reminderDate: taskForm.reminderDate
            ? new Date(taskForm.reminderDate).toISOString()
            : null,
        }
      );
      setTasks((prev) =>
        prev.map((task) => (task.id === selectedTask.id ? updatedTask : task))
      );
      setShowEditModal(false);
      setSelectedTask(null);
      resetTaskForm();
      setToast({
        show: true,
        message: "Task updated successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: taskError || "Failed to update task",
        type: "error",
      });
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: newStatus,
                completedAt:
                  newStatus === "completed" ? new Date().toISOString() : null,
              }
            : task
        )
      );
      setToast({
        show: true,
        message: "Task status updated!",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: taskError || "Failed to update task status",
        type: "error",
      });
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      setToast({
        show: true,
        message: "Task deleted successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: taskError || "Failed to delete task",
        type: "error",
      });
    }
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: "",
      description: "",
      category: "follow_up",
      priority: "medium",
      dueDate: "",
      reminderDate: "",
      studentId: selectedStudent?.id || "",
      assignedTo: user?.id || "",
      status: "pending",
    });
    setFormErrors({});
  };

  const getCategoryColor = (category) =>
    taskCategories.find((c) => c.value === category)?.color ||
    "bg-gray-100 text-gray-800";

  const getPriorityColor = (priority) =>
    taskPriorities.find((p) => p.value === priority)?.color ||
    "bg-gray-100 text-gray-800";

  const getStatusColor = (status) =>
    taskStatuses.find((s) => s.value === status)?.color ||
    "bg-gray-100 text-gray-800";

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = !filters.status || task.status === filters.status;
    const matchesPriority =
      !filters.priority || task.priority === filters.priority;
    const matchesCategory =
      !filters.category || task.category === filters.category;
    const matchesSearch =
      !filters.search ||
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.studentName.toLowerCase().includes(filters.search.toLowerCase());
    const matchesDueDate =
      !filters.dueDate ||
      new Date(task.dueDate).toDateString() ===
        new Date(filters.dueDate).toDateString();
    const matchesStudent =
      !selectedStudent || task.studentId === selectedStudent.id;

    return (
      matchesStatus &&
      matchesPriority &&
      matchesCategory &&
      matchesSearch &&
      matchesDueDate &&
      matchesStudent
    );
  });

  const getTaskStats = () => {
    const relevantTasks = selectedStudent
      ? tasks.filter((task) => task.studentId === selectedStudent.id)
      : tasks;
    return {
      total: relevantTasks.length,
      pending: relevantTasks.filter((task) => task.status === "pending").length,
      inProgress: relevantTasks.filter((task) => task.status === "in_progress")
        .length,
      completed: relevantTasks.filter((task) => task.status === "completed")
        .length,
      overdue: relevantTasks.filter((task) => task.status === "overdue").length,
    };
  };

  const columns = [
    {
      key: "title",
      label: "Task",
      render: (task) => (
        <div>
          <div className="font-medium text-gray-900">{task.title}</div>
          <div className="text-sm text-gray-500">{task.description}</div>
        </div>
      ),
    },
    {
      key: "student",
      label: "Student",
      render: (task) => (
        <div className="flex items-center">
          <User className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{task.studentName}</span>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (task) => (
        <Badge className={getCategoryColor(task.category)}>
          {taskCategories.find((c) => c.value === task.category)?.label}
        </Badge>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (task) => (
        <Badge className={getPriorityColor(task.priority)}>
          {taskPriorities.find((p) => p.value === task.priority)?.label}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (task) => (
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(task.id, e.target.value)}
          className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${getStatusColor(
            task.status
          )}`}
        >
          {taskStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (task) => {
        const dueDate = new Date(task.dueDate);
        const isOverdue = dueDate < new Date() && task.status !== "completed";
        return (
          <div
            className={`flex items-center text-sm ${
              isOverdue ? "text-red-600" : "text-gray-600"
            }`}
          >
            <Calendar className="h-4 w-4 mr-1" />
            <div>
              <div>{dueDate.toLocaleDateString()}</div>
              <div>
                {dueDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (task) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedTask(task);
              setTaskForm({
                ...task,
                dueDate: new Date(task.dueDate).toISOString().slice(0, 16),
                reminderDate: task.reminderDate
                  ? new Date(task.reminderDate).toISOString().slice(0, 16)
                  : "",
              });
              setShowEditModal(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteTask(task.id)}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const stats = getTaskStats();

  if (apiLoading || taskLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast
        isOpen={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600">
            {selectedStudent
              ? `Managing tasks for ${selectedStudent.name}`
              : "Manage your tasks and follow-ups"}
          </p>
        </div>
        <div className="flex space-x-3">
          {selectedStudent && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedStudent(null);
                setFilters((prev) => ({ ...prev, search: "" }));
              }}
            >
              View All Tasks
            </Button>
          )}
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          {
            label: "Total",
            value: stats.total,
            icon: Target,
            color: "text-blue-500",
          },
          {
            label: "Pending",
            value: stats.pending,
            icon: Clock,
            color: "text-yellow-500",
          },
          {
            label: "In Progress",
            value: stats.inProgress,
            icon: CheckSquare,
            color: "text-blue-500",
          },
          {
            label: "Completed",
            value: stats.completed,
            icon: CheckCircle,
            color: "text-green-500",
          },
          {
            label: "Overdue",
            value: stats.overdue,
            icon: AlertCircle,
            color: "text-red-500",
          },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="pl-10"
            />
          </div>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            {taskStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.priority}
            onChange={(e) =>
              setFilters({ ...filters, priority: e.target.value })
            }
          >
            <option value="">All Priorities</option>
            {taskPriorities.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
          >
            <option value="">All Categories</option>
            {taskCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          <Input
            type="date"
            value={filters.dueDate}
            onChange={(e) =>
              setFilters({ ...filters, dueDate: e.target.value })
            }
            placeholder="Filter by due date"
          />
          <div className="text-sm text-gray-600 flex items-center">
            {filteredTasks.length} of {tasks.length} tasks
          </div>
        </div>
      </Card>

      {/* Tasks Table */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          {selectedStudent ? `Tasks for ${selectedStudent.name}` : "All Tasks"}
        </h3>
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tasks found
            </h3>
            <p className="text-gray-600 mb-4">
              {Object.values(filters).some((f) => f)
                ? "No tasks match your current filters."
                : "Create your first task to get started."}
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Task
            </Button>
          </div>
        ) : (
          <DataTable
            data={filteredTasks}
            columns={columns}
            pagination={true}
            pageSize={10}
          />
        )}
      </Card>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetTaskForm();
        }}
        title="Create New Task"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <Input
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm({ ...taskForm, title: e.target.value })
              }
              placeholder="Enter task title..."
              className={formErrors.title ? "border-red-500" : ""}
            />
            {formErrors.title && (
              <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm({ ...taskForm, description: e.target.value })
              }
              placeholder="Enter task description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={taskForm.category}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, category: e.target.value })
                }
              >
                {taskCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={taskForm.priority}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, priority: e.target.value })
                }
              >
                {taskPriorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student *
            </label>
            <select
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                formErrors.studentId ? "border-red-500" : ""
              }`}
              value={taskForm.studentId}
              onChange={(e) =>
                setTaskForm({ ...taskForm, studentId: e.target.value })
              }
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
            {formErrors.studentId && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.studentId}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <Input
                type="datetime-local"
                value={taskForm.dueDate}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, dueDate: e.target.value })
                }
                className={formErrors.dueDate ? "border-red-500" : ""}
              />
              {formErrors.dueDate && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.dueDate}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Date
              </label>
              <Input
                type="datetime-local"
                value={taskForm.reminderDate}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, reminderDate: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                resetTaskForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>Create Task</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTask(null);
          resetTaskForm();
        }}
        title="Edit Task"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <Input
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm({ ...taskForm, title: e.target.value })
              }
              placeholder="Enter task title..."
              className={formErrors.title ? "border-red-500" : ""}
            />
            {formErrors.title && (
              <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm({ ...taskForm, description: e.target.value })
              }
              placeholder="Enter task description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={taskForm.category}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, category: e.target.value })
                }
              >
                {taskCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={taskForm.priority}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, priority: e.target.value })
                }
              >
                {taskPriorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={taskForm.status}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, status: e.target.value })
                }
              >
                {taskStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student *
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.studentId ? 'border-red-500' : ''}"
                value={taskForm.studentId}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, studentId: e.target.value })
                }
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
              {formErrors.studentId && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.studentId}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <Input
                type="datetime-local"
                value={taskForm.dueDate}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, dueDate: e.target.value })
                }
                className={formErrors.dueDate ? "border-red-500" : ""}
              />
              {formErrors.dueDate && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.dueDate}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Date
              </label>
              <Input
                type="datetime-local"
                value={taskForm.reminderDate}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, reminderDate: e.target.value })
                }
              />
            </div>
          </div>
          {selectedTask && selectedTask.completedAt && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Task Completed
                  </p>
                  <p className="text-sm text-green-600">
                    Completed on{" "}
                    {new Date(selectedTask.completedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setSelectedTask(null);
                resetTaskForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditTask}>Update Task</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TaskManagement;
