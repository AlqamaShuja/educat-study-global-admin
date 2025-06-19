import React, { useState, useEffect } from "react";
import useApi from "../../hooks/useApi";
import useAuthStore from "../../stores/authStore";
import usePermissions from "../../hooks/usePermissions";
import {
  validateLeadAssignmentForm,
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
  CheckSquare,
  Search,
  UserCheck,
  Mail,
  Target,
  Shield,
} from "lucide-react";

const LeadAssignment = () => {
  const { user } = useAuthStore();
  const { callApi, services, loading: apiLoading, error: apiError } = useApi();
  const { hasPermission } = usePermissions();
  const [leads, setLeads] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isBulkAssign, setIsBulkAssign] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [assignForm, setAssignForm] = useState({
    assignedTo: "",
    status: "new",
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

  useEffect(() => {
    if (user && hasPermission("manage", "leads")) {
      fetchLeads();
      fetchConsultants();
    }
  }, [user]);

  const fetchLeads = async () => {
    try {
      const response = await callApi(services.lead.getLeads, {
        assigned: false,
      }); // Filter unassigned leads
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
    const validationErrors = validateLeadAssignmentForm(assignForm);
    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      const leadIds = isBulkAssign ? selectedLeads : [selectedLeads[0]];
      await Promise.all(
        leadIds.map((leadId) =>
          callApi(services.lead.assignLead, leadId, {
            assignedTo: assignForm.assignedTo,
            status: assignForm.status,
          })
        )
      );
      setLeads(
        (prev) => prev.filter((lead) => !leadIds.includes(lead.id)) // Remove assigned leads from list
      );
      setSelectedLeads([]);
      setShowAssignModal(false);
      resetAssignForm();
      setToast({
        show: true,
        message: `Lead${leadIds.length > 1 ? "s" : ""} assigned successfully!`,
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to assign lead(s)",
        type: "error",
      });
    }
  };

  const handleSelectLead = (leadId) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId]
    );
  };

  const resetAssignForm = () => {
    setAssignForm({
      assignedTo: "",
      status: "new",
    });
    setFormErrors({});
    setIsBulkAssign(false);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !filters.search ||
      lead.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      lead.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || lead.status === filters.status;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) =>
    leadStatuses.find((s) => s.value === status)?.color ||
    "bg-gray-100 text-gray-800";

  const columns = [
    {
      key: "select",
      label: "",
      render: (lead) => (
        <input
          type="checkbox"
          checked={selectedLeads.includes(lead.id)}
          onChange={() => handleSelectLead(lead.id)}
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
        />
      ),
    },
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
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedLeads([lead.id]);
            setAssignForm({
              assignedTo: lead.assignedTo || "",
              status: lead.status,
            });
            setShowAssignModal(true);
          }}
          disabled={!hasPermission("edit", "leads")}
        >
          <CheckSquare className="h-4 w-4" />
        </Button>
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
          You do not have permission to assign leads.
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
          <h1 className="text-2xl font-bold text-gray-900">Lead Assignment</h1>
          <p className="text-gray-600">
            Assign unassigned leads to consultants.
          </p>
        </div>
        {selectedLeads.length > 0 && (
          <Button
            onClick={() => {
              setIsBulkAssign(true);
              setShowAssignModal(true);
            }}
            disabled={!hasPermission("edit", "leads")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Assign Selected ({selectedLeads.length})
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="text-sm text-gray-600 flex items-center">
            {filteredLeads.length} of {leads.length} unassigned leads
          </div>
        </div>
      </Card>

      {/* Leads Table */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Unassigned Leads</h3>
        {filteredLeads.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No unassigned leads found
            </h3>
            <p className="text-gray-600 mb-4">
              {Object.values(filters).some((f) => f)
                ? "No leads match your current filters."
                : "All leads are currently assigned."}
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
          setSelectedLeads(isBulkAssign ? selectedLeads : []);
          resetAssignForm();
        }}
        title={
          isBulkAssign ? `Assign ${selectedLeads.length} Leads` : "Assign Lead"
        }
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
                setSelectedLeads(isBulkAssign ? selectedLeads : []);
                resetAssignForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignLead}>
              {isBulkAssign ? `Assign Leads` : "Assign Lead"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LeadAssignment;
