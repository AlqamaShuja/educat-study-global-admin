import React, { useState, useEffect } from "react";
import useApi from "../../hooks/useApi";
import useAuthStore from "../../stores/authStore";
import usePermissions from "../../hooks/usePermissions";
import { validateAppointmentForm, validateInput } from "../../utils/validators";
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
  Plus,
  Edit,
  Trash2,
  Search,
  UserCheck,
  Clock,
  Shield,
} from "lucide-react";

const AppointmentBooking = () => {
  const { user } = useAuthStore();
  const { callApi, services, loading: apiLoading, error: apiError } = useApi();
  const { hasPermission } = usePermissions();
  const [appointments, setAppointments] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [clients, setClients] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    consultantId: "",
    date: "",
  });
  const [showBookModal, setShowBookModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [appointmentForm, setAppointmentForm] = useState({
    clientId: "",
    consultantId: "",
    startTime: "",
    endTime: "",
    status: "scheduled",
    notes: "",
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
    {
      value: "cancelled",
      label: "Cancelled",
      color: "bg-red-100 text-red-800",
    },
    {
      value: "completed",
      label: "Completed",
      color: "bg-purple-100 text-purple-800",
    },
  ];

  useEffect(() => {
    if (user && hasPermission("manage", "appointments")) {
      fetchConsultants();
      fetchClients();
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

  const fetchClients = async () => {
    try {
      const response = await callApi(services.user.getClients);
      setClients(
        response?.map((client) => ({
          id: client.id,
          name: validateInput(client.name),
        })) || []
      );
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to fetch clients",
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

  const fetchAvailableSlots = async (consultantId, date) => {
    if (!consultantId || !date) return;
    try {
      const response = await callApi(services.schedule.getAvailableSlots, {
        consultantId,
        date,
      });
      setAvailableSlots(
        response?.map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
        })) || []
      );
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to fetch available slots",
        type: "error",
      });
    }
  };

  const handleBookAppointment = async () => {
    const validationErrors = validateAppointmentForm(appointmentForm);
    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      const newAppointment = await callApi(
        services.appointment.createAppointment,
        {
          ...appointmentForm,
          startTime: new Date(appointmentForm.startTime).toISOString(),
          endTime: new Date(appointmentForm.endTime).toISOString(),
          notes: validateInput(appointmentForm.notes),
        }
      );
      setAppointments((prev) => [
        ...prev,
        {
          ...newAppointment,
          clientName:
            clients.find((c) => c.id === newAppointment.clientId)?.name ||
            "Unknown",
          consultantName:
            consultants.find((c) => c.id === newAppointment.consultantId)
              ?.name || "Unknown",
        },
      ]);
      setShowBookModal(false);
      resetForm();
      setToast({
        show: true,
        message: "Appointment booked successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to book appointment",
        type: "error",
      });
    }
  };

  const handleEditAppointment = async () => {
    const validationErrors = validateAppointmentForm(appointmentForm);
    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      const updatedAppointment = await callApi(
        services.appointment.updateAppointment,
        selectedAppointment.id,
        {
          ...appointmentForm,
          startTime: new Date(appointmentForm.startTime).toISOString(),
          endTime: new Date(appointmentForm.endTime).toISOString(),
          notes: validateInput(appointmentForm.notes),
        }
      );
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === selectedAppointment.id
            ? {
                ...updatedAppointment,
                clientName:
                  clients.find((c) => c.id === updatedAppointment.clientId)
                    ?.name || "Unknown",
                consultantName:
                  consultants.find(
                    (c) => c.id === updatedAppointment.consultantId
                  )?.name || "Unknown",
              }
            : appointment
        )
      );
      setShowEditModal(false);
      setSelectedAppointment(null);
      resetForm();
      setToast({
        show: true,
        message: "Appointment updated successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to update appointment",
        type: "error",
      });
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;

    try {
      await callApi(services.appointment.cancelAppointment, appointmentId);
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: "cancelled" }
            : appointment
        )
      );
      setToast({
        show: true,
        message: "Appointment cancelled successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to cancel appointment",
        type: "error",
      });
    }
  };

  const resetForm = () => {
    setAppointmentForm({
      clientId: "",
      consultantId: "",
      startTime: "",
      endTime: "",
      status: "scheduled",
      notes: "",
    });
    setFormErrors({});
    setAvailableSlots([]);
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
    const matchesDate =
      !filters.date ||
      new Date(appointment.startTime).toDateString() ===
        new Date(filters.date).toDateString();
    return matchesSearch && matchesConsultant && matchesDate;
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedAppointment(appointment);
              setAppointmentForm({
                clientId: appointment.clientId,
                consultantId: appointment.consultantId,
                startTime: new Date(appointment.startTime)
                  .toISOString()
                  .slice(0, 16),
                endTime: new Date(appointment.endTime)
                  .toISOString()
                  .slice(0, 16),
                status: appointment.status,
                notes: appointment.notes,
              });
              fetchAvailableSlots(
                appointment.consultantId,
                new Date(appointment.startTime).toISOString().slice(0, 10)
              );
              setShowEditModal(true);
            }}
            disabled={!hasPermission("edit", "appointments")}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCancelAppointment(appointment.id)}
            className="border-red-300 text-red-600 hover:bg-red-50"
            disabled={
              !hasPermission("delete", "appointments") ||
              appointment.status === "cancelled"
            }
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

  if (!hasPermission("manage", "appointments")) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Access Denied
        </h3>
        <p className="text-gray-600">
          You do not have permission to manage appointments.
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
            Appointment Booking
          </h1>
          <p className="text-gray-600">
            Manage client appointments with consultants.
          </p>
        </div>
        <Button
          onClick={() => setShowBookModal(true)}
          disabled={!hasPermission("create", "appointments")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Book Appointment
        </Button>
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
          <Input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            placeholder="Filter by date"
          />
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
            <p className="text-gray-600 mb-4">
              {Object.values(filters).some((f) => f)
                ? "No appointments match your current filters."
                : "Book your first appointment to get started."}
            </p>
            <Button
              onClick={() => setShowBookModal(true)}
              disabled={!hasPermission("create", "appointments")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Book First Appointment
            </Button>
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

      {/* Book Appointment Modal */}
      <Modal
        isOpen={showBookModal}
        onClose={() => {
          setShowBookModal(false);
          resetForm();
        }}
        title="Book Appointment"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client *
            </label>
            <select
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                formErrors.clientId ? "border-red-500" : ""
              }`}
              value={appointmentForm.clientId}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  clientId: e.target.value,
                })
              }
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {formErrors.clientId && (
              <p className="text-red-500 text-xs mt-1">{formErrors.clientId}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consultant *
            </label>
            <select
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                formErrors.consultantId ? "border-red-500" : ""
              }`}
              value={appointmentForm.consultantId}
              onChange={(e) => {
                setAppointmentForm({
                  ...appointmentForm,
                  consultantId: e.target.value,
                });
                fetchAvailableSlots(
                  e.target.value,
                  appointmentForm.startTime.slice(0, 10)
                );
              }}
            >
              <option value="">Select a consultant</option>
              {consultants.map((consultant) => (
                <option key={consultant.id} value={consultant.id}>
                  {consultant.name}
                </option>
              ))}
            </select>
            {formErrors.consultantId && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.consultantId}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <Input
                type="datetime-local"
                value={appointmentForm.startTime}
                onChange={(e) => {
                  setAppointmentForm({
                    ...appointmentForm,
                    startTime: e.target.value,
                  });
                  fetchAvailableSlots(
                    appointmentForm.consultantId,
                    e.target.value.slice(0, 10)
                  );
                }}
                className={formErrors.startTime ? "border-red-500" : ""}
              />
              {formErrors.startTime && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.startTime}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <Input
                type="datetime-local"
                value={appointmentForm.endTime}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    endTime: e.target.value,
                  })
                }
                className={formErrors.endTime ? "border-red-500" : ""}
              />
              {formErrors.endTime && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.endTime}
                </p>
              )}
            </div>
          </div>
          {availableSlots.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Slots
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onChange={(e) => {
                  const [start, end] = e.target.value.split("|");
                  setAppointmentForm({
                    ...appointmentForm,
                    startTime: start,
                    endTime: end,
                  });
                }}
              >
                <option value="">Select an available slot</option>
                {availableSlots.map((slot, index) => (
                  <option
                    key={index}
                    value={`${slot.startTime}|${slot.endTime}`}
                  >
                    {new Date(slot.startTime).toLocaleString()} -{" "}
                    {new Date(slot.endTime).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={appointmentForm.status}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  status: e.target.value,
                })
              }
            >
              {appointmentStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              value={appointmentForm.notes}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  notes: e.target.value,
                })
              }
              placeholder="Enter any additional notes..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowBookModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleBookAppointment}>Book Appointment</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Appointment Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAppointment(null);
          resetForm();
        }}
        title="Edit Appointment"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client *
            </label>
            <select
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                formErrors.clientId ? "border-red-500" : ""
              }`}
              value={appointmentForm.clientId}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  clientId: e.target.value,
                })
              }
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {formErrors.clientId && (
              <p className="text-red-500 text-xs mt-1">{formErrors.clientId}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consultant *
            </label>
            <select
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                formErrors.consultantId ? "border-red-500" : ""
              }`}
              value={appointmentForm.consultantId}
              onChange={(e) => {
                setAppointmentForm({
                  ...appointmentForm,
                  consultantId: e.target.value,
                });
                fetchAvailableSlots(
                  e.target.value,
                  appointmentForm.startTime.slice(0, 10)
                );
              }}
            >
              <option value="">Select a consultant</option>
              {consultants.map((consultant) => (
                <option key={consultant.id} value={consultant.id}>
                  {consultant.name}
                </option>
              ))}
            </select>
            {formErrors.consultantId && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.consultantId}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <Input
                type="datetime-local"
                value={appointmentForm.startTime}
                onChange={(e) => {
                  setAppointmentForm({
                    ...appointmentForm,
                    startTime: e.target.value,
                  });
                  fetchAvailableSlots(
                    appointmentForm.consultantId,
                    e.target.value.slice(0, 10)
                  );
                }}
                className={formErrors.startTime ? "border-red-500" : ""}
              />
              {formErrors.startTime && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.startTime}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <Input
                type="datetime-local"
                value={appointmentForm.endTime}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    endTime: e.target.value,
                  })
                }
                className={formErrors.endTime ? "border-red-500" : ""}
              />
              {formErrors.endTime && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.endTime}
                </p>
              )}
            </div>
          </div>
          {availableSlots.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Slots
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onChange={(e) => {
                  const [start, end] = e.target.value.split("|");
                  setAppointmentForm({
                    ...appointmentForm,
                    startTime: start,
                    endTime: end,
                  });
                }}
              >
                <option value="">Select an available slot</option>
                {availableSlots.map((slot, index) => (
                  <option
                    key={index}
                    value={`${slot.startTime}|${slot.endTime}`}
                  >
                    {new Date(slot.startTime).toLocaleString()} -{" "}
                    {new Date(slot.endTime).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={appointmentForm.status}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  status: e.target.value,
                })
              }
            >
              {appointmentStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              value={appointmentForm.notes}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  notes: e.target.value,
                })
              }
              placeholder="Enter any additional notes..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setSelectedAppointment(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditAppointment}>Update Appointment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AppointmentBooking;
