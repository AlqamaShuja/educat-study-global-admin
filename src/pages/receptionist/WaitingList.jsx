import React, { useState, useEffect } from "react";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import usePermissions from "../../hooks/usePermissions";
import { validateWaitingListForm, validateInput } from "../../utils/validators";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/modal/Modal";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Toast from "../../components/ui/Toast";
import DataTable from "../../components/tables/DataTable";
import {
  Clock,
  Plus,
  Edit,
  Trash2,
  Search,
  User,
  Phone,
  Mail,
  Shield,
  Calendar,
} from "@lucide/react";

const WaitingList = () => {
  const { user } = useAuth();
  const { callApi, loading: apiLoading, error: apiError } = useApi();
  const { hasPermission } = usePermissions();
  const [waitingList, setWaitingList] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    consultantId: "",
    status: "",
  });
  const [showModal, setShowModal] = useState({
    show: false,
    mode: "add",
    entry: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [waitingListForm, setWaitingListForm] = useState({
    clientName: "",
    email: "",
    phone: "",
    preferredConsultantId: "",
    preferredDateTime: "",
    status: "pending",
    notes: "",
  });

  const waitingListStatuses = [
    {
      value: "pending",
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "assigned",
      label: "Assigned",
      color: "bg-green-100 text-green-800",
    },
    { value: "canceled", label: "Canceled", color: "bg-red-100 text-red-800" },
  ];

  useEffect(() => {
    if (user && hasPermission("manage", "waiting-list")) {
      fetchConsultants();
      fetchWaitingList();
    }
  }, [user]);

  const fetchConsultants = async () => {
    try {
      const response = await callApi("GET", "/receptionist/consultants");
      setConsultants(
        response?.map((consultant) => ({
          id: consultant.id,
          name: validateInput(consultant.name),
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

  const fetchWaitingList = async () => {
    try {
      const response = await callApi("GET", "/receptionist/waiting-list");
      setWaitingList(
        response?.map((entry) => ({
          id: entry.id,
          clientId: entry.clientId,
          clientName: validateInput(entry.clientName || "Unknown"),
          email: validateInput(entry.email || "N/A"),
          phone: validateInput(entry.phone || "N/A"),
          preferredConsultantId: entry.preferredConsultantId,
          preferredConsultantName: validateInput(
            entry.preferredConsultantName || "Any"
          ),
          preferredDateTime: entry.preferredDateTime,
          status: entry.status,
          notes: validateInput(entry.notes || ""),
        })) || []
      );
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to fetch waiting list",
        type: "error",
      });
    }
  };

  const handleSaveEntry = async () => {
    const validationErrors = validateWaitingListForm(waitingListForm);
    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      const payload = {
        ...waitingListForm,
        clientName: validateInput(waitingListForm.clientName),
        email: validateInput(waitingListForm.email),
        phone: validateInput(waitingListForm.phone),
        notes: validateInput(waitingListForm.notes),
      };

      if (showModal.mode === "add") {
        const newEntry = await callApi(
          "POST",
          "/receptionist/waiting-list",
          payload
        );
        setWaitingList((prev) => [...prev, newEntry]);
        setToast({
          show: true,
          message: "Client added to waiting list!",
          type: "success",
        });
      } else {
        const updatedEntry = await callApi(
          "PUT",
          `/receptionist/waiting-list/${showModal.entry.id}`,
          payload
        );
        setWaitingList((prev) =>
          prev.map((entry) =>
            entry.id === updatedEntry.id ? updatedEntry : entry
          )
        );
        setToast({
          show: true,
          message: "Waiting list entry updated!",
          type: "success",
        });
      }

      setShowModal({ show: false, mode: "add", entry: null });
      resetForm();
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to save entry",
        type: "error",
      });
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this client from the waiting list?"
      )
    )
      return;

    try {
      await callApi("DELETE", `/receptionist/waiting-list/${entryId}`);
      setWaitingList((prev) => prev.filter((entry) => entry.id !== entryId));
      setToast({
        show: true,
        message: "Client removed from waiting list!",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to delete entry",
        type: "error",
      });
    }
  };

  const handleAssignAppointment = async (entryId) => {
    try {
      // Placeholder for assigning an appointment (actual implementation depends on API)
      await callApi("PUT", `/receptionist/waiting-list/${entryId}/assign`);
      setWaitingList((prev) =>
        prev.map((entry) =>
          entry.id === entryId ? { ...entry, status: "assigned" } : entry
        )
      );
      setToast({
        show: true,
        message: "Appointment assignment initiated!",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to assign appointment",
        type: "error",
      });
    }
  };

  const resetForm = () => {
    setWaitingListForm({
      clientName: "",
      email: "",
      phone: "",
      preferredConsultantId: "",
      preferredDateTime: "",
      status: "pending",
      notes: "",
    });
    setFormErrors({});
  };

  const filteredWaitingList = waitingList.filter((entry) => {
    const matchesSearch =
      !filters.search ||
      entry.clientName.toLowerCase().includes(filters.search.toLowerCase()) ||
      entry.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      entry.phone.includes(filters.search);
    const matchesConsultant =
      !filters.consultantId ||
      entry.preferredConsultantId === filters.consultantId;
    const matchesStatus = !filters.status || entry.status === filters.status;
    return matchesSearch && matchesConsultant && matchesStatus;
  });

  const getStatusColor = (status) =>
    waitingListStatuses.find((s) => s.value === status)?.color ||
    "bg-gray-100 text-gray-800";

  const columns = [
    {
      key: "clientName",
      label: "Client",
      render: (entry) => (
        <div className="flex items-center">
          <User className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{entry.clientName}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (entry) => (
        <div className="flex items-center">
          <Mail className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{entry.email}</span>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (entry) => (
        <div className="flex items-center">
          <Phone className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{entry.phone}</span>
        </div>
      ),
    },
    {
      key: "preferredConsultantName",
      label: "Preferred Consultant",
      render: (entry) => (
        <div className="flex items-center">
          <User className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{entry.preferredConsultantName}</span>
        </div>
      ),
    },
    {
      key: "preferredDateTime",
      label: "Preferred Date/Time",
      render: (entry) => (
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1" />
          {new Date(entry.preferredDateTime).toLocaleString()}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (entry) => (
        <Badge className={getStatusColor(entry.status)}>
          {waitingListStatuses.find((s) => s.value === entry.status)?.label}
        </Badge>
      ),
    },
    {
      key: "notes",
      label: "Notes",
      render: (entry) => (
        <span className="text-sm">{entry.notes || "N/A"}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (entry) => (
        <div className="flex space-x-2">
          {entry.status === "pending" && (
            <Link
              to={`/receptionist/appointments/booking?clientId=${entry.clientId}&consultantId=${entry.preferredConsultantId}`}
            >
              <Button
                size="sm"
                variant="outline"
                disabled={!hasPermission("create", "appointments")}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setShowModal({ show: true, mode: "edit", entry });
              setWaitingListForm({
                clientName: entry.clientName,
                email: entry.email,
                phone: entry.phone,
                preferredConsultantId: entry.preferredConsultantId,
                preferredDateTime: entry.preferredDateTime,
                status: entry.status,
                notes: entry.notes,
              });
            }}
            disabled={!hasPermission("edit", "waiting-list")}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteEntry(entry.id)}
            className="border-red-300 text-red-600 hover:bg-red-50"
            disabled={!hasPermission("delete", "waiting-list")}
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

  if (!hasPermission("manage", "waiting-list")) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Access Denied
        </h3>
        <p className="text-gray-600">
          You do not have permission to manage the waiting list.
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
          <h1 className="text-2xl font-bold text-gray-900">Waiting List</h1>
          <p className="text-gray-600">Manage clients awaiting appointments.</p>
        </div>
        <Button
          onClick={() => setShowModal({ show: true, mode: "add", entry: null })}
          disabled={!hasPermission("create", "waiting-list")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or phone..."
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
            {waitingListStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            {filteredWaitingList.length} of {waitingList.length} entries
          </div>
        </div>
      </Card>

      {/* Waiting List Table */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Waiting List</h3>
        {filteredWaitingList.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No waiting list entries
            </h3>
            <p className="text-gray-600 mb-4">
              {Object.values(filters).some((f) => f)
                ? "No entries match your current filters."
                : "Add a client to the waiting list to get started."}
            </p>
            <Button
              onClick={() =>
                setShowModal({ show: true, mode: "add", entry: null })
              }
              disabled={!hasPermission("create", "waiting-list")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Client
            </Button>
          </div>
        ) : (
          <DataTable
            data={filteredWaitingList}
            columns={columns}
            pagination={true}
            pageSize={10}
          />
        )}
      </Card>

      {/* Waiting List Modal */}
      <Modal
        isOpen={showModal.show}
        onClose={() => {
          setShowModal({ show: false, mode: "add", entry: null });
          resetForm();
        }}
        title={
          showModal.mode === "add"
            ? "Add Client to Waiting List"
            : "Edit Waiting List Entry"
        }
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Name *
            </label>
            <Input
              value={waitingListForm.clientName}
              onChange={(e) =>
                setWaitingListForm({
                  ...waitingListForm,
                  clientName: e.target.value,
                })
              }
              placeholder="Enter client name"
              className={formErrors.clientName ? "border-red-500" : ""}
            />
            {formErrors.clientName && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.clientName}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <Input
              type="email"
              value={waitingListForm.email}
              onChange={(e) =>
                setWaitingListForm({
                  ...waitingListForm,
                  email: e.target.value,
                })
              }
              placeholder="Enter client email"
              className={formErrors.email ? "border-red-500" : ""}
            />
            {formErrors.email && (
              <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <Input
              type="tel"
              value={waitingListForm.phone}
              onChange={(e) =>
                setWaitingListForm({
                  ...waitingListForm,
                  phone: e.target.value,
                })
              }
              placeholder="Enter client phone"
              className={formErrors.phone ? "border-red-500" : ""}
            />
            {formErrors.phone && (
              <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Consultant
            </label>
            <select
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                formErrors.preferredConsultantId ? "border-red-500" : ""
              }`}
              value={waitingListForm.preferredConsultantId}
              onChange={(e) =>
                setWaitingListForm({
                  ...waitingListForm,
                  preferredConsultantId: e.target.value,
                })
              }
            >
              <option value="">Any Consultant</option>
              {consultants.map((consultant) => (
                <option key={consultant.id} value={consultant.id}>
                  {consultant.name}
                </option>
              ))}
            </select>
            {formErrors.preferredConsultantId && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.preferredConsultantId}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Date/Time
            </label>
            <Input
              type="datetime-local"
              value={waitingListForm.preferredDateTime}
              onChange={(e) =>
                setWaitingListForm({
                  ...waitingListForm,
                  preferredDateTime: e.target.value,
                })
              }
              className={formErrors.preferredDateTime ? "border-red-500" : ""}
            />
            {formErrors.preferredDateTime && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.preferredDateTime}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                formErrors.status ? "border-red-500" : ""
              }`}
              value={waitingListForm.status}
              onChange={(e) =>
                setWaitingListForm({
                  ...waitingListForm,
                  status: e.target.value,
                })
              }
            >
              {waitingListStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            {formErrors.status && (
              <p className="text-red-500 text-xs mt-1">{formErrors.status}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              value={waitingListForm.notes}
              onChange={(e) =>
                setWaitingListForm({
                  ...waitingListForm,
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
                setShowModal({ show: false, mode: "add", entry: null });
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEntry}>
              {showModal.mode === "add" ? "Add Client" : "Update Entry"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WaitingList;
