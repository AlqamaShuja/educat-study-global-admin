// pages/consultant/AppointmentManagement.jsx
import React, { useState, useEffect } from "react";
import useConsultantStore from "../../stores/consultantStore";
import AppointmentTableView from "../../components/appointments/AppointmentTableView";
import AppointmentCalendarView from "../../components/appointments/AppointmentCalendarView";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Card from "../../components/ui/Card";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  User,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

// Custom notification helper
const showNotification = (message, type = "info") => {
  console.log(`${type.toUpperCase()}: ${message}`);
  // Replace with your actual notification system
  if (window.alert && type === "error") {
    window.alert(message);
  } else {
    console.log(`Notification: ${message}`);
  }
};

const AppointmentManagement = () => {
  const {
    leads,
    appointments = [],
    fetchLeads,
    scheduleMeeting,
    updateAppointment,
    deleteAppointment,
    fetchAppointments,
    loading,
    error,
    clearError,
  } = useConsultantStore();

  // State
  const [localAppointments, setLocalAppointments] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'calendar'

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    search: "",
    dateRange: "",
  });

  // Form states
  const [appointmentForm, setAppointmentForm] = useState({
    studentId: "",
    dateTime: "",
    type: "in_person",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper functions for datetime handling
  const formatDateTimeLocal = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    // Adjust for timezone offset to get local time
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  const parseDateTimeLocal = (dateTimeLocalValue) => {
    if (!dateTimeLocalValue) return "";
    // Create date from local datetime without timezone conversion
    return new Date(dateTimeLocalValue).toISOString();
  };

  // Load data on component mount
  useEffect(() => {
    fetchLeads();
    fetchAppointments()
      .then((fetchedAppointments) => {
        if (fetchedAppointments && fetchedAppointments.length > 0) {
          setLocalAppointments(fetchedAppointments);
        } else {
          // If no appointments from API, use mock data for demo
          generateMockAppointments();
        }
      })
      .catch((err) => {
        console.error("Failed to fetch appointments:", err);
        // If API fails, use mock data for demo
        generateMockAppointments();
      });
  }, [fetchLeads, fetchAppointments]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error("Store error:", error);
      showNotification(error, "error");
      clearError();
    }
  }, [error, clearError]);

  // Use appointments from store if available, otherwise use local state
  const allAppointments =
    appointments.length > 0 ? appointments : localAppointments;

  // Generate mock appointments from leads (fallback for demo)
  const generateMockAppointments = () => {
    const mockAppointments = [
      {
        id: "apt-1",
        studentId: "e3701205-af3b-46b5-b059-a8d1bc4ff3ba",
        student: {
          id: "e3701205-af3b-46b5-b059-a8d1bc4ff3ba",
          name: "John Doe",
          email: "john@example.com",
          phone: "+1234567890",
        },
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        type: "virtual",
        status: "scheduled",
        notes: "Initial consultation about study abroad programs",
        createdAt: new Date().toISOString(),
      },
      {
        id: "apt-2",
        studentId: "student-2",
        student: {
          id: "student-2",
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "+1234567891",
        },
        dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
        type: "in_person",
        status: "scheduled",
        notes: "Follow-up meeting to discuss application progress",
        createdAt: new Date().toISOString(),
      },
      {
        id: "apt-3",
        studentId: "student-3",
        student: {
          id: "student-3",
          name: "Mike Johnson",
          email: "mike@example.com",
          phone: "+1234567892",
        },
        dateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        type: "virtual",
        status: "completed",
        notes: "Discussed university options and requirements",
        createdAt: new Date().toISOString(),
      },
    ];
    setLocalAppointments(mockAppointments);
  };

  const handleScheduleAppointment = async () => {
    if (!appointmentForm.studentId || !appointmentForm.dateTime) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert datetime-local to ISO string only when sending to API
      const appointmentData = {
        dateTime: parseDateTimeLocal(appointmentForm.dateTime),
        type: appointmentForm.type,
        notes: appointmentForm.notes,
      };

      const response = await scheduleMeeting(
        appointmentForm.studentId,
        appointmentData
      );

      // If using real API, the appointment will be added through store
      // If using mock data, add to local state
      if (appointments.length === 0) {
        const newAppointment = {
          id: `apt-${Date.now()}`,
          studentId: appointmentForm.studentId,
          dateTime: appointmentData.dateTime,
          type: appointmentForm.type,
          notes: appointmentForm.notes,
          student: leads.find(
            (lead) => lead.student?.id === appointmentForm.studentId
          )?.student || {
            id: appointmentForm.studentId,
            name: "Unknown Student",
            email: "N/A",
          },
          status: "scheduled",
          createdAt: new Date().toISOString(),
        };
        setLocalAppointments((prev) => [newAppointment, ...prev]);
      }

      showNotification("Appointment scheduled successfully!", "success");
      setShowScheduleModal(false);
      resetAppointmentForm();

      // Refresh appointments from API
      fetchAppointments().catch(() => {
        console.log("Using local appointments");
      });
    } catch (err) {
      showNotification("Failed to schedule appointment", "error");
      console.error("Schedule appointment error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAppointment = async () => {
    if (!selectedAppointment) return;

    setIsSubmitting(true);
    try {
      // Convert datetime-local to ISO string if needed
      const appointmentData = {
        dateTime:
          typeof selectedAppointment.dateTime === "string" &&
          selectedAppointment.dateTime.includes("T") &&
          !selectedAppointment.dateTime.includes("Z")
            ? parseDateTimeLocal(selectedAppointment.dateTime)
            : selectedAppointment.dateTime,
        type: selectedAppointment.type,
        status: selectedAppointment.status,
        notes: selectedAppointment.notes,
      };

      try {
        // Try to call the API to update appointment
        await updateAppointment(selectedAppointment.id, appointmentData);
        showNotification("Appointment updated successfully!", "success");
      } catch (apiError) {
        console.warn("API update failed, updating local state:", apiError);
        // If API fails, update local state as fallback
        setLocalAppointments((prev) =>
          prev.map((apt) =>
            apt.id === selectedAppointment.id
              ? { ...selectedAppointment, dateTime: appointmentData.dateTime }
              : apt
          )
        );
        showNotification("Appointment updated locally!", "success");
      }

      setShowEditModal(false);
      setSelectedAppointment(null);

      // Refresh appointments from API
      fetchAppointments().catch(() => {
        console.log("Using local appointments");
      });
    } catch (err) {
      showNotification("Failed to update appointment", "error");
      console.error("Update appointment error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!confirm("Are you sure you want to delete this appointment?")) {
      return;
    }

    try {
      try {
        // Try to call the API to delete appointment
        await deleteAppointment(appointmentId);
        showNotification("Appointment deleted successfully!", "success");
      } catch (apiError) {
        console.warn("API delete failed, updating local state:", apiError);
        // If API fails, update local state as fallback
        setLocalAppointments((prev) =>
          prev.filter((apt) => apt.id !== appointmentId)
        );
        showNotification("Appointment deleted locally!", "success");
      }

      // Refresh appointments from API
      fetchAppointments().catch(() => {
        console.log("Using local appointments");
      });
    } catch (err) {
      showNotification("Failed to delete appointment", "error");
      console.error("Delete appointment error:", err);
    }
  };

  const resetAppointmentForm = () => {
    setAppointmentForm({
      studentId: "",
      dateTime: "",
      type: "in_person",
      notes: "",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      no_show: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getTypeIcon = (type) => {
    return type === "virtual" ? Video : MapPin;
  };

  // Filter appointments
  const filteredAppointments = allAppointments.filter((appointment) => {
    const matchesStatus =
      !filters.status || appointment.status === filters.status;
    const matchesType = !filters.type || appointment.type === filters.type;
    const matchesSearch =
      !filters.search ||
      appointment.student?.name
        ?.toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      appointment.student?.email
        ?.toLowerCase()
        .includes(filters.search.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  // Get student options for dropdown
  const studentOptions = leads.map((lead) => ({
    id: lead.student?.id || lead.studentId,
    name: lead.student?.name || "Unknown Student",
    email: lead.student?.email || "N/A",
  }));

  if (loading && allAppointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Appointment Management
          </h1>
          <p className="text-gray-600">
            Schedule and manage student appointments
          </p>
        </div>

        <div className="flex space-x-3">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 text-sm font-medium border ${
                viewMode === "table"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              } rounded-l-md`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 text-sm font-medium border-t border-r border-b ${
                viewMode === "calendar"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              } rounded-r-md`}
            >
              Calendar View
            </button>
          </div>

          <Button onClick={() => setShowScheduleModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by student name or email..."
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
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>

          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="in_person">In Person</option>
            <option value="virtual">Virtual</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Total: {filteredAppointments.length} appointments
          </div>
        </div>
      </Card>

      {/* Appointments Table View */}
      {viewMode === "table" && (
        <AppointmentTableView
          appointments={filteredAppointments}
          onView={(appointment) => {
            setSelectedAppointment(appointment);
            setShowViewModal(true);
          }}
          onEdit={(appointment) => {
            setSelectedAppointment(appointment);
            setShowEditModal(true);
          }}
          onDelete={handleDeleteAppointment}
          onJoin={(appointment) => {
            // Handle join meeting functionality
            console.log('Join meeting:', appointment);
          }}
          getStatusColor={getStatusColor}
          getTypeIcon={getTypeIcon}
        />
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <AppointmentCalendarView
          appointments={filteredAppointments}
          onAppointmentClick={(appointment) => {
            setSelectedAppointment(appointment);
            setShowViewModal(true);
          }}
          getStatusColor={getStatusColor}
          getTypeIcon={getTypeIcon}
        />
      )}

      {/* Schedule Appointment Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          resetAppointmentForm();
        }}
        title="Schedule New Appointment"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student *
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={appointmentForm.studentId}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  studentId: e.target.value,
                })
              }
            >
              <option value="">Select a student...</option>
              {studentOptions.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time *
            </label>
            <Input
              type="datetime-local"
              value={formatDateTimeLocal(appointmentForm.dateTime)}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  dateTime: e.target.value, // Store as datetime-local string temporarily
                })
              }
              min={formatDateTimeLocal(new Date().toISOString())}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Type
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={appointmentForm.type}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  type: e.target.value,
                })
              }
            >
              <option value="in_person">In Person</option>
              <option value="virtual">Virtual</option>
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
              placeholder="Enter appointment notes..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowScheduleModal(false);
                resetAppointmentForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleAppointment}
              disabled={
                isSubmitting ||
                !appointmentForm.studentId ||
                !appointmentForm.dateTime
              }
            >
              {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Appointment Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedAppointment(null);
        }}
        title="Appointment Details"
        size="lg"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            {/* Student Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                Student Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <p className="text-gray-900">
                    {selectedAppointment.student?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="text-gray-900">
                    {selectedAppointment.student?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <p className="text-gray-900">
                    {selectedAppointment.student?.phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Appointment Info */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                Appointment Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date & Time
                  </label>
                  <p className="text-gray-900">
                    {new Date(selectedAppointment.dateTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <div className="flex items-center">
                    {selectedAppointment.type === "virtual" ? (
                      <Video className="h-4 w-4 mr-2 text-blue-500" />
                    ) : (
                      <MapPin className="h-4 w-4 mr-2 text-green-500" />
                    )}
                    <span className="capitalize">
                      {selectedAppointment.type.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <Badge className={getStatusColor(selectedAppointment.status)}>
                    {selectedAppointment.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Created
                  </label>
                  <p className="text-gray-900">
                    {new Date(
                      selectedAppointment.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedAppointment.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-900">{selectedAppointment.notes}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAppointment(selectedAppointment);
                  setShowEditModal(true);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAppointment(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Appointment Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAppointment(null);
        }}
        title="Edit Appointment"
        size="lg"
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student
              </label>
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">
                    {selectedAppointment.student?.name || "N/A"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedAppointment.student?.email || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date & Time
              </label>
              <Input
                type="datetime-local"
                value={formatDateTimeLocal(selectedAppointment.dateTime)}
                onChange={(e) =>
                  setSelectedAppointment({
                    ...selectedAppointment,
                    dateTime: e.target.value, // Store as datetime-local string temporarily
                  })
                }
                min={formatDateTimeLocal(new Date().toISOString())}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Type
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedAppointment.type}
                onChange={(e) =>
                  setSelectedAppointment({
                    ...selectedAppointment,
                    type: e.target.value,
                  })
                }
              >
                <option value="in_person">In Person</option>
                <option value="virtual">Virtual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedAppointment.status}
                onChange={(e) =>
                  setSelectedAppointment({
                    ...selectedAppointment,
                    status: e.target.value,
                  })
                }
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                value={selectedAppointment.notes || ""}
                onChange={(e) =>
                  setSelectedAppointment({
                    ...selectedAppointment,
                    notes: e.target.value,
                  })
                }
                placeholder="Enter appointment notes..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAppointment(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleEditAppointment} disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Appointment"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AppointmentManagement;