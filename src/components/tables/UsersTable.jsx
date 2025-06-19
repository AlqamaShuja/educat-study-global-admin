import React, { useState } from "react";
import DataTable from "./DataTable";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import { useUserStore } from "../../stores/userStore";

const UsersTable = ({
  users = [],
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  onAssignOffice,
  showActions = true,
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    user: null,
  });
  const [statusConfirm, setStatusConfirm] = useState({
    open: false,
    user: null,
  });

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (value, row) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
            <span className="text-gray-600 font-medium text-sm">
              {row.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "role",
      header: "Role",
      render: (value) => {
        const roleColors = {
          super_admin: "danger",
          manager: "warning",
          consultant: "primary",
          receptionist: "info",
          student: "success",
        };
        return (
          <Badge variant={roleColors[value] || "default"} size="sm">
            {value?.replace("_", " ")?.toUpperCase() || "Unknown"}
          </Badge>
        );
      },
      sortable: true,
    },
    {
      key: "phone",
      header: "Phone",
      render: (value) => value || "N/A",
    },
    {
      key: "office",
      header: "Office",
      render: (_, row) => {
        if (!row.office) return "Unassigned";
        return (
          <div>
            <div className="text-sm font-medium text-gray-900">
              {row.office.name}
            </div>
            <div className="text-sm text-gray-500">
              {row.office.address?.city}
            </div>
          </div>
        );
      },
    },
    {
      key: "isActive",
      header: "Status",
      render: (value) => (
        <Badge variant={value ? "success" : "danger"} size="sm">
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "createdAt",
      header: "Created",
      render: (value) => (value ? new Date(value).toLocaleDateString() : "N/A"),
      sortable: true,
    },
  ];

  const actions = showActions
    ? [
        {
          label: "Edit",
          onClick: (user) => onEdit && onEdit(user),
          variant: "outline",
          icon: (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          ),
        },
        {
          label: (user) => (user.isActive ? "Deactivate" : "Activate"),
          onClick: (user) => {
            setStatusConfirm({ open: true, user });
          },
          variant: "outline",
          className: (user) =>
            user.isActive
              ? "text-orange-600 hover:text-orange-700"
              : "text-green-600 hover:text-green-700",
          icon: (user) =>
            user.isActive ? (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
        },
        {
          label: "Delete",
          onClick: (user) => {
            setDeleteConfirm({ open: true, user });
          },
          variant: "outline",
          className: "text-red-600 hover:text-red-700",
          disabled: (user) => user.role === "super_admin",
          icon: (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          ),
        },
      ]
    : [];

  const filters = [
    {
      key: "role",
      label: "Role",
      options: [
        { value: "", label: "All Roles" },
        { value: "super_admin", label: "Super Admin" },
        { value: "manager", label: "Manager" },
        { value: "consultant", label: "Consultant" },
        { value: "receptionist", label: "Receptionist" },
        { value: "student", label: "Student" },
      ],
    },
    {
      key: "isActive",
      label: "Status",
      options: [
        { value: "", label: "All Status" },
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
      filterFn: (row, value) => {
        if (value === "") return true;
        return row.isActive.toString() === value;
      },
    },
  ];

  const bulkActions = [
    {
      label: "Activate Selected",
      onClick: (selectedUsers) => {
        selectedUsers.forEach((user) => {
          if (!user.isActive && onToggleStatus) {
            onToggleStatus(user.id, true);
          }
        });
      },
      variant: "outline",
      className: "text-green-600 hover:text-green-700",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "Deactivate Selected",
      onClick: (selectedUsers) => {
        selectedUsers.forEach((user) => {
          if (user.isActive && onToggleStatus) {
            onToggleStatus(user.id, false);
          }
        });
      },
      variant: "outline",
      className: "text-orange-600 hover:text-orange-700",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
          />
        </svg>
      ),
    },
  ];

  const handleConfirmDelete = () => {
    if (deleteConfirm.user && onDelete) {
      onDelete(deleteConfirm.user.id);
    }
    setDeleteConfirm({ open: false, user: null });
  };

  const handleConfirmStatusChange = () => {
    if (statusConfirm.user && onToggleStatus) {
      onToggleStatus(statusConfirm.user.id, !statusConfirm.user.isActive);
    }
    setStatusConfirm({ open: false, user: null });
  };

  const handleExport = () => {
    const csvData = users.map((user) => ({
      Name: user.name,
      Email: user.email,
      Phone: user.phone || "N/A",
      Role: user.role?.replace("_", " ") || "Unknown",
      Office: user.office?.name || "Unassigned",
      Status: user.isActive ? "Active" : "Inactive",
      Created: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : "N/A",
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        searchable
        filterable
        sortable
        selectable
        pagination
        pageSize={10}
        actions={actions}
        filters={filters}
        bulkActions={bulkActions}
        exportable
        onExport={handleExport}
        title="Users Management"
        subtitle={`${users.length} total users`}
        emptyMessage="No users found. Create your first user to get started."
        className="bg-white rounded-lg shadow"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, user: null })}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteConfirm.user?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Status Change Confirmation Dialog */}
      <ConfirmDialog
        isOpen={statusConfirm.open}
        onClose={() => setStatusConfirm({ open: false, user: null })}
        onConfirm={handleConfirmStatusChange}
        title={`${
          statusConfirm.user?.isActive ? "Deactivate" : "Activate"
        } User`}
        message={`Are you sure you want to ${
          statusConfirm.user?.isActive ? "deactivate" : "activate"
        } "${statusConfirm.user?.name}"?`}
        confirmText={statusConfirm.user?.isActive ? "Deactivate" : "Activate"}
        cancelText="Cancel"
        type={statusConfirm.user?.isActive ? "warning" : "info"}
      />
    </>
  );
};

export default UsersTable;
