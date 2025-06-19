import React, { useState } from "react";
import DataTable from "./DataTable";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import Modal from "../ui/Modal";

const OfficesTable = ({
  offices = [],
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewDetails,
  onAssignManager,
  onManageConsultants,
  showActions = true,
  userRole = "super_admin",
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    office: null,
  });
  const [statusConfirm, setStatusConfirm] = useState({
    open: false,
    office: null,
  });
  const [detailsModal, setDetailsModal] = useState({
    open: false,
    office: null,
  });

  const columns = [
    {
      key: "name",
      header: "Office Name",
      render: (value, row) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">
              {row.address?.city}, {row.address?.country}
            </div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "manager",
      header: "Manager",
      render: (value, row) => {
        if (!row.manager) {
          return (
            <span className="text-gray-400 text-sm">No Manager Assigned</span>
          );
        }
        return (
          <div>
            <div className="text-sm font-medium text-gray-900">
              {row.manager.name}
            </div>
            <div className="text-sm text-gray-500">{row.manager.email}</div>
          </div>
        );
      },
    },
    {
      key: "address",
      header: "Location",
      render: (value) => {
        if (!value) return "N/A";
        return (
          <div className="text-sm">
            <div className="text-gray-900">{value.street}</div>
            <div className="text-gray-500">
              {value.city}, {value.state} {value.zipCode}
            </div>
            <div className="text-gray-500">{value.country}</div>
          </div>
        );
      },
    },
    {
      key: "contact",
      header: "Contact",
      render: (value) => {
        if (!value) return "N/A";
        return (
          <div className="text-sm">
            <div className="text-gray-900">{value.phone}</div>
            <div className="text-gray-500">{value.email}</div>
          </div>
        );
      },
    },
    {
      key: "consultants",
      header: "Staff",
      render: (value, row) => {
        const consultantCount = row.consultants?.length || 0;
        const maxConsultants = row.serviceCapacity?.maxConsultants || 0;
        const utilizationPercentage =
          maxConsultants > 0 ? (consultantCount / maxConsultants) * 100 : 0;

        let badgeVariant = "success";
        if (utilizationPercentage > 90) badgeVariant = "danger";
        else if (utilizationPercentage > 70) badgeVariant = "warning";

        return (
          <div className="text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-900 font-medium">
                {consultantCount}/{maxConsultants}
              </span>
              <Badge variant={badgeVariant} size="sm">
                {utilizationPercentage.toFixed(0)}%
              </Badge>
            </div>
            <div className="text-gray-500">Consultants</div>
          </div>
        );
      },
    },
    {
      key: "serviceCapacity",
      header: "Capacity",
      render: (value) => {
        if (!value) return "N/A";
        return (
          <div className="text-sm">
            <div className="text-gray-900">{value.maxAppointments}/day</div>
            <div className="text-gray-500">Max Appointments</div>
          </div>
        );
      },
    },
    {
      key: "workingDays",
      header: "Working Days",
      render: (value) => {
        if (!value || value.length === 0) return "N/A";
        if (value.length === 7) return "All Days";
        if (
          value.length === 5 &&
          !value.includes("Saturday") &&
          !value.includes("Sunday")
        ) {
          return "Weekdays";
        }
        return `${value.length} days`;
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

  const getActions = () => {
    if (!showActions) return [];

    const actions = [
      {
        label: "View Details",
        onClick: (office) => setDetailsModal({ open: true, office }),
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

    if (userRole === "super_admin") {
      actions.push(
        {
          label: "Edit",
          onClick: (office) => onEdit && onEdit(office),
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
          label: "Manage Staff",
          onClick: (office) =>
            onManageConsultants && onManageConsultants(office),
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          ),
        },
        {
          label: (office) => (office.isActive ? "Deactivate" : "Activate"),
          onClick: (office) => setStatusConfirm({ open: true, office }),
          variant: "outline",
          className: (office) =>
            office.isActive
              ? "text-orange-600 hover:text-orange-700"
              : "text-green-600 hover:text-green-700",
          icon: (office) =>
            office.isActive ? (
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
          onClick: (office) => setDeleteConfirm({ open: true, office }),
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
        }
      );
    }

    return actions;
  };

  const filters = [
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
    {
      key: "address.country",
      label: "Country",
      options: [
        { value: "", label: "All Countries" },
        { value: "Pakistan", label: "Pakistan" },
        { value: "UAE", label: "UAE" },
        { value: "UK", label: "United Kingdom" },
        { value: "Canada", label: "Canada" },
        { value: "Australia", label: "Australia" },
      ],
      filterFn: (row, value) => {
        if (value === "") return true;
        return row.address?.country === value;
      },
    },
    {
      key: "manager",
      label: "Manager Status",
      options: [
        { value: "", label: "All Offices" },
        { value: "assigned", label: "Manager Assigned" },
        { value: "unassigned", label: "No Manager" },
      ],
      filterFn: (row, value) => {
        if (value === "") return true;
        if (value === "assigned") return !!row.managerId;
        if (value === "unassigned") return !row.managerId;
        return true;
      },
    },
  ];

  const bulkActions =
    userRole === "super_admin"
      ? [
          {
            label: "Activate Selected",
            onClick: (selectedOffices) => {
              selectedOffices.forEach((office) => {
                if (!office.isActive && onToggleStatus) {
                  onToggleStatus(office.id, true);
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
            onClick: (selectedOffices) => {
              selectedOffices.forEach((office) => {
                if (office.isActive && onToggleStatus) {
                  onToggleStatus(office.id, false);
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
        ]
      : [];

  const handleConfirmDelete = () => {
    if (deleteConfirm.office && onDelete) {
      onDelete(deleteConfirm.office.id);
    }
    setDeleteConfirm({ open: false, office: null });
  };

  const handleConfirmStatusChange = () => {
    if (statusConfirm.office && onToggleStatus) {
      onToggleStatus(statusConfirm.office.id, !statusConfirm.office.isActive);
    }
    setStatusConfirm({ open: false, office: null });
  };

  const handleExport = () => {
    const csvData = offices.map((office) => ({
      "Office Name": office.name,
      Manager: office.manager?.name || "Unassigned",
      "Manager Email": office.manager?.email || "N/A",
      Address: `${office.address?.street || ""}, ${
        office.address?.city || ""
      }, ${office.address?.country || ""}`,
      Phone: office.contact?.phone || "N/A",
      Email: office.contact?.email || "N/A",
      Consultants: `${office.consultants?.length || 0}/${
        office.serviceCapacity?.maxConsultants || 0
      }`,
      "Max Appointments": office.serviceCapacity?.maxAppointments || "N/A",
      "Working Days": office.workingDays?.join(", ") || "N/A",
      Status: office.isActive ? "Active" : "Inactive",
      Created: office.createdAt
        ? new Date(office.createdAt).toLocaleDateString()
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
    a.download = `offices_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <DataTable
        data={offices}
        columns={columns}
        loading={loading}
        searchable
        filterable
        sortable
        selectable={userRole === "super_admin"}
        pagination
        pageSize={10}
        actions={getActions()}
        filters={filters}
        bulkActions={bulkActions}
        exportable
        onExport={handleExport}
        title="Offices Management"
        subtitle={`${offices.length} total offices`}
        emptyMessage="No offices found. Create your first office to get started."
        className="bg-white rounded-lg shadow"
        onRowClick={onViewDetails}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, office: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Office"
        message={`Are you sure you want to delete "${deleteConfirm.office?.name}"? This action cannot be undone and will affect all associated staff and data.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Status Change Confirmation Dialog */}
      <ConfirmDialog
        isOpen={statusConfirm.open}
        onClose={() => setStatusConfirm({ open: false, office: null })}
        onConfirm={handleConfirmStatusChange}
        title={`${
          statusConfirm.office?.isActive ? "Deactivate" : "Activate"
        } Office`}
        message={`Are you sure you want to ${
          statusConfirm.office?.isActive ? "deactivate" : "activate"
        } "${
          statusConfirm.office?.name
        }"? This will affect all associated operations.`}
        confirmText={statusConfirm.office?.isActive ? "Deactivate" : "Activate"}
        cancelText="Cancel"
        type={statusConfirm.office?.isActive ? "warning" : "info"}
      />

      {/* Office Details Modal */}
      <Modal
        isOpen={detailsModal.open}
        onClose={() => setDetailsModal({ open: false, office: null })}
        title="Office Details"
        size="lg"
      >
        {detailsModal.office && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Office Name
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {detailsModal.office.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd>
                    <Badge
                      variant={
                        detailsModal.office.isActive ? "success" : "danger"
                      }
                      size="sm"
                    >
                      {detailsModal.office.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </dd>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Address
              </h3>
              <div className="text-sm text-gray-900">
                <p>{detailsModal.office.address?.street}</p>
                <p>
                  {detailsModal.office.address?.city},{" "}
                  {detailsModal.office.address?.state}{" "}
                  {detailsModal.office.address?.zipCode}
                </p>
                <p>{detailsModal.office.address?.country}</p>
              </div>
            </div>

            {/* Working Hours */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Working Schedule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Working Days
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {detailsModal.office.workingDays?.join(", ") ||
                      "Not specified"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Office Hours
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {detailsModal.office.officeHours ? (
                      <div className="space-y-1">
                        {Object.entries(detailsModal.office.officeHours).map(
                          ([day, hours]) => (
                            <div key={day} className="flex justify-between">
                              <span>{day}:</span>
                              <span>{hours}</span>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      "Not specified"
                    )}
                  </dd>
                </div>
              </div>
            </div>

            {/* Service Capacity */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Service Capacity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Max Appointments/Day
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {detailsModal.office.serviceCapacity?.maxAppointments ||
                      "Not specified"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Max Consultants
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {detailsModal.office.serviceCapacity?.maxConsultants ||
                      "Not specified"}
                  </dd>
                </div>
              </div>
            </div>

            {/* Current Staff */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Current Staff
              </h3>
              <div className="space-y-2">
                {detailsModal.office.manager && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Manager
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {detailsModal.office.manager.name} (
                      {detailsModal.office.manager.email})
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Consultants ({detailsModal.office.consultants?.length || 0})
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {detailsModal.office.consultants?.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {detailsModal.office.consultants.map((consultant) => (
                          <li key={consultant.id}>
                            {consultant.name} ({consultant.email})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "No consultants assigned"
                    )}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default OfficesTable;
