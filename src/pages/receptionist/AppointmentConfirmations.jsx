import React, { useState, useEffect } from "react";
import useApi from "../../hooks/useApi";
import useAuthStore from "../../stores/authStore";
import usePermissions from "../../hooks/usePermissions";
import { validateRejectionForm, validateInput } from "../../utils/validators";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Toast from "../../components/ui/Toast";
import DataTable from "../../components/tables/DataTable";
import {
  Calendar,
  Check,
  X,
  Search,
  UserCheck,
  Clock,
  Shield,
} from "lucide-react";

const AppointmentConfirmations = () => {
  const { user } = useAuthStore();
  const { callApi, services, loading: apiLoading, error: apiError } = useApi();
  const { hasPermission } = usePermissions();
  const [appointments, setAppointments] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    consultantId: "",
    status: "",
  });
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [rejectionForm, setRejectionForm] = useState({
    reason: "",
  });

  const appointmentStatuses = [
    {
      value: "scheduled",
      label: "Scheduled",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "confirmed",
      label: "Confirmed",
      color: "bg-green-100 text-green-800",
    },
    { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
    {
      value: "completed",
      label: "Completed",
      color: "bg-purple-100 text-purple-800",
    },
  ];

  useEffect(() => {
    if (user && hasPermission("manage", "appointments")) {
      fetchConsultants();
      fetchAppointments();
    }
  }, [user]);

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

  const fetchAppointments = async () => {
    try {
      const response = await callApi(services.appointment.getAppointments);
      setAppointments(
        response?.map((appointment) => ({
          id: appointment.id,
          clientId: appointment.clientId,
          clientName: validateInput(appointment.clientName || "Unknown"),
          consultantId: appointment.consultantId,
          consultantName: validateInput(
            appointment.consultantName || "Unknown"
          ),
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          status: appointment.status,
          notes: validateInput(appointment.notes || ""),
        })) || []
      );
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to fetch appointments",
        type: "error",
      });
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      await callApi(services.appointment.confirmAppointment, appointmentId);
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: "confirmed" }
            : appointment
        )
      );
      setToast({
        show: true,
        message: "Appointment confirmed successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to confirm appointment",
        type: "error",
      });
    }
  };

  const handleRejectAppointment = async () => {
    const validationErrors = validateRejectionForm(rejectionForm);
    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      await callApi(
        services.appointment.rejectAppointment,
        selectedAppointment.id,
        {
          reason: validateInput(rejectionForm.reason),
        }
      );
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === selectedAppointment.id
            ? {
                ...appointment,
                status: "rejected",
                notes: rejectionForm.reason,
              }
            : appointment
        )
      );
      setShowRejectModal(false);
      setSelectedAppointment(null);
      resetRejectionForm();
      setToast({
        show: true,
        message: "Appointment rejected successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to reject appointment",
        type: "error",
      });
    }
  };

  const resetRejectionForm = () => {
    setRejectionForm({ reason: "" });
    setFormErrors({});
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      !filters.search ||
      appointment.clientName
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      appointment.consultantName
        .toLowerCase()
        .includes(filters.search.toLowerCase());
    const matchesConsultant =
      !filters.consultantId ||
      appointment.consultantId === filters.consultantId;
    const matchesStatus =
      !filters.status || appointment.status === filters.status;
    return matchesSearch && matchesConsultant && matchesStatus;
  });

  const getStatusColor = (status) =>
    appointmentStatuses.find((s) => s.value === status)?.color ||
    "bg-gray-100 text-gray-800";

  const columns = [
    {
      key: "clientName",
      label: "Client",
      render: (appointment) => (
        <div className="flex items-center">
          <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{appointment.clientName}</span>
        </div>
      ),
    },
    {
      key: "consultantName",
      label: "Consultant",
      render: (appointment) => (
        <div className="flex items-center">
          <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{appointment.consultantName}</span>
        </div>
      ),
    },
    {
      key: "startTime",
      label: "Start Time",
      render: (appointment) => (
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1" />
          {new Date(appointment.startTime).toLocaleString()}
        </div>
      ),
    },
    {
      key: "endTime",
      label: "End Time",
      render: (appointment) => (
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1" />
          {new Date(appointment.endTime).toLocaleString()}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (appointment) => (
        <Badge className={getStatusColor(appointment.status)}>
          {
            appointmentStatuses.find((s) => s.value === appointment.status)
              ?.label
          }
        </Badge>
      ),
    },
    {
      key: "notes",
      label: "Notes",
      render: (appointment) => (
        <span className="text-sm">{appointment.notes || "N/A"}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (appointment) => (
        <div className="flex space-x-2">
          {appointment.status === "scheduled" && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleConfirmAppointment(appointment.id)}
                disabled={!hasPermission("edit", "appointments")}
                className="border-green-300 text-green-600 hover:bg-green-50"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedAppointment(appointment);
                  setShowRejectModal(true);
                }}
                disabled={!hasPermission("edit", "appointments")}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
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

  if (!hasPermission("manage", "appointments")) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Access Denied
        </h3>
        <p className="text-gray-600">
          You do not have permission to manage appointment confirmations.
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
          <h1 className="text-2xl font-bold text-gray-900">
            Appointment Confirmations
          </h1>
          <p className="text-gray-600">
            Confirm or reject scheduled client appointments.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by client or consultant..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="pl-10"
            />
          </div>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.consultantId}
            onChange={(e) =>
              setFilters({ ...filters, consultantId: e.target.value })
            }
          >
            <option value="">All Consultants</option>
            {consultants.map((consultant) => (
              <option key={consultant.id} value={consultant.id}>
                {consultant.name}
              </option>
            ))}
          </select>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            {appointmentStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            {filteredAppointments.length} of {appointments.length} appointments
          </div>
        </div>
      </Card>

      {/* Appointments Table */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Appointments</h3>
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No appointments found
            </h3>
            <p className="text-gray-600">
              {Object.values(filters).some((f) => f)
                ? "No appointments match your current filters."
                : "No appointments are awaiting confirmation."}
            </p>
          </div>
        ) : (
          <DataTable
            data={filteredAppointments}
            columns={columns}
            pagination={true}
            pageSize={10}
          />
        )}
      </Card>

      {/* Reject Appointment Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedAppointment(null);
          resetRejectionForm();
        }}
        title="Reject Appointment"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason *
            </label>
            <textarea
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                formErrors.reason ? "border-red-500" : ""
              }`}
              rows={4}
              value={rejectionForm.reason}
              onChange={(e) =>
                setRejectionForm({ ...rejectionForm, reason: e.target.value })
              }
              placeholder="Enter the reason for rejecting this appointment..."
            />
            {formErrors.reason && (
              <p className="text-red-500 text-xs mt-1">{formErrors.reason}</p>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setSelectedAppointment(null);
                resetRejectionForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectAppointment}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Appointment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AppointmentConfirmations;
