import React, { useState, useEffect } from "react";
import useApi from "../../hooks/useApi";
import useAuthStore from "../../stores/authStore";
import usePermissions from "../../hooks/usePermissions";
import { validateInput } from "../../utils/validators";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Toast from "../../components/ui/Toast";
// import Calendar from "../../components/ui/Calendar";
import {
  Calendar as CalendarIcon,
  Search,
  UserCheck,
  Clock,
  Shield,
} from "lucide-react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US"; // or your preferred locale

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday
  getDay,
  locales,
});

const ConsultantCalendars = () => {
  const { user } = useAuthStore();
  const { callApi, services, loading: apiLoading, error: apiError } = useApi();
  const { hasPermission } = usePermissions();
  const [events, setEvents] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [filters, setFilters] = useState({
    consultantId: "",
    search: "",
    startDate: "",
    endDate: "",
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
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
    if (user && hasPermission("view", "calendars")) {
      fetchConsultants();
      fetchEvents();
    }
  }, [user, filters]);

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

  const fetchEvents = async () => {
    try {
      const params = {
        consultantId: filters.consultantId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      };
      const [appointments, schedules] = await Promise.all([
        callApi(services.appointment.getAppointments, params),
        callApi(services.schedule.getSchedules, params),
      ]);

      const appointmentEvents =
        appointments?.map((appointment) => ({
          id: appointment.id,
          title: `${validateInput(appointment.clientName || "Unknown")} - ${
            appointment.status
          }`,
          start: new Date(appointment.startTime),
          end: new Date(appointment.endTime),
          resourceId: appointment.consultantId,
          type: "appointment",
          data: {
            clientName: validateInput(appointment.clientName || "Unknown"),
            consultantName: validateInput(
              appointment.consultantName || "Unknown"
            ),
            status: appointment.status,
            notes: validateInput(appointment.notes || ""),
          },
        })) || [];

      const scheduleEvents =
        schedules?.map((schedule) => ({
          id: `schedule-${schedule.id}`,
          title: schedule.isAvailable ? "Available" : "Unavailable",
          start: new Date(schedule.startTime),
          end: new Date(schedule.endTime),
          resourceId: schedule.consultantId,
          type: "schedule",
          data: {
            isAvailable: schedule.isAvailable,
          },
        })) || [];

      setEvents([...appointmentEvents, ...scheduleEvents]);
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to fetch calendar events",
        type: "error",
      });
    }
  };

  const handleEventClick = (event) => {
    if (event.type === "appointment") {
      setSelectedEvent(event);
      setShowDetailsModal(true);
    }
  };

  const getEventStyle = (event) => {
    if (event.type === "schedule") {
      return {
        style: {
          backgroundColor: event.data.isAvailable
            ? "rgba(144, 238, 144, 0.3)"
            : "rgba(255, 99, 132, 0.3)",
          border: "1px solid",
          borderColor: event.data.isAvailable ? "#90EE90" : "#FF6347",
          color: "#333",
        },
      };
    }
    const status = appointmentStatuses.find(
      (s) => s.value === event.data.status
    );
    return {
      style: {
        backgroundColor: status ? status.color.split(" ")[0] : "#D3D3D3",
        border: "1px solid",
        borderColor: status ? status.color.split(" ")[0] : "#A9A9A9",
        color: "#333",
      },
    };
  };

  const filteredEvents = events.filter((event) => {
    if (!filters.search) return true;
    if (event.type === "appointment") {
      return (
        event.data.clientName
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        event.data.consultantName
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      );
    }
    return false; // Only search appointments, not schedule slots
  });

  if (apiLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hasPermission("view", "calendars")) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Access Denied
        </h3>
        <p className="text-gray-600">
          You do not have permission to view consultant calendars.
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
            Consultant Calendars
          </h1>
          <p className="text-gray-600">
            View consultant appointments and availability.
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
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            placeholder="Start Date"
          />
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            placeholder="End Date"
          />
        </div>
      </Card>

      {/* Calendar */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Consultant Calendars</h3>
        {filteredEvents.length === 0 && !filters.consultantId ? (
          <div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600">
              {Object.values(filters).some((f) => f)
                ? "No events match your current filters."
                : "Select a consultant to view their calendar."}
            </p>
          </div>
        ) : (
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              resources={
                filters.consultantId
                  ? [
                      {
                        resourceId: filters.consultantId,
                        resourceTitle:
                          consultants.find((c) => c.id === filters.consultantId)
                            ?.name || "Unknown",
                      },
                    ]
                  : consultants.map((consultant) => ({
                      resourceId: consultant.id,
                      resourceTitle: consultant.name,
                    }))
              }
              resourceIdAccessor="resourceId"
              resourceTitleAccessor="resourceTitle"
              views={["month", "week", "day"]}
              defaultView="week"
              onSelectEvent={handleEventClick}
              eventPropGetter={getEventStyle}
              step={15}
              timeslots={4}
            />
          </div>
        )}
      </Card>

      {/* Appointment Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedEvent(null);
        }}
        title="Appointment Details"
        size="md"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Client
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {selectedEvent.data.clientName}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Consultant
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {selectedEvent.data.consultantName}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedEvent.start.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedEvent.end.toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <Badge className={getStatusColor(selectedEvent.data.status)}>
                {
                  appointmentStatuses.find(
                    (s) => s.value === selectedEvent.data.status
                  )?.label
                }
              </Badge>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {selectedEvent.data.notes || "N/A"}
              </p>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedEvent(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const getStatusColor = (status) =>
  appointmentStatuses.find((s) => s.value === status)?.color ||
  "bg-gray-100 text-gray-800";

export default ConsultantCalendars;
