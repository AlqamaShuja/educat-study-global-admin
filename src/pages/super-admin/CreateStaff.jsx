import React, { useState, useEffect } from "react";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import usePermissions from "../../hooks/usePermissions";
import { validateStaffForm, validateInput } from "../../utils/validators";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Toast from "../../components/ui/Toast";
import DataTable from "../../components/tables/DataTable";
import {
  User,
  Plus,
  Edit,
  Trash2,
  Search,
  Mail,
  Building,
  Shield,
  Lock,
} from "@lucide/react";

const CreateStaff = () => {
  const { user } = useAuth();
  const { callApi, loading: apiLoading, error: apiError } = useApi();
  const { hasPermission } = usePermissions();
  const [staff, setStaff] = useState([]);
  const [offices, setOffices] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    officeId: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    officeId: "",
    status: "active",
  });

  const roleOptions = [
    { value: "manager", label: "Manager" },
    { value: "receptionist", label: "Receptionist" },
    { value: "consultant", label: "Consultant" },
    { value: "instructor", label: "Instructor" },
  ];

  const statusOptions = [
    { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
    { value: "inactive", label: "Inactive", color: "bg-red-100 text-red-800" },
  ];

  useEffect(() => {
    if (user && hasPermission("manage", "staff")) {
      fetchOffices();
      fetchStaff();
    }
  }, [user]);

  const fetchOffices = async () => {
    try {
      const response = await callApi("GET", "/super-admin/offices");
      setOffices(
        response?.map((office) => ({
          id: office.id,
          name: validateInput(office.name),
        })) || []
      );
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to fetch offices",
        type: "error",
      });
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await callApi("GET", "/super-admin/staff");
      setStaff(
        response?.map((member) => ({
          id: member.id,
          name: validateInput(member.name || "Unknown"),
          email: validateInput(member.email || "N/A"),
          role: member.role,
          officeId: member.officeId,
          officeName: validateInput(member.officeName || "Unassigned"),
          status: member.status,
          createdAt: member.createdAt,
        })) || []
      );
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to fetch staff",
        type: "error",
      });
    }
  };

  const handleSaveStaff = async () => {
    const validationErrors = validateStaffForm(staffForm, !!editStaff);
    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      const payload = {
        name: validateInput(staffForm.name),
        email: validateInput(staffForm.email),
        role: staffForm.role,
        officeId: staffForm.officeId || null,
        status: staffForm.status,
      };

      if (!editStaff && staffForm.password) {
        payload.password = staffForm.password; // Only include password for new staff
      }

      if (editStaff) {
        const updatedStaff = await callApi(
          "PUT",
          `/super-admin/staff/${editStaff.id}`,
          payload
        );
        setStaff((prev) =>
          prev.map((member) =>
            member.id === updatedStaff.id ? updatedStaff : member
          )
        );
        setToast({
          show: true,
          message: "Staff updated successfully!",
          type: "success",
        });
      } else {
        const newStaff = await callApi("POST", "/super-admin/staff", payload);
        setStaff((prev) => [...prev, newStaff]);
        setToast({
          show: true,
          message: "Staff created successfully!",
          type: "success",
        });
      }

      resetForm();
      setShowForm(false);
      setEditStaff(null);
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to save staff",
        type: "error",
      });
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm("Are you sure you want to delete this staff member?"))
      return;

    try {
      await callApi("DELETE", `/super-admin/staff/${staffId}`);
      setStaff((prev) => prev.filter((member) => member.id !== staffId));
      setToast({
        show: true,
        message: "Staff deleted successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to delete staff",
        type: "error",
      });
    }
  };

  const resetForm = () => {
    setStaffForm({
      name: "",
      email: "",
      password: "",
      role: "",
      officeId: "",
      status: "active",
    });
    setFormErrors({});
  };

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      !filters.search ||
      member.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      member.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = !filters.role || member.role === filters.role;
    const matchesOffice =
      !filters.officeId || member.officeId === filters.officeId;
    return matchesSearch && matchesRole && matchesOffice;
  });

  const getStatusColor = (status) =>
    statusOptions.find((s) => s.value === status)?.color ||
    "bg-gray-100 text-gray-800";

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (member) => (
        <div className="flex items-center">
          <User className="h-4 w-4 text-gray-400 mr-2" />
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
        <span className="text-sm capitalize">{member.role}</span>
      ),
    },
    {
      key: "officeName",
      label: "Office",
      render: (member) => (
        <div className="flex items-center">
          <Building className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{member.officeName}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (member) => (
        <Badge className={getStatusColor(member.status)}>
          {statusOptions.find((s) => s.value === member.status)?.label}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (member) => (
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1" />
          {new Date(member.createdAt).toLocaleString()}
        </div>
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
              setEditStaff(member);
              setStaffForm({
                name: member.name,
                email: member.email,
                password: "",
                role: member.role,
                officeId: member.officeId || "",
                status: member.status,
              });
              setShowForm(true);
            }}
            disabled={!hasPermission("edit", "staff")}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteStaff(member.id)}
            className="border-red-300 text-red-600 hover:bg-red-50"
            disabled={!hasPermission("delete", "staff")}
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

  if (!hasPermission("manage", "staff")) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Access Denied
        </h3>
        <p className="text-gray-600">
          You do not have permission to manage staff.
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
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Create and manage staff accounts.</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditStaff(null);
            resetForm();
          }}
          disabled={!hasPermission("create", "staff")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Staff
        </Button>
      </div>

      {/* Staff Form */}
      {showForm && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">
            {editStaff ? "Edit Staff" : "Create Staff"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <Input
                value={staffForm.name}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, name: e.target.value })
                }
                placeholder="Enter staff name"
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
                value={staffForm.email}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, email: e.target.value })
                }
                placeholder="Enter staff email"
                className={formErrors.email ? "border-red-500" : ""}
              />
              {formErrors.email && (
                <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
              )}
            </div>
            {!editStaff && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <Input
                  type="password"
                  value={staffForm.password}
                  onChange={(e) =>
                    setStaffForm({ ...staffForm, password: e.target.value })
                  }
                  placeholder="Enter password"
                  className={formErrors.password ? "border-red-500" : ""}
                />
                {formErrors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.password}
                  </p>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <Select
                options={roleOptions}
                value={staffForm.role}
                onChange={(value) =>
                  setStaffForm({ ...staffForm, role: value })
                }
                className={formErrors.role ? "border-red-500" : ""}
              />
              {formErrors.role && (
                <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Office
              </label>
              <Select
                options={[
                  { value: "", label: "Unassigned" },
                  ...offices.map((office) => ({
                    value: office.id,
                    label: office.name,
                  })),
                ]}
                value={staffForm.officeId}
                onChange={(value) =>
                  setStaffForm({ ...staffForm, officeId: value })
                }
                className={formErrors.officeId ? "border-red-500" : ""}
              />
              {formErrors.officeId && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.officeId}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <Select
                options={statusOptions.map((status) => ({
                  value: status.value,
                  label: status.label,
                }))}
                value={staffForm.status}
                onChange={(value) =>
                  setStaffForm({ ...staffForm, status: value })
                }
                className={formErrors.status ? "border-red-500" : ""}
              />
              {formErrors.status && (
                <p className="text-red-500 text-xs mt-1">{formErrors.status}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditStaff(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveStaff}>
              {editStaff ? "Update Staff" : "Create Staff"}
            </Button>
          </div>
        </Card>
      )}

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
          <Select
            options={[{ value: "", label: "All Roles" }, ...roleOptions]}
            value={filters.role}
            onChange={(value) => setFilters({ ...filters, role: value })}
          />
          <Select
            options={[
              { value: "", label: "All Offices" },
              ...offices.map((office) => ({
                value: office.id,
                label: office.name,
              })),
            ]}
            value={filters.officeId}
            onChange={(value) => setFilters({ ...filters, officeId: value })}
          />
        </div>
      </Card>

      {/* Staff Table */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Staff List</h3>
        {filteredStaff.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No staff found
            </h3>
            <p className="text-gray-600 mb-4">
              {Object.values(filters).some((f) => f)
                ? "No staff match your current filters."
                : "Create your first staff member to get started."}
            </p>
            <Button
              onClick={() => {
                setShowForm(true);
                setEditStaff(null);
                resetForm();
              }}
              disabled={!hasPermission("create", "staff")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Staff
            </Button>
          </div>
        ) : (
          <DataTable
            data={filteredStaff}
            columns={columns}
            pagination={true}
            pageSize={10}
          />
        )}
      </Card>
    </div>
  );
};

export default CreateStaff;
