import React, { useState, useEffect } from "react";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import usePermissions from "../../hooks/usePermissions";
import { validateWalkInForm, validateInput } from "../../utils/validators";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
// import Modal from "../../components/modal/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Toast from "../../components/ui/Toast";
import DataTable from "../../components/tables/DataTable";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Plus,
  Search,
  Shield,
  Edit,
  Trash2,
} from "lucide-react";
import Modal from "../../components/ui/Modal";

const WalkInRegistration = () => {
  const { user } = useAuth();
  const { callApi, loading: apiLoading, error: apiError } = useApi();
  const { hasPermission } = usePermissions();
  const [walkIns, setWalkIns] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [filters, setFilters] = useState({ search: "" });
  const [showModal, setShowModal] = useState({
    show: false,
    mode: "register",
    walkIn: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [walkInForm, setWalkInForm] = useState({
    clientName: "",
    email: "",
    phone: "",
    preferredConsultantId: "",
    purpose: "",
    action: "contact", // Options: 'contact', 'appointment', 'waiting'
  });

  const walkInStatuses = [
    {
      value: "registered",
      label: "Registered",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "appointed",
      label: "Appointed",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "waiting",
      label: "Waiting",
      color: "bg-yellow-100 text-yellow-800",
    },
    { value: "canceled", label: "Canceled", color: "bg-red-100 text-red-800" },
  ];

  const actionOptions = [
    { value: "contact", label: "Add to Contacts" },
    { value: "appointment", label: "Book Appointment" },
    { value: "waiting", label: "Add to Waiting List" },
  ];

  useEffect(() => {
    if (user && hasPermission("manage", "walk-ins")) {
      fetchConsultants();
      fetchWalkIns();
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

  const fetchWalkIns = async () => {
    try {
      const response = await callApi("GET", "/receptionist/walk-ins", {
        params: { date: new Date().toISOString().slice(0, 10) },
      });
      setWalkIns(
        response?.map((walkIn) => ({
          id: walkIn.id,
          clientName: validateInput(walkIn.clientName || "Unknown"),
          email: validateInput(walkIn.email || "N/A"),
          phone: validateInput(walkIn.phone || "N/A"),
          preferredConsultantName: validateInput(
            walkIn.preferredConsultantName || "None"
          ),
          purpose: validateInput(walkIn.purpose || "N/A"),
          status: walkIn.status,
          createdAt: walkIn.createdAt,
        })) || []
      );
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to fetch walk-ins",
        type: "error",
      });
    }
  };

  const handleRegisterWalkIn = async () => {
    const validationErrors = validateWalkInForm(walkInForm);
    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      const payload = {
        ...walkInForm,
        clientName: validateInput(walkInForm.clientName),
        email: validateInput(walkInForm.email),
        phone: validateInput(walkInForm.phone),
        purpose: validateInput(walkInForm.purpose),
      };

      let newWalkIn;
      if (showModal.mode === "register") {
        newWalkIn = await callApi("POST", "/receptionist/walk-ins", payload);
        setWalkIns((prev) => [...prev, newWalkIn]);
      } else {
        newWalkIn = await callApi(
          "PUT",
          `/receptionist/walk-ins/${showModal.walkIn.id}`,
          payload
        );
        setWalkIns((prev) =>
          prev.map((walkIn) =>
            walkIn.id === newWalkIn.id ? newWalkIn : walkIn
          )
        );
      }

      // Handle action
      if (walkInForm.action === "contact") {
        await callApi("POST", "/receptionist/contacts", {
          name: payload.clientName,
          email: payload.email,
          phone: payload.phone,
          type: "prospect",
          status: "contact",
          notes: payload.purpose,
        });
        setToast({
          show: true,
          message: "Walk-in registered and added to contacts!",
          type: "success",
        });
      } else if (walkInForm.action === "appointment") {
        // Redirect to appointment booking with pre-filled data
        setToast({
          show: true,
          message: "Redirecting to book appointment...",
          type: "success",
        });
        // Note: Actual redirect handled via Link or navigation in UI
      } else if (walkInForm.action === "waiting") {
        await callApi("POST", "/receptionist/waiting-list", {
          clientName: payload.clientName,
          email: payload.email,
          phone: payload.phone,
          preferredConsultantId: payload.preferredConsultantId,
          preferredDateTime: new Date().toISOString(),
          status: "pending",
          notes: payload.purpose,
        });
        setToast({
          show: true,
          message: "Walk-in registered and added to waiting list!",
          type: "success",
        });
      }

      setShowModal({ show: false, mode: "register", walkIn: null });
      resetForm();
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to register walk-in",
        type: "error",
      });
    }
  };

  const handleDeleteWalkIn = async (walkInId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this walk-in registration?"
      )
    )
      return;

    try {
      await callApi("DELETE", `/receptionist/walk-ins/${walkInId}`);
      setWalkIns((prev) => prev.filter((walkIn) => walkIn.id !== walkInId));
      setToast({
        show: true,
        message: "Walk-in registration deleted!",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to delete walk-in",
        type: "error",
      });
    }
  };

  const resetForm = () => {
    setWalkInForm({
      clientName: "",
      email: "",
      phone: "",
      preferredConsultantId: "",
      purpose: "",
      action: "contact",
    });
    setFormErrors({});
  };

  const filteredWalkIns = walkIns.filter(
    (walkIn) =>
      !filters.search ||
      walkIn.clientName.toLowerCase().includes(filters.search.toLowerCase()) ||
      walkIn.email.toLowerCase().includes(filters.search.toLowerCase())
  );

  const getStatusColor = (status) =>
    walkInStatuses.find((s) => s.value === status)?.color ||
    "bg-gray-100 text-gray-800";

  const columns = [
    {
      key: "clientName",
      label: "Client",
      render: (walkIn) => (
        <div className="flex items-center">
          <User className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{walkIn.clientName}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (walkIn) => (
        <div className="flex items-center">
          <Mail className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{walkIn.email}</span>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (walkIn) => (
        <div className="flex items-center">
          <Phone className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{walkIn.phone}</span>
        </div>
      ),
    },
    {
      key: "preferredConsultantName",
      label: "Consultant",
      render: (walkIn) => (
        <div className="flex items-center">
          <User className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{walkIn.preferredConsultantName}</span>
        </div>
      ),
    },
    {
      key: "purpose",
      label: "Purpose",
      render: (walkIn) => <span className="text-sm">{walkIn.purpose}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (walkIn) => (
        <Badge className={getStatusColor(walkIn.status)}>
          {walkInStatuses.find((s) => s.value === walkIn.status)?.label}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Registered At",
      render: (walkIn) => (
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1" />
          {new Date(walkIn.createdAt).toLocaleString()}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (walkIn) => (
        <div className="flex space-x-2">
          {walkIn.status === "registered" && (
            <Link
              to={`/receptionist/appointments/booking?clientName=${encodeURIComponent(
                walkIn.clientName
              )}&consultantId=${walkIn.preferredConsultantId}`}
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
              setShowModal({ show: true, mode: "edit", walkIn });
              setWalkInForm({
                clientName: walkIn.clientName,
                email: walkIn.email,
                phone: walkIn.phone,
                preferredConsultantId: walkIn.preferredConsultantId || "",
                purpose: walkIn.purpose,
                action: "contact",
              });
            }}
            disabled={!hasPermission("edit", "walk-ins")}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteWalkIn(walkIn.id)}
            className="border-red-300 text-red-600 hover:bg-red-50"
            disabled={!hasPermission("delete", "walk-ins")}
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

  if (!hasPermission("manage", "walk-ins")) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Access Denied
        </h3>
        <p className="text-gray-600">
          You do not have permission to manage walk-in registrations.
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
            Walk-In Registration
          </h1>
          <p className="text-gray-600">
            Register walk-in clients and manage their actions.
          </p>
        </div>
        <Button
          onClick={() =>
            setShowModal({ show: true, mode: "register", walkIn: null })
          }
          disabled={!hasPermission("create", "walk-ins")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Register Walk-In
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Registration Form Modal */}
      <Modal
        isOpen={showModal.show}
        onClose={() => {
          setShowModal({ show: false, mode: "register", walkIn: null });
          resetForm();
        }}
        title={
          showModal.mode === "register"
            ? "Register Walk-In Client"
            : "Edit Walk-In Registration"
        }
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Name *
            </label>
            <Input
              value={walkInForm.clientName}
              onChange={(e) =>
                setWalkInForm({ ...walkInForm, clientName: e.target.value })
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
              value={walkInForm.email}
              onChange={(e) =>
                setWalkInForm({ ...walkInForm, email: e.target.value })
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
              value={walkInForm.phone}
              onChange={(e) =>
                setWalkInForm({ ...walkInForm, phone: e.target.value })
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
            <Select
              options={[
                { value: "", label: "None" },
                ...consultants.map((consultant) => ({
                  value: consultant.id,
                  label: consultant.name,
                })),
              ]}
              value={walkInForm.preferredConsultantId}
              onChange={(value) =>
                setWalkInForm({ ...walkInForm, preferredConsultantId: value })
              }
              className={
                formErrors.preferredConsultantId ? "border-red-500" : ""
              }
            />
            {formErrors.preferredConsultantId && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.preferredConsultantId}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose of Visit *
            </label>
            <textarea
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                formErrors.purpose ? "border-red-500" : ""
              }`}
              rows={3}
              value={walkInForm.purpose}
              onChange={(e) =>
                setWalkInForm({ ...walkInForm, purpose: e.target.value })
              }
              placeholder="Enter purpose of visit..."
            />
            {formErrors.purpose && (
              <p className="text-red-500 text-xs mt-1">{formErrors.purpose}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action *
            </label>
            <Select
              options={actionOptions}
              value={walkInForm.action}
              onChange={(value) =>
                setWalkInForm({ ...walkInForm, action: value })
              }
              className={formErrors.action ? "border-red-500" : ""}
            />
            {formErrors.action && (
              <p className="text-red-500 text-xs mt-1">{formErrors.action}</p>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowModal({ show: false, mode: "register", walkIn: null });
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRegisterWalkIn}>
              {showModal.mode === "register"
                ? "Register Walk-In"
                : "Update Registration"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Recent Walk-Ins Table */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          Recent Walk-In Registrations
        </h3>
        {filteredWalkIns.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No walk-in registrations today
            </h3>
            <p className="text-gray-600 mb-4">
              {filters.search
                ? "No registrations match your search."
                : "Register a walk-in client to get started."}
            </p>
            <Button
              onClick={() =>
                setShowModal({ show: true, mode: "register", walkIn: null })
              }
              disabled={!hasPermission("create", "walk-ins")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Register First Walk-In
            </Button>
          </div>
        ) : (
          <DataTable
            data={filteredWalkIns}
            columns={columns}
            pagination={true}
            pageSize={10}
          />
        )}
      </Card>
    </div>
  );
};

export default WalkInRegistration;
