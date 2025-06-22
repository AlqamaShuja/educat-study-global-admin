import React, { useState, useEffect } from "react";
import useOfficeStore from "../../stores/officeStore";
import useUserStore from "../../stores/userStore";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable from "../../components/tables/DataTable";
import TableFilters from "../../components/tables/TableFilters";
import { Plus, Edit, Trash2, MapPin, Users, Phone, Mail } from "lucide-react";
import useUIStore from "../../stores/uiStore";
import OfficeFormModal from "../../components/forms/OfficeFormModal";

const OfficeManagement = () => {
  const {
    offices,
    isLoading,
    error,
    fetchOffices,
    createOffice,
    updateOffice,
    deleteOffice,
    toggleOfficeStatus,
  } = useOfficeStore();

  const { users, fetchAllStaff } = useUserStore();
  const { theme } = useUIStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    country: "",
    hasManager: "",
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
    contact: {
      phone: "",
      email: "",
      website: "",
    },
    officeHours: {
      Monday: "9:00 AM - 5:00 PM",
      Tuesday: "9:00 AM - 5:00 PM",
      Wednesday: "9:00 AM - 5:00 PM",
      Thursday: "9:00 AM - 5:00 PM",
      Friday: "9:00 AM - 5:00 PM",
      Saturday: "Closed",
      Sunday: "Closed",
    },
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    serviceCapacity: {
      maxAppointments: 20,
      maxConsultants: 5,
    },
    managerId: "",
    consultants: [],
    isActive: true,
    isBranch: false,
  });

  useEffect(() => {
    loadData();
  }, [filters, searchTerm]);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchOffices({ search: searchTerm, ...filters }),
        fetchAllStaff(),
      ]);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
      },
      contact: {
        phone: "",
        email: "",
        website: "",
      },
      officeHours: {
        Monday: "9:00 AM - 5:00 PM",
        Tuesday: "9:00 AM - 5:00 PM",
        Wednesday: "9:00 AM - 5:00 PM",
        Thursday: "9:00 AM - 5:00 PM",
        Friday: "9:00 AM - 5:00 PM",
        Saturday: "Closed",
        Sunday: "Closed",
      },
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      serviceCapacity: {
        maxAppointments: 20,
        maxConsultants: 5,
      },
      managerId: "",
      consultants: [],
      isActive: true,
    });
  };

  const handleCreateOffice = async () => {
    try {
      await createOffice(formData);
      setIsCreateModalOpen(false);
      resetForm();
      await loadData();
    } catch (error) {
      console.error("Failed to create office:", error);
    }
  };

  const handleUpdateOffice = async () => {
    try {
      await updateOffice(selectedOffice.id, formData);
      setIsEditModalOpen(false);
      setSelectedOffice(null);
      resetForm();
      await loadData();
    } catch (error) {
      console.error("Failed to update office:", error);
    }
  };

  const handleDeleteOffice = async (officeId) => {
    try {
      await deleteOffice(officeId);
      setDeleteConfirm(null);
      await loadData();
    } catch (error) {
      console.error("Failed to delete office:", error);
    }
  };

  const handleToggleStatus = async (office) => {
    try {
      await toggleOfficeStatus(office.id, !office.isActive);
      await loadData();
    } catch (error) {
      console.error("Failed to toggle office status:", error);
    }
  };

  const handleEditOffice = (office) => {
    setSelectedOffice(office);
    setFormData({
      name: office.name || "",
      address: office.address || {
        street: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
      },
      contact: office.contact || {
        phone: "",
        email: "",
        website: "",
      },
      officeHours: office.officeHours || {
        Monday: "9:00 AM - 5:00 PM",
        Tuesday: "9:00 AM - 5:00 PM",
        Wednesday: "9:00 AM - 5:00 PM",
        Thursday: "9:00 AM - 5:00 PM",
        Friday: "9:00 AM - 5:00 PM",
        Saturday: "Closed",
        Sunday: "Closed",
      },
      workingDays: office.workingDays || [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      serviceCapacity: office.serviceCapacity || {
        maxAppointments: 20,
        maxConsultants: 5,
      },
      managerId: office.managerId || "",
      consultants: office.consultants?.map((c) => c.id) || [],
      isActive: office.isActive !== undefined ? office.isActive : true,
    });
    setIsEditModalOpen(true);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const getStatusBadge = (isActive) => {
    return (
      <Badge
        color={isActive ? "green" : "gray"}
        className="flex items-center gap-1"
      >
        {/* {isActive ? (
          <ToggleRight className="w-3 h-3" />
        ) : (
          <ToggleLeft className="w-3 h-3" />
        )} */}
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  const filteredOffices =
    offices
      ?.map((office) => ({
        ...office,
        consultants: office.consultants || [], // Normalize consultants to empty array
      }))
      .filter((office) => {
        const matchesSearch =
          !searchTerm ||
          office.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          office.address?.city
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesStatus =
          !filters.status ||
          (filters.status === "active" && office.isActive) ||
          (filters.status === "inactive" && !office.isActive);

        const matchesCountry =
          !filters.country ||
          office.address?.country
            ?.toLowerCase()
            .includes(filters.country.toLowerCase());

        const matchesManager =
          !filters.hasManager ||
          (filters.hasManager === "yes" && office.managerId) ||
          (filters.hasManager === "no" && !office.managerId);

        return (
          matchesSearch && matchesStatus && matchesCountry && matchesManager
        );
      }) || [];

  const columns = [
    {
      key: "name",
      header: "Office Name",
      sortable: true,
      render: (_, office) => (
        <div>
          <div className="font-medium text-blue-600">{office.name}</div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {office.address?.city}, {office.address?.country}
          </div>
        </div>
      ),
    },
    {
      key: "address",
      header: "Address",
      render: (_, office) => (
        <div className="text-sm text-gray-600">
          <div>{office.address?.street || "-"}</div>
          <div>
            {office.address?.city}, {office.address?.state || ""}
          </div>
          <div>
            {office.address?.country} {office.address?.postalCode || ""}
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (_, office) => (
        <div className="text-sm text-gray-600 space-y-1">
          {office.contact?.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {office.contact.phone}
            </div>
          )}
          {office.contact?.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {office.contact.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "manager",
      header: "Manager",
      render: (_, office) => (
        <div>
          {office.manager ? (
            <>
              <div className="font-medium text-gray-600">
                {office.manager.name}
              </div>
              <div className="text-sm text-gray-500">
                {office.manager.email}
              </div>
            </>
          ) : (
            <Badge color="gray">No Manager</Badge>
          )}
        </div>
      ),
    },
    {
      key: "consultants",
      header: "Consultants",
      render: (_, office) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600">
            {(office.consultants || []).length}
          </span>
          <span className="text-gray-500">
            / {office.serviceCapacity?.maxConsultants || 0}
          </span>
        </div>
      ),
    },
    {
      key: "capacity",
      header: "Capacity",
      render: (_, office) => (
        <div className="text-sm text-gray-600">
          <div>
            Max Appointments: {office.serviceCapacity?.maxAppointments || 0}
          </div>
          <div>
            Max Consultants: {office.serviceCapacity?.maxConsultants || 0}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (_, office) => getStatusBadge(office.isActive),
    },
    {
      key: "type",
      header: "Type",
      render: (_, office) => (
        <Badge variant={office.isBranch ? "primary" : "success"}>
          {office.isBranch ? "Branch Office" : "Our Office"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, office) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditOffice(office)}
            className="text-blue-600 hover:bg-blue-50 border-blue-300"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDeleteConfirm(office)}
            className="text-red-600 hover:bg-red-50 border-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "", label: "All Statuses" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    {
      key: "country",
      label: "Country",
      type: "select",
      options: [
        { value: "", label: "All Countries" },
        { value: "pakistan", label: "Pakistan" },
        { value: "uae", label: "UAE" },
        { value: "uk", label: "United Kingdom" },
        { value: "canada", label: "Canada" },
      ],
    },
    {
      key: "hasManager",
      label: "Manager",
      type: "select",
      options: [
        { value: "", label: "All Offices" },
        { value: "yes", label: "Has Manager" },
        { value: "no", label: "No Manager" },
      ],
    },
  ];

  if (isLoading && !offices?.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  return (
    <div
      className={`p-8 min-h-screen ${
        theme === "dark" ? "dark bg-gray-900 text-white" : ""
      }`}
    >
      {/* Header */}
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-lg border border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">
            Office Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your offices and their details efficiently
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Office
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
        <div className="flex flex-col w-full lg:flex-row gap-4 items-center">
          <TableFilters
            filters={filterOptions}
            activeFilters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={() =>
              setFilters({ status: "", country: "", hasManager: "" })
            }
            showDateRange={false}
            className="w-full"
          />
        </div>
      </div>

      {/* Offices Table */}
      <Card className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="bg-gradient-to-tr from-blue-700 to-purple-800 text-white p-4 rounded-t-2xl">
          <h2 className="text-lg font-semibold">All Offices</h2>
        </div>
        <DataTable
          data={filteredOffices}
          columns={columns}
          loading={isLoading}
          emptyMessage={
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No offices found</p>
              <p className="mt-2">
                Click "Add Office" to create your first office
              </p>
            </div>
          }
          className="hover:bg-blue-50 transition-colors"
        />
      </Card>

      {/* Create Office Modal */}
      <OfficeFormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        onSubmit={handleCreateOffice}
        title="Create New Office"
        formData={formData}
        setFormData={setFormData}
      />

      {/* Edit Office Modal */}
      <OfficeFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedOffice(null);
          resetForm();
        }}
        onSubmit={handleUpdateOffice}
        title="Edit Office"
        formData={formData}
        setFormData={setFormData}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDeleteOffice(deleteConfirm.id)}
        title="Delete Office"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone and will affect all associated staff and data.`}
        confirmText="Delete Office"
        confirmVariant="danger"
        className="bg-blue-50 border-blue-200 rounded-lg"
      />

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default OfficeManagement;
