import React, { useState, useEffect } from "react";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import usePermissions from "../../hooks/usePermissions";
import { validateOfficeForm, validateInput } from "../../utils/validators";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Toast from "../../components/ui/Toast";
import DataTable from "../../components/tables/DataTable";
import {
  Building,
  Plus,
  Edit,
  Trash2,
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
} from "@lucide/react";

const CreateOffice = () => {
  const { user } = useAuth();
  const { callApi, loading: apiLoading, error: apiError } = useApi();
  const { hasPermission } = usePermissions();
  const [offices, setOffices] = useState([]);
  const [managers, setManagers] = useState([]);
  const [filters, setFilters] = useState({ search: "" });
  const [showForm, setShowForm] = useState(false);
  const [editOffice, setEditOffice] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [officeForm, setOfficeForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    managerId: "",
  });

  useEffect(() => {
    if (user && hasPermission("manage", "offices")) {
      fetchManagers();
      fetchOffices();
    }
  }, [user]);

  const fetchManagers = async () => {
    try {
      const response = await callApi("GET", "/super-admin/managers");
      setManagers(
        response?.map((manager) => ({
          id: manager.id,
          name: validateInput(manager.name),
        })) || []
      );
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to fetch managers",
        type: "error",
      });
    }
  };

  const fetchOffices = async () => {
    try {
      const response = await callApi("GET", "/super-admin/offices");
      setOffices(
        response?.map((office) => ({
          id: office.id,
          name: validateInput(office.name || "Untitled"),
          address: validateInput(office.address || "N/A"),
          city: validateInput(office.city || "N/A"),
          state: validateInput(office.state || "N/A"),
          zipCode: validateInput(office.zipCode || "N/A"),
          phone: validateInput(office.phone || "N/A"),
          email: validateInput(office.email || "N/A"),
          managerId: office.managerId,
          managerName: validateInput(office.managerName || "Unassigned"),
          createdAt: office.createdAt,
        })) || []
      );
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to fetch offices",
        type: "error",
      });
    }
  };

  const handleSaveOffice = async () => {
    const validationErrors = validateOfficeForm(officeForm);
    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      const payload = {
        ...officeForm,
        name: validateInput(officeForm.name),
        address: validateInput(officeForm.address),
        city: validateInput(officeForm.city),
        state: validateInput(officeForm.state),
        zipCode: validateInput(officeForm.zipCode),
        phone: validateInput(officeForm.phone),
        email: validateInput(officeForm.email),
      };

      if (editOffice) {
        const updatedOffice = await callApi(
          "PUT",
          `/super-admin/offices/${editOffice.id}`,
          payload
        );
        setOffices((prev) =>
          prev.map((office) =>
            office.id === updatedOffice.id ? updatedOffice : office
          )
        );
        setToast({
          show: true,
          message: "Office updated successfully!",
          type: "success",
        });
      } else {
        const newOffice = await callApi(
          "POST",
          "/super-admin/offices",
          payload
        );
        setOffices((prev) => [...prev, newOffice]);
        setToast({
          show: true,
          message: "Office created successfully!",
          type: "success",
        });
      }

      resetForm();
      setShowForm(false);
      setEditOffice(null);
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to save office",
        type: "error",
      });
    }
  };

  const handleDeleteOffice = async (officeId) => {
    if (!window.confirm("Are you sure you want to delete this office?")) return;

    try {
      await callApi("DELETE", `/super-admin/offices/${officeId}`);
      setOffices((prev) => prev.filter((office) => office.id !== officeId));
      setToast({
        show: true,
        message: "Office deleted successfully!",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: apiError || "Failed to delete office",
        type: "error",
      });
    }
  };

  const resetForm = () => {
    setOfficeForm({
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
      managerId: "",
    });
    setFormErrors({});
  };

  const filteredOffices = offices.filter(
    (office) =>
      !filters.search ||
      office.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      office.city.toLowerCase().includes(filters.search.toLowerCase())
  );

  const columns = [
    {
      key: "name",
      label: "Office Name",
      render: (office) => (
        <div className="flex items-center">
          <Building className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{office.name}</span>
        </div>
      ),
    },
    {
      key: "address",
      label: "Address",
      render: (office) => (
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{`${office.address}, ${office.city}, ${office.state} ${office.zipCode}`}</span>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (office) => (
        <div className="flex items-center">
          <Phone className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{office.phone}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (office) => (
        <div className="flex items-center">
          <Mail className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{office.email}</span>
        </div>
      ),
    },
    {
      key: "managerName",
      label: "Manager",
      render: (office) => (
        <div className="flex items-center">
          <User className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{office.managerName}</span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (office) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditOffice(office);
              setOfficeForm({
                name: office.name,
                address: office.address,
                city: office.city,
                state: office.state,
                zipCode: office.zipCode,
                phone: office.phone,
                email: office.email,
                managerId: office.managerId || "",
              });
              setShowForm(true);
            }}
            disabled={!hasPermission("edit", "offices")}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteOffice(office.id)}
            className="border-red-300 text-red-600 hover:bg-red-50"
            disabled={!hasPermission("delete", "offices")}
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

  if (!hasPermission("manage", "offices")) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Access Denied
        </h3>
        <p className="text-gray-600">
          You do not have permission to manage offices.
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
            Office Management
          </h1>
          <p className="text-gray-600">Create and manage office locations.</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditOffice(null);
            resetForm();
          }}
          disabled={!hasPermission("create", "offices")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Office
        </Button>
      </div>

      {/* Office Form */}
      {showForm && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">
            {editOffice ? "Edit Office" : "Create Office"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Office Name *
              </label>
              <Input
                value={officeForm.name}
                onChange={(e) =>
                  setOfficeForm({ ...officeForm, name: e.target.value })
                }
                placeholder="Enter office name"
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && (
                <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <Input
                value={officeForm.address}
                onChange={(e) =>
                  setOfficeForm({ ...officeForm, address: e.target.value })
                }
                placeholder="Enter address"
                className={formErrors.address ? "border-red-500" : ""}
              />
              {formErrors.address && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.address}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <Input
                value={officeForm.city}
                onChange={(e) =>
                  setOfficeForm({ ...officeForm, city: e.target.value })
                }
                placeholder="Enter city"
                className={formErrors.city ? "border-red-500" : ""}
              />
              {formErrors.city && (
                <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <Input
                value={officeForm.state}
                onChange={(e) =>
                  setOfficeForm({ ...officeForm, state: e.target.value })
                }
                placeholder="Enter state"
                className={formErrors.state ? "border-red-500" : ""}
              />
              {formErrors.state && (
                <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zip Code *
              </label>
              <Input
                value={officeForm.zipCode}
                onChange={(e) =>
                  setOfficeForm({ ...officeForm, zipCode: e.target.value })
                }
                placeholder="Enter zip code"
                className={formErrors.zipCode ? "border-red-500" : ""}
              />
              {formErrors.zipCode && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.zipCode}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <Input
                type="tel"
                value={officeForm.phone}
                onChange={(e) =>
                  setOfficeForm({ ...officeForm, phone: e.target.value })
                }
                placeholder="Enter phone number"
                className={formErrors.phone ? "border-red-500" : ""}
              />
              {formErrors.phone && (
                <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={officeForm.email}
                onChange={(e) =>
                  setOfficeForm({ ...officeForm, email: e.target.value })
                }
                placeholder="Enter email"
                className={formErrors.email ? "border-red-500" : ""}
              />
              {formErrors.email && (
                <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manager
              </label>
              <Select
                options={[
                  { value: "", label: "Unassigned" },
                  ...managers.map((manager) => ({
                    value: manager.id,
                    label: manager.name,
                  })),
                ]}
                value={officeForm.managerId}
                onChange={(value) =>
                  setOfficeForm({ ...officeForm, managerId: value })
                }
                className={formErrors.managerId ? "border-red-500" : ""}
              />
              {formErrors.managerId && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.managerId}
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditOffice(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveOffice}>
              {editOffice ? "Update Office" : "Create Office"}
            </Button>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by office name or city..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Offices Table */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Office List</h3>
        {filteredOffices.length === 0 ? (
          <div className="text-center py-8">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No offices found
            </h3>
            <p className="text-gray-600 mb-4">
              {filters.search
                ? "No offices match your search."
                : "Create your first office to get started."}
            </p>
            <Button
              onClick={() => {
                setShowForm(true);
                setEditOffice(null);
                resetForm();
              }}
              disabled={!hasPermission("create", "offices")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Office
            </Button>
          </div>
        ) : (
          <DataTable
            data={filteredOffices}
            columns={columns}
            pagination={true}
            pageSize={10}
          />
        )}
      </Card>
    </div>
  );
};

export default CreateOffice;
