import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Users,
  Edit2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import StaffFormModal from "../../components/forms/AddOrEditStaffModal";
import useUserStore from "../../stores/userStore";
import useOfficeStore from "../../stores/officeStore";

const StaffManagement = () => {
  //   const [staff, setStaff] = useState([]);
  //   const [offices, setOffices] = useState([]);
  //   const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [officeFilter, setOfficeFilter] = useState("");

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    officeId: "",
    isActive: true,
  });

  const {
    users: staff,
    isLoading: loading,
    error,
    fetchAllStaff,
    createStaff,
    updateStaff,
    deleteStaff,
    toggleStaffStatus,
    importStaffCSV,
    getStaffLogs,
    bulkUpdateStaff,
  } = useUserStore();

  const { offices, fetchOffices } = useOfficeStore();

  console.log(offices, "acnascjasnjncasncs:offices");
  

  // Fetch staff and offices on component mount
  useEffect(() => {
    fetchAllStaff();
    fetchOffices();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "",
      officeId: "",
      isActive: true,
    });
    setFormErrors({});
    setEditingStaff(null);
  };

  const handleOpenModal = (staffMember = null) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        name: staffMember.name || "",
        email: staffMember.email || "",
        phone: staffMember.phone || "",
        password: "",
        role: staffMember.role || "",
        officeId: staffMember.officeId || "",
        isActive: staffMember.isActive !== false,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    try {
      setFormErrors({});

      console.log(formData, "asckasncsanscns");

      if(formData.officeId == ""){
        formData.officeId = null;
      }
      
      if (editingStaff) {
        await updateStaff(editingStaff.id, formData);
      } else {
        await createStaff(formData);
      }

      await fetchAllStaff();
      handleCloseModal();
    } catch (error) {
      setFormErrors({
        general: error.message || "An error occurred. Please try again.",
      });
    }
  };

//   const handleToggleStatus = async (staffId, currentStatus) => {
//     try {
//       await toggleStaffStatus(staffId, !currentStatus);
//     } catch (error) {
//       console.error("Error toggling staff status:", error);
//     }
//   };
  // Filter staff based on search and filters
  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !roleFilter || member.role === roleFilter;
    const matchesOffice = !officeFilter || member.officeId === officeFilter;

    return matchesSearch && matchesRole && matchesOffice;
  });

  const getRoleBadgeColor = (role) => {
    const colors = {
      super_admin: "bg-purple-100 text-purple-800",
      manager: "bg-blue-100 text-blue-800",
      consultant: "bg-green-100 text-green-800",
      receptionist: "bg-yellow-100 text-yellow-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const getOfficeName = (officeId) => {
    const office = offices.find((o) => o.id === officeId);
    return office ? `${office.name} - ${office.address?.city}` : "No Office";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-7 w-7 text-blue-600" />
            Staff Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage staff members, roles, and office assignments across your
            organization
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Staff Member
        </Button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="manager">Manager</option>
              <option value="consultant">Consultant</option>
              <option value="receptionist">Receptionist</option>
            </select>
          </div>

          {/* Office Filter */}
          <div>
            <select
              value={officeFilter}
              onChange={(e) => setOfficeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">All Offices</option>
              {offices.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.name} - {office.address?.city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Staff Members ({filteredStaff.length})
          </h2>
        </div>

        {filteredStaff.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No staff members found
            </h3>
            <p className="text-gray-600">
              {searchTerm || roleFilter || officeFilter
                ? "Try adjusting your search criteria"
                : "Get started by adding your first staff member"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Office Assignment
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
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.email}
                        </div>
                        {member.phone && (
                          <div className="text-sm text-gray-500">
                            {member.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                          member.role
                        )}`}
                      >
                        {member.role
                          ?.replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getOfficeName(member.officeId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        // onClick={() =>
                        //   handleToggleStatus(member.id, member.isActive)
                        // }
                        className="flex items-center gap-1"
                      >
                        {member.isActive ? (
                          <>
                            {/* <ToggleRight className="h-5 w-5 text-green-500" /> */}
                            <span className="text-sm text-green-600">
                              Active
                            </span>
                          </>
                        ) : (
                          <>
                            {/* <ToggleLeft className="h-5 w-5 text-gray-400" /> */}
                            <span className="text-sm text-gray-500">
                              Inactive
                            </span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(member)}
                        className="flex items-center gap-1"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Staff Form Modal */}
      <StaffFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        title={editingStaff ? "Edit Staff Member" : "Create New Staff Member"}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        offices={offices}
      />
    </div>
  );
};

export default StaffManagement;

//
//
//
// import React, { useState, useEffect } from "react";
// import useUserStore from "../../stores/userStore";
// import useOfficeStore from "../../stores/officeStore";
// import Card from "../../components/ui/Card";
// import Button from "../../components/ui/Button";
// import Input from "../../components/ui/Input";
// import Modal from "../../components/ui/Modal";
// import Badge from "../../components/ui/Badge";
// import LoadingSpinner from "../../components/ui/LoadingSpinner";
// import ConfirmDialog from "../../components/ui/ConfirmDialog";
// import DataTable from "../../components/tables/DataTable";
// import TableFilters from "../../components/tables/TableFilters";
// import BulkActions from "../../components/tables/BulkActions";
// import MetricsWidget from "../../components/charts/MetricsWidget";
// import {
//   Plus,
//   Edit,
//   Trash2,
//   Users,
//   UserCheck,
//   UserX,
//   Shield,
//   Mail,
//   Phone,
//   MapPin,
//   Search,
//   Download,
//   Upload,
//   ToggleLeft,
//   ToggleRight,
//   History,
//   Settings,
// } from "lucide-react";

// const StaffManagement = () => {
//   const {
//     users,
//     isLoading,
//     error,
//     fetchAllStaff,
//     createStaff,
//     updateStaff,
//     deleteStaff,
//     toggleStaffStatus,
//     importStaffCSV,
//     getStaffLogs,
//     bulkUpdateStaff,
//   } = useUserStore();

//   const { offices, fetchAllOffices } = useOfficeStore();

//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedStaff, setSelectedStaff] = useState([]);
//   const [filters, setFilters] = useState({
//     role: "",
//     status: "",
//     officeId: "",
//     lastLogin: "",
//   });
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isImportModalOpen, setIsImportModalOpen] = useState(false);
//   const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
//   const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [staffLogs, setStaffLogs] = useState([]);
//   const [deleteConfirm, setDeleteConfirm] = useState(null);
//   const [importFile, setImportFile] = useState(null);
//   const [bulkUpdateData, setBulkUpdateData] = useState({
//     role: "",
//     officeId: "",
//     isActive: "",
//   });
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     phone: "",
//     role: "",
//     officeId: "",
//     isActive: true,
//     permissions: [],
//   });
//   const [formErrors, setFormErrors] = useState({});

//   useEffect(() => {
//     loadData();
//   }, [filters, searchTerm]);

//   const loadData = async () => {
//     try {
//       await Promise.all([
//         fetchAllStaff({ search: searchTerm, ...filters }),
//         fetchAllOffices(),
//       ]);
//     } catch (err) {
//       console.error("Failed to load data:", err);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       name: "",
//       email: "",
//       password: "",
//       phone: "",
//       role: "",
//       officeId: "",
//       isActive: true,
//       permissions: [],
//     });
//     setFormErrors({});
//   };

//   const validateForm = (data, isCreate) => {
//     const errors = {};
//     if (!data.name.trim()) errors.name = "Name is required";
//     if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email))
//       errors.email = "Valid email is required";
//     if (isCreate && !data.password) errors.password = "Password is required";
//     if (data.phone && !/^\+?\d{10,15}$/.test(data.phone.replace(/\s/g, "")))
//       errors.phone = "Invalid phone number";
//     if (!data.role) errors.role = "Role is required";
//     return errors;
//   };

//   const handleCreateStaff = async () => {
//     const errors = validateForm(formData, true);
//     if (Object.keys(errors).length) {
//       setFormErrors(errors);
//       return;
//     }

//     try {
//       await createStaff(formData);
//       setIsCreateModalOpen(false);
//       resetForm();
//       await loadData();
//     } catch (err) {
//       setFormErrors({ general: err.message || "Failed to create staff" });
//     }
//   };

//   const handleUpdateStaff = async () => {
//     const errors = validateForm(formData, false);
//     if (Object.keys(errors).length) {
//       setFormErrors(errors);
//       return;
//     }

//     try {
//       await updateStaff(selectedUser.id, formData);
//       setIsEditModalOpen(false);
//       setSelectedUser(null);
//       resetForm();
//       await loadData();
//     } catch (err) {
//       setFormErrors({ general: err.message || "Failed to update staff" });
//     }
//   };

//   const handleDeleteStaff = async (staffId) => {
//     try {
//       await deleteStaff(staffId);
//       setDeleteConfirm(null);
//       await loadData();
//     } catch (err) {
//       console.error("Failed to delete staff:", err);
//     }
//   };

//   const handleToggleStatus = async (user) => {
//     try {
//       await toggleStaffStatus(user.id, !user.isActive);
//       await loadData();
//     } catch (err) {
//       console.error("Failed to toggle staff status:", err);
//     }
//   };

//   const handleEditStaff = (user) => {
//     setSelectedUser(user);
//     setFormData({
//       name: user.name || "",
//       email: user.email || "",
//       password: "",
//       phone: user.phone || "",
//       role: user.role || "",
//       officeId: user.officeId || "",
//       isActive: user.isActive !== undefined ? user.isActive : true,
//       permissions: user.permissions || [],
//     });
//     setIsEditModalOpen(true);
//   };

//   const handleViewLogs = async (user) => {
//     try {
//       setSelectedUser(user);
//       const logs = await getStaffLogs(user.id);
//       setStaffLogs(logs);
//       setIsLogsModalOpen(true);
//     } catch (err) {
//       console.error("Failed to fetch staff logs:", err);
//     }
//   };

//   const handleImportCSV = async () => {
//     if (!importFile) return;

//     try {
//       await importStaffCSV(importFile);
//       setIsImportModalOpen(false);
//       setImportFile(null);
//       await loadData();
//     } catch (err) {
//       console.error("Failed to import CSV:", err);
//     }
//   };

//   const handleBulkUpdate = async () => {
//     try {
//       await bulkUpdateStaff(selectedStaff, bulkUpdateData);
//       setIsBulkUpdateModalOpen(false);
//       setSelectedStaff([]);
//       setBulkUpdateData({ role: "", officeId: "", isActive: "" });
//       await loadData();
//     } catch (err) {
//       console.error("Failed to bulk update staff:", err);
//     }
//   };

//   const handleFilterChange = (filterName, value) => {
//     setFilters((prev) => ({
//       ...prev,
//       [filterName]: value,
//     }));
//   };

//   const handleExport = () => {
//     const csvContent = [
//       ["Name", "Email", "Role", "Office", "Status", "Last Login"],
//       ...filteredUsers.map((user) => [
//         user.name,
//         user.email,
//         user.role,
//         user.office?.name || "N/A",
//         user.isActive ? "Active" : "Inactive",
//         user.lastLogin
//           ? new Date(user.lastLogin).toLocaleDateString()
//           : "Never",
//       ]),
//     ]
//       .map((row) => row.join(","))
//       .join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = "staff_export.csv";
//     link.click();
//     window.URL.revokeObjectURL(url);
//   };

//   const getRoleBadge = (role) => {
//     const roleConfig = {
//       super_admin: { color: "red", icon: Shield },
//       manager: { color: "blue", icon: Users },
//       consultant: { color: "green", icon: UserCheck },
//       receptionist: { color: "purple", icon: UserCheck },
//       student: { color: "gray", icon: Users },
//     };

//     const config = roleConfig[role] || roleConfig.student;
//     const Icon = config.icon;

//     return (
//       <Badge color={config.color} className="flex items-center gap-1">
//         <Icon className="w-3 h-3" />
//         {role?.replace("_", " ")}
//       </Badge>
//     );
//   };

//   const getStatusBadge = (isActive) => {
//     return (
//       <Badge
//         color={isActive ? "green" : "gray"}
//         className="flex items-center gap-1"
//       >
//         {isActive ? (
//           <UserCheck className="w-3 h-3" />
//         ) : (
//           <UserX className="w-3 h-3" />
//         )}
//         {isActive ? "Active" : "Inactive"}
//       </Badge>
//     );
//   };

//   const filteredUsers =
//     users?.filter((user) => {
//       const matchesSearch =
//         !searchTerm ||
//         user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         user.email?.toLowerCase().includes(searchTerm.toLowerCase());

//       const matchesRole = !filters.role || user.role === filters.role;
//       const matchesStatus =
//         !filters.status ||
//         (filters.status === "active" && user.isActive) ||
//         (filters.status === "inactive" && !user.isActive);
//       const matchesOffice =
//         !filters.officeId || user.officeId === filters.officeId;

//       return matchesSearch && matchesRole && matchesStatus && matchesOffice;
//     }) || [];

//   const columns = [
//     {
//       key: "name",
//       label: "Staff Member",
//       sortable: true,
//       render: (user) => (
//         <div>
//           <div className="font-medium">{user.name}</div>
//           <div className="text-sm text-gray-500 flex items-center gap-1">
//             <Mail className="w-3 h-3" />
//             {user.email}
//           </div>
//         </div>
//       ),
//     },
//     {
//       key: "role",
//       label: "Role",
//       sortable: true,
//       render: (user) => getRoleBadge(user.role),
//     },
//     {
//       key: "contact",
//       label: "Contact",
//       render: (user) => (
//         <div className="text-sm space-y-1">
//           {user.phone && (
//             <div className="flex items-center gap-1">
//               <Phone className="w-3 h-3" />
//               {user.phone}
//             </div>
//           )}
//         </div>
//       ),
//     },
//     {
//       key: "office",
//       label: "Office",
//       render: (user) => (
//         <div>
//           {user.office ? (
//             <>
//               <div className="font-medium">{user.office.name}</div>
//               <div className="text-sm text-gray-500 flex items-center gap-1">
//                 <MapPin className="w-3 h-3" />
//                 {user.office.address?.city}
//               </div>
//             </>
//           ) : (
//             <Badge color="gray">No Office</Badge>
//           )}
//         </div>
//       ),
//     },
//     {
//       key: "status",
//       label: "Status",
//       sortable: true,
//       render: (user) => getStatusBadge(user.isActive),
//     },
//     {
//       key: "lastLogin",
//       label: "Last Login",
//       sortable: true,
//       render: (user) => (
//         <div className="text-sm">
//           {user.lastLogin ? (
//             <>
//               <div>{new Date(user.lastLogin).toLocaleDateString()}</div>
//               <div className="text-gray-500">
//                 {new Date(user.lastLogin).toLocaleTimeString()}
//               </div>
//             </>
//           ) : (
//             <span className="text-gray-500">Never</span>
//           )}
//         </div>
//       ),
//     },
//     {
//       key: "createdAt",
//       label: "Joined",
//       sortable: true,
//       render: (user) => new Date(user.createdAt).toLocaleDateString(),
//     },
//     {
//       key: "actions",
//       label: "Actions",
//       render: (user) => (
//         <div className="flex items-center gap-2">
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={() => handleViewLogs(user)}
//           >
//             <History className="w-4 h-4" />
//           </Button>
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={() => handleEditStaff(user)}
//           >
//             <Edit className="w-4 h-4" />
//           </Button>
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={() => handleToggleStatus(user)}
//             className={user.isActive ? "text-orange-600" : "text-green-600"}
//           >
//             {user.isActive ? (
//               <ToggleLeft className="w-4 h-4" />
//             ) : (
//               <ToggleRight className="w-4 h-4" />
//             )}
//           </Button>
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={() => setDeleteConfirm(user)}
//             className="text-red-600 hover:text-red-700"
//           >
//             <Trash2 className="w-4 h-4" />
//           </Button>
//         </div>
//       ),
//     },
//   ];

//   const filterOptions = [
//     {
//       key: "role",
//       label: "Role",
//       type: "select",
//       options: [
//         { value: "", label: "All Roles" },
//         { value: "super_admin", label: "Super Admin" },
//         { value: "manager", label: "Manager" },
//         { value: "consultant", label: "Consultant" },
//         { value: "receptionist", label: "Receptionist" },
//       ],
//     },
//     {
//       key: "status",
//       label: "Status",
//       type: "select",
//       options: [
//         { value: "", label: "All Statuses" },
//         { value: "active", label: "Active" },
//         { value: "inactive", label: "Inactive" },
//       ],
//     },
//     {
//       key: "officeId",
//       label: "Office",
//       type: "select",
//       options: [
//         { value: "", label: "All Offices" },
//         { value: "no_office", label: "No Office" },
//         ...(offices?.map((office) => ({
//           value: office.id,
//           label: office.name,
//         })) || []),
//       ],
//     },
//   ];

//   const bulkActions = [
//     {
//       label: "Bulk Update",
//       action: () => setIsBulkUpdateModalOpen(true),
//       icon: Edit,
//       disabled: selectedStaff.length === 0,
//     },
//     {
//       label: "Export Selected",
//       action: handleExport,
//       icon: Download,
//       disabled: selectedStaff.length === 0,
//     },
//   ];

//   const StaffFormModal = ({ isOpen, onClose, onSubmit, title }) => (
//     <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
//       <div className="space-y-6">
//         {formErrors.general && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//             {formErrors.general}
//           </div>
//         )}
//         {/* Basic Information */}
//         <div className="space-y-4">
//           <h3 className="text-lg font-medium border-b pb-2">
//             Basic Information
//           </h3>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-2">
//                 Full Name *
//               </label>
//               <Input
//                 value={formData.name}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     name: e.target.value,
//                   }))
//                 }
//                 placeholder="John Doe"
//                 className={formErrors.name ? "border-red-500" : ""}
//                 required
//               />
//               {formErrors.name && (
//                 <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
//               )}
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2">Email *</label>
//               <Input
//                 type="email"
//                 value={formData.email}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     email: e.target.value,
//                   }))
//                 }
//                 placeholder="john@example.com"
//                 className={formErrors.email ? "border-red-500" : ""}
//                 required
//               />
//               {formErrors.email && (
//                 <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
//               )}
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-2">Phone</label>
//               <Input
//                 value={formData.phone}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     phone: e.target.value,
//                   }))
//                 }
//                 placeholder="+1-234-567-8900"
//                 className={formErrors.phone ? "border-red-500" : ""}
//               />
//               {formErrors.phone && (
//                 <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
//               )}
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2">
//                 {title.includes("Create")
//                   ? "Password *"
//                   : "New Password (Optional)"}
//               </label>
//               <Input
//                 type="password"
//                 value={formData.password}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     password: e.target.value,
//                   }))
//                 }
//                 placeholder={
//                   title.includes("Create")
//                     ? "Enter password"
//                     : "Leave blank to keep current"
//                 }
//                 className={formErrors.password ? "border-red-500" : ""}
//                 required={title.includes("Create")}
//               />
//               {formErrors.password && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {formErrors.password}
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Role & Office Assignment */}
//         <div className="space-y-4">
//           <h3 className="text-lg font-medium border-b pb-2">
//             Role & Assignment
//           </h3>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-2">Role *</label>
//               <select
//                 value={formData.role}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     role: e.target.value,
//                     officeId:
//                       e.target.value === "super_admin" ? "" : prev.officeId,
//                   }))
//                 }
//                 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                   formErrors.role ? "border-red-500" : "border-gray-300"
//                 }`}
//                 required
//               >
//                 <option value="">Select Role</option>
//                 <option value="super_admin">Super Admin</option>
//                 <option value="manager">Manager</option>
//                 <option value="consultant">Consultant</option>
//                 <option value="receptionist">Receptionist</option>
//               </select>
//               {formErrors.role && (
//                 <p className="text-red-500 text-sm mt-1">{formErrors.role}</p>
//               )}
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2">
//                 Office Assignment
//               </label>
//               <select
//                 value={formData.officeId}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     officeId: e.target.value,
//                   }))
//                 }
//                 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                   formErrors.officeId ? "border-red-500" : "border-gray-300"
//                 }`}
//                 disabled={formData.role === "super_admin"}
//               >
//                 <option value="">No Office Assignment</option>
//                 {offices?.map((office) => (
//                   <option key={office.id} value={office.id}>
//                     {office.name} - {office.address?.city}
//                   </option>
//                 ))}
//               </select>
//               {formErrors.officeId && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {formErrors.officeId}
//                 </p>
//               )}
//               {formData.role === "super_admin" && (
//                 <p className="text-sm text-gray-500 mt-1">
//                   Super admins are not assigned to specific offices
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <label className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 checked={formData.isActive}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     isActive: e.target.checked,
//                   }))
//                 }
//                 className="rounded"
//               />
//               Active Staff Member
//             </label>
//           </div>
//         </div>

//         <div className="flex justify-end gap-2 pt-4 border-t">
//           <Button variant="outline" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button
//             onClick={onSubmit}
//             disabled={
//               !formData.name ||
//               !formData.email ||
//               !formData.role ||
//               (title.includes("Create") && !formData.password)
//             }
//           >
//             {title.includes("Create") ? "Create Staff" : "Update Staff"}
//           </Button>
//         </div>
//       </div>
//     </Modal>
//   );

//   if (isLoading && !users?.length) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-3xl font-bold">Staff Management</h1>
//           <p className="text-gray-600">
//             Manage all staff members, roles, and permissions
//           </p>
//         </div>

//         <div className="flex gap-2">
//           <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
//             <Upload className="w-4 h-4 mr-2" />
//             Import CSV
//           </Button>
//           <Button variant="outline" onClick={handleExport}>
//             <Download className="w-4 h-4 mr-2" />
//             Export
//           </Button>
//           <Button onClick={() => setIsCreateModalOpen(true)}>
//             <Plus className="w-4 h-4 mr-2" />
//             Add Staff
//           </Button>
//         </div>
//       </div>

//       {/* Staff Metrics */}
//       <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//         <MetricsWidget
//           title="Total Staff"
//           value={filteredUsers?.length || 0}
//           icon={<Users className="w-6 h-6" />}
//           color="blue"
//         />
//         <MetricsWidget
//           title="Active Staff"
//           value={filteredUsers?.filter((user) => user.isActive)?.length || 0}
//           icon={<UserCheck className="w-6 h-6" />}
//           color="green"
//         />
//         <MetricsWidget
//           title="Managers"
//           value={
//             filteredUsers?.filter((user) => user.role === "manager")?.length ||
//             0
//           }
//           icon={<Shield className="w-6 h-6" />}
//           color="purple"
//         />
//         <MetricsWidget
//           title="Consultants"
//           value={
//             filteredUsers?.filter((user) => user.role === "consultant")
//               ?.length || 0
//           }
//           icon={<UserCheck className="w-6 h-6" />}
//           color="orange"
//         />
//         <MetricsWidget
//           title="Receptionists"
//           value={
//             filteredUsers?.filter((user) => user.role === "receptionist")
//               ?.length || 0
//           }
//           icon={<Settings className="w-6 h-6" />}
//           color="cyan"
//         />
//       </div>

//       {/* Search and Filters */}
//       <Card className="p-4">
//         <div className="flex flex-col lg:flex-row gap-4">
//           <div className="flex-1">
//             <Input
//               placeholder="Search by name, email, or role..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               icon={<Search className="w-4 h-4" />}
//             />
//           </div>
//           <TableFilters
//             filters={filters}
//             onFilterChange={handleFilterChange}
//             options={filterOptions}
//           />
//         </div>
//       </Card>

//       {/* Bulk Actions */}
//       {selectedStaff.length > 0 && (
//         <BulkActions
//           selectedCount={selectedStaff.length}
//           actions={bulkActions}
//           onClearSelection={() => setSelectedStaff([])}
//         />
//       )}

//       {/* Staff Table */}
//       <Card>
//         <DataTable
//           data={filteredUsers}
//           columns={columns}
//           selectable
//           selectedRows={selectedStaff}
//           onSelectionChange={setSelectedStaff}
//           loading={isLoading}
//           emptyMessage="No staff members found. Add your first staff member to get started."
//         />
//       </Card>

//       {/* Create Staff Modal */}
//       <StaffFormModal
//         isOpen={isCreateModalOpen}
//         onClose={() => {
//           setIsCreateModalOpen(false);
//           resetForm();
//         }}
//         onSubmit={handleCreateStaff}
//         title="Create New Staff Member"
//       />

//       {/* Edit Staff Modal */}
//       <StaffFormModal
//         isOpen={isEditModalOpen}
//         onClose={() => {
//           setIsEditModalOpen(false);
//           setSelectedUser(null);
//           resetForm();
//         }}
//         onSubmit={handleUpdateStaff}
//         title="Edit Staff Member"
//       />

//       {/* Import CSV Modal */}
//       <Modal
//         isOpen={isImportModalOpen}
//         onClose={() => {
//           setIsImportModalOpen(false);
//           setImportFile(null);
//         }}
//         title="Import Staff from CSV"
//         size="md"
//       >
//         <div className="space-y-4">
//           <div className="p-4 bg-blue-50 rounded-lg">
//             <h4 className="font-medium mb-2">CSV Format Requirements</h4>
//             <ul className="text-sm text-blue-800 space-y-1">
//               <li>• Headers: name, email, password, phone, role, officeId</li>
//               <li>• Role values: manager, consultant, receptionist</li>
//               <li>• officeId should match existing office IDs</li>
//               <li>• All fields are required except phone and officeId</li>
//             </ul>
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-2">
//               Select CSV File
//             </label>
//             <input
//               type="file"
//               accept=".csv"
//               onChange={(e) => setImportFile(e.target.files[0])}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div className="flex justify-end gap-2 pt-4 border-t">
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setIsImportModalOpen(false);
//                 setImportFile(null);
//               }}
//             >
//               Cancel
//             </Button>
//             <Button onClick={handleImportCSV} disabled={!importFile}>
//               Import Staff
//             </Button>
//           </div>
//         </div>
//       </Modal>

//       {/* Bulk Update Modal */}
//       <Modal
//         isOpen={isBulkUpdateModalOpen}
//         onClose={() => {
//           setIsBulkUpdateModalOpen(false);
//           setBulkUpdateData({ role: "", officeId: "", isActive: "" });
//         }}
//         title={`Bulk Update ${selectedStaff.length} Staff Members`}
//         size="md"
//       >
//         <div className="space-y-4">
//           <div className="p-3 bg-orange-50 rounded-lg">
//             <p className="text-sm text-orange-800">
//               You are about to update {selectedStaff.length} staff members. Only
//               filled fields will be updated.
//             </p>
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-2">
//               Change Role
//             </label>
//             <select
//               value={bulkUpdateData.role}
//               onChange={(e) =>
//                 setBulkUpdateData((prev) => ({
//                   ...prev,
//                   role: e.target.value,
//                 }))
//               }
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">Keep Current Role</option>
//               <option value="manager">Manager</option>
//               <option value="consultant">Consultant</option>
//               <option value="receptionist">Receptionist</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-2">
//               Change Office Assignment
//             </label>
//             <select
//               value={bulkUpdateData.officeId}
//               onChange={(e) =>
//                 setBulkUpdateData((prev) => ({
//                   ...prev,
//                   officeId: e.target.value,
//                 }))
//               }
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">Keep Current Office</option>
//               <option value="null">Remove Office Assignment</option>
//               {offices?.map((office) => (
//                 <option key={office.id} value={office.id}>
//                   {office.name} - {office.address?.city}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-2">
//               Change Status
//             </label>
//             <select
//               value={bulkUpdateData.isActive}
//               onChange={(e) =>
//                 setBulkUpdateData((prev) => ({
//                   ...prev,
//                   isActive: e.target.value,
//                 }))
//               }
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">Keep Current Status</option>
//               <option value="true">Activate</option>
//               <option value="false">Deactivate</option>
//             </select>
//           </div>

//           <div className="flex justify-end gap-2 pt-4 border-t">
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setIsBulkUpdateModalOpen(false);
//                 setBulkUpdateData({ role: "", officeId: "", isActive: "" });
//               }}
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleBulkUpdate}
//               disabled={
//                 !bulkUpdateData.role &&
//                 !bulkUpdateData.officeId &&
//                 !bulkUpdateData.isActive
//               }
//             >
//               Update Selected Staff
//             </Button>
//           </div>
//         </div>
//       </Modal>

//       {/* Staff Logs Modal */}
//       <Modal
//         isOpen={isLogsModalOpen}
//         onClose={() => {
//           setIsLogsModalOpen(false);
//           setSelectedUser(null);
//           setStaffLogs([]);
//         }}
//         title="Staff Activity Logs"
//         size="lg"
//       >
//         <div className="space-y-4">
//           <div className="p-3 bg-gray-50 rounded-lg">
//             <h3 className="font-medium">{selectedUser?.name}</h3>
//             <p className="text-sm text-gray-600">{selectedUser?.email}</p>
//             <p className="text-sm text-gray-600">Role: {selectedUser?.role}</p>
//           </div>

//           <div className="max-h-96 overflow-y-auto">
//             {staffLogs.length > 0 ? (
//               <div className="space-y-3">
//                 {staffLogs.map((log, index) => (
//                   <div
//                     key={index}
//                     className="border-l-2 border-blue-200 pl-4 pb-3"
//                   >
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <p className="font-medium">{log.action}</p>
//                         {log.details && (
//                           <p className="text-sm text-gray-600 mt-1">
//                             {log.details}
//                           </p>
//                         )}
//                         {log.ipAddress && (
//                           <p className="text-sm text-gray-500">
//                             IP: {log.ipAddress}
//                           </p>
//                         )}
//                       </div>
//                       <span className="text-sm text-gray-500">
//                         {new Date(log.timestamp).toLocaleString()}
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-center text-gray-500 py-8">
//                 No activity logs available for this staff member
//               </p>
//             )}
//           </div>

//           <div className="flex justify-end pt-4 border-t">
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setIsLogsModalOpen(false);
//                 setSelectedUser(null);
//                 setStaffLogs([]);
//               }}
//             >
//               Close
//             </Button>
//           </div>
//         </div>
//       </Modal>

//       {/* Delete Confirmation */}
//       <ConfirmDialog
//         isOpen={!!deleteConfirm}
//         onClose={() => setDeleteConfirm(null)}
//         onConfirm={() => handleDeleteStaff(deleteConfirm.id)}
//         title="Delete Staff Member"
//         message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone and will remove all associated data.`}
//         confirmText="Delete Staff"
//         confirmVariant="danger"
//       />

//       {error && (
//         <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//           {error}
//         </div>
//       )}
//     </div>
//   );
// };

// export default StaffManagement;
