import React, { useState, useEffect } from "react";
import useManagerStore from "../../stores/useManagerStore";
import managerService from "../../services/managerService";
// import usePermissions from "../../hooks/usePermissions";
import { validateScheduleForm, validateInput } from "../../utils/validators";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ConfirmDeleteScheduleModal from "../../components/manager/ConfirmDeleteScheduleModal";
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
import { toast } from "react-toastify";
import { addHours } from "date-fns";

const StaffSchedules = () => {
  const {
    user,
    consultants,
    schedules,
    setSchedules,
    fetchSchedules,
    fetchOfficeConsultants,
    loading,
    error,
  } = useManagerStore();
  //   const { hasPermission } = usePermissions();
  const [filters, setFilters] = useState({ search: "", staffId: "", date: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [scheduleForm, setScheduleForm] = useState({
    studentId: "",
    staffId: "",
    startTime: "",
    endTime: "",
    type: "shift",
    status: "scheduled",
    notes: "",
  });

  const scheduleTypes = [
    { value: "shift", label: "Shift", color: "bg-blue-100 text-blue-800" },
    {
      value: "meeting",
      label: "Meeting",
      color: "bg-green-100 text-green-800",
    },
  ];

  const scheduleStatuses = [
    {
      value: "scheduled",
      label: "Scheduled",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "completed",
      label: "Completed",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "canceled",
      label: "Canceled",
      color: "bg-gray-100 text-gray-800",
    },
    { value: "no_show", label: "No Show", color: "bg-red-100 text-red-800" },
  ];

  useEffect(() => {
    fetchSchedules();
    fetchOfficeConsultants();
    // Fetch students (assuming managerService.getStudents exists)
    managerService
      .getStudents()
      .then(setStudents)
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to fetch students");
      });
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error || "Failed to fetch schedules");
    }
  }, [error]);

  const handleAddSchedule = async () => {
    const validationErrors = validateScheduleForm({
      ...scheduleForm,
      endTime:
        scheduleForm.endTime ||
        addHours(new Date(scheduleForm.startTime), 1).toISOString(),
    });
    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      const newSchedule = await managerService.createSchedule({
        ...scheduleForm,
        studentId: scheduleForm.studentId,
        startTime: new Date(scheduleForm.startTime).toISOString(),
        endTime: scheduleForm.endTime
          ? new Date(scheduleForm.endTime).toISOString()
          : addHours(new Date(scheduleForm.startTime), 1).toISOString(),
        notes: validateInput(scheduleForm.notes),
      });
      const newScheduled = [newSchedule, ...schedules, ]
      setSchedules(newScheduled);
      setShowAddModal(false);
      resetForm();
      toast.success("Schedule added successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add schedule");
    }
  };

  const handleEditSchedule = async () => {
    const validationErrors = validateScheduleForm({
      ...scheduleForm,
      endTime:
        scheduleForm.endTime ||
        addHours(new Date(scheduleForm.startTime), 1).toISOString(),
    });
    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      const updatedSchedule = await managerService.updateSchedule(
        selectedSchedule.id,
        {
          ...scheduleForm,
          studentId: scheduleForm.studentId,
          startTime: new Date(scheduleForm.startTime).toISOString(),
          endTime: scheduleForm.endTime
            ? new Date(scheduleForm.endTime).toISOString()
            : addHours(new Date(scheduleForm.startTime), 1).toISOString(),
          notes: validateInput(scheduleForm.notes),
        }
      );
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === selectedSchedule.id
            ? {
                ...updatedSchedule,
                staffName:
                  consultants.find((s) => s.id === updatedSchedule.staffId)
                    ?.name || "Unknown",
              }
            : schedule
        )
      );
      setShowEditModal(false);
      setSelectedSchedule(null);
      resetForm();
      toast.success("Schedule updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update schedule");
    }
  };

  const handleDeleteSchedule = async () => {
    try {
      await managerService.deleteSchedule(scheduleToDelete.id);
      setSchedules((prev) =>
        prev.filter((schedule) => schedule.id !== scheduleToDelete.id)
      );
      setShowDeleteModal(false);
      setScheduleToDelete(null);
      toast.success("Schedule deleted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete schedule");
    }
  };

  const openDeleteModal = (schedule) => {
    setScheduleToDelete(schedule);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setScheduleForm({
      studentId: "",
      staffId: "",
      startTime: "",
      endTime: "",
      type: "shift",
      status: "scheduled",
      notes: "",
    });
    setFormErrors({});
  };

  console.log(schedules, "sakcnsacascnjsncscj");
  

  const filteredSchedules = schedules?.filter((schedule) => {
    const matchesSearch =
      !filters.search ||
      schedule.staffName.toLowerCase().includes(filters.search.toLowerCase()) ||
      schedule.notes.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStaff =
      !filters.staffId || schedule.staffId === filters.staffId;
    const matchesDate =
      !filters.date ||
      new Date(schedule.startTime).toDateString() ===
        new Date(filters.date).toDateString();
    return matchesSearch && matchesStaff && matchesDate;
  });

  const getTypeColor = (type) =>
    scheduleTypes.find((t) => t.value === type)?.color ||
    "bg-gray-100 text-gray-800";

  const getStatusColor = (status) =>
    scheduleStatuses.find((s) => s.value === status)?.color ||
    "bg-gray-100 text-gray-800";

  // Pagination
  const totalPages = Math.ceil(filteredSchedules?.length / pageSize);
  const paginatedSchedules = filteredSchedules?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  //   if (!hasPermission("manage", "schedules")) {
  //     return (
  //       <div className="text-center py-8">
  //         <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
  //         <h3 className="text-lg font-medium text-gray-900 mb-2">
  //           Access Denied
  //         </h3>
  //         <p className="text-gray-600">
  //           You do not have permission to manage staff schedules.
  //         </p>
  //       </div>
  //     );
  //   }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Schedules</h1>
          <p className="text-gray-600">
            Manage schedules for your team members.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          //   disabled={!hasPermission("create", "schedules")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by staff or notes..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="pl-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={filters.staffId}
            onChange={(e) =>
              setFilters({ ...filters, staffId: e.target.value })
            }
          >
            <option value="">All Staff</option>
            {consultants?.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.name}
              </option>
            ))}
          </select>
          <Input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="text-sm text-gray-600 flex items-center">
            {filteredSchedules?.length} of {schedules?.length} schedules
          </div>
        </div>
      </Card>

      {/* Custom Schedules Table */}
      <Card className="p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Staff Schedules
        </h3>
        {filteredSchedules?.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No schedules found
            </h3>
            <p className="text-gray-600 mb-4">
              {Object.values(filters).some((f) => f)
                ? "No schedules match your current filters."
                : "Add your first schedule to get started."}
            </p>
            <Button
              variant="primary"
              onClick={() => setShowAddModal(true)}
              //   disabled={!hasPermission("create", "schedules")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Schedule
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { key: "staffName", label: "Staff" },
                    { key: "startTime", label: "Start Time" },
                    { key: "endTime", label: "End Time" },
                    { key: "type", label: "Type" },
                    { key: "status", label: "Status" },
                    { key: "notes", label: "Notes" },
                    { key: "actions", label: "Actions" },
                  ].map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedSchedules.map((schedule, index) => (
                  <tr
                    key={schedule.id}
                    className={`hover:bg-gray-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {schedule.staffName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(schedule.startTime).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {schedule.endTime
                          ? new Date(schedule.endTime).toLocaleString()
                          : addHours(
                              new Date(schedule.startTime),
                              1
                            ).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge className={getTypeColor(schedule.type)}>
                        {
                          scheduleTypes.find((t) => t.value === schedule.type)
                            ?.label
                        }
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge
                        className={
                          new Date(
                            schedule.endTime ||
                              addHours(new Date(schedule.startTime), 1)
                          ) < new Date() && schedule.status === "scheduled"
                            ? getStatusColor("no_show")
                            : getStatusColor(schedule.status)
                        }
                      >
                        {new Date(
                          schedule.endTime ||
                            addHours(new Date(schedule.startTime), 1)
                        ) < new Date() && schedule.status === "scheduled"
                          ? "No Show"
                          : scheduleStatuses.find(
                              (s) => s.value === schedule.status
                            )?.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {schedule.notes || "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const start = new Date(schedule.startTime);
                            const end = schedule.endTime
                              ? new Date(schedule.endTime)
                              : addHours(start, 1);
                            setSelectedSchedule(schedule);
                            setScheduleForm({
                              studentId: schedule.studentId,
                              staffId: schedule.staffId,
                              startTime: start.toISOString().slice(0, 16),
                              endTime: end.toISOString().slice(0, 16),
                              type: schedule.type,
                              status: schedule.status,
                              notes: schedule.notes,
                            });
                            setShowEditModal(true);
                          }}
                          //   disabled={!hasPermission("edit", "schedules")}
                          className="border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDeleteModal(schedule)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          //   disabled={!hasPermission("delete", "schedules")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Add Schedule Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add Schedule"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student *
            </label>
            <select
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.studentId ? "border-red-500" : ""
              }`}
              value={scheduleForm.studentId}
              //   onChange={(e) =>
              //     setScheduleForm({ ...scheduleForm, studentId: e.target.value })
              //   }
              onChange={(e) => {
                const selectedStudentId = e.target.value;
                const selectedStudent = students.find(
                  (s) => s.id === selectedStudentId
                );
                const assignedConsultant =
                  selectedStudent?.studentLeads?.[0]?.assignedConsultant;

                  console.log(selectedStudent, "asjnsajcsajcsnacna");
                  

                if (assignedConsultant) {
                  setScheduleForm({
                    ...scheduleForm,
                    studentId: selectedStudentId,
                    staffId: assignedConsultant,
                  });
                } else {
                  toast.error(
                    "This student is not assigned to any consultant."
                  );
                  setScheduleForm({
                    ...scheduleForm,
                    studentId: selectedStudentId,
                    staffId: "", // Clear the staffId if no consultant
                  });
                }
              }}
            >
              <option value="">Select a student</option>
              {students?.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.email}
                </option>
              ))}
            </select>
            {formErrors.studentId && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.studentId}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff Member *
            </label>
            <select
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.staffId ? "border-red-500" : ""
              }`}
              value={scheduleForm.staffId}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, staffId: e.target.value })
              }
            >
              <option value="">Select a staff member</option>
              {consultants?.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}
                </option>
              ))}
            </select>
            {formErrors.staffId && (
              <p className="text-red-500 text-xs mt-1">{formErrors.staffId}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <Input
                type="datetime-local"
                value={scheduleForm.startTime}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    startTime: e.target.value,
                    endTime: scheduleForm.endTime || "",
                  })
                }
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
                End Time
              </label>
              <Input
                type="datetime-local"
                value={scheduleForm.endTime}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, endTime: e.target.value })
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={scheduleForm.type}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, type: e.target.value })
                }
              >
                {scheduleTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={scheduleForm.status}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, status: e.target.value })
                }
              >
                {scheduleStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              value={scheduleForm.notes}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, notes: e.target.value })
              }
              placeholder="Enter any additional notes..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddSchedule}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add Schedule
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Schedule Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedSchedule(null);
          resetForm();
        }}
        title="Edit Schedule"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student *
            </label>
            <select
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.studentId ? "border-red-500" : ""
              }`}
              value={scheduleForm.studentId}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, studentId: e.target.value })
              }
            >
              <option value="">Select a student</option>
              {students?.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
            {formErrors.studentId && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.studentId}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff Member *
            </label>
            <select
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.staffId ? "border-red-500" : ""
              }`}
              value={scheduleForm.staffId}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, staffId: e.target.value })
              }
            >
              <option value="">Select a staff member</option>
              {consultants?.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}
                </option>
              ))}
            </select>
            {formErrors.staffId && (
              <p className="text-red-500 text-xs mt-1">{formErrors.staffId}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <Input
                type="datetime-local"
                value={scheduleForm.startTime}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    startTime: e.target.value,
                    endTime: scheduleForm.endTime || "",
                  })
                }
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
                End Time
              </label>
              <Input
                type="datetime-local"
                value={scheduleForm.endTime}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, endTime: e.target.value })
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={scheduleForm.type}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, type: e.target.value })
                }
              >
                {scheduleTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={scheduleForm.status}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, status: e.target.value })
                }
              >
                {scheduleStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              value={scheduleForm.notes}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, notes: e.target.value })
              }
              placeholder="Enter any additional notes..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setSelectedSchedule(null);
                resetForm();
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleEditSchedule}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Update Schedule
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Schedule Modal */}
      <ConfirmDeleteScheduleModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteSchedule}
        staffName={scheduleToDelete?.staffName}
      />
    </div>
  );
};

export default StaffSchedules;

// import React, { useState, useEffect } from "react";
// import useManagerStore from "../../stores/useManagerStore";
// import managerService from "../../services/managerService";
// import usePermissions from "../../hooks/usePermissions";
// import { validateScheduleForm, validateInput } from "../../utils/validators";
// import Card from "../../components/ui/Card";
// import Button from "../../components/ui/Button";
// import Badge from "../../components/ui/Badge";
// import Modal from "../../components/ui/Modal";
// import Input from "../../components/ui/Input";
// import LoadingSpinner from "../../components/ui/LoadingSpinner";
// import DataTable from "../../components/tables/DataTable";
// import ConfirmDeleteScheduleModal from "../../components/manager/ConfirmDeleteScheduleModal";
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
// import { toast } from "react-toastify";
// import { addHours } from "date-fns";

// const StaffSchedules = () => {
//   const { user } = useManagerStore();
//   const {
//     consultants,
//     schedules,
//     setSchedules,
//     fetchSchedules,
//     loading,
//     error,
//   } = useManagerStore();
//   const { hasPermission } = usePermissions();
//   const [filters, setFilters] = useState({ search: "", staffId: "", date: "" });
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedSchedule, setSelectedSchedule] = useState(null);
//   const [scheduleToDelete, setScheduleToDelete] = useState(null);
//   const [formErrors, setFormErrors] = useState({});
//   //   const [schedules, setSchedules] = useState([]);
//   const [scheduleForm, setScheduleForm] = useState({
//     staffId: "",
//     startTime: "",
//     endTime: "",
//     type: "shift",
//     status: "scheduled",
//     notes: "",
//   });

//   console.log(schedules, "acnajnsancsnasjc");

//   const scheduleTypes = [
//     { value: "shift", label: "Shift", color: "bg-blue-100 text-blue-800" },
//     {
//       value: "meeting",
//       label: "Meeting",
//       color: "bg-green-100 text-green-800",
//     },
//     {
//       value: "training",
//       label: "Training",
//       color: "bg-yellow-100 text-yellow-800",
//     },
//     { value: "leave", label: "Leave", color: "bg-red-100 text-red-800" },
//   ];

//   const scheduleStatuses = [
//     {
//       value: "scheduled",
//       label: "Scheduled",
//       color: "bg-blue-100 text-blue-800",
//     },
//     {
//       value: "completed",
//       label: "Completed",
//       color: "bg-green-100 text-green-800",
//     },
//     {
//       value: "cancelled",
//       label: "Cancelled",
//       color: "bg-gray-100 text-gray-800",
//     },
//   ];

//   useEffect(() => {
//     fetchSchedules();
//   }, []);

//   useEffect(() => {
//     if (error) {
//       toast.error(error || "Failed to fetch schedules");
//     }
//   }, [error]);

//   const handleAddSchedule = async () => {
//     const validationErrors = validateScheduleForm(scheduleForm);
//     if (Object.keys(validationErrors)?.length) {
//       setFormErrors(validationErrors);
//       return;
//     }

//     try {
//       const newSchedule = await managerService.createSchedule({
//         ...scheduleForm,
//         startTime: new Date(scheduleForm.startTime).toISOString(),
//         endTime: new Date(scheduleForm.endTime).toISOString(),
//         notes: validateInput(scheduleForm.notes),
//       });
//       setSchedules((prev) => [
//         ...prev,
//         {
//           ...newSchedule,
//           staffName:
//             consultants.find((s) => s.id === newSchedule.staffId)?.name ||
//             "Unknown",
//         },
//       ]);
//       setShowAddModal(false);
//       resetForm();
//       toast.success("Schedule added successfully!");
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to add schedule");
//     }
//   };

//   const handleEditSchedule = async () => {
//     const validationErrors = validateScheduleForm(scheduleForm);
//     if (Object.keys(validationErrors)?.length) {
//       setFormErrors(validationErrors);
//       return;
//     }

//     try {
//       const updatedSchedule = await managerService.updateSchedule(
//         selectedSchedule.id,
//         {
//           ...scheduleForm,
//           startTime: new Date(scheduleForm.startTime).toISOString(),
//           endTime: new Date(scheduleForm.endTime).toISOString(),
//           notes: validateInput(scheduleForm.notes),
//         }
//       );
//       setSchedules((prev) =>
//         prev?.map((schedule) =>
//           schedule.id === selectedSchedule.id
//             ? {
//                 ...updatedSchedule,
//                 staffName:
//                   consultants.find((s) => s.id === updatedSchedule.staffId)
//                     ?.name || "Unknown",
//               }
//             : schedule
//         )
//       );
//       setShowEditModal(false);
//       setSelectedSchedule(null);
//       resetForm();
//       toast.success("Schedule updated successfully!");
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to update schedule");
//     }
//   };

//   const handleDeleteSchedule = async () => {
//     try {
//       await managerService.deleteSchedule(scheduleToDelete.id);
//       setSchedules((prev) =>
//         prev?.filter((schedule) => schedule.id !== scheduleToDelete.id)
//       );
//       setShowDeleteModal(false);
//       setScheduleToDelete(null);
//       toast.success("Schedule deleted successfully!");
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to delete schedule");
//     }
//   };

//   const openDeleteModal = (schedule) => {
//     setScheduleToDelete(schedule);
//     setShowDeleteModal(true);
//   };

//   const resetForm = () => {
//     setScheduleForm({
//       staffId: "",
//       startTime: "",
//       endTime: "",
//       type: "shift",
//       status: "scheduled",
//       notes: "",
//     });
//     setFormErrors({});
//   };

//   const filteredSchedules = schedules?.filter((schedule) => {
//     const matchesSearch =
//       !filters.search ||
//       schedule.staffName.toLowerCase().includes(filters.search.toLowerCase()) ||
//       schedule.notes.toLowerCase().includes(filters.search.toLowerCase());
//     const matchesStaff =
//       !filters.staffId || schedule.staffId === filters.staffId;
//     const matchesDate =
//       !filters.date ||
//       new Date(schedule.startTime).toDateString() ===
//         new Date(filters.date).toDateString();
//     return matchesSearch && matchesStaff && matchesDate;
//   });

//   const getTypeColor = (type) =>
//     scheduleTypes.find((t) => t.value === type)?.color ||
//     "bg-gray-100 text-gray-800";

//   const getStatusColor = (status) =>
//     scheduleStatuses.find((s) => s.value === status)?.color ||
//     "bg-gray-100 text-gray-800";

//   const columns = [
//     {
//       key: "staffName",
//       label: "Staff",
//       render: (schedule) => (
//         <div className="flex items-center">
//           <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
//           <span className="text-sm">{schedule.staffName}</span>
//         </div>
//       ),
//     },
//     {
//       key: "startTime",
//       label: "Start Time",
//       render: (schedule) => (
//         <div className="flex items-center text-sm text-gray-600">
//           <Clock className="h-4 w-4 mr-1" />
//           {new Date(schedule.startTime).toLocaleString()}
//         </div>
//       ),
//     },
//     {
//       key: "endTime",
//       label: "End Time",
//       render: (schedule) => {
//         const endTime = schedule.endTime
//           ? new Date(schedule.endTime)
//           : addHours(new Date(schedule.startTime), 1);

//         return (
//           <div className="flex items-center text-sm text-gray-600">
//             <Clock className="h-4 w-4 mr-1" />
//             {endTime.toLocaleString()}
//           </div>
//         );
//       },
//     },
//     {
//       key: "type",
//       label: "Type",
//       render: (schedule) => (
//         <Badge className={getTypeColor(schedule.type)}>
//           {scheduleTypes.find((t) => t.value === schedule.type)?.label}
//         </Badge>
//       ),
//     },
//     {
//       key: "status",
//       label: "Status",
//       render: (schedule) => (
//         <Badge className={getStatusColor(schedule.status)}>
//           {scheduleStatuses.find((s) => s.value === status)?.label}
//         </Badge>
//       ),
//     },
//     {
//       key: "notes",
//       label: "Notes",
//       render: (schedule) => (
//         <span className="text-sm">{schedule.notes || "N/A"}</span>
//       ),
//     },
//     {
//       key: "actions",
//       label: "Actions",
//       render: (schedule) => (
//         <div className="flex space-x-2">
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={() => {
//               const start = new Date(schedule.startTime);
//               const end = schedule.endTime
//                 ? new Date(schedule.endTime)
//                 : addHours(start, 1); // fallback to +1 hour

//               setSelectedSchedule(schedule);
//               setScheduleForm({
//                 staffId: schedule.staffId,
//                 startTime: start.toISOString().slice(0, 16),
//                 endTime: end.toISOString().slice(0, 16),
//                 type: schedule.type,
//                 status: schedule.status,
//                 notes: schedule.notes,
//               });
//               setShowEditModal(true);
//             }}
//             disabled={!hasPermission("edit", "schedules")}
//           >
//             <Edit className="h-4 w-4" />
//           </Button>
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={() => openDeleteModal(schedule)}
//             className="border-red-300 text-red-600 hover:bg-red-50"
//             disabled={!hasPermission("delete", "schedules")}
//           >
//             <Trash2 className="h-4 w-4" />
//           </Button>
//         </div>
//       ),
//     },
//   ];

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   //   if (!hasPermission("manage", "schedules")) {
//   //     return (
//   //       <div className="text-center py-8">
//   //         <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//   //         <h3 className="text-lg font-medium text-gray-900 mb-2">
//   //           Access Denied
//   //         </h3>
//   //         <p className="text-gray-600">
//   //           You do not have permission to manage staff schedules.
//   //         </p>
//   //       </div>
//   //     );
//   //   }

//   return (
//     <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Staff Schedules</h1>
//           <p className="text-gray-600">
//             Manage schedules for your team members.
//           </p>
//         </div>
//         <Button
//           variant="primary"
//           onClick={() => setShowAddModal(true)}
//           disabled={!hasPermission("create", "schedules")}
//         >
//           <Plus className="h-4 w-4 mr-2" />
//           Add Schedule
//         </Button>
//       </div>

//       {/* Filters */}
//       <Card className="p-4">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//             <Input
//               placeholder="Search by staff or notes..."
//               value={filters.search}
//               onChange={(e) =>
//                 setFilters({ ...filters, search: e.target.value })
//               }
//               className="pl-10"
//             />
//           </div>
//           <select
//             className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//             value={filters.staffId}
//             onChange={(e) =>
//               setFilters({ ...filters, staffId: e.target.value })
//             }
//           >
//             <option value="">All Staff</option>
//             {consultants?.map((staff) => (
//               <option key={staff.id} value={staff.id}>
//                 {staff.name}
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
//             {filteredSchedules?.length} of {schedules?.length} schedules
//           </div>
//         </div>
//       </Card>

//       {/* Schedules Table */}
//       <Card className="p-4">
//         <h3 className="text-lg font-semibold mb-4">Staff Schedules</h3>
//         {filteredSchedules?.length === 0 ? (
//           <div className="text-center py-8">
//             <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">
//               No schedules found
//             </h3>
//             <p className="text-gray-600 mb-4">
//               {Object.values(filters).some((f) => f)
//                 ? "No schedules match your current filters."
//                 : "Add your first schedule to get started."}
//             </p>
//             <Button
//               variant="primary"
//               onClick={() => setShowAddModal(true)}
//               disabled={!hasPermission("create", "schedules")}
//             >
//               <Plus className="h-4 w-4 mr-2" />
//               Add First Schedule
//             </Button>
//           </div>
//         ) : (
//           <DataTable
//             data={filteredSchedules}
//             columns={columns}
//             pagination={true}
//             pageSize={10}
//           />
//         )}
//       </Card>

//       {/* Add Schedule Modal */}
//       <Modal
//         isOpen={showAddModal}
//         onClose={() => {
//           setShowAddModal(false);
//           resetForm();
//         }}
//         title="Add Schedule"
//         size="lg"
//       >
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Staff Member *
//             </label>
//             <select
//               className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//                 formErrors.staffId ? "border-red-500" : ""
//               }`}
//               value={scheduleForm.staffId}
//               onChange={(e) =>
//                 setScheduleForm({ ...scheduleForm, staffId: e.target.value })
//               }
//             >
//               <option value="">Select a staff member</option>
//               {consultants?.map((staff) => (
//                 <option key={staff.id} value={staff.id}>
//                   {staff.name}
//                 </option>
//               ))}
//             </select>
//             {formErrors.staffId && (
//               <p className="text-red-500 text-xs mt-1">{formErrors.staffId}</p>
//             )}
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Start Time *
//               </label>
//               <Input
//                 type="datetime-local"
//                 value={scheduleForm.startTime}
//                 onChange={(e) =>
//                   setScheduleForm({
//                     ...scheduleForm,
//                     startTime: e.target.value,
//                   })
//                 }
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
//                 value={scheduleForm.endTime}
//                 onChange={(e) =>
//                   setScheduleForm({ ...scheduleForm, endTime: e.target.value })
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
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Type *
//               </label>
//               <select
//                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                 value={scheduleForm.type}
//                 onChange={(e) =>
//                   setScheduleForm({ ...scheduleForm, type: e.target.value })
//                 }
//               >
//                 {scheduleTypes?.map((type) => (
//                   <option key={type.value} value={type.value}>
//                     {type.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Status *
//               </label>
//               <select
//                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                 value={scheduleForm.status}
//                 onChange={(e) =>
//                   setScheduleForm({ ...scheduleForm, status: e.target.value })
//                 }
//               >
//                 {scheduleStatuses?.map((status) => (
//                   <option key={status.value} value={status.value}>
//                     {status.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Notes
//             </label>
//             <textarea
//               className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//               rows={3}
//               value={scheduleForm.notes}
//               onChange={(e) =>
//                 setScheduleForm({ ...scheduleForm, notes: e.target.value })
//               }
//               placeholder="Enter any additional notes..."
//             />
//           </div>
//           <div className="flex justify-end space-x-3">
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setShowAddModal(false);
//                 resetForm();
//               }}
//             >
//               Cancel
//             </Button>
//             <Button variant="primary" onClick={handleAddSchedule}>
//               Add Schedule
//             </Button>
//           </div>
//         </div>
//       </Modal>

//       {/* Edit Schedule Modal */}
//       <Modal
//         isOpen={showEditModal}
//         onClose={() => {
//           setShowEditModal(false);
//           setSelectedSchedule(null);
//           resetForm();
//         }}
//         title="Edit Schedule"
//         size="lg"
//       >
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Staff Member *
//             </label>
//             <select
//               className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//                 formErrors.staffId ? "border-red-500" : ""
//               }`}
//               value={scheduleForm.staffId}
//               onChange={(e) =>
//                 setScheduleForm({ ...scheduleForm, staffId: e.target.value })
//               }
//             >
//               <option value="">Select a staff member</option>
//               {consultants?.map((staff) => (
//                 <option key={staff.id} value={staff.id}>
//                   {staff.name}
//                 </option>
//               ))}
//             </select>
//             {formErrors.staffId && (
//               <p className="text-red-500 text-xs mt-1">{formErrors.staffId}</p>
//             )}
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Start Time *
//               </label>
//               <Input
//                 type="datetime-local"
//                 value={scheduleForm.startTime}
//                 onChange={(e) =>
//                   setScheduleForm({
//                     ...scheduleForm,
//                     startTime: e.target.value,
//                   })
//                 }
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
//                 value={scheduleForm.endTime}
//                 onChange={(e) =>
//                   setScheduleForm({ ...scheduleForm, endTime: e.target.value })
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
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Type *
//               </label>
//               <select
//                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                 value={scheduleForm.type}
//                 onChange={(e) =>
//                   setScheduleForm({ ...scheduleForm, type: e.target.value })
//                 }
//               >
//                 {scheduleTypes?.map((type) => (
//                   <option key={type.value} value={type.value}>
//                     {type.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Status *
//               </label>
//               <select
//                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                 value={scheduleForm.status}
//                 onChange={(e) =>
//                   setScheduleForm({ ...scheduleForm, status: e.target.value })
//                 }
//               >
//                 {scheduleStatuses?.map((status) => (
//                   <option key={status.value} value={status.value}>
//                     {status.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Notes
//             </label>
//             <textarea
//               className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//               rows={3}
//               value={scheduleForm.notes}
//               onChange={(e) =>
//                 setScheduleForm({ ...scheduleForm, notes: e.target.value })
//               }
//               placeholder="Enter any additional notes..."
//             />
//           </div>
//           <div className="flex justify-end space-x-3">
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setShowEditModal(false);
//                 setSelectedSchedule(null);
//                 resetForm();
//               }}
//             >
//               Cancel
//             </Button>
//             <Button variant="primary" onClick={handleEditSchedule}>
//               Update Schedule
//             </Button>
//           </div>
//         </div>
//       </Modal>

//       {/* Delete Schedule Modal */}
//       <ConfirmDeleteScheduleModal
//         isOpen={showDeleteModal}
//         onClose={() => setShowDeleteModal(false)}
//         onConfirm={handleDeleteSchedule}
//         staffName={scheduleToDelete?.staffName}
//       />
//     </div>
//   );
// };

// export default StaffSchedules;
