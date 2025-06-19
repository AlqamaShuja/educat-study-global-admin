import React, { useState, useEffect } from "react";
import useApi from "../../hooks/useApi";
import useAuthStore from "../../stores/authStore";
import usePermissions from "../../hooks/usePermissions";
import { validateScheduleForm, validateInput } from "../../utils/validators";
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

const StaffSchedules = () => {
  const { user } = useAuthStore();
  const { callApi, services, loading: apiLoading, error: apiError } = useApi();
  const { hasPermission } = usePermissions();
  const [schedules, setSchedules] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [filters, setFilters] = useState({ search: "", staffId: "", date: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [scheduleForm, setScheduleForm] = useState({
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
    {
      value: "training",
      label: "Training",
      color: "bg-yellow-100 text-yellow-800",
    },
    { value: "leave", label: "Leave", color: "bg-red-100 text-red-800" },
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
      value: "cancelled",
      label: "Cancelled",
      color: "bg-gray-100 text-gray-800",
    },
  ];

  useEffect(() => {
    if (user && hasPermission("manage", "schedules")) {
      fetchStaffMembers();
      fetchSchedules();
    }
  }, [user]);

  const fetchStaffMembers = async () => {
    try {
      const response = await callApi(services.user.getTeamMembers);
      setStaffMembers(
        response?.map((member) => ({
          id: member.id,
          name: validateInput(member.name),
        })) || []
      );
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to fetch staff members",
        type: "error",
      });
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await callApi(services.schedule.getSchedules);
      setSchedules(
        response?.map((schedule) => ({
          id: schedule.id,
          staffId: schedule.staffId,
          staffName: validateInput(schedule.staffName || "Unknown"),
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          type: schedule.type,
          status: schedule.status,
          notes: validateInput(schedule.notes || ""),
        })) || []
      );
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to fetch schedules",
        type: "error",
      });
    }
  };

  const handleAddSchedule = async () => {
    const validationErrors = validateScheduleForm(scheduleForm);
    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      const newSchedule = await callApi(services.schedule.createSchedule, {
        ...scheduleForm,
        startTime: new Date(scheduleForm.startTime).toISOString(),
        endTime: new Date(scheduleForm.endTime).toISOString(),
        notes: validateInput(scheduleForm.notes),
      });
      setSchedules((prev) => [
        ...prev,
        {
          ...newSchedule,
          staffName:
            staffMembers.find((s) => s.id === newSchedule.staffId)?.name ||
            "Unknown",
        },
      ]);
      setShowAddModal(false);
      resetForm();
      setToast({
        show: true,
        message: "Schedule added successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to add schedule",
        type: "error",
      });
    }
  };

  const handleEditSchedule = async () => {
    const validationErrors = validateScheduleForm(scheduleForm);
    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      const updatedSchedule = await callApi(
        services.schedule.updateSchedule,
        selectedSchedule.id,
        {
          ...scheduleForm,
          startTime: new Date(scheduleForm.startTime).toISOString(),
          endTime: new Date(scheduleForm.endTime).toISOString(),
          notes: validateInput(scheduleForm.notes),
        }
      );
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === selectedSchedule.id
            ? {
                ...updatedSchedule,
                staffName:
                  staffMembers.find((s) => s.id === updatedSchedule.staffId)
                    ?.name || "Unknown",
              }
            : schedule
        )
      );
      setShowEditModal(false);
      setSelectedSchedule(null);
      resetForm();
      setToast({
        show: true,
        message: "Schedule updated successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to update schedule",
        type: "error",
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm("Are you sure you want to delete this schedule?"))
      return;

    try {
      await callApi(services.schedule.deleteSchedule, scheduleId);
      setSchedules((prev) =>
        prev.filter((schedule) => schedule.id !== scheduleId)
      );
      setToast({
        show: true,
        message: "Schedule deleted successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to delete schedule",
        type: "error",
      });
    }
  };

  const resetForm = () => {
    setScheduleForm({
      staffId: "",
      startTime: "",
      endTime: "",
      type: "shift",
      status: "scheduled",
      notes: "",
    });
    setFormErrors({});
  };

  const filteredSchedules = schedules.filter((schedule) => {
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

  const columns = [
    {
      key: "staffName",
      label: "Staff",
      render: (schedule) => (
        <div className="flex items-center">
          <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{schedule.staffName}</span>
        </div>
      ),
    },
    {
      key: "startTime",
      label: "Start Time",
      render: (schedule) => (
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1" />
          {new Date(schedule.startTime).toLocaleString()}
        </div>
      ),
    },
    {
      key: "endTime",
      label: "End Time",
      render: (schedule) => (
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1" />
          {new Date(schedule.endTime).toLocaleString()}
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (schedule) => (
        <Badge className={getTypeColor(schedule.type)}>
          {scheduleTypes.find((t) => t.value === schedule.type)?.label}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (schedule) => (
        <Badge className={getStatusColor(schedule.status)}>
          {scheduleStatuses.find((s) => s.value === schedule.status)?.label}
        </Badge>
      ),
    },
    {
      key: "notes",
      label: "Notes",
      render: (schedule) => (
        <span className="text-sm">{schedule.notes || "N/A"}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (schedule) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedSchedule(schedule);
              setScheduleForm({
                staffId: schedule.staffId,
                startTime: new Date(schedule.startTime)
                  .toISOString()
                  .slice(0, 16),
                endTime: new Date(schedule.endTime).toISOString().slice(0, 16),
                type: schedule.type,
                status: schedule.status,
                notes: schedule.notes,
              });
              setShowEditModal(true);
            }}
            disabled={!hasPermission("edit", "schedules")}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteSchedule(schedule.id)}
            className="border-red-300 text-red-600 hover:bg-red-50"
            disabled={!hasPermission("delete", "schedules")}
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

  if (!hasPermission("manage", "schedules")) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Access Denied
        </h3>
        <p className="text-gray-600">
          You do not have permission to manage staff schedules.
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
          <h1 className="text-2xl font-bold text-gray-900">Staff Schedules</h1>
          <p className="text-gray-600">
            Manage schedules for your team members.
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          disabled={!hasPermission("create", "schedules")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by staff or notes..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="pl-10"
            />
          </div>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.staffId}
            onChange={(e) =>
              setFilters({ ...filters, staffId: e.target.value })
            }
          >
            <option value="">All Staff</option>
            {staffMembers.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.name}
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
            {filteredSchedules.length} of {schedules.length} schedules
          </div>
        </div>
      </Card>

      {/* Schedules Table */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Staff Schedules</h3>
        {filteredSchedules.length === 0 ? (
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
              onClick={() => setShowAddModal(true)}
              disabled={!hasPermission("create", "schedules")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Schedule
            </Button>
          </div>
        ) : (
          <DataTable
            data={filteredSchedules}
            columns={columns}
            pagination={true}
            pageSize={10}
          />
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
              Staff Member *
            </label>
            <select
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                formErrors.staffId ? "border-red-500" : ""
              }`}
              value={scheduleForm.staffId}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, staffId: e.target.value })
              }
            >
              <option value="">Select a staff member</option>
              {staffMembers.map((staff) => (
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
                End Time *
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
            >
              Cancel
            </Button>
            <Button onClick={handleAddSchedule}>Add Schedule</Button>
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
              Staff Member *
            </label>
            <select
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                formErrors.staffId ? "border-red-500" : ""
              }`}
              value={scheduleForm.staffId}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, staffId: e.target.value })
              }
            >
              <option value="">Select a staff member</option>
              {staffMembers.map((staff) => (
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
                End Time *
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
            >
              Cancel
            </Button>
            <Button onClick={handleEditSchedule}>Update Schedule</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StaffSchedules;
