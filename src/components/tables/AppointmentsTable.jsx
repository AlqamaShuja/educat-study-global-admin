import React, { useState } from "react";
import DataTable from "./DataTable";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import Modal from "../ui/Modal";
import Input from "../ui/Input";

const AppointmentsTable = ({
  appointments = [],
  loading = false,
  onEdit,
  onCancel,
  onReschedule,
  onCheckIn,
  onComplete,
  onViewDetails,
  showActions = true,
  userRole = "consultant",
}) => {
  const [cancelConfirm, setCancelConfirm] = useState({
    open: false,
    appointment: null,
  });
  const [rescheduleModal, setRescheduleModal] = useState({
    open: false,
    appointment: null,
  });
  const [checkInConfirm, setCheckInConfirm] = useState({
    open: false,
    appointment: null,
  });
  const [newDateTime, setNewDateTime] = useState("");

  const columns = [
    {
      key: "student",
      header: "Student",
      render: (value, row) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-green-600 font-medium text-sm">
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
      key: "consultant",
      header: "Consultant",
      render: (value, row) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {row.consultant?.name}
          </div>
          <div className="text-sm text-gray-500">{row.consultant?.email}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "dateTime",
      header: "Date & Time",
      render: (value) => {
        if (!value) return "N/A";
        const date = new Date(value);
        const isToday = date.toDateString() === new Date().toDateString();
        const isPast = date < new Date();

        return (
          <div
            className={`text-sm ${
              isPast && !isToday ? "text-gray-500" : "text-gray-900"
            }`}
          >
            <div className={`font-medium ${isToday ? "text-blue-600" : ""}`}>
              {date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              {isToday && <span className="ml-1 text-xs">(Today)</span>}
            </div>
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
    {
      key: "type",
      header: "Type",
      render: (value) => {
        const typeColors = {
          in_person: "primary",
          virtual: "success",
        };
        return (
          <Badge variant={typeColors[value] || "default"} size="sm">
            {value === "in_person" ? "In Person" : "Virtual"}
          </Badge>
        );
      },
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => {
        const statusColors = {
          scheduled: "warning",
          completed: "success",
          canceled: "danger",
          no_show: "secondary",
        };

        // Auto-determine status based on time if not explicitly set
        let displayStatus = value;
        const appointmentTime = new Date(row.dateTime);
        const now = new Date();
        const timeDiff = now - appointmentTime;

        if (!value || value === "scheduled") {
          if (timeDiff > 2 * 60 * 60 * 1000) {
            // 2 hours past
            displayStatus = "no_show";
          } else if (timeDiff > 0) {
            displayStatus = "in_progress";
          } else {
            displayStatus = "scheduled";
          }
        }

        const statusLabels = {
          scheduled: "Scheduled",
          in_progress: "In Progress",
          completed: "Completed",
          canceled: "Canceled",
          no_show: "No Show",
        };

        return (
          <Badge variant={statusColors[displayStatus] || "default"} size="sm">
            {statusLabels[displayStatus] || displayStatus}
          </Badge>
        );
      },
      sortable: true,
    },
    {
      key: "office",
      header: "Office",
      render: (value, row) => {
        if (!row.office) return "Not specified";
        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900">{row.office.name}</div>
            <div className="text-gray-500">{row.office.address?.city}</div>
          </div>
        );
      },
    },
    {
      key: "notes",
      header: "Notes",
      render: (value) => {
        if (!value)
          return <span className="text-gray-400 text-sm">No notes</span>;
        return (
          <div
            className="text-sm text-gray-600 max-w-xs truncate"
            title={value}
          >
            {value}
          </div>
        );
      },
    },
  ];

  const getActions = () => {
    if (!showActions) return [];

    const baseActions = [
      {
        label: "View",
        onClick: (appointment) => onViewDetails && onViewDetails(appointment),
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

    // Add role-specific actions
    if (
      userRole === "receptionist" ||
      userRole === "consultant" ||
      userRole === "manager"
    ) {
      baseActions.push(
        {
          label: "Check In",
          onClick: (appointment) =>
            setCheckInConfirm({ open: true, appointment }),
          variant: "outline",
          className: "text-green-600 hover:text-green-700",
          disabled: (appointment) => {
            const appointmentTime = new Date(appointment.dateTime);
            const now = new Date();
            const timeDiff = appointmentTime - now;
            return (
              timeDiff > 30 * 60 * 1000 ||
              appointment.status === "completed" ||
              appointment.status === "canceled"
            ); // More than 30 minutes early
          },
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
          label: "Reschedule",
          onClick: (appointment) => {
            setNewDateTime(
              new Date(appointment.dateTime).toISOString().slice(0, 16)
            );
            setRescheduleModal({ open: true, appointment });
          },
          variant: "outline",
          className: "text-blue-600 hover:text-blue-700",
          disabled: (appointment) =>
            appointment.status === "completed" ||
            appointment.status === "canceled",
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          ),
        }
      );
    }

    if (userRole === "consultant") {
      baseActions.push({
        label: "Complete",
        onClick: (appointment) => onComplete && onComplete(appointment.id),
        variant: "outline",
        className: "text-green-600 hover:text-green-700",
        disabled: (appointment) => {
          const appointmentTime = new Date(appointment.dateTime);
          const now = new Date();
          return (
            now < appointmentTime ||
            appointment.status === "completed" ||
            appointment.status === "canceled"
          );
        },
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        ),
      });
    }

    // Cancel action for most roles
    if (userRole !== "student") {
      baseActions.push({
        label: "Cancel",
        onClick: (appointment) => setCancelConfirm({ open: true, appointment }),
        variant: "outline",
        className: "text-red-600 hover:text-red-700",
        disabled: (appointment) =>
          appointment.status === "completed" ||
          appointment.status === "canceled",
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
              d="M6 18L18 6M6 6l12 12"
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
        { value: "scheduled", label: "Scheduled" },
        { value: "completed", label: "Completed" },
        { value: "canceled", label: "Canceled" },
        { value: "no_show", label: "No Show" },
      ],
    },
    {
      key: "type",
      label: "Type",
      options: [
        { value: "", label: "All Types" },
        { value: "in_person", label: "In Person" },
        { value: "virtual", label: "Virtual" },
      ],
    },
    {
      key: "dateTime",
      label: "Date Range",
      options: [
        { value: "", label: "All Dates" },
        { value: "today", label: "Today" },
        { value: "tomorrow", label: "Tomorrow" },
        { value: "this_week", label: "This Week" },
        { value: "next_week", label: "Next Week" },
      ],
      filterFn: (row, value) => {
        if (value === "") return true;

        const appointmentDate = new Date(row.dateTime);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        switch (value) {
          case "today":
            return appointmentDate.toDateString() === today.toDateString();
          case "tomorrow":
            return appointmentDate.toDateString() === tomorrow.toDateString();
          case "this_week":
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return (
              appointmentDate >= startOfWeek && appointmentDate <= endOfWeek
            );
          case "next_week":
            const nextWeekStart = new Date(today);
            nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
            const nextWeekEnd = new Date(nextWeekStart);
            nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
            return (
              appointmentDate >= nextWeekStart && appointmentDate <= nextWeekEnd
            );
          default:
            return true;
        }
      },
    },
  ];

  const bulkActions =
    userRole !== "student"
      ? [
          {
            label: "Cancel Selected",
            onClick: (selectedAppointments) => {
              selectedAppointments.forEach((appointment) => {
                if (
                  appointment.status !== "completed" &&
                  appointment.status !== "canceled" &&
                  onCancel
                ) {
                  onCancel(appointment.id);
                }
              });
            },
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ),
          },
        ]
      : [];

  const handleConfirmCancel = () => {
    if (cancelConfirm.appointment && onCancel) {
      onCancel(cancelConfirm.appointment.id);
    }
    setCancelConfirm({ open: false, appointment: null });
  };

  const handleConfirmCheckIn = () => {
    if (checkInConfirm.appointment && onCheckIn) {
      onCheckIn(checkInConfirm.appointment.id);
    }
    setCheckInConfirm({ open: false, appointment: null });
  };

  const handleReschedule = () => {
    if (rescheduleModal.appointment && onReschedule && newDateTime) {
      onReschedule(
        rescheduleModal.appointment.id,
        new Date(newDateTime).toISOString()
      );
    }
    setRescheduleModal({ open: false, appointment: null });
    setNewDateTime("");
  };

  const handleExport = () => {
    const csvData = appointments.map((appointment) => ({
      "Student Name": appointment.student?.name || "N/A",
      "Student Email": appointment.student?.email || "N/A",
      Consultant: appointment.consultant?.name || "N/A",
      Date: appointment.dateTime
        ? new Date(appointment.dateTime).toLocaleDateString()
        : "N/A",
      Time: appointment.dateTime
        ? new Date(appointment.dateTime).toLocaleTimeString()
        : "N/A",
      Type: appointment.type === "in_person" ? "In Person" : "Virtual",
      Status: appointment.status || "Scheduled",
      Office: appointment.office?.name || "Not specified",
      Notes: appointment.notes || "No notes",
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
    a.download = `appointments_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <DataTable
        data={appointments}
        columns={columns}
        loading={loading}
        searchable
        filterable
        sortable
        selectable={userRole !== "student"}
        pagination
        pageSize={10}
        actions={getActions()}
        filters={filters}
        bulkActions={bulkActions}
        exportable
        onExport={handleExport}
        title="Appointments Management"
        subtitle={`${appointments.length} total appointments`}
        emptyMessage="No appointments found. Schedule your first appointment to get started."
        className="bg-white rounded-lg shadow"
        onRowClick={onViewDetails}
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={cancelConfirm.open}
        onClose={() => setCancelConfirm({ open: false, appointment: null })}
        onConfirm={handleConfirmCancel}
        title="Cancel Appointment"
        message={`Are you sure you want to cancel the appointment with "${
          cancelConfirm.appointment?.student?.name
        }" scheduled for ${
          cancelConfirm.appointment?.dateTime
            ? new Date(cancelConfirm.appointment.dateTime).toLocaleString()
            : "N/A"
        }?`}
        confirmText="Cancel Appointment"
        cancelText="Keep Appointment"
        type="warning"
      />

      {/* Check In Confirmation Dialog */}
      <ConfirmDialog
        isOpen={checkInConfirm.open}
        onClose={() => setCheckInConfirm({ open: false, appointment: null })}
        onConfirm={handleConfirmCheckIn}
        title="Check In Student"
        message={`Check in "${checkInConfirm.appointment?.student?.name}" for their appointment?`}
        confirmText="Check In"
        cancelText="Cancel"
        type="info"
      />

      {/* Reschedule Modal */}
      <Modal
        isOpen={rescheduleModal.open}
        onClose={() => {
          setRescheduleModal({ open: false, appointment: null });
          setNewDateTime("");
        }}
        title="Reschedule Appointment"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Reschedule appointment with:{" "}
            <strong>{rescheduleModal.appointment?.student?.name}</strong>
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Date & Time
            </label>
            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
              {rescheduleModal.appointment?.dateTime
                ? new Date(
                    rescheduleModal.appointment.dateTime
                  ).toLocaleString()
                : "N/A"}
            </p>
          </div>

          <Input
            label="New Date & Time"
            type="datetime-local"
            value={newDateTime}
            onChange={(e) => setNewDateTime(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            required
          />

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setRescheduleModal({ open: false, appointment: null });
                setNewDateTime("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleReschedule} disabled={!newDateTime}>
              Reschedule
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AppointmentsTable;
