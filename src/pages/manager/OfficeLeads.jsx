import React, { useState, useEffect } from "react";
import useApi from "../../hooks/useApi";
import useAuthStore from "../../stores/authStore";
import usePermissions from "../../hooks/usePermissions";
import {
  validateLeadForm,
  validateTaskForm,
  validateInput,
} from "../../utils/validators";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Toast from "../../components/ui/Toast";
import DataTable from "../../components/tables/DataTable";
import {
  Users,
  Plus,
  Edit,
  Search,
  UserCheck,
  Mail,
  Target,
  CheckSquare,
  Shield,
} from "lucide-react";

const OfficeLeads = () => {
  const { user } = useAuthStore();
  const { callApi, services, loading: apiLoading, error: apiError } = useApi();
  const { hasPermission } = usePermissions();
  const [leads, setLeads] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    assignedTo: "",
  });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [assignForm, setAssignForm] = useState({
    assignedTo: "",
    status: "",
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    category: "follow_up",
    priority: "medium",
    dueDate: "",
    studentId: "",
    assignedTo: "",
    status: "pending",
  });

  const leadStatuses = [
    { value: "new", label: "New", color: "bg-blue-100 text-blue-800" },
    {
      value: "contacted",
      label: "Contacted",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "qualified",
      label: "Qualified",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "converted",
      label: "Converted",
      color: "bg-purple-100 text-purple-800",
    },
    { value: "lost", label: "Lost", color: "bg-red-100 text-red-800" },
  ];

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
  ];

  const taskPriorities = [
    { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
    { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-800" },
    { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" },
  ];

  useEffect(() => {
    if (user && hasPermission("manage", "leads")) {
      fetchLeads();
      fetchConsultants();
    }
  }, [user]);

  const fetchLeads = async () => {
    try {
      const response = await callApi(services.lead.getLeads);
      setLeads(
        response?.map((lead) => ({
          id: lead.id,
          studentId: lead.studentId,
          name: validateInput(lead.student?.name || "Unknown"),
          email: validateInput(lead.student?.email || "N/A"),
          status: lead.status,
          assignedTo: lead.assignedTo,
          assignedToName: validateInput(lead.assignedToName || "Unassigned"),
          source: validateInput(lead.source || "N/A"),
          createdAt: new Date(lead.createdAt).toLocaleDateString(),
        })) || []
      );
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to fetch leads",
        type: "error",
      });
    }
  };

  const fetchConsultants = async () => {
    try {
      const response = await callApi(services.user.getTeamMembers);
      setConsultants(
        response
          ?.filter((member) => member.role === "consultant")
          .map((member) => ({
            id: member.id,
            name: validateInput(member.name),
          })) || []
      );
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to fetch consultants",
        type: "error",
      });
    }
  };

  const handleAssignLead = async () => {
    const validationErrors = validateLeadForm(assignForm);
    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      const updatedLead = await callApi(
        services.lead.assignLead,
        selectedLead.id,
        {
          assignedTo: assignForm.assignedTo,
          status: assignForm.status,
        }
      );
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === selectedLead.id
            ? {
                ...lead,
                status: updatedLead.status,
                assignedTo: updatedLead.assignedTo,
                assignedToName:
                  consultants.find((c) => c.id === updatedLead.assignedTo)
                    ?.name || "Unassigned",
              }
            : lead
        )
      );
      setShowAssignModal(false);
      resetAssignForm();
      setToast({
        show: true,
        message: "Lead assigned successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to assign lead",
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
      await callApi(services.task.createTask, {
        ...taskForm,
        dueDate: new Date(taskForm.dueDate).toISOString(),
        studentId: selectedLead.studentId,
        assignedTo: taskForm.assignedTo || selectedLead.assignedTo,
      });
      setShowTaskModal(false);
      resetTaskForm();
      setToast({
        show: true,
        message: "Task created successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to create task",
        type: "error",
      });
    }
  };

  const resetAssignForm = () => {
    setAssignForm({
      assignedTo: "",
      status: "",
    });
    setFormErrors({});
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: "",
      description: "",
      category: "follow_up",
      priority: "medium",
      dueDate: "",
      studentId: "",
      assignedTo: "",
      status: "pending",
    });
    setFormErrors({});
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !filters.search ||
      lead.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      lead.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || lead.status === filters.status;
    const matchesAssignedTo =
      !filters.assignedTo || lead.assignedTo === filters.assignedTo;
    return matchesSearch && matchesStatus && matchesAssignedTo;
  });

  const getStatusColor = (status) =>
    leadStatuses.find((s) => s.value === status)?.color ||
    "bg-gray-100 text-gray-800";

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (lead) => (
        <div className="flex items-center">
          <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{lead.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (lead) => (
        <div className="flex items-center">
          <Mail className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{lead.email}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (lead) => (
        <Badge className={getStatusColor(lead.status)}>
          {leadStatuses.find((s) => s.value === lead.status)?.label}
        </Badge>
      ),
    },
    {
      key: "assignedTo",
      label: "Assigned To",
      render: (lead) => <span className="text-sm">{lead.assignedToName}</span>,
    },
    {
      key: "source",
      label: "Source",
      render: (lead) => <span className="text-sm">{lead.source}</span>,
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (lead) => (
        <div className="flex items-center text-sm text-gray-600">
          <Target className="h-4 w-4 mr-1" />
          {lead.createdAt}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (lead) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedLead(lead);
              setAssignForm({
                assignedTo: lead.assignedTo || "",
                status: lead.status,
              });
              setShowAssignModal(true);
            }}
            disabled={!hasPermission("edit", "leads")}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedLead(lead);
              setTaskForm({
                ...taskForm,
                studentId: lead.studentId,
                assignedTo: lead.assignedTo || "",
              });
              setShowTaskModal(true);
            }}
            disabled={!hasPermission("create", "tasks")}
          >
            <CheckSquare className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (apiLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hasPermission("manage", "leads")) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Access Denied
        </h3>
        <p className="text-gray-600">
          You do not have permission to manage leads.
        </p>
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
          <h1 className="text-2xl font-bold text-gray-900">Office Leads</h1>
          <p className="text-gray-600">Manage and assign leads to your team.</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
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
            {leadStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.assignedTo}
            onChange={(e) =>
              setFilters({ ...filters, assignedTo: e.target.value })
            }
          >
            <option value="">All Consultants</option>
            {consultants.map((consultant) => (
              <option key={consultant.id} value={consultant.id}>
                {consultant.name}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            {filteredLeads.length} of {leads.length} leads
          </div>
        </div>
      </Card>

      {/* Leads Table */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Leads</h3>
        {filteredLeads.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No leads found
            </h3>
            <p className="text-gray-600 mb-4">
              {Object.values(filters).some((f) => f)
                ? "No leads match your current filters."
                : "No leads available."}
            </p>
          </div>
        ) : (
          <DataTable
            data={filteredLeads}
            columns={columns}
            pagination={true}
            pageSize={10}
          />
        )}
      </Card>

      {/* Assign Lead Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedLead(null);
          resetAssignForm();
        }}
        title="Assign Lead"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consultant *
            </label>
            <select
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                formErrors.assignedTo ? "border-red-500" : ""
              }`}
              value={assignForm.assignedTo}
              onChange={(e) =>
                setAssignForm({ ...assignForm, assignedTo: e.target.value })
              }
            >
              <option value="">Select a consultant</option>
              {consultants.map((consultant) => (
                <option key={consultant.id} value={consultant.id}>
                  {consultant.name}
                </option>
              ))}
            </select>
            {formErrors.assignedTo && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.assignedTo}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                formErrors.status ? "border-red-500" : ""
              }`}
              value={assignForm.status}
              onChange={(e) =>
                setAssignForm({ ...assignForm, status: e.target.value })
              }
            >
              <option value="">Select a status</option>
              {leadStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            {formErrors.status && (
              <p className="text-red-500 text-xs mt-1">{formErrors.status}</p>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAssignModal(false);
                setSelectedLead(null);
                resetAssignForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignLead}>Assign Lead</Button>
          </div>
        </div>
      </Modal>

      {/* Create Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setSelectedLead(null);
          resetTaskForm();
        }}
        title="Create Task for Lead"
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
              <p className="text-red-500 text-xs mt-1">{formErrors.dueDate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned To
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={taskForm.assignedTo}
              onChange={(e) =>
                setTaskForm({ ...taskForm, assignedTo: e.target.value })
              }
            >
              <option value="">Select a consultant</option>
              {consultants.map((consultant) => (
                <option key={consultant.id} value={consultant.id}>
                  {consultant.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowTaskModal(false);
                setSelectedLead(null);
                resetTaskForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>Create Task</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OfficeLeads;
