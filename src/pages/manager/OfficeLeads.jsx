import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useManagerStore from "../../stores/useManagerStore";
import managerService from "../../services/managerService";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import AddEditLeadModal from "../../components/manager/AddEditLeadModal";
import LeadDetailsView from "../../components/manager/LeadDetailsView";
import { FileText, Eye, Edit, Search, UserPlus, X } from "lucide-react";
import { toast } from "react-toastify";

const OfficeLeads = () => {
  const navigate = useNavigate();
  const {
    leads,
    consultants,
    fetchLeads,
    fetchOfficeConsultants,
    loading,
    error,
    setState,
  } = useManagerStore();
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchLeads();
    fetchOfficeConsultants();
  }, [fetchLeads, fetchOfficeConsultants]);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  }, [error]);

  const leadStatuses = [
    { value: "", label: "All Statuses" },
    { value: "new", label: "New", color: "bg-gray-100 text-gray-800" },
    {
      value: "in_progress",
      label: "In Progress",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "converted",
      label: "Converted",
      color: "bg-green-100 text-green-800",
    },
    { value: "lost", label: "Lost", color: "bg-red-100 text-red-800" },
  ];

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !filters.search ||
      lead.student?.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      lead.student?.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || lead.status === filters.status;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) =>
    leadStatuses.find((s) => s.value === status)?.color ||
    "bg-gray-100 text-gray-800";

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / pageSize);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Office Leads
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and track leads for your office
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </header>

      {/* Filters */}
      <Card className="p-4 mt-8 shadow-md animate-fade-in bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="pl-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            {leadStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            {filteredLeads.length} of {leads.length} leads
          </div>
        </div>
      </Card>

      {/* Leads Table */}
      <Card className="shadow-md mt-4 hover:shadow-lg transition-shadow duration-300 animate-fade-in bg-white">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 px-6 pt-4">
          Leads
        </h3>
        {filteredLeads.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Leads Found
            </h3>
            <p className="text-gray-600">
              {filters.search || filters.status
                ? "No leads match your current filters."
                : "No leads available in your office."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Consultant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedLeads.map((lead, index) => (
                  <tr
                    key={lead.id}
                    className={`hover:bg-blue-50 transition-colors duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {lead.student?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.student?.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status
                          ? lead.status
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())
                          : "New"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.consultantName || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowDetailsModal(true);
                          }}
                          className="border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowEditModal(true);
                          }}
                          className="border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-between items-center px-6 pb-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
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
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Add Lead Modal */}
      <AddEditLeadModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        consultants={consultants}
        onSubmit={async (data) => {
          try {
            const newLead = await managerService.createLead(data);
            await fetchLeads();
            setShowAddModal(false);
          } catch (err) {
            throw err; // Handled in modal
          }
        }}
        mode="add"
      />

      {/* Edit Lead Modal */}
      <AddEditLeadModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedLead(null);
        }}
        lead={selectedLead}
        consultants={consultants}
        onSubmit={async (data) => {
          try {
            const updatedLead = await managerService.updateLead(
              selectedLead.id,
              {
                status: data.status,
                assignedConsultant: data.assignedConsultant || null,
              }
            );
            await fetchLeads();
            setShowEditModal(false);
            setSelectedLead(null);
          } catch (err) {
            throw err; // Handled in modal
          }
        }}
        mode="edit"
      />

      {/* Details Modal */}
      {showDetailsModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl relative">
            <button
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedLead(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
            <LeadDetailsView lead={selectedLead} />
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeLeads;

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import useManagerStore from "../../stores/useManagerStore";
// import managerService from "../../services/managerService";
// import Card from "../../components/ui/Card";
// import Button from "../../components/ui/Button";
// import Badge from "../../components/ui/Badge";
// import Input from "../../components/ui/Input";
// import LoadingSpinner from "../../components/ui/LoadingSpinner";
// import AddEditLeadModal from "../../components/manager/AddEditLeadModal";
// import { FileText, Eye, Edit, Search, UserPlus } from "lucide-react";
// import { toast } from "react-toastify";

// const OfficeLeads = () => {
//   const navigate = useNavigate();
//   const {
//     leads,
//     consultants,
//     fetchLeads,
//     fetchOfficeConsultants,
//     loading,
//     error,
//     setState,
//   } = useManagerStore();
//   const [filters, setFilters] = useState({ search: "", status: "" });
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedLead, setSelectedLead] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const pageSize = 10;

//   useEffect(() => {
//     fetchLeads();
//     fetchOfficeConsultants();
//   }, []);

//   useEffect(() => {
//     if (error) {
//       toast.error(error, {
//         position: "top-right",
//         autoClose: 5000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         theme: "colored",
//       });
//     }
//   }, [error]);

//   const leadStatuses = [
//     { value: "", label: "All Statuses" },
//     { value: "new", label: "New", color: "bg-gray-100 text-gray-800" },
//     {
//       value: "in_progress",
//       label: "In Progress",
//       color: "bg-blue-100 text-blue-800",
//     },
//     {
//       value: "converted",
//       label: "Converted",
//       color: "bg-green-100 text-green-800",
//     },
//     { value: "lost", label: "Lost", color: "bg-red-100 text-red-800" },
//   ];

//   const filteredLeads = leads.filter((lead) => {
//     const matchesSearch =
//       !filters.search ||
//       lead.student?.name.toLowerCase().includes(filters.search.toLowerCase()) ||
//       lead.student?.email.toLowerCase().includes(filters.search.toLowerCase());
//     const matchesStatus = !filters.status || lead.status === filters.status;
//     return matchesSearch && matchesStatus;
//   });

//   const getStatusColor = (status) =>
//     leadStatuses.find((s) => s.value === status)?.color ||
//     "bg-gray-100 text-gray-800";

//   // Pagination
//   const totalPages = Math.ceil(filteredLeads.length / pageSize);
//   const paginatedLeads = filteredLeads.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <LoadingSpinner size="lg" className="text-blue-600" />
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
//       {/* Header */}
//       <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
//             Office Leads
//           </h1>
//           <p className="mt-1 text-sm text-gray-600">
//             Manage and track leads for your office
//           </p>
//         </div>
//         <Button
//           variant="primary"
//           onClick={() => setShowAddModal(true)}
//           className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
//         >
//           <UserPlus className="h-4 w-4 mr-2" />
//           Add Lead
//         </Button>
//       </header>

//       {/* Filters */}
//       <Card className="p-4 mt-8 shadow-md animate-fade-in bg-white">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//             <Input
//               placeholder="Search by name or email..."
//               value={filters.search}
//               onChange={(e) =>
//                 setFilters({ ...filters, search: e.target.value })
//               }
//               className="pl-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>
//           <select
//             className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//             value={filters.status}
//             onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//           >
//             {leadStatuses.map((status) => (
//               <option key={status.value} value={status.value}>
//                 {status.label}
//               </option>
//             ))}
//           </select>
//           <div className="text-sm text-gray-600 flex items-center">
//             {filteredLeads.length} of {leads.length} leads
//           </div>
//         </div>
//       </Card>

//       {/* Leads Table */}
//       <Card className="shadow-md mt-4 hover:shadow-lg transition-shadow duration-300 animate-fade-in bg-white">
//         <h3 className="text-lg font-semibold mb-4 text-gray-900 px-6 pt-4">
//           Leads
//         </h3>
//         {filteredLeads.length === 0 ? (
//           <div className="text-center py-8">
//             <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">
//               No Leads Found
//             </h3>
//             <p className="text-gray-600">
//               {filters.search || filters.status
//                 ? "No leads match your current filters."
//                 : "No leads available in your office."}
//             </p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Student
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Email
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Assigned Consultant
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {paginatedLeads.map((lead, index) => (
//                   <tr
//                     key={lead.id}
//                     className={`hover:bg-blue-50 transition-colors duration-200 ${
//                       index % 2 === 0 ? "bg-white" : "bg-gray-50"
//                     }`}
//                   >
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                       {lead.student?.name || "N/A"}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {lead.student?.email || "N/A"}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <Badge className={getStatusColor(lead.status)}>
//                         {lead.status
//                           ? lead.status
//                               .replace(/_/g, " ")
//                               .replace(/\b\w/g, (c) => c.toUpperCase())
//                           : "New"}
//                       </Badge>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {lead.consultantName || "Unassigned"}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                       <div className="flex space-x-2">
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() =>
//                             navigate(`/manager/students/${lead.studentId}`)
//                           }
//                           className="border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors duration-200"
//                         >
//                           <Eye className="h-4 w-4 mr-1" />
//                           View
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => {
//                             setSelectedLead(lead);
//                             setShowEditModal(true);
//                           }}
//                           className="border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors duration-200"
//                         >
//                           <Edit className="h-4 w-4 mr-1" />
//                           Edit
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="mt-4 flex justify-between items-center px-6 pb-4">
//                 <Button
//                   variant="outline"
//                   onClick={() =>
//                     setCurrentPage((prev) => Math.max(prev - 1, 1))
//                   }
//                   disabled={currentPage === 1}
//                   className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
//                 >
//                   Previous
//                 </Button>
//                 <span className="text-sm text-gray-600">
//                   Page {currentPage} of {totalPages}
//                 </span>
//                 <Button
//                   variant="outline"
//                   onClick={() =>
//                     setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//                   }
//                   disabled={currentPage === totalPages}
//                   className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
//                 >
//                   Next
//                 </Button>
//               </div>
//             )}
//           </div>
//         )}
//       </Card>

//       {/* Add Lead Modal */}
//       <AddEditLeadModal
//         isOpen={showAddModal}
//         onClose={() => setShowAddModal(false)}
//         consultants={consultants}
//         onSubmit={async (data) => {
//           try {
//             const newLead = await managerService.createLead(data);
//             await fetchLeads();
//             setShowAddModal(false);
//           } catch (err) {
//             throw err; // Handled in modal
//           }
//         }}
//         mode="add"
//       />

//       {/* Edit Lead Modal */}
//       <AddEditLeadModal
//         isOpen={showEditModal}
//         onClose={() => {
//           setShowEditModal(false);
//           setSelectedLead(null);
//         }}
//         lead={selectedLead}
//         consultants={consultants}
//         onSubmit={async (data) => {
//           try {
//             const updatedLead = await managerService.updateLead(
//               selectedLead.id,
//               {
//                 status: data.status,
//                 assignedConsultant: data.assignedConsultant || null,
//               }
//             );
//             // setState((state) => ({
//             //   leads: state.leads.map((l) =>
//             //     l.id === updatedLead.id ? updatedLead : l
//             //   ),
//             // }));
//             await fetchLeads();
//             setShowEditModal(false);
//             setSelectedLead(null);
//           } catch (err) {
//             throw err; // Handled in modal
//           }
//         }}
//         mode="edit"
//       />
//     </div>
//   );
// };

// export default OfficeLeads;
