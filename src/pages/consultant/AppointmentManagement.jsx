// pages/consultant/AppointmentManagement.jsx
import React, { useState, useEffect } from "react";
import useApi from "../../hooks/useApi";
import DataTable from "../../components/tables/DataTable";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Calendar from "../../components/calendar/Calendar";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  User,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";

const AppointmentManagement = () => {
  const { request, loading } = useApi();
  const [appointments, setAppointments] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'calendar'
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    dateRange: "",
    search: "",
  });

  const [appointmentForm, setAppointmentForm] = useState({
    studentId: "",
    dateTime: "",
    type: "in_person",
    notes: "",
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      // Since there's no direct appointments endpoint for consultants,
      // we'll get leads and extract appointment info
      const response = await request("/consultant/leads");
      const leads = response || [];

      // This would need to be adjusted based on your actual API structure
      // For now, we'll simulate appointments from leads
      const mockAppointments = leads.map((lead) => ({
        id: `apt-${lead.id}`,
        studentId: lead.studentId,
        student: lead.student,
        dateTime: new Date(
          Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        type: Math.random() > 0.5 ? "virtual" : "in_person",
        status: "scheduled",
        notes: "Initial consultation",
      }));

      setAppointments(mockAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleScheduleAppointment = async () => {
    try {
      await request(
        `/consultant/students/${appointmentForm.studentId}/meetings`,
        {
          method: "POST",
          data: appointmentForm,
        }
      );

      setShowScheduleModal(false);
      setAppointmentForm({
        studentId: "",
        dateTime: "",
        type: "in_person",
        notes: "",
      });
      fetchAppointments();
    } catch (error) {
      console.error("Error scheduling appointment:", error);
    }
  };

  const handleEditAppointment = async () => {
    try {
      // This would need the actual appointment update endpoint
      console.log("Updating appointment:", selectedAppointment);

      setShowEditModal(false);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
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

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesStatus =
      !filters.status || appointment.status === filters.status;
    const matchesType = !filters.type || appointment.type === filters.type;
    const matchesSearch =
      !filters.search ||
      appointment.student?.name
        ?.toLowerCase()
        .includes(filters.search.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  const columns = [
    {
      key: "student.name",
      label: "Student",
      render: (appointment) => (
        <div className="flex items-center">
          <User className="h-8 w-8 text-gray-400 mr-3" />
          <div>
            <div className="font-medium text-gray-900">
              {appointment.student?.name || "N/A"}
            </div>
            <div className="text-sm text-gray-500">
              {appointment.student?.email || "N/A"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "dateTime",
      label: "Date & Time",
      render: (appointment) => {
        const date = new Date(appointment.dateTime);
        return (
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
            <div>
              <div className="font-medium text-gray-900">
                {date.toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-500">
                {date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "type",
      label: "Type",
      render: (appointment) => {
        const IconComponent = getTypeIcon(appointment.type);
        return (
          <div className="flex items-center">
            <IconComponent className="h-4 w-4 text-gray-400 mr-2" />
            <span className="capitalize">
              {appointment.type.replace("_", " ")}
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (appointment) => (
        <Badge className={getStatusColor(appointment.status)}>
          {appointment.status.replace("_", " ").toUpperCase()}
        </Badge>
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
              setShowEditModal(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>

          {appointment.type === "virtual" &&
            appointment.status === "scheduled" && (
              <Button size="sm">
                <Video className="h-4 w-4 mr-1" />
                Join
              </Button>
            )}
        </div>
      ),
    },
  ];

  // Convert appointments to calendar events
  const calendarEvents = filteredAppointments.map((appointment) => ({
    id: appointment.id,
    title: appointment.student?.name || "Appointment",
    start: appointment.dateTime,
    end: new Date(
      new Date(appointment.dateTime).getTime() + 60 * 60 * 1000
    ).toISOString(),
    type: appointment.type,
    status: appointment.status,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search by student name..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />

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
            Total: {filteredAppointments.length} appointments
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-lg shadow">
          <DataTable
            data={filteredAppointments}
            columns={columns}
            searchable={false}
            pagination={true}
            pageSize={10}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <Calendar
            events={calendarEvents}
            onEventClick={(event) => {
              const appointment = appointments.find(
                (apt) => apt.id === event.id
              );
              setSelectedAppointment(appointment);
              setShowEditModal(true);
            }}
            onDateSelect={(date) => {
              setAppointmentForm({
                ...appointmentForm,
                dateTime: date.toISOString(),
              });
              setShowScheduleModal(true);
            }}
          />
        </div>
      )}

      {/* Schedule Appointment Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setAppointmentForm({
            studentId: "",
            dateTime: "",
            type: "in_person",
            notes: "",
          });
        }}
        title="Schedule New Appointment"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student ID
            </label>
            <Input
              value={appointmentForm.studentId}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  studentId: e.target.value,
                })
              }
              placeholder="Enter student ID..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time
            </label>
            <Input
              type="datetime-local"
              value={
                appointmentForm.dateTime
                  ? new Date(appointmentForm.dateTime)
                      .toISOString()
                      .slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  dateTime: new Date(e.target.value).toISOString(),
                })
              }
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

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowScheduleModal(false);
                setAppointmentForm({
                  studentId: "",
                  dateTime: "",
                  type: "in_person",
                  notes: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleScheduleAppointment}>
              Schedule Appointment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Appointment Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAppointment(null);
        }}
        title="Edit Appointment"
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
                value={new Date(selectedAppointment.dateTime)
                  .toISOString()
                  .slice(0, 16)}
                onChange={(e) =>
                  setSelectedAppointment({
                    ...selectedAppointment,
                    dateTime: new Date(e.target.value).toISOString(),
                  })
                }
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

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAppointment(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditAppointment}>
                Update Appointment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AppointmentManagement;
