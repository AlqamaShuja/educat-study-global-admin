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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [officeFilter, setOfficeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    officeId: "",
    isActive: true,
    status: "pending", // Added status field
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
      status: "pending",
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
        status: staffMember.status || "pending",
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

      if (formData.officeId == "") {
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

  // Filter staff based on search and filters
  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !roleFilter || member.role === roleFilter;
    const matchesOffice = !officeFilter || member.officeId === officeFilter;
    const matchesStatus = !statusFilter || member.status === statusFilter;

    return matchesSearch && matchesRole && matchesOffice && matchesStatus;
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

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      suspended: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
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
              {searchTerm || roleFilter || officeFilter || statusFilter
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
                    Active
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
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                          member.status
                        )}`}
                      >
                        {member.status?.replace(/\b\w/g, (l) =>
                          l.toUpperCase()
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="flex items-center gap-1">
                        {member.isActive ? (
                          <>
                            <span className="text-sm text-green-600">
                              Active
                            </span>
                          </>
                        ) : (
                          <>
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

// import React, { useState, useEffect } from "react";
// import {
//   Plus,
//   Search,
//   Filter,
//   Users,
//   Edit2,
//   ToggleLeft,
//   ToggleRight,
// } from "lucide-react";
// import Button from "../../components/ui/Button";
// import Input from "../../components/ui/Input";
// import StaffFormModal from "../../components/forms/AddOrEditStaffModal";
// import useUserStore from "../../stores/userStore";
// import useOfficeStore from "../../stores/officeStore";

// const StaffManagement = () => {
//   //   const [staff, setStaff] = useState([]);
//   //   const [offices, setOffices] = useState([]);
//   //   const [loading, setLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingStaff, setEditingStaff] = useState(null);
//   const [formErrors, setFormErrors] = useState({});

//   // Search and filter states
//   const [searchTerm, setSearchTerm] = useState("");
//   const [roleFilter, setRoleFilter] = useState("");
//   const [officeFilter, setOfficeFilter] = useState("");

//   // Form data state
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     password: "",
//     role: "",
//     officeId: "",
//     isActive: true,
//   });

//   const {
//     users: staff,
//     isLoading: loading,
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

//   const { offices, fetchOffices } = useOfficeStore();

//   console.log(offices, "acnascjasnjncasncs:offices");

//   // Fetch staff and offices on component mount
//   useEffect(() => {
//     fetchAllStaff();
//     fetchOffices();
//   }, []);

//   const resetForm = () => {
//     setFormData({
//       name: "",
//       email: "",
//       phone: "",
//       password: "",
//       role: "",
//       officeId: "",
//       isActive: true,
//     });
//     setFormErrors({});
//     setEditingStaff(null);
//   };

//   const handleOpenModal = (staffMember = null) => {
//     if (staffMember) {
//       setEditingStaff(staffMember);
//       setFormData({
//         name: staffMember.name || "",
//         email: staffMember.email || "",
//         phone: staffMember.phone || "",
//         password: "",
//         role: staffMember.role || "",
//         officeId: staffMember.officeId || "",
//         isActive: staffMember.isActive !== false,
//       });
//     } else {
//       resetForm();
//     }
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     resetForm();
//   };

//   const handleSubmit = async () => {
//     try {
//       setFormErrors({});

//       console.log(formData, "asckasncsanscns");

//       if(formData.officeId == ""){
//         formData.officeId = null;
//       }

//       if (editingStaff) {
//         await updateStaff(editingStaff.id, formData);
//       } else {
//         await createStaff(formData);
//       }

//       await fetchAllStaff();
//       handleCloseModal();
//     } catch (error) {
//       setFormErrors({
//         general: error.message || "An error occurred. Please try again.",
//       });
//     }
//   };

// //   const handleToggleStatus = async (staffId, currentStatus) => {
// //     try {
// //       await toggleStaffStatus(staffId, !currentStatus);
// //     } catch (error) {
// //       console.error("Error toggling staff status:", error);
// //     }
// //   };
//   // Filter staff based on search and filters
//   const filteredStaff = staff.filter((member) => {
//     const matchesSearch =
//       member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       member.email?.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesRole = !roleFilter || member.role === roleFilter;
//     const matchesOffice = !officeFilter || member.officeId === officeFilter;

//     return matchesSearch && matchesRole && matchesOffice;
//   });

//   const getRoleBadgeColor = (role) => {
//     const colors = {
//       super_admin: "bg-purple-100 text-purple-800",
//       manager: "bg-blue-100 text-blue-800",
//       consultant: "bg-green-100 text-green-800",
//       receptionist: "bg-yellow-100 text-yellow-800",
//     };
//     return colors[role] || "bg-gray-100 text-gray-800";
//   };

//   const getOfficeName = (officeId) => {
//     const office = offices.find((o) => o.id === officeId);
//     return office ? `${office.name} - ${office.address?.city}` : "No Office";
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header Section */}
//       <div className="flex justify-between items-start">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//             <Users className="h-7 w-7 text-blue-600" />
//             Staff Management
//           </h1>
//           <p className="text-gray-600 mt-1">
//             Manage staff members, roles, and office assignments across your
//             organization
//           </p>
//         </div>
//         <Button
//           onClick={() => handleOpenModal()}
//           className="flex items-center gap-2"
//         >
//           <Plus className="h-4 w-4" />
//           Add Staff Member
//         </Button>
//       </div>

//       {/* Search and Filter Section */}
//       <div className="bg-white rounded-lg border border-gray-200 p-4">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {/* Search */}
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//             <Input
//               placeholder="Search by name or email..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10"
//             />
//           </div>

//           {/* Role Filter */}
//           <div className="relative">
//             <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//             <select
//               value={roleFilter}
//               onChange={(e) => setRoleFilter(e.target.value)}
//               className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
//             >
//               <option value="">All Roles</option>
//               <option value="super_admin">Super Admin</option>
//               <option value="manager">Manager</option>
//               <option value="consultant">Consultant</option>
//               <option value="receptionist">Receptionist</option>
//             </select>
//           </div>

//           {/* Office Filter */}
//           <div>
//             <select
//               value={officeFilter}
//               onChange={(e) => setOfficeFilter(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
//             >
//               <option value="">All Offices</option>
//               {offices.map((office) => (
//                 <option key={office.id} value={office.id}>
//                   {office.name} - {office.address?.city}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Staff List */}
//       <div className="bg-white rounded-lg border border-gray-200">
//         <div className="px-6 py-4 border-b border-gray-200">
//           <h2 className="text-lg font-semibold text-gray-900">
//             Staff Members ({filteredStaff.length})
//           </h2>
//         </div>

//         {filteredStaff.length === 0 ? (
//           <div className="p-12 text-center">
//             <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">
//               No staff members found
//             </h3>
//             <p className="text-gray-600">
//               {searchTerm || roleFilter || officeFilter
//                 ? "Try adjusting your search criteria"
//                 : "Get started by adding your first staff member"}
//             </p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Staff Member
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Role
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Office Assignment
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredStaff.map((member) => (
//                   <tr key={member.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div>
//                         <div className="text-sm font-medium text-gray-900">
//                           {member.name}
//                         </div>
//                         <div className="text-sm text-gray-500">
//                           {member.email}
//                         </div>
//                         {member.phone && (
//                           <div className="text-sm text-gray-500">
//                             {member.phone}
//                           </div>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span
//                         className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
//                           member.role
//                         )}`}
//                       >
//                         {member.role
//                           ?.replace("_", " ")
//                           .replace(/\b\w/g, (l) => l.toUpperCase())}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {getOfficeName(member.officeId)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <button
//                         // onClick={() =>
//                         //   handleToggleStatus(member.id, member.isActive)
//                         // }
//                         className="flex items-center gap-1"
//                       >
//                         {member.isActive ? (
//                           <>
//                             {/* <ToggleRight className="h-5 w-5 text-green-500" /> */}
//                             <span className="text-sm text-green-600">
//                               Active
//                             </span>
//                           </>
//                         ) : (
//                           <>
//                             {/* <ToggleLeft className="h-5 w-5 text-gray-400" /> */}
//                             <span className="text-sm text-gray-500">
//                               Inactive
//                             </span>
//                           </>
//                         )}
//                       </button>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleOpenModal(member)}
//                         className="flex items-center gap-1"
//                       >
//                         <Edit2 className="h-3 w-3" />
//                         Edit
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Staff Form Modal */}
//       <StaffFormModal
//         isOpen={isModalOpen}
//         onClose={handleCloseModal}
//         onSubmit={handleSubmit}
//         title={editingStaff ? "Edit Staff Member" : "Create New Staff Member"}
//         formData={formData}
//         setFormData={setFormData}
//         formErrors={formErrors}
//         offices={offices}
//       />
//     </div>
//   );
// };

// export default StaffManagement;
