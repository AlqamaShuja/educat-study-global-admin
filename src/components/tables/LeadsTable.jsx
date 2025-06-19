import React, { useState } from "react";
import DataTable from "./DataTable";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import Modal from "../ui/Modal";

const LeadsTable = ({
  leads = [],
  loading = false,
  onEdit,
  onDelete,
  onAssign,
  onUpdateStatus,
  onViewDetails,
  showActions = true,
  userRole = "consultant",
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    lead: null,
  });
  const [statusModal, setStatusModal] = useState({ open: false, lead: null });
  const [assignModal, setAssignModal] = useState({ open: false, lead: null });

  const columns = [
    {
      key: "student",
      header: "Student",
      render: (value, row) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-blue-600 font-medium text-sm">
              {row.student?.name?.charAt(0)?.toUpperCase() || "S"}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {row.student?.name}
            </div>
            <div className="text-sm text-gray-500">{row.student?.email}</div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "source",
      header: "Source",
      render: (value) => {
        const sourceColors = {
          walk_in: "primary",
          online: "success",
          referral: "warning",
          "Google OAuth": "info",
          "Facebook OAuth": "info",
        };
        return (
          <Badge variant={sourceColors[value] || "default"} size="sm">
            {value?.replace("_", " ")?.toUpperCase() || "Unknown"}
          </Badge>
        );
      },
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (value) => {
        const statusColors = {
          new: "warning",
          in_progress: "primary",
          converted: "success",
          lost: "danger",
        };
        return (
          <Badge variant={statusColors[value] || "default"} size="sm">
            {value?.replace("_", " ")?.toUpperCase() || "Unknown"}
          </Badge>
        );
      },
      sortable: true,
    },
    {
      key: "studyPreferences",
      header: "Study Preferences",
      render: (value) => {
        if (!value) return "Not specified";
        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {value.destination || "Any"} - {value.level || "Any Level"}
            </div>
            {value.fields && value.fields.length > 0 && (
              <div className="text-gray-500">
                {value.fields.slice(0, 2).join(", ")}
                {value.fields.length > 2 && ` +${value.fields.length - 2} more`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "consultant",
      header: "Consultant",
      render: (value, row) => {
        if (!row.consultant) {
          return <span className="text-gray-400 text-sm">Unassigned</span>;
        }
        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {row.consultant.name}
            </div>
            <div className="text-gray-500">{row.consultant.email}</div>
          </div>
        );
      },
    },
    {
      key: "office",
      header: "Office",
      render: (value, row) => {
        if (!row.office) return "Not assigned";
        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900">{row.office.name}</div>
            <div className="text-gray-500">{row.office.address?.city}</div>
          </div>
        );
      },
    },
    {
      key: "createdAt",
      header: "Created",
      render: (value) => {
        if (!value) return "N/A";
        const date = new Date(value);
        return (
          <div className="text-sm">
            <div className="text-gray-900">{date.toLocaleDateString()}</div>
            <div className="text-gray-500">
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        );
      },
      sortable: true,
    },
  ];

  const getActions = () => {
    if (!showActions) return [];

    const baseActions = [
      {
        label: "View",
        onClick: (lead) => onViewDetails && onViewDetails(lead),
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
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        ),
      },
    ];

    if (userRole === "super_admin" || userRole === "manager") {
      baseActions.push(
        {
          label: "Edit",
          onClick: (lead) => onEdit && onEdit(lead),
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
          label: "Assign",
          onClick: (lead) => setAssignModal({ open: true, lead }),
          variant: "outline",
          disabled: (lead) => !!lead.assignedConsultant,
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          ),
        }
      );
    }

    if (
      userRole === "consultant" ||
      userRole === "manager" ||
      userRole === "super_admin"
    ) {
      baseActions.push({
        label: "Update Status",
        onClick: (lead) => setStatusModal({ open: true, lead }),
        variant: "outline",
        className: "text-blue-600 hover:text-blue-700",
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        ),
      });
    }

    if (userRole === "super_admin") {
      baseActions.push({
        label: "Delete",
        onClick: (lead) => setDeleteConfirm({ open: true, lead }),
        variant: "outline",
        className: "text-red-600 hover:text-red-700",
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
      });
    }

    return baseActions;
  };

  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "", label: "All Status" },
        { value: "new", label: "New" },
        { value: "in_progress", label: "In Progress" },
        { value: "converted", label: "Converted" },
        { value: "lost", label: "Lost" },
      ],
    },
    {
      key: "source",
      label: "Source",
      options: [
        { value: "", label: "All Sources" },
        { value: "walk_in", label: "Walk-in" },
        { value: "online", label: "Online" },
        { value: "referral", label: "Referral" },
        { value: "Google OAuth", label: "Google OAuth" },
        { value: "Facebook OAuth", label: "Facebook OAuth" },
      ],
    },
    {
      key: "assignedConsultant",
      label: "Assignment",
      options: [
        { value: "", label: "All Leads" },
        { value: "assigned", label: "Assigned" },
        { value: "unassigned", label: "Unassigned" },
      ],
      filterFn: (row, value) => {
        if (value === "") return true;
        if (value === "assigned") return !!row.assignedConsultant;
        if (value === "unassigned") return !row.assignedConsultant;
        return true;
      },
    },
  ];

  const bulkActions =
    userRole === "super_admin" || userRole === "manager"
      ? [
          {
            label: "Mark as In Progress",
            onClick: (selectedLeads) => {
              selectedLeads.forEach((lead) => {
                if (onUpdateStatus) {
                  onUpdateStatus(lead.id, "in_progress");
                }
              });
            },
            variant: "outline",
            className: "text-blue-600 hover:text-blue-700",
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
          },
          {
            label: "Bulk Assign",
            onClick: (selectedLeads) => {
              // This would open a modal to select consultant for bulk assignment
              console.log("Bulk assign:", selectedLeads);
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            ),
          },
        ]
      : [];

  const handleConfirmDelete = () => {
    if (deleteConfirm.lead && onDelete) {
      onDelete(deleteConfirm.lead.id);
    }
    setDeleteConfirm({ open: false, lead: null });
  };

  const handleStatusUpdate = (newStatus) => {
    if (statusModal.lead && onUpdateStatus) {
      onUpdateStatus(statusModal.lead.id, newStatus);
    }
    setStatusModal({ open: false, lead: null });
  };

  const handleExport = () => {
    const csvData = leads.map((lead) => ({
      "Student Name": lead.student?.name || "N/A",
      "Student Email": lead.student?.email || "N/A",
      "Student Phone": lead.student?.phone || "N/A",
      Source: lead.source || "N/A",
      Status: lead.status || "N/A",
      Destination: lead.studyPreferences?.destination || "N/A",
      Level: lead.studyPreferences?.level || "N/A",
      Fields: lead.studyPreferences?.fields?.join("; ") || "N/A",
      Consultant: lead.consultant?.name || "Unassigned",
      Office: lead.office?.name || "Not assigned",
      Created: lead.createdAt
        ? new Date(lead.createdAt).toLocaleDateString()
        : "N/A",
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(","),
      ...csvData.map((row) =>
        Object.values(row)
          .map((val) => `"${val}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const statusOptions = [
    { value: "new", label: "New", color: "warning" },
    { value: "in_progress", label: "In Progress", color: "primary" },
    { value: "converted", label: "Converted", color: "success" },
    { value: "lost", label: "Lost", color: "danger" },
  ];

  return (
    <>
      <DataTable
        data={leads}
        columns={columns}
        loading={loading}
        searchable
        filterable
        sortable
        selectable={userRole === "super_admin" || userRole === "manager"}
        pagination
        pageSize={10}
        actions={getActions()}
        filters={filters}
        bulkActions={bulkActions}
        exportable
        onExport={handleExport}
        title="Leads Management"
        subtitle={`${leads.length} total leads`}
        emptyMessage="No leads found. Create your first lead to get started."
        className="bg-white rounded-lg shadow"
        onRowClick={onViewDetails}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, lead: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete the lead for "${deleteConfirm.lead?.student?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Status Update Modal */}
      <Modal
        isOpen={statusModal.open}
        onClose={() => setStatusModal({ open: false, lead: null })}
        title="Update Lead Status"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Update status for:{" "}
            <strong>{statusModal.lead?.student?.name}</strong>
          </p>

          <div className="space-y-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusUpdate(option.value)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                  statusModal.lead?.status === option.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.label}</span>
                  <Badge variant={option.color} size="sm">
                    {option.label}
                  </Badge>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setStatusModal({ open: false, lead: null })}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default LeadsTable;
