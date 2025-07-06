import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Users,
  Search,
  Filter,
  Plus,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Video,
  UserCheck,
  Save,
  X,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
} from "lucide-react";
import { toast } from "react-toastify";
import receptionistService from "../../services/receptionistService";
import useAuthStore from "../../stores/authStore";

const AppointmentBooking = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [consultants, setConsultants] = useState([]);
  const [students, setStudents] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedConsultant, setSelectedConsultant] = useState("all");

  const [formData, setFormData] = useState({
    studentId: "",
    consultantId: "",
    dateTime: "",
    endTime: "",
    type: "in_person",
    notes: "",
    priority: "normal",
  });

  const [errors, setErrors] = useState({});
  const [editingAppointment, setEditingAppointment] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [consultantCalendars, waitingList] = await Promise.all([
        receptionistService.getConsultantCalendars(),
        receptionistService.getWaitingList(),
      ]);

      // Extract unique consultants
      const uniqueConsultants =
        consultantCalendars?.reduce((acc, appointment) => {
          if (
            appointment.consultant &&
            !acc.find((c) => c.id === appointment.consultant.id)
          ) {
            acc.push(appointment.consultant);
          }
          return acc;
        }, []) || [];

      // Extract students from appointments and waiting list
      const appointmentStudents =
        consultantCalendars?.map((apt) => apt.student).filter(Boolean) || [];
      const waitingStudents = waitingList || [];
      const allStudents = [...appointmentStudents, ...waitingStudents].reduce(
        (acc, student) => {
          if (!acc.find((s) => s.id === student.id)) {
            acc.push(student);
          }
          return acc;
        },
        []
      );

      setConsultants(uniqueConsultants);
      setStudents(allStudents);
      setAppointments(consultantCalendars || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load appointment data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }

    // Auto-set end time when start time is selected
    if (field === "dateTime" && value) {
      const startTime = new Date(value);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Add 1 hour
      setFormData((prev) => ({
        ...prev,
        endTime: endTime.toISOString().slice(0, 16),
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentId) {
      newErrors.studentId = "Student selection is required";
    }
    if (!formData.consultantId) {
      newErrors.consultantId = "Consultant selection is required";
    }
    if (!formData.dateTime) {
      newErrors.dateTime = "Date and time are required";
    } else {
      const appointmentDate = new Date(formData.dateTime);
      const now = new Date();
      if (appointmentDate < now) {
        newErrors.dateTime = "Appointment cannot be scheduled in the past";
      }
    }
    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    } else if (formData.dateTime) {
      const startTime = new Date(formData.dateTime);
      const endTime = new Date(formData.endTime);
      if (endTime <= startTime) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const appointmentData = {
        ...formData,
        dateTime: new Date(formData.dateTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      };

      if (editingAppointment) {
        await receptionistService.rescheduleAppointment(
          editingAppointment.id,
          appointmentData
        );
        toast.success("Appointment updated successfully!");
      } else {
        await receptionistService.bookAppointment(appointmentData);
        toast.success("Appointment booked successfully!");
      }

      // Reset form and refresh data
      resetForm();
      fetchInitialData();
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast.error(error.message || "Failed to save appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: "",
      consultantId: "",
      dateTime: "",
      endTime: "",
      type: "in_person",
      notes: "",
      priority: "normal",
    });
    setErrors({});
    setShowBookingForm(false);
    setEditingAppointment(null);
  };

  const handleEdit = (appointment) => {
    setFormData({
      studentId: appointment.studentId,
      consultantId: appointment.consultantId,
      dateTime: new Date(appointment.dateTime).toISOString().slice(0, 16),
      endTime: appointment.endTime
        ? new Date(appointment.endTime).toISOString().slice(0, 16)
        : "",
      type: appointment.type,
      notes: appointment.notes || "",
      priority: appointment.priority || "normal",
    });
    setEditingAppointment(appointment);
    setShowBookingForm(true);
  };

  const handleCancel = async (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await receptionistService.cancelAppointment(appointmentId);
        toast.success("Appointment cancelled successfully");
        fetchInitialData();
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        toast.error("Failed to cancel appointment");
      }
    }
  };

  const handleCheckIn = async (appointmentId) => {
    try {
      await receptionistService.checkInStudent(appointmentId);
      toast.success("Student checked in successfully");
      fetchInitialData();
    } catch (error) {
      console.error("Error checking in student:", error);
      toast.error("Failed to check in student");
    }
  };

  const sendReminder = async (appointmentId) => {
    try {
      await receptionistService.sendAppointmentReminder(appointmentId, {
        message: "Reminder: You have an upcoming appointment.",
      });
      toast.success("Reminder sent successfully");
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error("Failed to send reminder");
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      !searchTerm ||
      appointment.student?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.consultant?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesDate =
      !filterDate ||
      new Date(appointment.dateTime).toDateString() ===
        new Date(filterDate).toDateString();

    const matchesStatus =
      filterStatus === "all" || appointment.status === filterStatus;

    const matchesConsultant =
      selectedConsultant === "all" ||
      appointment.consultantId === selectedConsultant;

    return matchesSearch && matchesDate && matchesStatus && matchesConsultant;
  });

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-800",
      completed: "bg-purple-100 text-purple-800",
      canceled: "bg-red-100 text-red-800",
      no_show: "bg-gray-100 text-gray-800",
      in_progress: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      normal: "text-gray-600",
      high: "text-blue-600",
      urgent: "text-purple-600",
    };
    return colors[priority] || "text-gray-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold">Appointment Booking</h1>
                <p className="mt-2 opacity-90">
                  Manage and schedule appointments
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-75">Receptionist: {user?.name}</p>
              <p className="text-xs opacity-60">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Appointments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    appointments.filter((apt) => apt.status === "completed")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    appointments.filter((apt) => apt.status === "scheduled")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Available Consultants
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {consultants.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                />
              </div>

              {/* Date Filter */}
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
                <option value="no_show">No Show</option>
                <option value="in_progress">In Progress</option>
              </select>

              {/* Consultant Filter */}
              <select
                value={selectedConsultant}
                onChange={(e) => setSelectedConsultant(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Consultants</option>
                {consultants.map((consultant) => (
                  <option key={consultant.id} value={consultant.id}>
                    {consultant.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => fetchInitialData()}
                className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>

              <button
                onClick={() => setShowBookingForm(true)}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingAppointment
                      ? "Edit Appointment"
                      : "Book New Appointment"}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-1 text-blue-600" />
                      Select Student *
                    </label>
                    <select
                      value={formData.studentId}
                      onChange={(e) =>
                        handleInputChange("studentId", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.studentId ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Choose a student</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} - {student.email}
                        </option>
                      ))}
                    </select>
                    {errors.studentId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.studentId}
                      </p>
                    )}
                  </div>

                  {/* Consultant Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="h-4 w-4 inline mr-1 text-purple-600" />
                      Select Consultant *
                    </label>
                    <select
                      value={formData.consultantId}
                      onChange={(e) =>
                        handleInputChange("consultantId", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.consultantId
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Choose a consultant</option>
                      {consultants.map((consultant) => (
                        <option key={consultant.id} value={consultant.id}>
                          {consultant.name}
                        </option>
                      ))}
                    </select>
                    {errors.consultantId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.consultantId}
                      </p>
                    )}
                  </div>

                  {/* Start Date & Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 inline mr-1 text-blue-600" />
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.dateTime}
                      onChange={(e) =>
                        handleInputChange("dateTime", e.target.value)
                      }
                      min={new Date().toISOString().slice(0, 16)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.dateTime ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.dateTime && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.dateTime}
                      </p>
                    )}
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="h-4 w-4 inline mr-1 text-blue-600" />
                      End Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) =>
                        handleInputChange("endTime", e.target.value)
                      }
                      min={formData.dateTime}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.endTime ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.endTime && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.endTime}
                      </p>
                    )}
                  </div>

                  {/* Appointment Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Type
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="in_person"
                          checked={formData.type === "in_person"}
                          onChange={(e) =>
                            handleInputChange("type", e.target.value)
                          }
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <UserCheck className="h-4 w-4 mr-1 text-blue-600" />
                        In-Person
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="virtual"
                          checked={formData.type === "virtual"}
                          onChange={(e) =>
                            handleInputChange("type", e.target.value)
                          }
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <Video className="h-4 w-4 mr-1 text-purple-600" />
                        Virtual
                      </label>
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        handleInputChange("priority", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add any additional notes for the appointment..."
                  />
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingAppointment ? "Updating..." : "Booking..."}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Save className="h-4 w-4 mr-2" />
                        {editingAppointment
                          ? "Update Appointment"
                          : "Book Appointment"}
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Appointments ({filteredAppointments.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No appointments found
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || filterDate || filterStatus !== "all"
                    ? "Try adjusting your filters or search terms"
                    : "No appointments have been scheduled yet"}
                </p>
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Book First Appointment
                </button>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Consultant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.student?.name || "Unknown Student"}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {appointment.student?.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <Users className="h-4 w-4 text-purple-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.consultant?.name || "Unassigned"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(appointment.dateTime).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(appointment.dateTime).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                          {appointment.endTime && (
                            <span>
                              {" "}
                              -{" "}
                              {new Date(appointment.endTime).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {appointment.type === "virtual" ? (
                            <Video className="h-4 w-4 text-purple-600 mr-2" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-blue-600 mr-2" />
                          )}
                          <span className="text-sm text-gray-900 capitalize">
                            {appointment.type.replace("_", " ")}
                          </span>
                        </div>
                        {appointment.priority &&
                          appointment.priority !== "normal" && (
                            <div
                              className={`text-xs font-medium ${getPriorityColor(
                                appointment.priority
                              )}`}
                            >
                              {appointment.priority.toUpperCase()}
                            </div>
                          )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status.replace("_", " ").toUpperCase()}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {appointment.status === "scheduled" && (
                            <>
                              <button
                                onClick={() => handleCheckIn(appointment.id)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                title="Check In"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => sendReminder(appointment.id)}
                                className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                                title="Send Reminder"
                              >
                                <AlertCircle className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => handleEdit(appointment)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => handleCancel(appointment.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="Cancel"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}

                          {appointment.status !== "scheduled" && (
                            <button
                              onClick={() => {
                                // View appointment details
                                alert(
                                  `Appointment Details:\n\nStudent: ${
                                    appointment.student?.name
                                  }\nConsultant: ${
                                    appointment.consultant?.name
                                  }\nDate: ${new Date(
                                    appointment.dateTime
                                  ).toLocaleString()}\nType: ${
                                    appointment.type
                                  }\nStatus: ${appointment.status}\nNotes: ${
                                    appointment.notes || "None"
                                  }`
                                );
                              }}
                              className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() =>
                (window.location.href = "/receptionist/consultant-calendars")
              }
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                View Consultant Calendars
              </span>
            </button>

            <button
              onClick={() =>
                (window.location.href = "/receptionist/waiting-list")
              }
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Clock className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                Manage Waiting List
              </span>
            </button>

            <button
              onClick={() =>
                (window.location.href = "/receptionist/walk-in-registration")
              }
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UserCheck className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                Register Walk-in
              </span>
            </button>

            <button
              onClick={() => (window.location.href = "/receptionist/dashboard")}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                Back to Dashboard
              </span>
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Appointment Management Tips
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use filters to quickly find specific appointments</li>
                <li>
                  • Check students in when they arrive for their appointments
                </li>
                <li>• Send reminders to reduce no-shows</li>
                <li>• Schedule appointments at least 15 minutes apart</li>
                <li>
                  • Virtual appointments require stable internet connection
                </li>
                <li>
                  • Cancel appointments as early as possible to free up slots
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;

// import React, { useState, useEffect } from "react";
// import useApi from "../../hooks/useApi";
// import useAuthStore from "../../stores/authStore";
// import usePermissions from "../../hooks/usePermissions";
// import { validateAppointmentForm, validateInput } from "../../utils/validators";
// import Card from "../../components/ui/Card";
// import Button from "../../components/ui/Button";
// import Badge from "../../components/ui/Badge";
// import Modal from "../../components/ui/Modal";
// import Input from "../../components/ui/Input";
// import LoadingSpinner from "../../components/ui/LoadingSpinner";
// import Toast from "../../components/ui/Toast";
// import DataTable from "../../components/tables/DataTable";
// import {
//   Calendar,
//   Plus,
//   Edit,
//   Trash2,
//   Search,
//   UserCheck,
//   Clock,
//   Shield,
// } from "lucide-react";

// const AppointmentBooking = () => {
//   const { user } = useAuthStore();
//   const { callApi, services, loading: apiLoading, error: apiError } = useApi();
//   const { hasPermission } = usePermissions();
//   const [appointments, setAppointments] = useState([]);
//   const [consultants, setConsultants] = useState([]);
//   const [clients, setClients] = useState([]);
//   const [availableSlots, setAvailableSlots] = useState([]);
//   const [filters, setFilters] = useState({
//     search: "",
//     consultantId: "",
//     date: "",
//   });
//   const [showBookModal, setShowBookModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedAppointment, setSelectedAppointment] = useState(null);
//   const [formErrors, setFormErrors] = useState({});
//   const [toast, setToast] = useState({
//     show: false,
//     message: "",
//     type: "success",
//   });

//   const [appointmentForm, setAppointmentForm] = useState({
//     clientId: "",
//     consultantId: "",
//     startTime: "",
//     endTime: "",
//     status: "scheduled",
//     notes: "",
//   });

//   const appointmentStatuses = [
//     {
//       value: "scheduled",
//       label: "Scheduled",
//       color: "bg-blue-100 text-blue-800",
//     },
//     {
//       value: "confirmed",
//       label: "Confirmed",
//       color: "bg-green-100 text-green-800",
//     },
//     {
//       value: "cancelled",
//       label: "Cancelled",
//       color: "bg-red-100 text-red-800",
//     },
//     {
//       value: "completed",
//       label: "Completed",
//       color: "bg-purple-100 text-purple-800",
//     },
//   ];

//   useEffect(() => {
//     if (user && hasPermission("manage", "appointments")) {
//       fetchConsultants();
//       fetchClients();
//       fetchAppointments();
//     }
//   }, [user]);

//   const fetchConsultants = async () => {
//     try {
//       const response = await callApi(services.user.getTeamMembers);
//       setConsultants(
//         response
//           ?.filter((member) => member.role === "consultant")
//           .map((member) => ({
//             id: member.id,
//             name: validateInput(member.name),
//           })) || []
//       );
//     } catch (error) {
//       setToast({
//         show: true,
//         message: apiError || "Failed to fetch consultants",
//         type: "error",
//       });
//     }
//   };

//   const fetchClients = async () => {
//     try {
//       const response = await callApi(services.user.getClients);
//       setClients(
//         response?.map((client) => ({
//           id: client.id,
//           name: validateInput(client.name),
//         })) || []
//       );
//     } catch (error) {
//       setToast({
//         show: true,
//         message: apiError || "Failed to fetch clients",
//         type: "error",
//       });
//     }
//   };

//   const fetchAppointments = async () => {
//     try {
//       const response = await callApi(services.appointment.getAppointments);
//       setAppointments(
//         response?.map((appointment) => ({
//           id: appointment.id,
//           clientId: appointment.clientId,
//           clientName: validateInput(appointment.clientName || "Unknown"),
//           consultantId: appointment.consultantId,
//           consultantName: validateInput(
//             appointment.consultantName || "Unknown"
//           ),
//           startTime: appointment.startTime,
//           endTime: appointment.endTime,
//           status: appointment.status,
//           notes: validateInput(appointment.notes || ""),
//         })) || []
//       );
//     } catch (error) {
//       setToast({
//         show: true,
//         message: apiError || "Failed to fetch appointments",
//         type: "error",
//       });
//     }
//   };

//   const fetchAvailableSlots = async (consultantId, date) => {
//     if (!consultantId || !date) return;
//     try {
//       const response = await callApi(services.schedule.getAvailableSlots, {
//         consultantId,
//         date,
//       });
//       setAvailableSlots(
//         response?.map((slot) => ({
//           startTime: slot.startTime,
//           endTime: slot.endTime,
//         })) || []
//       );
//     } catch (error) {
//       setToast({
//         show: true,
//         message: apiError || "Failed to fetch available slots",
//         type: "error",
//       });
//     }
//   };

//   const handleBookAppointment = async () => {
//     const validationErrors = validateAppointmentForm(appointmentForm);
//     if (Object.keys(validationErrors).length) {
//       setFormErrors(validationErrors);
//       return;
//     }

//     try {
//       const newAppointment = await callApi(
//         services.appointment.createAppointment,
//         {
//           ...appointmentForm,
//           startTime: new Date(appointmentForm.startTime).toISOString(),
//           endTime: new Date(appointmentForm.endTime).toISOString(),
//           notes: validateInput(appointmentForm.notes),
//         }
//       );
//       setAppointments((prev) => [
//         ...prev,
//         {
//           ...newAppointment,
//           clientName:
//             clients.find((c) => c.id === newAppointment.clientId)?.name ||
//             "Unknown",
//           consultantName:
//             consultants.find((c) => c.id === newAppointment.consultantId)
//               ?.name || "Unknown",
//         },
//       ]);
//       setShowBookModal(false);
//       resetForm();
//       setToast({
//         show: true,
//         message: "Appointment booked successfully!",
//         type: "success",
//       });
//     } catch (error) {
//       setToast({
//         show: true,
//         message: apiError || "Failed to book appointment",
//         type: "error",
//       });
//     }
//   };

//   const handleEditAppointment = async () => {
//     const validationErrors = validateAppointmentForm(appointmentForm);
//     if (Object.keys(validationErrors).length) {
//       setFormErrors(validationErrors);
//       return;
//     }

//     try {
//       const updatedAppointment = await callApi(
//         services.appointment.updateAppointment,
//         selectedAppointment.id,
//         {
//           ...appointmentForm,
//           startTime: new Date(appointmentForm.startTime).toISOString(),
//           endTime: new Date(appointmentForm.endTime).toISOString(),
//           notes: validateInput(appointmentForm.notes),
//         }
//       );
//       setAppointments((prev) =>
//         prev.map((appointment) =>
//           appointment.id === selectedAppointment.id
//             ? {
//                 ...updatedAppointment,
//                 clientName:
//                   clients.find((c) => c.id === updatedAppointment.clientId)
//                     ?.name || "Unknown",
//                 consultantName:
//                   consultants.find(
//                     (c) => c.id === updatedAppointment.consultantId
//                   )?.name || "Unknown",
//               }
//             : appointment
//         )
//       );
//       setShowEditModal(false);
//       setSelectedAppointment(null);
//       resetForm();
//       setToast({
//         show: true,
//         message: "Appointment updated successfully!",
//         type: "success",
//       });
//     } catch (error) {
//       setToast({
//         show: true,
//         message: apiError || "Failed to update appointment",
//         type: "error",
//       });
//     }
//   };

//   const handleCancelAppointment = async (appointmentId) => {
//     if (!window.confirm("Are you sure you want to cancel this appointment?"))
//       return;

//     try {
//       await callApi(services.appointment.cancelAppointment, appointmentId);
//       setAppointments((prev) =>
//         prev.map((appointment) =>
//           appointment.id === appointmentId
//             ? { ...appointment, status: "cancelled" }
//             : appointment
//         )
//       );
//       setToast({
//         show: true,
//         message: "Appointment cancelled successfully!",
//         type: "success",
//       });
//     } catch (error) {
//       setToast({
//         show: true,
//         message: apiError || "Failed to cancel appointment",
//         type: "error",
//       });
//     }
//   };

//   const resetForm = () => {
//     setAppointmentForm({
//       clientId: "",
//       consultantId: "",
//       startTime: "",
//       endTime: "",
//       status: "scheduled",
//       notes: "",
//     });
//     setFormErrors({});
//     setAvailableSlots([]);
//   };

//   const filteredAppointments = appointments.filter((appointment) => {
//     const matchesSearch =
//       !filters.search ||
//       appointment.clientName
//         .toLowerCase()
//         .includes(filters.search.toLowerCase()) ||
//       appointment.consultantName
//         .toLowerCase()
//         .includes(filters.search.toLowerCase());
//     const matchesConsultant =
//       !filters.consultantId ||
//       appointment.consultantId === filters.consultantId;
//     const matchesDate =
//       !filters.date ||
//       new Date(appointment.startTime).toDateString() ===
//         new Date(filters.date).toDateString();
//     return matchesSearch && matchesConsultant && matchesDate;
//   });

//   const getStatusColor = (status) =>
//     appointmentStatuses.find((s) => s.value === status)?.color ||
//     "bg-gray-100 text-gray-800";

//   const columns = [
//     {
//       key: "clientName",
//       label: "Client",
//       render: (appointment) => (
//         <div className="flex items-center">
//           <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
//           <span className="text-sm">{appointment.clientName}</span>
//         </div>
//       ),
//     },
//     {
//       key: "consultantName",
//       label: "Consultant",
//       render: (appointment) => (
//         <div className="flex items-center">
//           <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
//           <span className="text-sm">{appointment.consultantName}</span>
//         </div>
//       ),
//     },
//     {
//       key: "startTime",
//       label: "Start Time",
//       render: (appointment) => (
//         <div className="flex items-center text-sm text-gray-600">
//           <Clock className="h-4 w-4 mr-1" />
//           {new Date(appointment.startTime).toLocaleString()}
//         </div>
//       ),
//     },
//     {
//       key: "endTime",
//       label: "End Time",
//       render: (appointment) => (
//         <div className="flex items-center text-sm text-gray-600">
//           <Clock className="h-4 w-4 mr-1" />
//           {new Date(appointment.endTime).toLocaleString()}
//         </div>
//       ),
//     },
//     {
//       key: "status",
//       label: "Status",
//       render: (appointment) => (
//         <Badge className={getStatusColor(appointment.status)}>
//           {
//             appointmentStatuses.find((s) => s.value === appointment.status)
//               ?.label
//           }
//         </Badge>
//       ),
//     },
//     {
//       key: "notes",
//       label: "Notes",
//       render: (appointment) => (
//         <span className="text-sm">{appointment.notes || "N/A"}</span>
//       ),
//     },
//     {
//       key: "actions",
//       label: "Actions",
//       render: (appointment) => (
//         <div className="flex space-x-2">
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={() => {
//               setSelectedAppointment(appointment);
//               setAppointmentForm({
//                 clientId: appointment.clientId,
//                 consultantId: appointment.consultantId,
//                 startTime: new Date(appointment.startTime)
//                   .toISOString()
//                   .slice(0, 16),
//                 endTime: new Date(appointment.endTime)
//                   .toISOString()
//                   .slice(0, 16),
//                 status: appointment.status,
//                 notes: appointment.notes,
//               });
//               fetchAvailableSlots(
//                 appointment.consultantId,
//                 new Date(appointment.startTime).toISOString().slice(0, 10)
//               );
//               setShowEditModal(true);
//             }}
//             disabled={!hasPermission("edit", "appointments")}
//           >
//             <Edit className="h-4 w-4" />
//           </Button>
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={() => handleCancelAppointment(appointment.id)}
//             className="border-red-300 text-red-600 hover:bg-red-50"
//             disabled={
//               !hasPermission("delete", "appointments") ||
//               appointment.status === "cancelled"
//             }
//           >
//             <Trash2 className="h-4 w-4" />
//           </Button>
//         </div>
//       ),
//     },
//   ];

//   if (apiLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   if (!hasPermission("manage", "appointments")) {
//     return (
//       <div className="text-center py-8">
//         <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//         <h3 className="text-lg font-medium text-gray-900 mb-2">
//           Access Denied
//         </h3>
//         <p className="text-gray-600">
//           You do not have permission to manage appointments.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <Toast
//         isOpen={toast.show}
//         message={toast.message}
//         type={toast.type}
//         onClose={() => setToast({ ...toast, show: false })}
//       />

//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">
//             Appointment Booking
//           </h1>
//           <p className="text-gray-600">
//             Manage client appointments with consultants.
//           </p>
//         </div>
//         <Button
//           onClick={() => setShowBookModal(true)}
//           disabled={!hasPermission("create", "appointments")}
//         >
//           <Plus className="h-4 w-4 mr-2" />
//           Book Appointment
//         </Button>
//       </div>

//       {/* Filters */}
//       <Card className="p-4">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//             <Input
//               placeholder="Search by client or consultant..."
//               value={filters.search}
//               onChange={(e) =>
//                 setFilters({ ...filters, search: e.target.value })
//               }
//               className="pl-10"
//             />
//           </div>
//           <select
//             className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             value={filters.consultantId}
//             onChange={(e) =>
//               setFilters({ ...filters, consultantId: e.target.value })
//             }
//           >
//             <option value="">All Consultants</option>
//             {consultants.map((consultant) => (
//               <option key={consultant.id} value={consultant.id}>
//                 {consultant.name}
//               </option>
//             ))}
//           </select>
//           <Input
//             type="date"
//             value={filters.date}
//             onChange={(e) => setFilters({ ...filters, date: e.target.value })}
//             placeholder="Filter by date"
//           />
//           <div className="text-sm text-gray-600 flex items-center">
//             {filteredAppointments.length} of {appointments.length} appointments
//           </div>
//         </div>
//       </Card>

//       {/* Appointments Table */}
//       <Card className="p-4">
//         <h3 className="text-lg font-semibold mb-4">Appointments</h3>
//         {filteredAppointments.length === 0 ? (
//           <div className="text-center py-8">
//             <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">
//               No appointments found
//             </h3>
//             <p className="text-gray-600 mb-4">
//               {Object.values(filters).some((f) => f)
//                 ? "No appointments match your current filters."
//                 : "Book your first appointment to get started."}
//             </p>
//             <Button
//               onClick={() => setShowBookModal(true)}
//               disabled={!hasPermission("create", "appointments")}
//             >
//               <Plus className="h-4 w-4 mr-2" />
//               Book First Appointment
//             </Button>
//           </div>
//         ) : (
//           <DataTable
//             data={filteredAppointments}
//             columns={columns}
//             pagination={true}
//             pageSize={10}
//           />
//         )}
//       </Card>

//       {/* Book Appointment Modal */}
//       <Modal
//         isOpen={showBookModal}
//         onClose={() => {
//           setShowBookModal(false);
//           resetForm();
//         }}
//         title="Book Appointment"
//         size="lg"
//       >
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Client *
//             </label>
//             <select
//               className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
//                 formErrors.clientId ? "border-red-500" : ""
//               }`}
//               value={appointmentForm.clientId}
//               onChange={(e) =>
//                 setAppointmentForm({
//                   ...appointmentForm,
//                   clientId: e.target.value,
//                 })
//               }
//             >
//               <option value="">Select a client</option>
//               {clients.map((client) => (
//                 <option key={client.id} value={client.id}>
//                   {client.name}
//                 </option>
//               ))}
//             </select>
//             {formErrors.clientId && (
//               <p className="text-red-500 text-xs mt-1">{formErrors.clientId}</p>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Consultant *
//             </label>
//             <select
//               className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
//                 formErrors.consultantId ? "border-red-500" : ""
//               }`}
//               value={appointmentForm.consultantId}
//               onChange={(e) => {
//                 setAppointmentForm({
//                   ...appointmentForm,
//                   consultantId: e.target.value,
//                 });
//                 fetchAvailableSlots(
//                   e.target.value,
//                   appointmentForm.startTime.slice(0, 10)
//                 );
//               }}
//             >
//               <option value="">Select a consultant</option>
//               {consultants.map((consultant) => (
//                 <option key={consultant.id} value={consultant.id}>
//                   {consultant.name}
//                 </option>
//               ))}
//             </select>
//             {formErrors.consultantId && (
//               <p className="text-red-500 text-xs mt-1">
//                 {formErrors.consultantId}
//               </p>
//             )}
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Start Time *
//               </label>
//               <Input
//                 type="datetime-local"
//                 value={appointmentForm.startTime}
//                 onChange={(e) => {
//                   setAppointmentForm({
//                     ...appointmentForm,
//                     startTime: e.target.value,
//                   });
//                   fetchAvailableSlots(
//                     appointmentForm.consultantId,
//                     e.target.value.slice(0, 10)
//                   );
//                 }}
//                 className={formErrors.startTime ? "border-red-500" : ""}
//               />
//               {formErrors.startTime && (
//                 <p className="text-red-500 text-xs mt-1">
//                   {formErrors.startTime}
//                 </p>
//               )}
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 End Time *
//               </label>
//               <Input
//                 type="datetime-local"
//                 value={appointmentForm.endTime}
//                 onChange={(e) =>
//                   setAppointmentForm({
//                     ...appointmentForm,
//                     endTime: e.target.value,
//                   })
//                 }
//                 className={formErrors.endTime ? "border-red-500" : ""}
//               />
//               {formErrors.endTime && (
//                 <p className="text-red-500 text-xs mt-1">
//                   {formErrors.endTime}
//                 </p>
//               )}
//             </div>
//           </div>
//           {availableSlots.length > 0 && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Available Slots
//               </label>
//               <select
//                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 onChange={(e) => {
//                   const [start, end] = e.target.value.split("|");
//                   setAppointmentForm({
//                     ...appointmentForm,
//                     startTime: start,
//                     endTime: end,
//                   });
//                 }}
//               >
//                 <option value="">Select an available slot</option>
//                 {availableSlots.map((slot, index) => (
//                   <option
//                     key={index}
//                     value={`${slot.startTime}|${slot.endTime}`}
//                   >
//                     {new Date(slot.startTime).toLocaleString()} -{" "}
//                     {new Date(slot.endTime).toLocaleString()}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Status *
//             </label>
//             <select
//               className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               value={appointmentForm.status}
//               onChange={(e) =>
//                 setAppointmentForm({
//                   ...appointmentForm,
//                   status: e.target.value,
//                 })
//               }
//             >
//               {appointmentStatuses.map((status) => (
//                 <option key={status.value} value={status.value}>
//                   {status.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Notes
//             </label>
//             <textarea
//               className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               rows={3}
//               value={appointmentForm.notes}
//               onChange={(e) =>
//                 setAppointmentForm({
//                   ...appointmentForm,
//                   notes: e.target.value,
//                 })
//               }
//               placeholder="Enter any additional notes..."
//             />
//           </div>
//           <div className="flex justify-end space-x-3">
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setShowBookModal(false);
//                 resetForm();
//               }}
//             >
//               Cancel
//             </Button>
//             <Button onClick={handleBookAppointment}>Book Appointment</Button>
//           </div>
//         </div>
//       </Modal>

//       {/* Edit Appointment Modal */}
//       <Modal
//         isOpen={showEditModal}
//         onClose={() => {
//           setShowEditModal(false);
//           setSelectedAppointment(null);
//           resetForm();
//         }}
//         title="Edit Appointment"
//         size="lg"
//       >
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Client *
//             </label>
//             <select
//               className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
//                 formErrors.clientId ? "border-red-500" : ""
//               }`}
//               value={appointmentForm.clientId}
//               onChange={(e) =>
//                 setAppointmentForm({
//                   ...appointmentForm,
//                   clientId: e.target.value,
//                 })
//               }
//             >
//               <option value="">Select a client</option>
//               {clients.map((client) => (
//                 <option key={client.id} value={client.id}>
//                   {client.name}
//                 </option>
//               ))}
//             </select>
//             {formErrors.clientId && (
//               <p className="text-red-500 text-xs mt-1">{formErrors.clientId}</p>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Consultant *
//             </label>
//             <select
//               className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
//                 formErrors.consultantId ? "border-red-500" : ""
//               }`}
//               value={appointmentForm.consultantId}
//               onChange={(e) => {
//                 setAppointmentForm({
//                   ...appointmentForm,
//                   consultantId: e.target.value,
//                 });
//                 fetchAvailableSlots(
//                   e.target.value,
//                   appointmentForm.startTime.slice(0, 10)
//                 );
//               }}
//             >
//               <option value="">Select a consultant</option>
//               {consultants.map((consultant) => (
//                 <option key={consultant.id} value={consultant.id}>
//                   {consultant.name}
//                 </option>
//               ))}
//             </select>
//             {formErrors.consultantId && (
//               <p className="text-red-500 text-xs mt-1">
//                 {formErrors.consultantId}
//               </p>
//             )}
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Start Time *
//               </label>
//               <Input
//                 type="datetime-local"
//                 value={appointmentForm.startTime}
//                 onChange={(e) => {
//                   setAppointmentForm({
//                     ...appointmentForm,
//                     startTime: e.target.value,
//                   });
//                   fetchAvailableSlots(
//                     appointmentForm.consultantId,
//                     e.target.value.slice(0, 10)
//                   );
//                 }}
//                 className={formErrors.startTime ? "border-red-500" : ""}
//               />
//               {formErrors.startTime && (
//                 <p className="text-red-500 text-xs mt-1">
//                   {formErrors.startTime}
//                 </p>
//               )}
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 End Time *
//               </label>
//               <Input
//                 type="datetime-local"
//                 value={appointmentForm.endTime}
//                 onChange={(e) =>
//                   setAppointmentForm({
//                     ...appointmentForm,
//                     endTime: e.target.value,
//                   })
//                 }
//                 className={formErrors.endTime ? "border-red-500" : ""}
//               />
//               {formErrors.endTime && (
//                 <p className="text-red-500 text-xs mt-1">
//                   {formErrors.endTime}
//                 </p>
//               )}
//             </div>
//           </div>
//           {availableSlots.length > 0 && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Available Slots
//               </label>
//               <select
//                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 onChange={(e) => {
//                   const [start, end] = e.target.value.split("|");
//                   setAppointmentForm({
//                     ...appointmentForm,
//                     startTime: start,
//                     endTime: end,
//                   });
//                 }}
//               >
//                 <option value="">Select an available slot</option>
//                 {availableSlots.map((slot, index) => (
//                   <option
//                     key={index}
//                     value={`${slot.startTime}|${slot.endTime}`}
//                   >
//                     {new Date(slot.startTime).toLocaleString()} -{" "}
//                     {new Date(slot.endTime).toLocaleString()}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Status *
//             </label>
//             <select
//               className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               value={appointmentForm.status}
//               onChange={(e) =>
//                 setAppointmentForm({
//                   ...appointmentForm,
//                   status: e.target.value,
//                 })
//               }
//             >
//               {appointmentStatuses.map((status) => (
//                 <option key={status.value} value={status.value}>
//                   {status.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Notes
//             </label>
//             <textarea
//               className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               rows={3}
//               value={appointmentForm.notes}
//               onChange={(e) =>
//                 setAppointmentForm({
//                   ...appointmentForm,
//                   notes: e.target.value,
//                 })
//               }
//               placeholder="Enter any additional notes..."
//             />
//           </div>
//           <div className="flex justify-end space-x-3">
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setShowEditModal(false);
//                 setSelectedAppointment(null);
//                 resetForm();
//               }}
//             >
//               Cancel
//             </Button>
//             <Button onClick={handleEditAppointment}>Update Appointment</Button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default AppointmentBooking;
