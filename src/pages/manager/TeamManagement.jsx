import React, { useState, useEffect } from "react";
import useApi from "../../hooks/useApi";
import useAuthStore from "../../stores/authStore";
import usePermissions from "../../hooks/usePermissions";
import { validateTeamMemberForm, validateInput } from "../../utils/validators";
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
  Trash2,
  Search,
  UserCheck,
  Shield,
  Mail,
} from "lucide-react";

const TeamManagement = () => {
  const { user } = useAuthStore();
  const { callApi, services, loading: apiLoading, error: apiError } = useApi();
  const { hasPermission } = usePermissions();
  const [teamMembers, setTeamMembers] = useState([]);
  const [filters, setFilters] = useState({ search: "", role: "", status: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [memberForm, setMemberForm] = useState({
    name: "",
    email: "",
    role: "consultant",
    status: "active",
  });

  const roles = [
    {
      value: "consultant",
      label: "Consultant",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "receptionist",
      label: "Receptionist",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "manager",
      label: "Manager",
      color: "bg-purple-100 text-purple-800",
    },
  ];

  const statuses = [
    { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
    {
      value: "inactive",
      label: "Inactive",
      color: "bg-gray-100 text-gray-800",
    },
  ];

  useEffect(() => {
    if (user && hasPermission("manage", "team")) {
      fetchTeamMembers();
    }
  }, [user]);

  const fetchTeamMembers = async () => {
    try {
      const response = await callApi(services.user.getTeamMembers);
      setTeamMembers(
        response?.map((member) => ({
          id: member.id,
          name: validateInput(member.name),
          email: validateInput(member.email),
          role: member.role,
          status: member.status,
          leadsAssigned: member.leadsAssigned || 0,
          leadsConverted: member.leadsConverted || 0,
        })) || []
      );
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to fetch team members",
        type: "error",
      });
    }
  };

  const handleAddMember = async () => {
    const validationErrors = validateTeamMemberForm(memberForm);
    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      const newMember = await callApi(services.user.createTeamMember, {
        ...memberForm,
        name: validateInput(memberForm.name),
        email: validateInput(memberForm.email),
      });
      setTeamMembers((prev) => [...prev, newMember]);
      setShowAddModal(false);
      resetForm();
      setToast({
        show: true,
        message: "Team member added successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to add team member",
        type: "error",
      });
    }
  };

  const handleEditMember = async () => {
    const validationErrors = validateTeamMemberForm(memberForm);
    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      const updatedMember = await callApi(
        services.user.updateTeamMember,
        selectedMember.id,
        {
          ...memberForm,
          name: validateInput(memberForm.name),
          email: validateInput(memberForm.email),
        }
      );
      setTeamMembers((prev) =>
        prev.map((member) =>
          member.id === selectedMember.id ? updatedMember : member
        )
      );
      setShowEditModal(false);
      setSelectedMember(null);
      resetForm();
      setToast({
        show: true,
        message: "Team member updated successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to update team member",
        type: "error",
      });
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to delete this team member?"))
      return;

    try {
      await callApi(services.user.deleteTeamMember, memberId);
      setTeamMembers((prev) => prev.filter((member) => member.id !== memberId));
      setToast({
        show: true,
        message: "Team member deleted successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to delete team member",
        type: "error",
      });
    }
  };

  const resetForm = () => {
    setMemberForm({
      name: "",
      email: "",
      role: "consultant",
      status: "active",
    });
    setFormErrors({});
  };

  const filteredTeamMembers = teamMembers.filter((member) => {
    const matchesSearch =
      !filters.search ||
      member.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      member.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = !filters.role || member.role === filters.role;
    const matchesStatus = !filters.status || member.status === filters.status;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role) =>
    roles.find((r) => r.value === role)?.color || "bg-gray-100 text-gray-800";

  const getStatusColor = (status) =>
    statuses.find((s) => s.value === status)?.color ||
    "bg-gray-100 text-gray-800";

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (member) => (
        <div className="flex items-center">
          <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{member.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (member) => (
        <div className="flex items-center">
          <Mail className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{member.email}</span>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (member) => (
        <Badge className={getRoleColor(member.role)}>
          {roles.find((r) => r.value === member.role)?.label}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (member) => (
        <Badge className={getStatusColor(member.status)}>
          {statuses.find((s) => s.value === member.status)?.label}
        </Badge>
      ),
    },
    {
      key: "leadsAssigned",
      label: "Leads Assigned",
      render: (member) => (
        <span className="text-sm">{member.leadsAssigned}</span>
      ),
    },
    {
      key: "leadsConverted",
      label: "Leads Converted",
      render: (member) => (
        <span className="text-sm">{member.leadsConverted}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (member) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedMember(member);
              setMemberForm({
                name: member.name,
                email: member.email,
                role: member.role,
                status: member.status,
              });
              setShowEditModal(true);
            }}
            disabled={!hasPermission("edit", "team")}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteMember(member.id)}
            className="border-red-300 text-red-600 hover:bg-red-50"
            disabled={!hasPermission("delete", "team")}
          >
            <Trash2 className="h-4 w-4" />
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

  if (!hasPermission("manage", "team")) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Access Denied
        </h3>
        <p className="text-gray-600">
          You do not have permission to manage team members.
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
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">
            Manage your team members and their roles.
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          disabled={!hasPermission("create", "team")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
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
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            <option value="">All Roles</option>
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            {filteredTeamMembers.length} of {teamMembers.length} members
          </div>
        </div>
      </Card>

      {/* Team Members Table */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Team Members</h3>
        {filteredTeamMembers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No team members found
            </h3>
            <p className="text-gray-600 mb-4">
              {Object.values(filters).some((f) => f)
                ? "No members match your current filters."
                : "Add your first team member to get started."}
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              disabled={!hasPermission("create", "team")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Member
            </Button>
          </div>
        ) : (
          <DataTable
            data={filteredTeamMembers}
            columns={columns}
            pagination={true}
            pageSize={10}
          />
        )}
      </Card>

      {/* Add Team Member Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add Team Member"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <Input
              value={memberForm.name}
              onChange={(e) =>
                setMemberForm({ ...memberForm, name: e.target.value })
              }
              placeholder="Enter full name"
              className={formErrors.name ? "border-red-500" : ""}
            />
            {formErrors.name && (
              <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <Input
              type="email"
              value={memberForm.email}
              onChange={(e) =>
                setMemberForm({ ...memberForm, email: e.target.value })
              }
              placeholder="Enter email address"
              className={formErrors.email ? "border-red-500" : ""}
            />
            {formErrors.email && (
              <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={memberForm.role}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, role: e.target.value })
                }
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={memberForm.status}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, status: e.target.value })
                }
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddMember}>Add Member</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Team Member Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMember(null);
          resetForm();
        }}
        title="Edit Team Member"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <Input
              value={memberForm.name}
              onChange={(e) =>
                setMemberForm({ ...memberForm, name: e.target.value })
              }
              placeholder="Enter full name"
              className={formErrors.name ? "border-red-500" : ""}
            />
            {formErrors.name && (
              <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <Input
              type="email"
              value={memberForm.email}
              onChange={(e) =>
                setMemberForm({ ...memberForm, email: e.target.value })
              }
              placeholder="Enter email address"
              className={formErrors.email ? "border-red-500" : ""}
            />
            {formErrors.email && (
              <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={memberForm.role}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, role: e.target.value })
                }
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={memberForm.status}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, status: e.target.value })
                }
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setSelectedMember(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditMember}>Update Member</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeamManagement;
